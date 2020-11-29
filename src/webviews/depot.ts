import hx from 'hbuilderx';
import path from 'path';
import toast from '../utils/toast';
import ACTIONS, { dispatch } from '../utils/actions';

interface IMessage {
  command: string;
  data?: any;
  callback?: (...args: any[]) => void;
}

export default class WebviewProvider {
  context: IContext;
  panel: IWebviewPanel;

  constructor(context: IContext) {
    this.context = context;
    this.panel = this.createPanel();
    this.listen();
    this.refresh();
  }

  refresh() {
    this.update({
      token: this.context.token,
      userInfo: this.context.userInfo,
    });
  }

  listen() {
    this.panel.webView.onDidReceiveMessage(async (message: IMessage) => {
      console.log('webview receive message => ', message);
      const { command, data } = message;

      switch (command) {
        case 'webview.mrDetail':
          hx.env.openExternal(data);
          break;
        case 'webview.toast':
          toast.error(data);
          break;
        case 'webview.refresh':
          this.refresh();
          break;
        default:
          hx.commands.executeCommand(command);
          return;
      }
    });
  }

  createPanel() {
    const webviewPanel: IWebviewPanel = hx.window.createWebView('codingPlugin.webview', {
      enableScripts: true,
    });

    return webviewPanel;
  }

  async update(data: any) {
    const webview = this.panel.webView;
    const fileInfo = hx.Uri.file(path.resolve(__dirname, '../../out/webviews/main.js'));

    const config = hx.workspace.getConfiguration();
    const colorScheme = config.get('editor.colorScheme');

    const COLORS: Record<string, string> = {
      Monokai: 'themeDark',
      'Atom One Dark': 'themeDarkBlue',
      Default: 'themeLight',
    };

    if (data.token && !data.userInfo) {
      try {
        const userInfo = await this.context.codingServer.getUserInfo(data.token);
        data.userInfo = userInfo;
        dispatch(ACTIONS.SET_USER_INFO, {
          context: this.context,
          value: userInfo,
        });
      } catch (err) {
        console.warn('个人令牌出错了');
      }
    }

    webview.html = `
      <html>
        <body class='${COLORS[colorScheme]}'>
          <div>
            <div id='root'></div>
          </div>
          <script>
            window.__CODING__ = '${JSON.stringify(data)}'
          </script>
          <script src='${fileInfo}'></script>
        </body>
      </html>
    `;
  }
}
