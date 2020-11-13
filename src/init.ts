import hx from 'hbuilderx';
import DepotTreeDataProvider from './trees/depot';
import MRTreeDataProvider from './trees/mr';
import { getMRUrl } from './utils/repo';

export function registerCommands(context: IContext) {
  const { webviewProvider, repoInfo } = context;

  context.subscriptions.push(hx.commands.registerCommand('codingPlugin.helloWorld', () => {
    hx.window.showInformationMessage('你好，这是我的第一个插件扩展。');
    // webviewProvider.panel.webView.postMessage('hhhhh');
  }));

  context.subscriptions.push(hx.commands.registerCommand('codingPlugin.mrTreeItemClick', function(param: any[]) {
    // hx.window.showInformationMessage('选中了TreeItem:' + param[0]);
    // webviewProvider.update(param[0]);
    hx.env.openExternal(getMRUrl(repoInfo.team, param[0]));
  }));
}

export function registerTreeViews(context: IContext) {
  context.subscriptions.push(hx.window.createTreeView('codingPlugin.treeMR', {
    showCollapseAll: true,
    treeDataProvider: new MRTreeDataProvider(context)
  }));

  context.subscriptions.push(hx.window.createTreeView('codingPlugin.treeDepot', {
    showCollapseAll: true,
    treeDataProvider: new DepotTreeDataProvider(context, [
      { name: '仓库列表', children: [{ name: '111' }] },
      { name: '创建仓库' }
    ])
  }));
}

export default function init(context: IContext) {
  registerCommands(context);
  registerTreeViews(context);
}
