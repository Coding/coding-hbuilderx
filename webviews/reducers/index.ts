import { getDepotProject } from '../utils/depot';
import { IDepot, IMRItem, IRepoInfo } from '../typings/common';

export interface IState {
  token: string;
  userInfo: Record<string, any>;
  repoInfo: IRepoInfo | null;
  refetchDepotList: boolean;
  selectedDepot: IDepot | null;
  selectedProjectName: string | undefined;
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

const getInitialState = (): IState => {
  const CODING_DATA = JSON.parse(window.__CODING__);
  const { repoInfo, userInfo } = CODING_DATA;
  const selectedDepot = repoInfo && userInfo && repoInfo.team === userInfo.team
    ? {
      name: repoInfo.repo,
      depotPath: `/p/${repoInfo.project}/d/${repoInfo.repo}/git`,
      vcsType: 'git'
    }
    : null;

  return {
    ...CODING_DATA,
    refetchDepotList: false,
    selectedDepot,
    selectedProjectName: repoInfo ? repoInfo.project : '',
    selectedMR: null
  };
};

export const initialState = getInitialState();

const appReducer = (state: IState, { type, payload }: IAction) => {
  switch (type) {
    case ACTIONS.REFETCH_DEPOT_LIST:
      return {
        ...state,
        refetchDepotList: payload
      };
    case ACTIONS.SET_SELECTED_DEPOT:
      return {
        ...state,
        selectedDepot: payload,
        selectedProjectName: getDepotProject(payload.depotPath),
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
