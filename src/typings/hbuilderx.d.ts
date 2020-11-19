declare module 'hbuilderx' {
  const hx: any;
  export default hx;
}

interface IContext {
  id: string;
  dispose: () => void;
  subscriptions: any[];
  ctx: {
    [key: string]: any;
  };
  [key: string]: any;
}

interface IWebviewPanel {
  webView: any;
  postMessage: (message: any) => void;
  onDidDispose: (cb: () => void) => void;
  dispose: () => void;
}

interface ITreeItem {
  name?: string;
  children?: ITreeItem[];
}
