import React, { useReducer } from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import { DataContext } from './reducers/context';
import appReducer, { initialState } from './reducers';
import './styles/common.css';

const Root = () => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <DataContext.Provider value={{ state, dispatch }}>
      <App />
    </DataContext.Provider>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
  document.getElementById('root'),
);
