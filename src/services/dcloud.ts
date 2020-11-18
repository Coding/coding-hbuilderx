import axios from '../utils/axios';
import { ITokenResponse, IDCloudUser } from '../typings/common';

const appSecret = `eLEDnBuT258P1OmRx1OVFSCj4SZXom`;
export const appId = `gZTr3CuevT`;

export const applyForToken = async (code: string) => {
  try {
    const resp: ITokenResponse = await axios.get(`https://ide.dcloud.net.cn/dcloudOauthv2/accessToken`, {
      params: {
        code,
        appid: appId,
        app_secret: appSecret,
      },
    });

    if (resp.ret) {
      return Promise.reject(resp);
    }
    return resp;
  } catch (e) {
    return Promise.reject(e);
  }
};

export const fetchUser = async (accessToken: string) => {
  try {
    const resp: IDCloudUser = await axios.get(`https://ide.dcloud.net.cn/dcloudOauthv2/userInfo`, {
      params: {
        access_token: accessToken,
      },
    });

    if (resp.ret) {
      return Promise.reject(resp);
    }
    return resp;
  } catch (e) {
    return Promise.reject(e);
  }
};
