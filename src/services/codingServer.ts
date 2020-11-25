import hx from 'hbuilderx';
import fs from 'fs';
import qs from 'querystring';
import axios from '../utils/axios';
import git from 'isomorphic-git';
import { IDepot, IRepoInfo, ISessionData } from '../typings/common';
import { parseCloneUrl } from '../utils/repo';
import { getIp } from '../utils/ip';
import { encryptPassword } from '../utils/password';
import { getEmailPrefix } from '../utils/email';
import { readConfig } from './dcloud';

export default class CodingServer {
  _session: ISessionData;

  constructor(session: ISessionData) {
    this._session = session;
  }

  get session() {
    return this._session;
  }

  getHeaders = (token?: string) => ({
    Authorization: `token ${token || this._session.accessToken}`,
  });

  static async getRepoParams() {
    const folders = await hx.workspace.getWorkspaceFolders();

    if (!folders.length) {
      return;
    }

    try {
      const remotes = await git.listRemotes({ fs, dir: folders[0].uri.path });
      return parseCloneUrl(remotes[0].url);
    } catch {
      console.error('该目录没有进行 git 初始化');
    }
  }

  async getUserInfo(token: string) {
    try {
      const result = await axios({
        method: 'get',
        url: `https://e.coding.net/api/current_user`,
        headers: this.getHeaders(token),
      });

      if (result.code) {
        return Promise.reject(result);
      }

      return result?.data;
    } catch (err) {
      console.error(err);
    }
  }

  async getMrList({ team, project, repo }: IRepoInfo) {
    try {
      const url = `https://${team}.coding.net/api/user/${team}/project/${project}/depot/${repo}/git/merges/query`;
      const result = await axios({
        method: 'get',
        url,
        headers: this.getHeaders(),
        params: {
          status: `open`,
          sort: `action_at`,
          page: 1,
          PageSize: 100,
          sortDirection: `DESC`,
        },
      });

      if (result.code) {
        return Promise.reject(result);
      }

      return result?.data?.list || [];
    } catch (err) {
      console.error(err);
    }
  }

  async getMrDetail({ team, project, repo, mergeRequestIId }: IRepoInfo & { mergeRequestIId: number }) {
    try {
      const result = await axios({
        method: 'get',
        url: `https://${team}.coding.net/api/user/${team}/project/${project}/depot/${repo}/git/merge/${mergeRequestIId}/detail`,
        headers: this.getHeaders(),
      });

      if (result.code) {
        return Promise.reject(result);
      }

      return result.data;
    } catch (err) {
      console.error(err);
    }
  }

  async getDepotList(team: string) {
    try {
      const result = await axios({
        method: 'get',
        url: `https://${team}.coding.net/api/user/${team}/depots`,
        headers: this.getHeaders(),
      });

      if (result.code) {
        return Promise.reject(result);
      }

      const depots = result?.data || [];
      return depots.filter((depot: IDepot) => depot.vcsType === 'git');
    } catch (err) {
      console.error(err);
    }
  }

  async createProject(team: string, project: string) {
    try {
      const result = await axios({
        method: 'post',
        url: `https://${team}.coding.net/api/team/${team}/template-project`,
        headers: this.getHeaders(),
        data: {
          name: project,
          displayName: project,
          projectTemplate: 'DEV_OPS',
          icon: '/static/project_icon/scenery-version-2-5.svg',
        },
      });

      if (result.code) {
        return Promise.reject(result);
      }

      return result.data;
    } catch (err) {
      console.error(err);
    }
  }

  async createDepot(team: string, project: string, depot: string) {
    try {
      const projectRes = await this.createProject(team, project);

      if (!projectRes) return;

      const result = await axios({
        method: 'post',
        url: `https://${team}.coding.net/api/user/${team}/project/${project}/depot`,
        headers: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          ...this.getHeaders(),
        },
        data: qs.stringify({
          name: depot,
          vcsType: 'git',
          gitReadmeEnabled: false,
          shared: false,
        }),
      });

      if (result.code) {
        return Promise.reject(result);
      }

      return result.data;
    } catch (err) {
      console.error(err);
    }
  }

  async createTeam(password: string) {
    try {
      const email = await readConfig(`email`);
      const ip = getIp();
      const pwd = encryptPassword(password);
      console.log('ip => ', ip);
      console.log('pwd => ', pwd);
      const emailPrefix = getEmailPrefix(email);
      const teamName = `dcloud-${emailPrefix}-${Date.now()}`;

      console.log('data ===> ', {
        Action: 'CreateTeam',
        Domain: teamName,
        TeamName: teamName,
        Ip: ip,
        Password: pwd,
        Email: email,
      });

      const result = await axios({
        method: 'post',
        url: `https://e.coding.net/open-api`,
        data: {
          Action: 'CreateTeam',
          Domain: teamName,
          TeamName: teamName,
          Ip: ip,
          Password: pwd,
          Email: email,
        },
      });
      console.log('result => ', result);
    } catch (err) {
      console.error(err);
    }
  }
}
