import hx from 'hbuilderx';
import * as DCloudService from '../services/dcloud';
import toast from '../utils/toast';
import { refreshTree } from './registerCommands';

const { executeCommand } = hx.commands;

export async function initCredentials(context: IContext) {
  try {
    let hbToken = await DCloudService.readConfig(`hbToken`);
    const token = await DCloudService.readConfig(`token`);

    if (!hbToken) {
      const code = await DCloudService.grantForUserInfo();
      const tokenResult = await DCloudService.applyForToken(code);
      hbToken = tokenResult.data.access_token;
    }

    const resp = await DCloudService.fetchUser(hbToken);
    toast.info(`logged in as DCloud user: ${resp.data.nickname} ${resp.data.email}`);

    if (!token) {
      await executeCommand('codingPlugin.createTeam');
    }

    const {
      ctx: { codingServer, token: accessToken },
    } = context;
    if (accessToken) {
      const userData = await codingServer.getUserInfo(accessToken);
      toast.info(`logged in as CODING user: ${userData.name} @ ${userData.team}`);
    }
  } catch (err) {
    if (err === 1) {
      toast.warn(`请先登录 DCloud`);
    }
  } finally {
    refreshTree();
  }
}
