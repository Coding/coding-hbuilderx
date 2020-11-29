import axios from '../utils/axios';
import qs from 'querystring';

interface IRepoInfo {
  team: string;
  project?: string;
  repo?: string;
}
interface IMergeRequestParams extends IRepoInfo {
  mergeRequestIId: number;
}

interface IMergeMergeRequestParams extends IMergeRequestParams {
  message: string;
}

const getHeaders = (token: string) => ({
  Authorization: `token ${token}`,
});

const getBaseUrl = ({ team, project, repo }: IRepoInfo) => {
  let url = `https://${team}.coding.net/api/user/${team}`;

  if (project) url += `/project/${project}`;
  if (repo) url += `/depot/${repo}`;
  return url;
};

export const getDepotList = async (token: string, team: string) => {
  const reuslt = await axios({
    method: 'get',
    url: `${getBaseUrl({ team })}/depots`,
    headers: getHeaders(token)
  });

  return reuslt.data;
};

export const getMergeRequestList = async (token: string, { team, project, repo }: IRepoInfo) => {
  const result = await axios({
    method: 'get',
    url: `${getBaseUrl({ team, project, repo })}/git/merges/query`,
    headers: getHeaders(token),
    params: {
      status: `open`,
      sort: `action_at`,
      page: 1,
      PageSize: 100,
      sortDirection: `DESC`,
    },
  });

  return result?.data?.list || [];
};

export const getMergeRequestDetail = async (token: string, { team, project, repo, mergeRequestIId }: IMergeRequestParams) => {
  const result = await axios({
    method: 'get',
    url: `${getBaseUrl({ team, project, repo })}/git/merge/${mergeRequestIId}/detail`,
    headers: getHeaders(token)
  });

  return result;
};

export const closeMergeRequest = async (token: string, { team, project, repo, mergeRequestIId }: IMergeRequestParams) => {
  const result = await axios({
    method: 'post',
    url: `${getBaseUrl({ team, project, repo })}/git/merge/${mergeRequestIId}/refuse`,
    headers: getHeaders(token)
  });

  return result;
};

export const mergeMergeRequest = async (token: string, { team, project, repo, mergeRequestIId, ...others }: IMergeMergeRequestParams) => {
  const result = await axios({
    method: 'post',
    url: `${getBaseUrl({ team, project, repo })}/git/merge/${mergeRequestIId}/merge`,
    headers: {
      'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
      ...getHeaders(token),
    },
    data: qs.stringify({
      ...others,
      del_source_branch: false,
      fastforward: false,
      squash: false
    })
  });

  return result;
};

export const allowMerge = async (token: string, { team, project, repo, mergeRequestIId }: IMergeRequestParams) => {
  const result = await axios({
    method: 'post',
    url: `${getBaseUrl({ team, project, repo })}/git/merge/${mergeRequestIId}/good`,
    headers: getHeaders(token)
  });
  return result;
};

export const disallowMerge = async (token: string, { team, project, repo, mergeRequestIId }: IMergeRequestParams) => {
  const result = await axios({
    method: 'delete',
    url: `${getBaseUrl({ team, project, repo })}/git/merge/${mergeRequestIId}/good`,
    headers: getHeaders(token)
  });
  return result;
};

export const getReviewers = async (token: string, { team, project, repo, mergeRequestIId }: IMergeRequestParams) => {
  const result = await axios({
    method: 'get',
    url: `${getBaseUrl({ team, project, repo })}/git/merge/${mergeRequestIId}/reviewers`,
    headers: getHeaders(token)
  });
  return result;
};
