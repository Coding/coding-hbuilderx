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

export interface IUserInfo {
  id: number;
  avatar: string;
  global_key: string;
  name: string;
  path: string;
  team: string;
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
