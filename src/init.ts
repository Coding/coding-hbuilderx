import hx from 'hbuilderx';
import DepotTreeDataProvider from './trees/depot';
import MRTreeDataProvider from './trees/mr';
import DepotMRTreeDataProvider from './trees/depotMR';
import MRCustomEditorProvider from './customEditors/mergeRequest';

import toast from './utils/toast';
import ACTIONS, { dispatch } from './utils/actions';
import { IDepot, IMRItem, IUserInfo } from './typings/common';
import * as DCloudService from './services/dcloud';

const { registerCommand } = hx.commands;
const { createTreeView } = hx.window;

export function registerCommands(context: IContext) {
  const { codingServer, token } = context;

  context.subscriptions.push(
    registerCommand('codingPlugin.mrTreeItemClick', async function ([userInfo, mrItem]: [IUserInfo, IMRItem]) {
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
        toast.info('仓库创建成功');
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

export function workspaceInit() {
  hx.workspace.onDidChangeWorkspaceFolders(function (event: any) {
    if (event.added) {
      event.added.forEach((item: any) => console.log('新增了项目: ', item.name));
    }

    if (event.removed) {
      event.removed.forEach((item: any) => console.log('移除了项目: ', item.name));
    }
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
  workspaceInit();
  initCredentials(context);
}
