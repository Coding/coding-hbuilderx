import { IDepot, IMRItem } from '../typings/common';

export interface IState {
  token: string;
  userInfo: Record<string, any>;
  refetchDepotList: boolean;
  selectedDepot: IDepot | null;
  selectedProjectName: string;
  selectedMR: IMRItem | null;
}

export interface IAction {
  type: ACTIONS;
  payload: any;
}

export const enum ACTIONS {
  REFETCH_DEPOT_LIST = 'REFETCH_DEPOT_LIST',
  SET_SELECTED_DEPOT = 'SET_SELECTED_DEPOT',
  SET_SELECTED_MR = 'SET_SELECTED_MR',
}

export const initialState = {
  ...JSON.parse(window.__CODING__),
  refetchDepotList: false,
  selectedDepot: null,
  selectedProjectName: '',
  selectedMR: null
};

const appReducer = (state: IState, { type, payload }: IAction) => {
  switch (type) {
    case ACTIONS.REFETCH_DEPOT_LIST:
      return {
        ...state,
        refetchDepotList: payload
      };
    case ACTIONS.SET_SELECTED_DEPOT:
      const matchRes = payload.depotPath.match(/\/p\/([^/]+)/);
      return {
        ...state,
        selectedDepot: payload,
        selectedProjectName: matchRes?.[1],
        selectedMR: null
      };
    case ACTIONS.SET_SELECTED_MR:
      return {
        ...state,
        selectedMR: payload
      };
    default:
  }
  return state;
};

export default appReducer;
