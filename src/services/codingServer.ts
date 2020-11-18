import hx from 'hbuilderx';
import fs from 'fs';
import qs from 'querystring';
import axios from '../utils/axios';
import git from 'isomorphic-git';
import { IRepoInfo, ISessionData } from '../typings/common';
import { parseCloneUrl } from '../utils/repo';
import toast from '../utils/toast';

export default class CodingServer {
  _session!: ISessionData;
  _repo!: IRepoInfo;

  constructor(session?: ISessionData, repo?: IRepoInfo) {
    if (session) {
      this._session = session;
    }
    if (repo) {
      this._repo = repo;
    }
  }

  get session() {
    return this._session;
  }

  get repo() {
    return this._repo;
  }

  static async getRepoParams() {
    const folders = await hx.workspace.getWorkspaceFolders();

    if (!folders.length) {
      toast.warn('workspace 中没有目录');
      return;
    }

    try {
      const remotes = await git.listRemotes({ fs, dir: folders[0].uri.path });
      return parseCloneUrl(remotes[0].url);
    } catch {
      toast.error('该目录没有进行 git 初始化');
    }
  }

  async getUserInfo(team: string, token: string = this._session?.accessToken || ``) {
    try {
      const result = await axios({
        method: 'get',
        url: `https://${team}.coding.net/api/current_user`,
        params: {
          access_token: token,
        },
      });

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
        params: {
          status: `open`,
          sort: `action_at`,
          page: 1,
          PageSize: 100,
          sortDirection: `DESC`,
          access_token: this._session.accessToken,
        },
      });
      return result?.data?.list || [];
    } catch (err) {
      console.error(err);
    }
  }

  async getDepotList(team: string = this._repo?.team, project: string = this._repo?.project) {
    // TODO: 使用新接口
    try {
      const result = await axios({
        method: 'get',
        url: `https://${team}.coding.net/api/user/${team}/project/${project}/repos`,
        params: {
          access_token: this._session.accessToken,
        },
      });

      return result?.data?.depots || [];
    } catch (err) {
      console.error(err);
    }
  }

  async createProject(team: string, project: string) {
    try {
      const result = await axios({
        method: 'post',
        url: `https://${team}.coding.net/api/team/${team}/template-project?access_token=${this._session.accessToken}`,
        data: {
          name: project,
          displayName: project,
          projectTemplate: 'DEV_OPS',
          icon: '/static/project_icon/scenery-version-2-5.svg',
        },
      });

      return result.data;
    } catch (err) {
      console.error(err);
    }
  }

  async createDepot(team: string, project: string, depot: string) {
    try {
      await this.createProject(team, project);

      const result = await axios({
        method: 'post',
        url: `https://${team}.coding.net/api/user/${team}/project/${project}/depot?access_token=${this._session.accessToken}`,
        headers: {
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
        data: qs.stringify({
          name: depot,
          vcsType: 'git',
          gitReadmeEnabled: false,
          shared: false,
        }),
      });
    } catch (err) {
      console.error(err);
    }
  }
}
