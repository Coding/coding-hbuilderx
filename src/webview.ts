import hx from 'hbuilderx';
import path from 'path';

interface IMessage {
  command: string;
  text: string;
}

export default class WebviewProvider {
  panel: IWebviewPanel;

  constructor() {
    this.panel = this.createPanel();
    this.listen();
  }

  listen() {
    this.panel.webView.onDidReceiveMessage((message: IMessage) => {
      console.log('webview receive message => ', message);
      const { command, text } = message;
      if (command === 'webview.mrDetail') {
        hx.env.openExternal(text);
      } else {
        hx.commands.executeCommand(command);
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
    const fileInfo = hx.Uri.file(path.resolve(__dirname, '../out/webviews/main.js'));

    webview.html = `
      <body>
        <div>
          <div id='root'></div>
        </div>
        <script>
          window.__CODING__ = '${JSON.stringify(data)}'
        </script>
        <script src='${fileInfo}'></script>
      </body>
    `;
  }
}
