import axios from 'axios';
import qs from 'querystring';

interface IMergeRequestParams {
  team: string;
  project: string;
  repo: string;
  mergeRequestIId: number;
}

interface IMergeMergeRequestParams extends IMergeRequestParams {
  message: string;
  del_source_branch: boolean;
  fastforward: boolean;
  squash: boolean;
}

const getHeaders = (token: string) => ({
  Authorization: `token ${token}`,
});

export const getMergeRequestDetail = async (token: string, { team, project, repo, mergeRequestIId }: IMergeRequestParams) => {
  const result = await axios({
    method: 'get',
    url: `https://${team}.coding.net/api/user/${team}/project/${project}/depot/${repo}/git/merge/${mergeRequestIId}/detail`,
    headers: getHeaders(token)
  });

  return result.data;
};

export const closeMergeRequest = async (token: string, { team, project, repo, mergeRequestIId }: IMergeRequestParams) => {
  const result = await axios({
    method: 'post',
    url: `https://${team}.coding.net/api/user/${team}/project/${project}/depot/${repo}/git/merge/${mergeRequestIId}/refuse`,
    headers: getHeaders(token)
  });

  return result.data;
};

export const mergeMergeRequest = async (token: string, { team, project, repo, mergeRequestIId, ...others }: IMergeMergeRequestParams) => {
  const result = await axios({
    method: 'post',
    url: `https://${team}.coding.net/api/user/${team}/project/${project}/depot/${repo}/git/merge/${mergeRequestIId}/merge`,
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

  return result.data;
};

export const allowMerge = async (token: string, { team, project, repo, mergeRequestIId }: IMergeRequestParams) => {
  const result = await axios({
    method: 'post',
    url: `https://${team}.coding.net/api/user/${team}/project/${project}/depot/${repo}/git/merge/${mergeRequestIId}/good`,
    headers: getHeaders(token)
  });
  return result.data;
};
