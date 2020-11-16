"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clear = exports.workspaceInit = exports.createTreeViews = exports.registerCommands = void 0;
const hbuilderx_1 = __importDefault(require("hbuilderx"));
const depot_1 = __importDefault(require("./trees/depot"));
const mr_1 = __importDefault(require("./trees/mr"));
const repo_1 = require("./utils/repo");
function registerCommands(context) {
    const { webviewProvider, repoInfo, codingServer } = context;
    const { team, project } = repoInfo;
    context.subscriptions.push(hbuilderx_1.default.commands.registerCommand('codingPlugin.helloWorld', () => {
        hbuilderx_1.default.window.showInformationMessage('你好，这是我的第一个插件扩展。');
    }));
    context.subscriptions.push(hbuilderx_1.default.commands.registerCommand('codingPlugin.mrTreeItemClick', function (param) {
        // webviewProvider.update(param[0]);
        hbuilderx_1.default.env.openExternal(repo_1.getMRUrl(team, param));
    }));
    context.subscriptions.push(hbuilderx_1.default.commands.registerCommand('codingPlugin.depotTreeItemClick', function (param) {
        console.log('选中了: ', param);
    }));
    context.subscriptions.push(hbuilderx_1.default.commands.registerCommand('codingPlugin.createProjectAndDepot', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const project = yield hbuilderx_1.default.window.showInputBox({
                prompt: '请输入项目名'
            });
            const depot = yield hbuilderx_1.default.window.showInputBox({
                prompt: '请输入仓库名'
            });
        });
    }));
    context.subscriptions.push(hbuilderx_1.default.commands.registerCommand('codingPlugin.createDepot', function (param) {
        return __awaiter(this, void 0, void 0, function* () {
            const depot = yield hbuilderx_1.default.window.showInputBox({
                prompt: '请输入仓库名'
            });
            const result = yield codingServer.createDepot(team, depot, depot);
            // TODO: 拉取代码，更新workspace
        });
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
function workspaceInit() {
    hbuilderx_1.default.workspace.onDidChangeWorkspaceFolders(function (event) {
        if (event.added) {
            event.added.forEach((item) => console.log('新增了项目: ', item.name));
        }
        if (event.removed) {
            event.removed.forEach((item) => console.log('移除了项目: ', item.name));
        }
    });
}
exports.workspaceInit = workspaceInit;
function clear(context) {
    context.subscriptions.forEach(({ dispose }) => dispose());
}
exports.clear = clear;
function init(context) {
    registerCommands(context);
    createTreeViews(context);
    workspaceInit();
}
exports.default = init;
