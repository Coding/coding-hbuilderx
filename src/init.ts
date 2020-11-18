import hx from 'hbuilderx';
import DepotTreeDataProvider from './trees/depot';
import MRTreeDataProvider from './trees/mr';

import toast from './utils/toast';
import { getMRUrl } from './utils/repo';
import ACTIONS, { dispatch } from './utils/actions';
import { IDepot, IMRItem } from './typings/common';

export function registerCommands(context: IContext) {
  const { codingServer } = context;

  context.subscriptions.push(
    hx.commands.registerCommand('codingPlugin.helloWorld', () => {
      toast.info('hello');
    }),
  );

  context.subscriptions.push(
    hx.commands.registerCommand('codingPlugin.mrTreeItemClick', function ([team, mrItem]: [string, IMRItem]) {
      hx.env.openExternal(getMRUrl(team, mrItem));
    }),
  );

  context.subscriptions.push(
    hx.commands.registerCommand('codingPlugin.depotTreeItemClick', function (param: IDepot) {
      toast.info(`选中仓库：${param.name}`);
      dispatch(ACTIONS.SET_SELECTED_DEPOT, {
        context,
        value: param,
      });
    }),
  );

  context.subscriptions.push(
    hx.commands.registerCommand('codingPlugin.createDepot', async function (param: any) {
      const depot = await hx.window.showInputBox({
        prompt: '请输入仓库名',
      });
      const team = codingServer.session?.user?.team;
      const result = await codingServer.createDepot(team, depot, depot);
      // TODO: 拉取代码，更新workspace
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

export default function init(context: IContext) {
  registerCommands(context);
  createTreeViews(context);
  workspaceInit();
}
