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
const fs_1 = __importDefault(require("fs"));
const axios_1 = __importDefault(require("axios"));
const isomorphic_git_1 = __importDefault(require("isomorphic-git"));
const repo_1 = require("../utils/repo");
const accessToken = '1b7fca3bd7594a89b0f5e2a0250c1147';
class CodingServer {
    constructor(session, repo) {
        this._repo = {};
        if (session) {
            this._session = session;
        }
        if (repo) {
            this._repo = repo;
        }
    }
    static getRepoParams() {
        return __awaiter(this, void 0, void 0, function* () {
            const folders = yield hbuilderx_1.default.workspace.getWorkspaceFolders();
            if (!folders.length) {
                console.warn('workspace中没有目录');
                return;
            }
            try {
                const remotes = yield isomorphic_git_1.default.listRemotes({ fs: fs_1.default, dir: folders[0].uri.path });
                return repo_1.parseCloneUrl(remotes[0].url);
            }
            catch (_a) {
                console.error('该目录没有进行git初始化');
            }
        });
    }
    getUserInfo(team, token) {
        var _a, _b;
        if (token === void 0) { token = ((_a = this._session) === null || _a === void 0 ? void 0 : _a.accessToken) || ``; }
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield axios_1.default.get(`https://${team}.coding.net/api/current_user`, {
                    params: {
                        access_token: token,
                    },
                });
                if (result.data.code) {
                    console.error(result.data.msg);
                    return Promise.reject(result.data.msg);
                }
                return (_b = result.data) === null || _b === void 0 ? void 0 : _b.data;
            }
            catch (err) {
                throw Error(err);
            }
        });
    }
    getMrList(team = this._repo.team, project = this._repo.project, repo = this._repo.repo) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const url = `https://${team}.coding.net/api/user/${team}/project/${project}/depot/${repo}/git/merges/query`;
            const result = yield axios_1.default.get(url, {
                params: {
                    status: `open`,
                    sort: `action_at`,
                    page: 1,
                    PageSize: 100,
                    sortDirection: `DESC`,
                    access_token: accessToken,
                }
            });
            return ((_b = (_a = result.data) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.list) || [];
        });
    }
}
exports.default = CodingServer;