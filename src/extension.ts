import init from './init';
import WebviewProvider from './webview';
import CodingServer from './services/codingServer';
import { proxyCtx } from './utils/proxy';

const accessToken = '1b7fca3bd7594a89b0f5e2a0250c1147';
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

  const codingServer = new CodingServer(
    {
      id: 'abc',
      user,
      accessToken,
      refreshToken: 'abc',
    },
    repoInfo,
  );

  context.ctx = {
    webviewProvider,
    codingServer,
    repoInfo,
    depots: [],
    selectedDepot: null,
  };

  proxyCtx(context);
  init(context);
}

function deactivate() {
  console.log('plugin deactivate');
}

export { activate, deactivate };
