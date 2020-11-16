"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDepotUrl = exports.getMRUrl = exports.parseCloneUrl = void 0;
function parseCloneUrl(url) {
    const reg = /^(https:\/\/|git@)e\.coding\.net(\/|:)(.*)\.git$/i;
    const result = url.match(reg);
    if (!result) {
        return null;
    }
    const str = result.pop();
    if (!str || !(str === null || str === void 0 ? void 0 : str.includes(`/`))) {
        return null;
    }
    const [team, project, repo] = str.split(`/`);
    return { team, project, repo: repo || project };
}
exports.parseCloneUrl = parseCloneUrl;
function getMRUrl(team, mrItem) {
    return `https://${team}.coding.net${mrItem.path}`;
}
exports.getMRUrl = getMRUrl;
function getDepotUrl(team, depot) {
    return `https://${team}.coding.net${depot.depotPath}`;
}
exports.getDepotUrl = getDepotUrl;
