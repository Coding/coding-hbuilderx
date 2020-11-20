import init from './init';
import CodingServer from './services/codingServer';
import WebviewProvider from './webviews';
import ACTIONS, { dispatch } from './utils/actions';
import { proxyCtx } from './utils/proxy';
import toast from './utils/toast';

// const accessToken = '7e4d9d17f87875e731d536d13635a700ddf52b12';
// const user = {
//   id: 8005956,
//   avatar: 'https://coding-net-production-static-ci.codehub.cn/WM-TEXT-AVATAR-lvVeBfbGLtCPdcsAOPod.jpg',
//   global_key: 'PDCOwrBjib',
//   name: 'uniquemo',
//   path: '/u/PDCOwrBjib',
//   team: 'uniquemo',
// };

const accessToken = '6e15bbb9960810111c90086a6efc07a923dea5a3';
const user = {
  id: 8003868,
  avatar: 'https://coding-net-production-static-ci.codehub.cn/WM-TEXT-AVATAR-lvVeBfbGLtCPdcsAOPod.jpg',
  global_key: 'dHzOCagiSb',
  name: '莫泳欣',
  path: '/u/dHzOCagiSb',
  team: 'codingcorp',
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

  dispatch(ACTIONS.SET_CTX, {
    context,
    value: {
      webviewProvider,
      codingServer,
      depots: [],
      selectedDepot: null,
    },
  });

  proxyCtx(context);
  init(context);
}

function deactivate() {
  toast.info('plugin deactivate');
}

export { activate, deactivate };
