import initialize from './initialize';
import CodingServer from './services/codingServer';
import WebviewProvider from './webviews';
import ACTIONS, { dispatch } from './utils/actions';
import { proxyCtx } from './utils/proxy';
import toast from './utils/toast';
import { readConfig } from './services/dcloud';

async function activate(context: IContext) {
  const webviewProvider = new WebviewProvider(context);
  const repoInfo = await CodingServer.getRepoParams();
  console.log('repoInfo: ', repoInfo);
  const token = await readConfig(`token`);

  const codingServer = new CodingServer(context);

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
  initialize(context);
}

function deactivate() {
  toast.info('plugin deactivate');
}

export { activate, deactivate };
