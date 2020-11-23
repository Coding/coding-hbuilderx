import hx from 'hbuilderx';
import DepotTreeDataProvider from './trees/depot';
import MRTreeDataProvider from './trees/mr';
import DepotMRTreeDataProvider from './trees/depotMR';
import MRCustomEditorProvider from './customEditors/mergeRequest';

import toast from './utils/toast';
import ACTIONS, { dispatch } from './utils/actions';
import { IDepot, IMRItem, IUserInfo } from './typings/common';
import * as DCloudService from './services/dcloud';
import CodingServer from './services/codingServer';

const { registerCommand } = hx.commands;
const { createTreeView, showQuickPick } = hx.window;

export function registerCommands(context: IContext) {
  const { codingServer, token } = context;

  context.subscriptions.push(
    registerCommand('codingPlugin.pickDepot', async function () {
      const options: IQuickPickOption[] = [];
      context.depots.forEach((depot: IDepot) => {
        options.push({
          label: depot.name,
          depot,
        });
      });

      const result = await showQuickPick(options);
      dispatch(ACTIONS.SET_SELECTED_DEPOT, {
        context,
        value: result.depot,
      });
    }),
  );

  context.subscriptions.push(
    registerCommand('codingPlugin.mrTreeItemClick', async function ([userInfo, mrItem]: [IUserInfo, IMRItem]) {
      if (context.selectedMR?.id === mrItem.id) return;

      const matchRes = mrItem.path.match(/\/p\/([^/]+)\/d\/([^/]+)\/git\/merge\/([0-9]+)/);
      if (matchRes) {
        const [, project, repo, mergeRequestIId] = matchRes;
        context.webviewProvider.update({
          token,
          userInfo,
          mergeRequestIId,
          repoInfo: {
            team: userInfo.team,
            project,
            repo,
          },
        });
        dispatch(ACTIONS.SET_SELECTED_MR, {
          context,
          value: mrItem,
        });
      }
    }),
  );

  context.subscriptions.push(
    registerCommand('codingPlugin.depotTreeItemClick', function (param: IDepot) {
      toast.info(`选中仓库：${param.name}`);
      dispatch(ACTIONS.SET_SELECTED_DEPOT, {
        context,
        value: param,
      });
    }),
  );

  context.subscriptions.push(
    registerCommand('codingPlugin.createDepot', async function (param: any) {
      const depot = await hx.window.showInputBox({
        prompt: '请输入仓库名',
      });

      if (!depot) {
        toast.warn('仓库名不能为空');
        return;
      }

      const team = context.userInfo.team;
      const result = await codingServer.createDepot(team, depot, depot);
      if (result) {
        const res = await toast.info('仓库创建成功，是否切换到该仓库？', ['是', '否']);
        if (res === '是') {
          dispatch(ACTIONS.SET_SELECTED_DEPOT, {
            context,
            value: result,
          });
        }
      }
    }),
  );
}

export function createTreeViews(context: IContext) {
  context.subscriptions.push(
    createTreeView('codingPlugin.treeMR', {
      showCollapseAll: false,
      treeDataProvider: new MRTreeDataProvider(context),
    }),
  );

  context.subscriptions.push(
    createTreeView('codingPlugin.treeDepot', {
      showCollapseAll: false,
      treeDataProvider: new DepotTreeDataProvider(context),
    }),
  );

  context.subscriptions.push(
    createTreeView('codingPlugin.treeDepotMR', {
      showCollapseAll: false,
      treeDataProvider: new DepotMRTreeDataProvider(context),
    }),
  );
}

export function workspaceInit(context: IContext) {
  hx.workspace.onDidChangeWorkspaceFolders(async function () {
    const repoInfo = await CodingServer.getRepoParams();
    dispatch(ACTIONS.SET_REPO_INFO, {
      context,
      value: repoInfo,
    });
  });
}

export function clear(context: IContext) {
  context.subscriptions.forEach(({ dispose }) => dispose());
}

export function registerCustomEditors(context: IContext) {
  const mrCustomEditor = new MRCustomEditorProvider(context);
  hx.window.registerCustomEditorProvider('customEditor.mrDetail', mrCustomEditor);

  dispatch(ACTIONS.SET_MR_CUSTOM_EDITOR, {
    context,
    value: mrCustomEditor,
  });
}

async function initCredentials(context: IContext) {
  try {
    let hbToken = await DCloudService.readConfig(`hbToken`);
    if (!hbToken) {
      const code = await DCloudService.grantForUserInfo();
      const tokenResult = await DCloudService.applyForToken(code);
      hbToken = tokenResult.data.access_token;
    }
    const resp = await DCloudService.fetchUser(hbToken);
    toast.info(`logged in as DCloud user: ${resp.data.nickname} ${resp.data.email}`);
    const {
      ctx: { codingServer, repoInfo, token },
    } = context;
    const userData = await codingServer.getUserInfo(token);
    toast.info(`logged in as coding user: ${userData.name} @ ${userData.team}`);
  } catch (err) {
    console.error(err);
  }
}

export default function init(context: IContext) {
  registerCommands(context);
  createTreeViews(context);
  workspaceInit(context);
  initCredentials(context);
}
