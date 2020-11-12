"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hbuilderx_1 = __importDefault(require("hbuilderx"));
class TreeDataProvider extends hbuilderx_1.default.TreeDataProvider {
    constructor(treeData) {
        super();
        this._treeData = treeData;
    }
    getChildren(element) {
        return new Promise(resolve => {
            if (!element) {
                resolve(this._treeData);
            }
            else {
                resolve(element.children);
            }
        });
    }
    getTreeItem(element) {
        return {
            label: element.name,
            collapsibleState: element.children ? 1 : 0,
            command: {
                command: element.children ? '' : 'codingPlugin.treeItemClick',
                arguments: [
                    element.name
                ]
            }
        };
    }
}
exports.default = TreeDataProvider;
