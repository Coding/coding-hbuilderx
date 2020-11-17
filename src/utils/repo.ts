import { IRepoInfo, IMRItem, IDepot } from '../typings/common'

export function parseCloneUrl(url: string): IRepoInfo | null {
  const reg = /^(https:\/\/|git@)e\.coding\.net(\/|:)(.*)\.git$/i
  const result = url.match(reg)
  console.log('1')

  if (!result) {
    return null
  }

  const str = result.pop()
  if (!str || !str?.includes(`/`)) {
    return null
  }

  const [team, project, repo] = str.split(`/`)
  return { team, project, repo: repo || project }
}

export function getMRUrl(team: string, mrItem: IMRItem): string {
  return `https://${team}.coding.net${mrItem.path}`
}

export function getDepotUrl(team: string, depot: IDepot): string {
  return `https://${team}.coding.net${depot.depotPath}`
}
