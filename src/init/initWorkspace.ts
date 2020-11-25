import hx from 'hbuilderx';
import CodingServer from '../services/codingServer';
import ACTIONS, { dispatch } from '../utils/actions';

function initWorkspace(context: IContext) {
  hx.workspace.onDidChangeWorkspaceFolders(async function () {
    const repoInfo = await CodingServer.getRepoParams();
    dispatch(ACTIONS.SET_REPO_INFO, {
      context,
      value: repoInfo,
    });
  });
}

export default initWorkspace;
