"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommands = void 0;
const hbuilderx_1 = __importDefault(require("hbuilderx"));
function registerCommands(context) {
    const { webviewProvider, treeDataProvider } = context.ctx;
    context.subscriptions.push(hbuilderx_1.default.commands.registerCommand('codingPlugin.helloWorld', () => {
        hbuilderx_1.default.window.showInformationMessage('你好，这是我的第一个插件扩展。');
        // webviewProvider.panel.webView.postMessage('hhhhh');
    }));
    context.subscriptions.push(hbuilderx_1.default.commands.registerCommand('codingPlugin.treeItemClick', function (param) {
        hbuilderx_1.default.window.showInformationMessage('选中了TreeItem:' + param[0]);
        webviewProvider.update(param[0]);
    }));
    context.subscriptions.push(hbuilderx_1.default.window.createTreeView('codingPlugin.tree', {
        showCollapseAll: true,
        treeDataProvider
    }));
}
exports.registerCommands = registerCommands;
