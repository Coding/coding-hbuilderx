import { createContext, Dispatch } from 'react';
import { initialState, IState, IAction } from './index';

interface IDataContext {
  state: IState;
  dispatch: Dispatch<IAction>;
}

export const DataContext = createContext<IDataContext>({
  state: initialState,
  dispatch: () => {}
});
