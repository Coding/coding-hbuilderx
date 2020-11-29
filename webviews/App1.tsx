import React, { useEffect, useState, useRef } from 'react';
import cn from 'classnames';

import {
  getMergeRequestDetail,
  closeMergeRequest,
  mergeMergeRequest,
  allowMerge,
  disallowMerge,
  getReviewers
} from './services';
import { MERGE_STATUS_TEXT, MERGE_STATUS } from './constants';
import style from './style.css';

interface IReviewers {
  reviewers: any[];
  volunteer_reviewers: any[];
}

const toast = (msg: string) => {
  window.hbuilderx.postMessage({
    command: 'webview.toast',
    data: msg
  });
};

const App = () => {
  const data = JSON.parse(window.__CODING__);
  const { token: accessToken, userInfo: user, repoInfo, mergeRequestIId } = data;
  const team = user?.team;

  // Fix initialize isAgreed doesn't work
  const agreedRef = useRef<boolean>(true);

  const [isClosing, setIsClosing] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [isAllowing, setIsAllowing] = useState(false);
  const [isDisAllowing, setIsDisAllowing] = useState(false);
  const [mrStatus, setMrStatus] = useState<MERGE_STATUS>(MERGE_STATUS.CANMERGE);
  const [mrDetail, setMrDetail] = useState();
  const [reviewers, setReviewers] = useState<IReviewers>({ reviewers: [], volunteer_reviewers: [] });

  const getInitialAgreed = () => {
    let agreed = true;
    const index = reviewers.reviewers.findIndex((r) => r.reviewer.id === user.id);

    if (index >= 0) {
      agreed = reviewers.reviewers[index].value === 100;
    } else {
      agreed = reviewers.volunteer_reviewers.findIndex((r) => r.reviewer.id === user.id) >= 0;
    }
    return agreed;
  };

  const [isAgreed, setIsAgreed] = useState(getInitialAgreed());

  const getIsAgreed = () => {
    if (agreedRef.current) return getInitialAgreed();
    return isAgreed;
  };

  const getParams = () => ({
    ...repoInfo,
    mergeRequestIId
  });

  useEffect(() => {
    const asyncFn = async () => {
      const [detailRes, reviewersRes] = await Promise.all([
        getMergeRequestDetail(accessToken, { ...getParams() }),
        getReviewers(accessToken, { ...getParams() })
      ]);

      if (!reviewersRes.code) {
        setReviewers(reviewersRes.data);
      }

      if (!detailRes.code) {
        setMrDetail(detailRes.data);
        setMrStatus(detailRes.data.merge_request.merge_status);
      }
    };
    asyncFn();
  }, []);

  if (!mrDetail) return null;

  const { can_merge: canMerge, merge_request: mergeRequest } = mrDetail as any;
  const { title, srcBranch, desBranch, author, body } = mergeRequest;
  const url = `https://${team}.coding.net${mergeRequest.path}`;

  const viewOnWeb = () => {
    window.hbuilderx.postMessage({
      command: 'webview.mrDetail',
      data: url
    });
  };

  const handleClose = async () => {
    if (isClosing) return;

    setIsClosing(true);
    const result = await closeMergeRequest(accessToken, { ...getParams() });

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
      ...getParams(),
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
    const result = await allowMerge(accessToken, { ...getParams() });

    if (!result.code) {
      setIsAgreed(true);
      agreedRef.current = false;
    } else {
      toast('操作失败');
    }

    setIsAllowing(false);
  };

  const handleDisAllowMerge = async () => {
    if (isDisAllowing) return;

    setIsDisAllowing(true);
    const result = await disallowMerge(accessToken, { ...getParams() });

    if (!result.code) {
      setIsAgreed(false);
      agreedRef.current = false;
    } else {
      toast('操作失败');
    }

    setIsDisAllowing(false);
  };

  const renderStatus = () => {
    const CNS = {
      [MERGE_STATUS.CANMERGE]: style.success,
      [MERGE_STATUS.CANNOTMERGE]: style.error,
      [MERGE_STATUS.ACCEPTED]: style.merged
    };
    return <span className={cn(style.status, CNS[mrStatus])}>{MERGE_STATUS_TEXT[mrStatus]}</span>;
  };

  const renderActionText = (loading: boolean, text: string) => loading ? `${text}中...` : text;

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

      <h3>概览：</h3>
      <div dangerouslySetInnerHTML={{ __html: body }} />

      <div className={style.btnGroup}>
        {showAllowMergeBtn && !getIsAgreed() && (
          <div
            className={cn(style.btn, style.btnPrimary, isAllowing && style.disabled)}
            onClick={handleAllowMerge}
          >
            {renderActionText(isAllowing, '允许合并')}
          </div>
        )}

        {showAllowMergeBtn && getIsAgreed() && (
          <div
            className={cn(style.btn, style.btnPrimary, isDisAllowing && style.disabled)}
            onClick={handleDisAllowMerge}
          >
            {renderActionText(isDisAllowing, '撤销允许合并')}
          </div>
        )}

        {showMergeBtn && (
          <div
            className={cn(style.btn, style.btnPrimary, isMerging && style.disabled)}
            onClick={handleMerge}
          >
            {renderActionText(isMerging, '合并')}
          </div>
        )}

        {showCloseBtn && (
          <div
            className={cn(style.btn, isClosing && style.disabled)}
            onClick={handleClose}
          >
            {renderActionText(isClosing, '关闭')}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
