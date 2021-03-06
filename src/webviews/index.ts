import hx from 'hbuilderx';
import path from 'path';
import toast from '../utils/toast';

interface IMessage {
  command: string;
  data: any;
}

export default class WebviewProvider {
  context: IContext;
  panel: IWebviewPanel;

  constructor(context: IContext) {
    this.context = context;
    this.panel = this.createPanel();
    this.listen();
  }

  listen() {
    this.panel.webView.onDidReceiveMessage((message: IMessage) => {
      console.log('webview receive message => ', message);
      const { command, data } = message;

      switch (command) {
        case 'webview.goToPage':
          hx.env.openExternal(data);
          break;
        case 'webview.toast':
          toast.error(data);
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

  update(data: any) {
    const webview = this.panel.webView;
    const fileInfo = hx.Uri.file(path.resolve(__dirname, '../../out/webviews/main.js'));

    const config = hx.workspace.getConfiguration();
    const colorScheme = config.get('editor.colorScheme');

    const COLORS: Record<string, string> = {
      Monokai: 'themeDark',
      'Atom One Dark': 'themeDarkBlue',
      Default: 'themeLight',
    };

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
