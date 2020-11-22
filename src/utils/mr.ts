import hx from 'hbuilderx';
import os from 'os';
import { IRepoInfo, IDepot, IUserInfo } from '../typings/common';
import CodingServer from '../services/codingServer';

export const getMrListParams = async (selectedDepot: IDepot, user: IUserInfo): Promise<IRepoInfo | undefined> => {
  const team = user.team;

  if (selectedDepot) {
    const { depotPath } = selectedDepot;
    const matchRes = depotPath.match(/\/p\/([^/]+)\/d\/([^/]+)\//);
    if (matchRes) {
      const [, project, repo] = matchRes;
      return { team, project, repo };
    }
  }

  const result = await CodingServer.getRepoParams();
  return result;
};

export const getHostsPath = () => {
  const operatingSystem = os.platform();
  let file;
  switch (operatingSystem) {
    case 'win32':
      break;
    case 'darwin':
    default:
      file = '/etc/hosts';
  }
  return file;
};

export const openHosts = () => {
  const hostsPath = getHostsPath();
  hx.workspace.openTextDocument(hostsPath);
};
