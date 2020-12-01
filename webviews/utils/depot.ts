export const getDepotProject = (depotPath: string) => {
  const matchRes = depotPath.match(/\/p\/([^/]+)/);
  return matchRes?.[1];
};
