import React from 'react';
import cn from 'classnames';
import style from './style.css';

const App = () => {
  const data = JSON.parse(window.__CODING__);
  const { team, title, srcBranch, desBranch, author, path } = data;
  const url = `https://${team}.coding.net${path}`;

  const viewOnWeb = () => {
    window.hbuilderx.postMessage({
      command: 'webview.mrDetail',
      text: url
    });
  };

  return (
    <div className={style.root}>
      <a onClick={viewOnWeb}>前往 web 端查看</a>

      <div className={style.title}>
        {title}
      </div>
      <div>{`将分支 ${srcBranch} 合并到分支 ${desBranch}`}</div>
      <div>创建人：{author.name}</div>

      <div className={style.btnGroup}>
        <div className={cn(style.btn, style.btnPrimary)}>合并</div>
        <div className={cn(style.btn, style.btnPrimary)}>允许合并</div>
        <div className={style.btn}>关闭</div>
      </div>
    </div>
  );
};

export default App;
