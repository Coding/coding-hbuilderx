import hx from 'hbuilderx';
import { initCredentials } from './initCredentials';

import toast from '../utils/toast';
import ACTIONS, { dispatch } from '../utils/actions';
import { IDepot, IMRItem, IUserInfo } from '../typings/common';

const { registerCommand, executeCommand } = hx.commands;
const { showQuickPick, showInputBox } = hx.window;

export const refreshTree = () => executeCommand('codingPlugin.refreshTree');

export default function registerCommands(context: IContext) {
  const { codingServer, token } = context;

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
          token,
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
    registerCommand('codingPlugin.createDepot', async function (param: any) {
      const depot = await showInputBox({
        prompt: '请输入仓库名',
      });

      if (!depot) {
        toast.warn('仓库名不能为空');
        return;
      }

      const team = context.userInfo.team;
      const result = await codingServer.createDepot(team, depot, depot);
      if (result) {
        const res = await toast.info('仓库创建成功，是否切换到该仓库？', ['是', '否']);
        if (res === '是') {
          dispatch(ACTIONS.SET_SELECTED_DEPOT, {
            context,
            value: result,
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
      const password = await showInputBox({
        prompt: '配置 CODING 服务密码',
        password: true,
      });

      if (!password) {
        toast.error('服务密码不能为空');
        return;
      }

      const repeatPassword = await showInputBox({
        prompt: '再次确认密码',
        password: true,
      });

      if (password !== repeatPassword) {
        toast.error('两次输入的密码不一致');
        return;
      }

      try {
        const result = await codingServer.createTeam(password);
        if (result) {
          toast.info('团队创建成功');
          dispatch(ACTIONS.SET_TOKEN, {
            context,
            value: result.Token,
          });
          refreshTree();
        }
      } catch (err) {
        toast.error(`创建团队失败`);
        console.error(err);
      }
    }),
  );
}
