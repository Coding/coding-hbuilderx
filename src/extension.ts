import init from './init';
import WebviewProvider from './webview';
import CodingServer from './services/codingServer';
import ACTIONS, { dispatch } from './utils/actions';
import { proxyCtx } from './utils/proxy';
import toast from './utils/toast';
import { readConfig } from './services/dcloud';

const accessToken = '7e4d9d17f87875e731d536d13635a700ddf52b12';
const user = {
  id: 8005956,
  avatar: 'https://coding-net-production-static-ci.codehub.cn/WM-TEXT-AVATAR-lvVeBfbGLtCPdcsAOPod.jpg',
  global_key: 'PDCOwrBjib',
  name: 'uniquemo',
  path: '/u/PDCOwrBjib',
  team: 'uniquemo',
};

async function activate(context: IContext) {
  // TODO: 认证，拿到用户信息

  const webviewProvider = new WebviewProvider();
  const repoInfo = await CodingServer.getRepoParams();
  console.log('repoInfo ==> ', repoInfo);
  const token = await readConfig(`token`);
  if (!token) {
    toast.warn(`请先登录 CODING`);
  }

  const codingServer = new CodingServer(
    {
      id: 'abc',
      user,
      accessToken,
      refreshToken: 'abc',
    },
    repoInfo,
  );

  dispatch(ACTIONS.SET_CTX, {
    context,
    value: {
      webviewProvider,
      codingServer,
      depots: [],
      selectedDepot: null,
      token,
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
