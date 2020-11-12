"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const tree_1 = __importDefault(require("./tree"));
const webview_1 = __importDefault(require("./webview"));
const commands_1 = require("./commands");
const tree_2 = require("./constants/tree");
function activate(context) {
    const webviewProvider = new webview_1.default();
    const treeDataProvider = new tree_1.default(tree_2.treeData);
    context.ctx = {
        webviewProvider,
        treeDataProvider
    };
    commands_1.registerCommands(context);
}
exports.activate = activate;
function deactivate() {
    console.log('plugin deactivate');
}
exports.deactivate = deactivate;
