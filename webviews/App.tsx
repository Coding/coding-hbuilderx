import React, { useEffect, useState } from 'react';

const App = () => {
  const [msg, setMsg] = useState();

  useEffect(() => {
    window.addEventListener('message', (msg: any) => {
      setMsg(msg);
    });
  }, []);

  const handleClick = () => {
    alert((window as any).__TEXT__);
  };

  return (
    <div>
      app
      <button onClick={handleClick}>哈哈哈</button>
      {msg}
    </div>
  );
};

export default App;
