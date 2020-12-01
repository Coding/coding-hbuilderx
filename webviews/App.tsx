import React, { useContext, useEffect } from 'react';
import DepotSelect from './components/DepotSelect';
import Actions from './components/Actions';
import MergeRequestDetail from './components/MergeRequestDetail';
import MergeRequestList from './components/MergeRequestList';

import { DataContext } from './reducers/context';
import { ACTIONS } from './reducers';
import style from './style.css';

import { auth, login } from './utils/command';

const App = () => {
  const { state, dispatch } = useContext(DataContext);
  const { token, userInfo, selectedDepot, selectedProjectName } = state;

  const handleAuth = () => auth();
  const handleLogin = () => login();

  useEffect(() => {
    setTimeout(() => {
      window.hbuilderx.onDidReceiveMessage((msgModal: IMsgModel) => {
        const { command, data } = msgModal;
        switch (command) {
          case 'create.depot.success':
            dispatch({
              type: ACTIONS.REFETCH_DEPOT_LIST,
              payload: true
            });
            break;
          case 'create.depot.switch':
            dispatch({
              type: ACTIONS.SET_SELECTED_DEPOT,
              payload: data
            });
            break;
        }
      });
    }, 0);
  }, []);

  if (token && !userInfo) {
    return (
      <div className={style.root}>
        <div className='btn btnPrimary' onClick={handleLogin}>
          CODING 登录
        </div>
      </div>
    );
  }

  const viewOnWeb = () => {
    let url = `https://${userInfo.team}.coding.net`;
    url += selectedDepot ? `/p/${selectedProjectName}/d/${selectedDepot.name}/git` : '';
    window.hbuilderx.postMessage({
      command: 'webview.goToPage',
      data: url
    });
  };

  return (
    <div className={style.root}>
      {!token ? (
        <div className='btn btnPrimary' onClick={handleAuth}>
          CODING 授权
        </div>
      ) : (
        <>
          <div className={style.header}>
            <DepotSelect />
            <div className={style.actions}>
              <Actions />
            </div>
            <a onClick={viewOnWeb}>前往 web 端查看</a>
          </div>
          <div>
            <div className='title'>合并请求</div>
            <div className={style.mrWrap}>
              <div className={style.left}>
                <MergeRequestList />
              </div>
              <div>
                <MergeRequestDetail />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
