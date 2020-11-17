import { IRepoInfo, IDepot, IUserInfo } from '../typings/common';

export const getMrListParams = (
  repoInfo: IRepoInfo,
  selectedDepot: IDepot,
  depots: IDepot[],
  user: IUserInfo,
): IRepoInfo | undefined => {
  const { team } = user;
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

  if (repoInfo) return repoInfo;
};
