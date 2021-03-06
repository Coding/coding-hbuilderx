import WebviewProvider from '../webviews/depot';
import ACTIONS, { dispatch } from '../utils/actions';
import toast from '../utils/toast';

function createWebview(context: IContext) {
  const webviewProvider = new WebviewProvider(context);
  dispatch(ACTIONS.SET_WEBVIEW, {
    context,
    value: webviewProvider,
  });
}

export default createWebview;
