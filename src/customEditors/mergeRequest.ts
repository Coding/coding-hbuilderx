import hx from 'hbuilderx';
import path from 'path';
import toast from '../utils/toast';

interface IMessage {
  command: string;
  data: any;
}

const { CustomDocument, CustomEditorProvider } = hx.CustomEditor;

class MRCustomDocument extends CustomDocument {
  constructor(uri: string) {
    super(uri);
  }

  dispose() {
    super.dispose();
  }
}

export default class MRCustomEditorProvider extends CustomEditorProvider {
  constructor(context: any) {
    super();
    this.context = context;
    this.panel = null;
  }

  listen(webViewPanel: IWebviewPanel) {
    webViewPanel.webView.onDidReceiveMessage((message: IMessage) => {
      console.log('webview receive message => ', message);
      const { command, data } = message;

      switch (command) {
        case 'webview.mrDetail':
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

    webViewPanel.onDidDispose(function () {
      console.log('custom editor disposed');
    });
  }

  update(data: any) {
    if (!this.panel) {
      setTimeout(() => {
        this.update(data);
      }, 500);
      return;
    }
    const webview = this.panel?.webView;
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

  openCustomDocument(uri: any) {
    return Promise.resolve(new MRCustomDocument(uri));
  }

  resolveCustomEditor(document: any, webViewPanel: IWebviewPanel) {
    this.panel = webViewPanel;
    this.listen(webViewPanel);
  }

  saveCustomDocument(document: any) {
    return true;
  }

  saveCustomDocumentAs(document: any, destination: any) {
    return true;
  }
}
