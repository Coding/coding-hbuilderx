import hx from 'hbuilderx';
import DepotTreeDataProvider from './trees/depot';
import MRTreeDataProvider from './trees/mr';
import { getMRUrl } from './utils/repo';
import { IDepot, IMRItem } from './typings/common';

export function registerCommands(context: IContext) {
  const { webviewProvider, repoInfo, codingServer } = context;
  const { team, project } = repoInfo;

  context.subscriptions.push(hx.commands.registerCommand('codingPlugin.helloWorld', () => {
    hx.window.showInformationMessage('你好，这是我的第一个插件扩展。');
  }));

  context.subscriptions.push(hx.commands.registerCommand('codingPlugin.mrTreeItemClick', function(param: IMRItem) {
    // webviewProvider.update(param[0]);
    hx.env.openExternal(getMRUrl(team, param));
  }));

  context.subscriptions.push(hx.commands.registerCommand('codingPlugin.depotTreeItemClick', function(param: IDepot) {
    console.log('选中了: ', param);
  }));

  context.subscriptions.push(hx.commands.registerCommand('codingPlugin.createProjectAndDepot', async function() {
    const project = await hx.window.showInputBox({
      prompt: '请输入项目名'
    });
    const depot = await hx.window.showInputBox({
      prompt: '请输入仓库名'
    });
  }));

  context.subscriptions.push(hx.commands.registerCommand('codingPlugin.createDepot', async function(param: any) {
    const depot = await hx.window.showInputBox({
      prompt: '请输入仓库名'
    });
    const result = await codingServer.createDepot(team, depot, depot);
    // TODO: 拉取代码，更新workspace
  }));
}

export function createTreeViews(context: IContext) {
  context.subscriptions.push(hx.window.createTreeView('codingPlugin.treeMR', {
    showCollapseAll: true,
    treeDataProvider: new MRTreeDataProvider(context)
  }));

  context.subscriptions.push(hx.window.createTreeView('codingPlugin.treeDepot', {
    showCollapseAll: true,
    treeDataProvider: new DepotTreeDataProvider(context)
  }));
}

export function workspaceInit() {
  hx.workspace.onDidChangeWorkspaceFolders(function(event: any) {
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
