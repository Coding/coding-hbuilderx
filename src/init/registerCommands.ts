import hx from 'hbuilderx';
import { initCredentials } from './initCredentials';
import { readConfig } from '../services/dcloud';
import { gitListRemotes, gitInit, gitAdd, gitCommit, gitAddRemote, gitPush, gitChanged } from '../services/git';

import toast from '../utils/toast';
import ACTIONS, { dispatch } from '../utils/actions';
import { IDepot, IMRItem, IUserInfo } from '../typings/common';

const { registerCommand, executeCommand } = hx.commands;
const { showQuickPick, showInputBox } = hx.window;

export const refreshTree = () => executeCommand('codingPlugin.refreshTree');

interface IWorkspaceFolder {
  fsPath: string;
  workspaceFolder: {
    id: string;
    metatype: string;
    name: string;
  };
}

export default function registerCommands(context: IContext) {
  const { codingServer } = context;

  context.subscriptions.push(
    registerCommand(`codingPlugin.gitPush`, async function (param: IWorkspaceFolder) {
      const executor = async () => {
        const { fsPath } = param;
        const changed = await gitChanged(fsPath);
        if (!changed) {
          toast.warn(`代码没有变更`);
          return;
        }
        const commitMsg = await showInputBox({
          prompt: '请输入 git commit 信息',
        });
        await gitAdd(fsPath);
        await gitCommit(fsPath, commitMsg || `feat: update`);
        await gitPush(fsPath, (code) => {
          if (code === 0) {
            toast.info(`提交成功`);
          } else {
            toast.error(`操作失败`);
          }
        });
      };

      const token = await readConfig(`token`);
      if (!token) {
        await initCredentials(context, () => {
          executor();
        });
        return;
      }

      executor();
    }),
  );

  context.subscriptions.push(
    registerCommand('codingPlugin.connect', async function (param: IWorkspaceFolder) {
      const executor = async () => {
        const {
          fsPath,
          workspaceFolder: { name },
        } = param;
        const team = context.userInfo.team;
        const reg = new RegExp(`^(https:\\/\\/|git@)(.*)(e\\.coding\\.net(\\/${team}|:${team})(.*)\\.git)$`, 'i');

        let remotes: any[] = [];
        try {
          remotes = await gitListRemotes(fsPath);
        } catch {
          await gitInit(fsPath);
          await gitAdd(fsPath);
          await gitCommit(fsPath);
        } finally {
          const codingRemote = remotes.find((item) => item.url.match(reg));
          if (codingRemote) {
            toast.warn(`${name} 已经是 CODING 的代码仓库`);
          } else {
            const result = await codingServer.createDepot(team, name, name);
            await gitAddRemote(fsPath, result.gitHttpsUrl);
            await gitPush(fsPath, (code) => {
              if (code === 0) {
                toast.info(`${name} 托管到 CODING 成功。${result.gitHttpsUrl}`);
              } else {
                toast.error(`操作失败`);
              }
            });
          }
        }
      };

      const token = await readConfig(`token`);
      if (!token) {
        await initCredentials(context, () => {
          executor();
        });
        return;
      }

      executor();
    }),
  );

  context.subscriptions.push(
    registerCommand('codingPlugin.pickDepot', async function () {
      const options: IQuickPickOption[] = [];
      context.depots.forEach((depot: IDepot) => {
        const { name, depotPath } = depot;
        const project = depotPath.match(/\/p\/([^/]+)\//)?.[1];
        options.push({
          label: name,
          description: `(project: ${project})`,
          depot,
        });
      });

      const result = await showQuickPick(options);
      dispatch(ACTIONS.SET_SELECTED_DEPOT, {
        context,
        value: result.depot,
      });
      refreshTree();
    }),
  );

  context.subscriptions.push(
    registerCommand('codingPlugin.mrTreeItemClick', async function ([userInfo, mrItem]: [IUserInfo, IMRItem]) {
      if (context.selectedMR?.id === mrItem.id) return;

      dispatch(ACTIONS.SET_SELECTED_MR, {
        context,
        value: mrItem,
      });

      const matchRes = mrItem.path.match(/\/p\/([^/]+)\/d\/([^/]+)\/git\/merge\/([0-9]+)/);
      if (matchRes) {
        const [, project, repo, mergeRequestIId] = matchRes;
        context.webviewProvider.update({
          token: context.token,
          userInfo,
          mergeRequestIId,
          repoInfo: {
            team: userInfo.team,
            project,
            repo,
          },
        });
      }
    }),
  );

  context.subscriptions.push(
    registerCommand('codingPlugin.depotTreeItemClick', function (param: IDepot) {
      toast.info(`选中仓库：${param.name}`);
      dispatch(ACTIONS.SET_SELECTED_DEPOT, {
        context,
        value: param,
      });
    }),
  );

  context.subscriptions.push(
    registerCommand('codingPlugin.createDepot', async function (callback: any) {
      const depot = await showInputBox({
        prompt: '请输入仓库名',
      });

      if (!depot) {
        toast.warn('仓库名不能为空');
        return;
      }

      const team = context.userInfo.team;
      const result = await codingServer.createDepot(team, depot, depot);
      const webview = context.webviewProvider?.panel.webView;
      if (result) {
        webview.postMessage({
          command: 'create.depot.success',
          data: result,
        });
        const res = await toast.info('仓库创建成功，是否切换到该仓库？', ['是', '否']);
        if (res === '是') {
          dispatch(ACTIONS.SET_SELECTED_DEPOT, {
            context,
            value: result,
          });
          webview.postMessage({
            command: 'create.depot.switch',
            data: result,
          });
        }
        refreshTree();
      }
    }),
  );

  context.subscriptions.push(
    registerCommand('codingPlugin.auth', async function () {
      initCredentials(context);
    }),
  );

  context.subscriptions.push(
    registerCommand('codingPlugin.login', async function () {
      const newToken = await showInputBox({
        prompt: '请输入 CODING 个人令牌',
      });

      if (!newToken) {
        toast.error(`个人令牌不能为空`);
        return;
      }

      try {
        const userInfo = await codingServer.getUserInfo(newToken);
        if (userInfo) {
          dispatch(ACTIONS.SET_TOKEN, {
            context,
            value: newToken,
          });
          refreshTree();
          context.webviewProvider.refresh();
        }
      } catch {
        toast.error(`个人令牌无效`);
      }
    }),
  );

  context.subscriptions.push(
    registerCommand('codingPlugin.refreshTree', async function () {
      console.log('refresh');
    }),
  );

  context.subscriptions.push(
    registerCommand('codingPlugin.createTeam', async function () {
      try {
        const result = await codingServer.createTeam();
        if (result) {
          toast.info(`团队创建成功，初始密码为 coding12345`);
          dispatch(ACTIONS.SET_TOKEN, {
            context,
            value: result.Token,
          });
          const userData = await codingServer.getUserInfo(result.Token);
          dispatch(ACTIONS.SET_USER_INFO, {
            context: context,
            value: userData,
          });
          refreshTree();
          context.webviewProvider.refresh();
        }
      } catch (err) {
        toast.error(`创建团队失败`);
        console.error(err);
      }
    }),
  );
}
