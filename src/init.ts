import hx from 'hbuilderx';
import DepotTreeDataProvider from './trees/depot';
import MRTreeDataProvider from './trees/mr';

import toast from './utils/toast';
import ACTIONS, { dispatch } from './utils/actions';
import { IDepot, IMRItem } from './typings/common';
import * as DCloudService from './services/dcloud';

const { registerCommand } = hx.commands;

export function registerCommands(context: IContext) {
  const { codingServer, webviewProvider } = context;

  context.subscriptions.push(
    registerCommand('codingPlugin.helloWorld', () => {
      toast.info('hello');
    }),
  );

  context.subscriptions.push(
    registerCommand('codingPlugin.mrTreeItemClick', async function ([team, mrItem]: [string, IMRItem]) {
      const matchRes = mrItem.path.match(/\/p\/([^/]+)\/d\/([^/]+)\/git\/merge\/([0-9]+)/);
      if (matchRes) {
        const [, project, repo, mergeRequestIId] = matchRes;
        const result = await codingServer.getMrDetail({ team, project, repo, mergeRequestIId });
        webviewProvider.update({
          session: codingServer.session,
          mrItem: result,
          repoInfo: {
            team,
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
      const team = codingServer.session?.user?.team;
      await codingServer.createDepot(team, depot, depot);
      toast.info('仓库创建成功');
    }),
  );
}

export function createTreeViews(context: IContext) {
  context.subscriptions.push(
    hx.window.createTreeView('codingPlugin.treeMR', {
      showCollapseAll: false,
      treeDataProvider: new MRTreeDataProvider(context),
    }),
  );

  context.subscriptions.push(
    hx.window.createTreeView('codingPlugin.treeDepot', {
      showCollapseAll: true,
      treeDataProvider: new DepotTreeDataProvider(context),
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
    const userData = await codingServer.getUserInfo(repoInfo.team, token);
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
