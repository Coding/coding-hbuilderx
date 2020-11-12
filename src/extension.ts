import hx from 'hbuilderx';
import TreeDataProvider from './tree';
import WebviewProvider from './webview';
import { registerCommands } from './commands';
import { treeData } from './constants/tree';

function activate(context: IContext) {
  const webviewProvider = new WebviewProvider();
  const treeDataProvider = new TreeDataProvider(treeData);

  context.ctx = {
    webviewProvider,
    treeDataProvider
  };

  registerCommands(context);
}

function deactivate() {
  console.log('plugin deactivate');
}

export {
  activate,
  deactivate
};
