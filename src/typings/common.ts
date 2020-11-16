export interface IRepoInfo {
	team: string;
	project: string;
	repo: string;
}

export enum TokenType {
  AccessToken = `accessToken`,
  RefreshToken = `refreshToken` ,
}

export interface IUserResponse {
  avatar: string;
  global_key: string;
  name: string;
  path: string;
  team: string;
}

export interface ISessionData {
  id: string;
  user: IUserResponse | null;
  accessToken: string;
  refreshToken: string;
}

export interface RepoInfo {
	team: string;
	project: string;
	repo: string;
}

export interface IUserInfo {
  id: number;
}

export interface IReviewer {
  reviewer: IUserInfo;
}

export interface IMRItem {
  id: number;
  iid: number;
  srcBranch: string;
  desBranch: string;
  title: string;
  path: string;
  author: IUserInfo;
  reviewers: IReviewer[];
}

export interface IDepot {
  depotPath: string;
  gitHttpsHost: string;
  gitHttpsUrl: string;
  gitSshHost: string;
  gitSshUrl: string;
  id: number;
  isDefault: boolean;
  isSvnHttp: boolean;
  name: string;
  shared: boolean;
  size: number;
  status: number;
  svnEnabled: boolean;
  vcsType: 'git' | 'svn'
}
