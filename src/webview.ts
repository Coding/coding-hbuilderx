import hx from 'hbuilderx';
import fs from 'fs';
import path from 'path';

export default class WebviewProvider {
  panel: IWebviewPanel;

  constructor() {
    this.panel = this.createPanel();
    this.listen();
  }

  listen() {
    this.panel.webView.onDidReceiveMessage((message: any) => {
      console.log('webview receive message => ', message);
    });
  }

  createPanel() {
    const webviewPanel: IWebviewPanel = hx.window.createWebView('codingPlugin.webview', {
      enableScripts: true,
    });

    return webviewPanel;
  }

  update(itemId: string) {
    const webview = this.panel.webView;
    const fileInfo = hx.Uri.file(path.resolve(__dirname, '../out/webviews/main.js'));

    webview.html = `
      <body>
        <div style="max-width:200px;">
          <div id='root'></div>
          <button onclick="test()">测试</button>
          <div>${itemId}</div>
        </div>
        <script>
          window.__TEXT__ = '${itemId}'
          function test() {
            alert('abc')

            window.fetch("https://api.github.com/search/repositories?q=react", {
              "method": "GET",
              "mode": "cors",
              "credentials": "include"
            }).then((res) => {
              res.json().then(data => alert(JSON.stringify(data.items[0])))
            })
          }
        </script>
        <script>
          window.addEventListener("message", (msg) => {
            console.log(msg);
          });
        </script>
        <script src='${fileInfo}'></script>
      </body>
    `;
  }
}
