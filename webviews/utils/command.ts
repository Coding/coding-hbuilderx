export const toast = (msg: any) => {
  window.hbuilderx.postMessage({
    command: 'webview.toast',
    data: msg
  });
};

export const createDepot = () => {
  window.hbuilderx.postMessage({
    command: 'codingPlugin.createDepot',
  });
};

export const refresh = () => {
  window.hbuilderx.postMessage({
    command: 'webview.refresh'
  });
};

export const auth = () => {
  window.hbuilderx.postMessage({
    command: 'codingPlugin.auth'
  });
};

export const login = () => {
  window.hbuilderx.postMessage({
    command: 'codingPlugin.login'
  });
};
