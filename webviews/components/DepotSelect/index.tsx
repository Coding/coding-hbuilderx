import React, { useContext, useEffect } from 'react';
import Select from 'react-select';

import { DataContext } from '../../reducers/context';
import { ACTIONS } from '../../reducers';
import { getDepotList } from '../../services';
import useAsyncFn from '../../hooks/useAsyncFn';
import { IDepot } from '../../typings/common';
import { getDepotProject } from '../../utils/depot';
import style from './style.css';

const DepotSelect = () => {
  const { state, dispatch } = useContext(DataContext);
  const { token, userInfo, refetchDepotList, selectedDepot } = state;

  const [getDepotListState, getDepotListFn] = useAsyncFn(getDepotList);
  const { loading, value: depotList = [] } = getDepotListState;

  const fetchData = async () => {
    try {
      await getDepotListFn(token, userInfo.team);
      dispatch({
        type: ACTIONS.REFETCH_DEPOT_LIST,
        payload: false
      });
    } catch (err) {
      alert(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (refetchDepotList) {
      fetchData();
    }
  }, [refetchDepotList]);

  const getOptionLabel = ({ name, depotPath }: IDepot) => {
    const project = getDepotProject(depotPath);
    return name === project ? name : `${name} (${project})`;
  };

  return (
    <div className={style.root}>
      <span>当前仓库：</span>
      <div className={style.select}>
        <Select
          placeholder='选择仓库'
          defaultValue={selectedDepot}
          value={selectedDepot}
          onChange={(item: any) => {
            dispatch({
              type: ACTIONS.SET_SELECTED_DEPOT,
              payload: item
            });
          }}
          options={depotList}
          getOptionLabel={getOptionLabel}
          getOptionValue={(item) => item.depotPath}
          isLoading={loading}
        />
      </div>
    </div>
  );
};

export default DepotSelect;
