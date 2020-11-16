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
const hbuilderx_1 = __importDefault(require("hbuilderx"));
class DepotTreeDataProvider extends hbuilderx_1.default.TreeDataProvider {
    constructor(context) {
        super();
        this.context = context;
    }
    getChildren(element) {
        return __awaiter(this, void 0, void 0, function* () {
            if (element) {
                return Promise.resolve(element.children);
            }
            try {
                const depots = yield this.context.codingServer.getDepotList();
                return Promise.resolve([
                    {
                        name: '创建仓库',
                        disableClick: true,
                    },
                    {
                        name: '仓库列表',
                        children: depots
                    }
                ]);
            }
            catch (_a) {
                console.error('获取仓库列表失败');
            }
        });
    }
    getTreeItem(element) {
        return {
            label: element.name,
            collapsibleState: element.children ? 1 : 0,
            command: {
                command: (element.children || element.disableClick) ? '' : 'codingPlugin.depotTreeItemClick',
                arguments: element
            }
        };
    }
}
exports.default = DepotTreeDataProvider;
