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
exports.deactivate = exports.activate = void 0;
const init_1 = __importDefault(require("./init"));
const webview_1 = __importDefault(require("./webview"));
const codingServer_1 = __importDefault(require("./services/codingServer"));
const proxy_1 = require("./utils/proxy");
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const webviewProvider = new webview_1.default();
        const repoInfo = yield codingServer_1.default.getRepoParams();
        console.log('repoInfo ==> ', repoInfo);
        const codingServer = new codingServer_1.default({
            id: '123',
            user: {
                avatar: 'string',
                global_key: 'string',
                name: 'string',
                path: 'string',
                team: 'string'
            },
            accessToken: '1b7fca3bd7594a89b0f5e2a0250c1147',
            refreshToken: 'abc'
        }, repoInfo || {
            team: 'codingcorp',
            project: 'mo-test',
            repo: 'mo-test'
        });
        let userInfo = null;
        if (repoInfo) {
            userInfo = yield codingServer.getUserInfo(repoInfo.team);
        }
        context.ctx = {
            webviewProvider,
            codingServer,
            repoInfo,
            userInfo
        };
        proxy_1.proxyCtx(context);
        init_1.default(context);
    });
}
exports.activate = activate;
function deactivate() {
    console.log('plugin deactivate');
}
exports.deactivate = deactivate;
