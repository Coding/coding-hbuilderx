"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerTreeViews = exports.registerCommands = void 0;
const hbuilderx_1 = __importDefault(require("hbuilderx"));
const depot_1 = __importDefault(require("./trees/depot"));
const mr_1 = __importDefault(require("./trees/mr"));
const repo_1 = require("./utils/repo");
function registerCommands(context) {
    const { webviewProvider, repoInfo } = context;
    context.subscriptions.push(hbuilderx_1.default.commands.registerCommand('codingPlugin.helloWorld', () => {
        hbuilderx_1.default.window.showInformationMessage('你好，这是我的第一个插件扩展。');
        // webviewProvider.panel.webView.postMessage('hhhhh');
    }));
    context.subscriptions.push(hbuilderx_1.default.commands.registerCommand('codingPlugin.mrTreeItemClick', function (param) {
        // hx.window.showInformationMessage('选中了TreeItem:' + param[0]);
        // webviewProvider.update(param[0]);
        hbuilderx_1.default.env.openExternal(repo_1.getMRUrl(repoInfo.team, param[0]));
    }));
}
exports.registerCommands = registerCommands;
function registerTreeViews(context) {
    context.subscriptions.push(hbuilderx_1.default.window.createTreeView('codingPlugin.treeMR', {
        showCollapseAll: true,
        treeDataProvider: new mr_1.default(context)
    }));
    context.subscriptions.push(hbuilderx_1.default.window.createTreeView('codingPlugin.treeDepot', {
        showCollapseAll: true,
        treeDataProvider: new depot_1.default(context, [
            { name: '仓库列表', children: [{ name: '111' }] },
            { name: '创建仓库' }
        ])
    }));
}
exports.registerTreeViews = registerTreeViews;
function init(context) {
    registerCommands(context);
    registerTreeViews(context);
}
exports.default = init;
