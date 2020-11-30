import React, { useEffect, useContext } from 'react';
import cn from 'classnames';

import { getMergeRequestList } from '../../services';
import useAsyncFn from '../../hooks/useAsyncFn';
import { DataContext } from '../../reducers/context';
import { ACTIONS } from '../../reducers';
import { IMRItem, IReviewer } from '../../typings/common';
import style from './style.css';

const MergeRequestList = () => {
  const [getState, getMergeRequestListFn] = useAsyncFn(getMergeRequestList);
  const { state, dispatch } = useContext(DataContext);

  const { value: list = [] } = getState;
  const { token, userInfo, selectedDepot, selectedProjectName, selectedMR } = state;

  const fetchData = () => {
    getMergeRequestListFn(
      token,
      {
        team: userInfo.team,
        project: selectedProjectName,
        repo: selectedDepot?.name
      }
    );
  };

  useEffect(() => {
    if (selectedDepot) {
      fetchData();
    }
  }, [selectedDepot]);

  const createdList = list.filter((item: IMRItem) => item.author.id === userInfo.id);
  const reviewerList = list.filter((item: IMRItem) =>
    item.reviewers.find((r: IReviewer) => r.reviewer.id === userInfo.id),
  );
  const others = list.filter((item: IMRItem) => {
    const isNotInCreatedList = createdList.findIndex((i: IMRItem) => i.id === item.id) === -1;
    const isNotInReviewerList = reviewerList.findIndex((i: IMRItem) => i.id === item.id) === -1;
    return isNotInCreatedList && isNotInReviewerList;
  });

  const handleItemClick = (item: IMRItem) => {
    dispatch({
      type: ACTIONS.SET_SELECTED_MR,
      payload: item
    });
  };

  const renderList = (data: IMRItem[]) => {
    return data.map((item) => {
      const { title } = item;
      return (
        <div
          className={cn(style.item, selectedMR?.id === item.id && style.selected)}
          title={title}
          onClick={() => handleItemClick(item)}
        >
          {title}
        </div>
      );
    });
  };

  return (
    <div className={style.root}>
      <div className={style.block}>
        <div className={style.label}>我创建的（{createdList.length}）</div>
        {renderList(createdList)}
      </div>

      <div className={style.block}>
        <div className={style.label}>需要我 Review 的（{reviewerList.length}）</div>
        {renderList(reviewerList)}
      </div>

      <div className={style.block}>
        <div className={style.label}>其他（{others.length}）</div>
        {renderList(others)}
      </div>
    </div>
  );
};

export default MergeRequestList;
