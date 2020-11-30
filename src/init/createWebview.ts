import WebviewProvider from '../webviews/depot';
import ACTIONS, { dispatch } from '../utils/actions';
import toast from '../utils/toast';

function createWebview(context: IContext) {
  const webviewProvider = new WebviewProvider(context);
  dispatch(ACTIONS.SET_WEBVIEW, {
    context,
    value: webviewProvider,
  });

  toast.info('温馨提示，若页面没有渲染，请重新打开`插件扩展视图 - CODING 代码仓库`');
}

export default createWebview;
