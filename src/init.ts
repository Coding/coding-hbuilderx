import hx from 'hbuilderx';
import DepotTreeDataProvider from './trees/depot';
import MRTreeDataProvider from './trees/mr';
import { getMRUrl, getDepotUrl } from './utils/repo';
import { IDepot, IMRItem } from './typings/common';

export function registerCommands(context: IContext) {
  const { webviewProvider, repoInfo } = context;

  context.subscriptions.push(hx.commands.registerCommand('codingPlugin.helloWorld', () => {
    hx.window.showInformationMessage('你好，这是我的第一个插件扩展。');
    // webviewProvider.panel.webView.postMessage('hhhhh');
  }));

  context.subscriptions.push(hx.commands.registerCommand('codingPlugin.mrTreeItemClick', function(param: IMRItem) {
    // hx.window.showInformationMessage('选中了TreeItem:' + param[0]);
    // webviewProvider.update(param[0]);
    hx.env.openExternal(getMRUrl(repoInfo.team, param));
  }));

  context.subscriptions.push(hx.commands.registerCommand('codingPlugin.depotTreeItemClick', function(param: IDepot) {
    hx.env.openExternal(getDepotUrl(repoInfo.team, param));
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

export default function init(context: IContext) {
  registerCommands(context);
  createTreeViews(context);
}
