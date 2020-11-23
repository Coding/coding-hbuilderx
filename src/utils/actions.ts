const enum ACTIONS {
  SET_DEPOTS = 'SET_DEPOTS',
  SET_SELECTED_DEPOT = 'SET_SELECTED_DEPOT',
  SET_SELECTED_MR = 'SET_SELECTED_MR',
  SET_USER_INFO = 'SET_USER_INFO',
  SET_REPO_INFO = 'SET_REPO_INFO',
  SET_CTX = 'SET_CTX',
  SET_MR_CUSTOM_EDITOR = 'SET_MR_CUSTOM_EDITOR',
}

interface IPayload {
  context: IContext;
  value: any;
}

export const dispatch = (type: ACTIONS, { context, value }: IPayload) => {
  switch (type) {
    case ACTIONS.SET_DEPOTS:
      context.depots = value;
      break;
    case ACTIONS.SET_SELECTED_DEPOT:
      context.selectedDepot = value;
      break;
    case ACTIONS.SET_SELECTED_MR:
      context.selectedMR = value;
      break;
    case ACTIONS.SET_USER_INFO:
      context.userInfo = value;
      break;
    case ACTIONS.SET_REPO_INFO:
      context.repoInfo = value;
      break;
    case ACTIONS.SET_CTX:
      context.ctx = value;
      break;
    case ACTIONS.SET_MR_CUSTOM_EDITOR:
      context.mrCustomEditor = value;
      break;
    default:
      return;
  }
};

export default ACTIONS;
