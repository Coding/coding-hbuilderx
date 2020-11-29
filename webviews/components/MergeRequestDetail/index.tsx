import React, { useEffect, useState, useContext } from 'react';
import cn from 'classnames';

import {
  getMergeRequestDetail,
  closeMergeRequest,
  mergeMergeRequest,
  allowMerge,
  disallowMerge,
  getReviewers
} from '../../services';
import useAsyncFn from '../../hooks/useAsyncFn';
import { DataContext } from '../../reducers/context';
import { MERGE_STATUS } from '../../constants';
import style from './style.css';

interface IReviewers {
  reviewers: any[];
  volunteer_reviewers: any[];
}

const App = () => {
  const { state } = useContext(DataContext);
  const { token: accessToken, userInfo: user, selectedDepot, selectedProjectName, selectedMR } = state;
  const team = user?.team;
  const repoInfo = { team, project: selectedProjectName, repo: selectedDepot?.name };
  const mergeRequestIId = selectedMR?.iid as number;

  const [mrStatus, setMrStatus] = useState<MERGE_STATUS>(MERGE_STATUS.CANMERGE);
  const [mrDetail, setMrDetail] = useState();
  const [reviewers, setReviewers] = useState<IReviewers>({ reviewers: [], volunteer_reviewers: [] });

  const [closeMergeRequestState, closeMergeRequestFn] = useAsyncFn(closeMergeRequest);
  const [mergeMergeRequestState, mergeMergeRequestFn] = useAsyncFn(mergeMergeRequest);
  const [allowMergeState, allowMergeFn] = useAsyncFn(allowMerge);
  const [disallowMergeState, disallowMergeFn] = useAsyncFn(disallowMerge);
  const { loading: isClosing } = closeMergeRequestState;
  const { loading: isMerging } = mergeMergeRequestState;
  const { loading: isAllowing } = allowMergeState;
  const { loading: isDisAllowing } = disallowMergeState;

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
    if (selectedMR) {
      asyncFn();
    }
  }, [selectedMR]);

  if (!mrDetail || !selectedMR) return null;

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
    const result = await closeMergeRequestFn(accessToken, { ...getParams() });
    if (!result.code) {
      setMrStatus(MERGE_STATUS.REFUSED);
    }
  };

  const handleMerge = async () => {
    if (isMerging) return;
    const result = await mergeMergeRequestFn(accessToken, {
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
    }
  };

  const handleAllowMerge = async () => {
    if (isAllowing) return;
    const result = await allowMergeFn(accessToken, { ...getParams() });
    if (!result.code) {
      setIsAgreed(true);
    }
  };

  const handleDisAllowMerge = async () => {
    if (isDisAllowing) return;
    const result = await disallowMergeFn(accessToken, { ...getParams() });
    if (!result.code) {
      setIsAgreed(false);
    }
  };

  const renderStatus = () => {
    switch (mrStatus) {
      case MERGE_STATUS.ACCEPTED:
        return <span className={cn(style.status, style.merged)}>已合并</span>;
      case MERGE_STATUS.CANMERGE:
        return <span className={cn(style.status, style.success)}>可合并</span>;
      case MERGE_STATUS.REFUSED:
        return <span className={cn(style.status)}>已关闭</span>;
      case MERGE_STATUS.CANNOTMERGE:
        return <span className={cn(style.status, style.error)}>不可自动合并</span>;
    }
  };

  const showCloseBtn = (canMerge || user.id === mergeRequest.author.id) && mrStatus !== MERGE_STATUS.REFUSED && mrStatus !== MERGE_STATUS.ACCEPTED;
  const mrStatusOk = mrStatus === MERGE_STATUS.CANMERGE || mrStatus === MERGE_STATUS.CANNOTMERGE;
  const showMergeBtn = mrStatus === MERGE_STATUS.CANMERGE;
  const showAllowMergeBtn = mrStatusOk && author.id !== user.id;

  return (
    <div className={style.root}>
      <div className={style.title}>
        {title} {renderStatus()}
        <a onClick={viewOnWeb} className={style.link}>前往 web 端查看</a>
      </div>
      <div>{`将分支 ${srcBranch} 合并到分支 ${desBranch}`}</div>
      <div>创建人：{author.name}</div>

      <h3>概览：</h3>
      <div dangerouslySetInnerHTML={{ __html: body }} />

      <div className={'btnGroup'}>
        {showAllowMergeBtn && !isAgreed && (
          <div
            className={cn('btn', 'btnPrimary', isAllowing && 'disabled')}
            onClick={handleAllowMerge}
          >
            {isAllowing ? <span>允许合并中...</span> : <span>允许合并</span>}
          </div>
        )}

        {showAllowMergeBtn && isAgreed && (
          <div
            className={cn('btn', 'btnPrimary', isDisAllowing && 'disabled')}
            onClick={handleDisAllowMerge}
          >
            {isDisAllowing ? <span>撤销允许合并中...</span> : <span>撤销允许合并</span>}
          </div>
        )}

        {showMergeBtn && (
          <div
            className={cn('btn', 'btnPrimary', isMerging && 'disabled')}
            onClick={handleMerge}
          >
            {isMerging ? <span>合并中...</span> : <span>合并</span>}
          </div>
        )}

        {showCloseBtn && (
          <div
            className={cn('btn', isClosing && 'disabled')}
            onClick={handleClose}
          >
            {isClosing ? <span>关闭中...</span> : <span>关闭</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
