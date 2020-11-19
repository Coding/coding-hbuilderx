import hx from 'hbuilderx';
import os from 'os';
import { IRepoInfo, IDepot, IUserInfo } from '../typings/common';

export const getMrListParams = (selectedDepot: IDepot, depots: IDepot[], user: IUserInfo): IRepoInfo | undefined => {
  const team = user?.team;
  let depot = selectedDepot;

  if (!depot) {
    depot = depots?.[0];
  }

  if (depot) {
    const { depotPath } = depot;
    const matchRes = depotPath.match(/\/p\/([^/]+)\/d\/([^/]+)\//);
    if (matchRes) {
      const [, project, repo] = matchRes;
      return { team, project, repo };
    }
  }
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
