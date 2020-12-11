import fs from 'fs';
import git from 'isomorphic-git';
// import http from 'isomorphic-git/http/node';
import shell from 'shelljs';
import { readConfig } from './dcloud';

export const gitListRemotes = async (fsPath: string) => {
  const remotes = await git.listRemotes({ fs, dir: fsPath });
  return remotes;
};

export const gitInit = async (fsPath: string) => {
  await git.init({ fs, dir: fsPath });
};

export const gitAdd = async (fsPath: string) => {
  await git.add({ fs, dir: fsPath, filepath: '.' });
};

export const gitCommit = async (fsPath: string, message = 'initialize') => {
  const email = await readConfig('email');
  const sha = await git.commit({
    fs,
    dir: fsPath,
    author: {
      name: email,
      email,
    },
    message,
  });
  return sha;
};

export const getCurrentBranch = async (fsPath: string) => {
  const branch = await git.currentBranch({
    fs,
    dir: fsPath,
    fullname: false,
  });
  return branch;
};

export const gitPush = async (fsPath: string, callback?: (code: number) => void) => {
  const branch = await getCurrentBranch(fsPath);
  shell.pushd(fsPath);
  shell.exec(`git push origin ${branch}`, (code) => {
    shell.popd();
    callback && callback(code);
  });
};

// export const gitPush = async (fsPath: string, url: string) => {
//   const token = await readConfig('token');
//   const email = await readConfig('email');
//   const matchRes = url.match(/^https:\/\/(.+)/);
//   const result = await git.push({
//     fs,
//     http,
//     dir: fsPath,
//     remote: 'origin',
//     ref: 'master',
//     remoteRef: 'master',
//     url: `https://${encodeURIComponent(email)}:${token}@${matchRes?.[1]}`,
//   });
// };

export const gitAddRemote = async (fsPath: string, url: string) => {
  const token = await readConfig('token');
  const email = await readConfig('email');
  const matchRes = url.match(/^https:\/\/(.+)/);
  await git.addRemote({
    fs,
    dir: fsPath,
    remote: 'origin',
    url: `https://${encodeURIComponent(email)}:${token}@${matchRes?.[1]}`,
  });
};

export const gitChanged = async (fsPath: string) => {
  const result = await git.statusMatrix({
    fs,
    dir: fsPath,
  });
  const changed = result.filter(([file, headStatus, workdirStatus, stageStatus]) => {
    if (headStatus !== workdirStatus || headStatus !== stageStatus || workdirStatus !== stageStatus) {
      return true;
    }
    return false;
  });
  return !!changed.length;
};
