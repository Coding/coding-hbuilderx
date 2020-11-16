"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTreeViews = exports.registerCommands = void 0;
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
        hbuilderx_1.default.env.openExternal(repo_1.getMRUrl(repoInfo.team, param));
    }));
    context.subscriptions.push(hbuilderx_1.default.commands.registerCommand('codingPlugin.depotTreeItemClick', function (param) {
        hbuilderx_1.default.env.openExternal(repo_1.getDepotUrl(repoInfo.team, param));
    }));
}
exports.registerCommands = registerCommands;
function createTreeViews(context) {
    context.subscriptions.push(hbuilderx_1.default.window.createTreeView('codingPlugin.treeMR', {
        showCollapseAll: true,
        treeDataProvider: new mr_1.default(context)
    }));
    context.subscriptions.push(hbuilderx_1.default.window.createTreeView('codingPlugin.treeDepot', {
        showCollapseAll: true,
        treeDataProvider: new depot_1.default(context)
    }));
}
exports.createTreeViews = createTreeViews;
function init(context) {
    registerCommands(context);
    createTreeViews(context);
}
exports.default = init;
