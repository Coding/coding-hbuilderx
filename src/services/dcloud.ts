import keytar from 'keytar';
import hx from 'hbuilderx';

import axios from '../utils/axios';
import { ITokenResponse, IDCloudUser, ITokenType, IOAuthResponse } from '../typings/common';

const appSecret = `eLEDnBuT258P1OmRx1OVFSCj4SZXom`;
export const appId = `gZTr3CuevT`;

export const applyForToken = async (code: string | null) => {
  try {
    if (!code) {
      throw new Error(`no code provided.`);
    }

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

    await keytar.setPassword(appId, ITokenType.AccessToken, resp.data.access_token);
    await keytar.setPassword(appId, ITokenType.RefreshToken, resp.data.refresh_token);
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

export const setToken = async (name: ITokenType, value: string) => {
  return await keytar.setPassword(appId, name, value);
};

export const readToken = async (name: ITokenType) => {
  const val = await keytar.getPassword(appId, name);
  if (!val) {
    return Promise.reject(null);
  }

  return val;
};

export const grantForUserInfo = (): Promise<string | null> =>
  new Promise((resolve, reject) => {
    hx.authorize
      .login({
        scopes: ['basic', 'email', 'phone'],
        appId: appId,
      })
      .then((param: IOAuthResponse) => {
        const { code, error } = param;
        if (error || !code) {
          return reject(null);
        }

        return resolve(code);
      });
  });
