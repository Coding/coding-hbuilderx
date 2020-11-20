import hx from 'hbuilderx';

import axios from '../utils/axios';
import { ITokenResponse, IDCloudUser, ITokenType, IOAuthResponse } from '../typings/common';

const appSecret = `dnGxdvWuEwOO3VimZwo1IsqfESam7k`;
export const appId = `crvUAM0Snz`;

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

    await setConfig(`hbToken`, resp.data.access_token);
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

    if (!resp.data.email) {
      return Promise.reject(resp);
    }

    await setConfig(`email`, resp.data.email);
    return resp;
  } catch (e) {
    return Promise.reject(e);
  }
};

export const setConfig = async (prop: string, value: string) => {
  const codingPlugin = hx.workspace.getConfiguration(`codingPlugin`);
  try {
    await codingPlugin.update(prop, value);
    return true;
  } catch {
    return false;
  }
};

export const readConfig = async (prop: string) => {
  const codingPlugin = hx.workspace.getConfiguration(`codingPlugin`);
  const token = codingPlugin.get(prop, ``);
  return token;
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

        console.log(`hbuilder oauth code: `, code);
        return resolve(code);
      });
  });
