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

  listen() {
    this.panel.webView.onDidReceiveMessage((message: IMessage) => {
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

    this.panel.onDidDispose(function () {
      console.log('custom editor disposed');
    });
  }

  update(data: any) {
    const webview = this.panel.webView;
    const fileInfo = hx.Uri.file(path.resolve(__dirname, '../../out/webviews/main.js'));

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

  openCustomDocument(uri: any) {
    return Promise.resolve(new MRCustomDocument(uri));
  }

  resolveCustomEditor(document: any, webViewPanel: IWebviewPanel) {
    this.panel = webViewPanel;
    this.listen();
  }

  saveCustomDocument(document: any) {
    return true;
  }

  saveCustomDocumentAs(document: any, destination: any) {
    return true;
  }
}
