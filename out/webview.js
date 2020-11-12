"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hbuilderx_1 = __importDefault(require("hbuilderx"));
const path_1 = __importDefault(require("path"));
class WebviewProvider {
    constructor() {
        this.panel = this.createPanel();
        this.listen();
    }
    listen() {
        this.panel.webView.onDidReceiveMessage((message) => {
            console.log('webview receive message => ', message);
        });
    }
    createPanel() {
        const webviewPanel = hbuilderx_1.default.window.createWebView('codingPlugin.webview', {
            enableScripts: true
        });
        return webviewPanel;
    }
    update(itemId) {
        const webview = this.panel.webView;
        const fileInfo = hbuilderx_1.default.Uri.file(path_1.default.resolve(__dirname, '../out/webviews/main.js'));
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
            console.log('msg 222 => ', msg);
          });
        </script>
        <script src='${fileInfo}'></script>
      </body>
    `;
    }
}
exports.default = WebviewProvider;
