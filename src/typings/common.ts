export interface IRepoInfo {
  team: string;
  project: string;
  repo: string;
}

export enum TokenType {
  AccessToken = `accessToken`,
  RefreshToken = `refreshToken`,
}

export interface IUserInfo {
  id: number;
  avatar: string;
  global_key: string;
  name: string;
  path: string;
  team: string;
}

export interface ISessionData {
  id: string;
  user: IUserInfo | null;
  accessToken: string;
  refreshToken: string;
}

export interface IReviewer {
  reviewer: IUserInfo;
  value: number;
  volunteer: string;
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
  vcsType: 'git' | 'svn';
}

export interface IOAuthResponse {
  code: string;
  error: number;
}

export interface ITokenResponse {
  ret: number;
  desc: string;
  data: {
    access_token: string;
    access_token_ttl: string;
    refresh_token: string;
    refresh_token_ttl: string;
  };
}

export interface IDCloudUser {
  ret: number;
  desc: string;
  data: {
    nickname: string;
    avatar: string;
    uid: string;
    email: string;
    phone: string;
  };
}

export enum ITokenType {
  AccessToken = `accessToken`,
  RefreshToken = `refreshToken`,
}
