import hx from 'hbuilderx';
import init from './init';
import WebviewProvider from './webview';
import CodingServer from './services/codingServer';
import { proxyCtx } from './utils/proxy';

const accessToken = '1b7fca3bd7594a89b0f5e2a0250c1147';

async function activate(context: IContext) {
  // TODO: 认证，拿到用户信息

  const webviewProvider = new WebviewProvider();
  const repoInfo = await CodingServer.getRepoParams();
  console.log('repoInfo ==> ', repoInfo);

  if (!repoInfo) {
    hx.window.showWarningMessage('workspace中没有CODING的代码仓库');
    return;
  }

  const codingServer = new CodingServer(
    {
      id: '123',
      user: {
        avatar: 'string',
        global_key: 'string',
        name: 'string',
        path: 'string',
        team: 'string'
      },
      accessToken,
      refreshToken: 'abc'
    },
    repoInfo || {
      team: 'codingcorp',
      project: 'mo-test',
      repo: 'mo-test'
    }
  );

  let userInfo = null;
  if (repoInfo) {
    userInfo = await codingServer.getUserInfo(repoInfo.team);
  }

  context.ctx = {
    webviewProvider,
    codingServer,
    repoInfo,
    userInfo
  };

  proxyCtx(context);
  init(context);
}

function deactivate() {
  console.log('plugin deactivate');
}

export {
  activate,
  deactivate
};
