import hx from 'hbuilderx';
import { refreshTree } from './registerCommands';

const { onUserLogin, onUserLogout } = hx.authorize;

export default function initLoginLogout(context: IContext) {
  onUserLogin(() => {
    console.warn('login');
    refreshTree();
    context.webviewProvider.refresh();
  });

  onUserLogout(() => {
    console.warn('logout');
  });
}
