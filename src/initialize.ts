import createTreeViews from './init/createTreeViews';
import initWorkspace from './init/initWorkspace';
import { initCredentials } from './init/initCredentials';
import registerCommands from './init/registerCommands';
import initLoginLogout from './init/initLoginLogout';

export function clear(context: IContext) {
  context.subscriptions.forEach(({ dispose }) => dispose());
}

export default function initialize(context: IContext) {
  initLoginLogout(context);
  initCredentials(context);
  registerCommands(context);
  createTreeViews(context);
  initWorkspace(context);
}
