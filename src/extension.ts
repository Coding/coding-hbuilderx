import initialize from './initialize';
import CodingServer from './services/codingServer';
import ACTIONS, { dispatch } from './utils/actions';
import { proxyCtx } from './utils/proxy';
import toast from './utils/toast';
import { readConfig } from './services/dcloud';

async function activate(context: IContext) {
  const codingServer = new CodingServer(context);
  const repoInfo = await CodingServer.getRepoParams();
  console.warn('repoInfo: ', repoInfo);
  const token = await readConfig(`token`);

  dispatch(ACTIONS.SET_CTX, {
    context,
    value: {
      webviewProvider: null,
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
