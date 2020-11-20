import React, { useState } from 'react';
import cn from 'classnames';

import { closeMergeRequest, mergeMergeRequest, allowMerge } from './services';
import { MERGE_STATUS_TEXT, MERGE_STATUS } from './constants';
import style from './style.css';

const toast = (msg: string) => {
  window.hbuilderx.postMessage({
    command: 'webview.toast',
    data: msg
  });
};

const App = () => {
  const data = JSON.parse(window.__CODING__);
  const { session, mrItem, repoInfo } = data;
  const { accessToken } = session;
  const user = session?.user;
  const team = user?.team;

  const { can_merge: canMerge, merge_request: mergeRequest } = mrItem;
  const { title, srcBranch, desBranch, author, merge_status: mergeStatus } = mergeRequest;
  const url = `https://${team}.coding.net${mergeRequest.path}`;

  const [isClosing, setIsClosing] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [isAllowing, setIsAllowing] = useState(false);
  const [mrStatus, setMrStatus] = useState(mergeStatus);
  const [allowText, setAllowText] = useState('允许合并');

  const viewOnWeb = () => {
    window.hbuilderx.postMessage({
      command: 'webview.mrDetail',
      data: url
    });
  };

  const handleClose = async () => {
    if (isClosing) return;

    setIsClosing(true);
    const result = await closeMergeRequest(accessToken, {
      ...repoInfo,
      mergeRequestIId: mergeRequest.iid
    });

    if (!result.code) {
      setMrStatus(MERGE_STATUS.REFUSED);
    } else {
      toast('关闭合并请求失败');
    }

    setIsClosing(false);
  };

  const handleMerge = async () => {
    if (isMerging) return;

    setIsMerging(true);
    const result = await mergeMergeRequest(accessToken, {
      ...repoInfo,
      mergeRequestIId: mergeRequest.iid,
      message: `
        Accept Merge Request #${mergeRequest.iid}: (${srcBranch} -> ${desBranch})
        Merge Request: ${title}
        Created By: @${author.name}
        Accepted By: @${user.name}
        URL: https://${repoInfo.team}.coding.net/p/${repoInfo.project}/d/${repoInfo.repo}/git/merge/${mergeRequest.iid}
      `
    });

    if (!result.code) {
      setMrStatus(MERGE_STATUS.ACCEPTED);
    } else {
      toast('合并请求失败');
    }

    setIsMerging(false);
  };

  const handleAllowMerge = async () => {
    if (isAllowing) return;

    setIsAllowing(true);
    const result = await allowMerge(accessToken, {
      ...repoInfo,
      mergeRequestIId: mergeRequest.iid
    });

    if (!result.code) {
      setAllowText('已允许');
    } else {
      toast('操作失败');
    }

    setIsAllowing(false);
  };

  const renderStatus = () => {
    const CNS = {
      [MERGE_STATUS.CANMERGE]: style.success,
      [MERGE_STATUS.CANNOTMERGE]: style.error,
      [MERGE_STATUS.ACCEPTED]: style.merged
    };
    return <span className={cn(style.status, CNS[mrStatus])}>{MERGE_STATUS_TEXT[mrStatus]}</span>;
  };

  const showCloseBtn = (canMerge || user.id === mergeRequest.author.id) && mrStatus !== MERGE_STATUS.REFUSED && mrStatus !== MERGE_STATUS.ACCEPTED;
  const mrStatusOk = mrStatus === MERGE_STATUS.CANMERGE || mrStatus === MERGE_STATUS.CANNOTMERGE;
  const showMergeBtn = mrStatus === MERGE_STATUS.CANMERGE;
  const showAllowMergeBtn = mrStatusOk && author.id !== user.id;

  return (
    <div className={style.root}>
      <a onClick={viewOnWeb}>前往 web 端查看</a>

      <div className={style.title}>
        {title} {renderStatus()}
      </div>
      <div>{`将分支 ${srcBranch} 合并到分支 ${desBranch}`}</div>
      <div>创建人：{author.name}</div>

      <div className={style.btnGroup}>
        {showMergeBtn && (
          <div
            className={cn(style.btn, style.btnPrimary, isMerging && style.disabled)}
            onClick={handleMerge}
          >
            {isMerging ? '合并中...' : '合并'}
          </div>
        )}

        {showAllowMergeBtn && (
          <div
            className={cn(style.btn, style.btnPrimary, isAllowing && style.disabled)}
            onClick={handleAllowMerge}
          >
            {allowText}
          </div>
        )}

        {showCloseBtn && (
          <div
            className={cn(style.btn, isClosing && style.disabled)}
            onClick={handleClose}
          >
            {isClosing ? '关闭中...' : '关闭'}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
