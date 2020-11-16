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
class MRTreeDataProvider extends hbuilderx_1.default.TreeDataProvider {
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
                const list = yield this.context.codingServer.getMrList();
                const userId = this.context.userInfo.id;
                const createdList = list.filter((item) => item.author.id === userId);
                const reviewerList = list.filter((item) => item.reviewers.find((r) => r.reviewer.id === userId));
                return Promise.resolve([
                    {
                        title: `Created By Me (${createdList.length})`,
                        children: createdList
                    },
                    {
                        title: `Waiting For My Review (${reviewerList.length})`,
                        children: reviewerList
                    }
                ]);
            }
            catch (_a) {
                console.error('获取MR列表失败');
                Promise.resolve([]);
            }
        });
    }
    getTreeItem(element) {
        return {
            label: element.title,
            collapsibleState: element.children ? 1 : 0,
            command: {
                command: element.children ? '' : 'codingPlugin.mrTreeItemClick',
                arguments: element
            }
        };
    }
}
exports.default = MRTreeDataProvider;
