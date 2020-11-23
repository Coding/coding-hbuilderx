import init from './init';
import CodingServer from './services/codingServer';
import WebviewProvider from './webviews';
import ACTIONS, { dispatch } from './utils/actions';
import { proxyCtx } from './utils/proxy';
import toast from './utils/toast';
import { readConfig } from './services/dcloud';

async function activate(context: IContext) {
  // TODO: 认证，拿到用户信息
  const webviewProvider = new WebviewProvider(context);

  const repoInfo = await CodingServer.getRepoParams();
  console.log('repoInfo ==> ', repoInfo);
  const token = await readConfig(`token`);
  if (!token) {
    toast.warn(`请先登录 CODING`);
  }

  const codingServer = new CodingServer({
    accessToken: token,
  });

  dispatch(ACTIONS.SET_CTX, {
    context,
    value: {
      webviewProvider,
      codingServer,
      depots: [],
      selectedDepot: null,
      selectedMR: null,
      token,
      userInfo: null,
      repoInfo,
    },
  });

  proxyCtx(context);
  init(context);
}

function deactivate() {
  toast.info('plugin deactivate');
}

export { activate, deactivate };
