import hx from 'hbuilderx';
import * as DCloudService from '../services/dcloud';
import toast from '../utils/toast';

const { executeCommand } = hx.commands;

export async function initCredentials(context: IContext) {
  try {
    let hbToken = await DCloudService.readConfig(`hbToken`);
    console.log('hbToken => ', hbToken);

    if (!hbToken) {
      const code = await DCloudService.grantForUserInfo();
      console.log('code => ', code);
      const tokenResult = await DCloudService.applyForToken(code);
      console.log('tokenResult => ', tokenResult);
      hbToken = tokenResult.data.access_token;
    }

    const resp = await DCloudService.fetchUser(hbToken);
    console.log('resp => ', resp);
    toast.info(`logged in as DCloud user: ${resp.data.nickname} ${resp.data.email}`);

    executeCommand('codingPlugin.password');

    // const {
    //   ctx: { codingServer, repoInfo, token },
    // } = context;
    // const userData = await codingServer.getUserInfo(token);
    // console.log('userData => ', userData);
    // toast.info(`logged in as coding user: ${userData.name} @ ${userData.team}`);
  } catch (err) {
    console.error(err);
  }
}
