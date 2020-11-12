import hx from 'hbuilderx';

export function registerCommands(context: IContext) {
  const { webviewProvider, treeDataProvider } = context.ctx;

  context.subscriptions.push(hx.commands.registerCommand('codingPlugin.helloWorld', () => {
    hx.window.showInformationMessage('你好，这是我的第一个插件扩展。');
    // webviewProvider.panel.webView.postMessage('hhhhh');
  }));

  context.subscriptions.push(hx.commands.registerCommand('codingPlugin.treeItemClick', function(param: any[]) {
    hx.window.showInformationMessage('选中了TreeItem:' + param[0]);
    webviewProvider.update(param[0]);
  }));

  context.subscriptions.push(hx.window.createTreeView('codingPlugin.tree', {
    showCollapseAll: true,
    treeDataProvider
  }));
}
