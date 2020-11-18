const enum ACTIONS {
  SET_DEPOTS = 'SET_DEPOTS',
  SET_SELECTED_DEPOT = 'SET_SELECTED_DEPOT',
  SET_CTX = 'SET_CTX',
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
    case ACTIONS.SET_CTX:
      context.ctx = value;
      break;
    default:
      return;
  }
};

export default ACTIONS;
