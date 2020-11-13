import hx from 'hbuilderx';
import fs from 'fs';
import axios from 'axios';
import git from 'isomorphic-git';
import { IRepoInfo, ISessionData } from '../typings/common';
import { parseCloneUrl } from '../utils/repo';

const accessToken = '1b7fca3bd7594a89b0f5e2a0250c1147';

export default class CodingServer {
  _session!: ISessionData;
  _repo: IRepoInfo = {} as IRepoInfo;

  constructor(session?: ISessionData, repo?: IRepoInfo) {
    if (session) {
      this._session = session;
    }

    if (repo) {
      this._repo = repo;
    }
  }

  static async getRepoParams() {
    const folders = await hx.workspace.getWorkspaceFolders();

    if (!folders.length) {
      console.warn('workspace中没有目录');
      return;
    }

    try {
      const remotes = await git.listRemotes({ fs, dir: folders[0].uri.path });
      return parseCloneUrl(remotes[0].url);
    } catch {
      console.error('该目录没有进行git初始化');
    } 
  }

  async getUserInfo(team: string, token: string = this._session?.accessToken || ``) {
    try {
      const result = await axios.get(`https://${team}.coding.net/api/current_user`, {
        params: {
          access_token: token,
        },
      });

      if (result.data.code) {
        console.error(result.data.msg);
        return Promise.reject(result.data.msg);
      }

      return result.data?.data;
    } catch (err) {
      throw Error(err);
    }
  }

  async getMrList(
    team: string = this._repo.team,
    project: string = this._repo.project,
    repo: string = this._repo.repo
  ) {
    const url = `https://${team}.coding.net/api/user/${team}/project/${project}/depot/${repo}/git/merges/query`;
    const result = await axios.get(url, {
      params: {
        status: `open`,
        sort: `action_at`,
        page: 1,
        PageSize: 100,
        sortDirection: `DESC`,
        access_token: accessToken,
      }
    });
    return result.data?.data?.list || [];
  }
}
