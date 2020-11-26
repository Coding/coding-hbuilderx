import hx from 'hbuilderx';
import { refreshTree } from './registerCommands';

const { onUserLogin, onUserLogout } = hx.authorize;

export default function initLoginLogout(context: IContext) {
  onUserLogin(() => {
    console.warn('login');
    refreshTree();
  });

  onUserLogout(() => {
    console.warn('logout');
  });
}
