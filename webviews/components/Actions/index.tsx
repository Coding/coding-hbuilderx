import React from 'react';
import { createDepot, refresh } from '../../utils/command';

const Actions = () => {
  const handleCreate = () => createDepot();
  const handleRefresh = () => refresh();

  return (
    <div className='btnGroup'>
      <div className='btn' onClick={handleCreate}>创建仓库</div>
      <div className='btn' onClick={handleRefresh}>刷新页面</div>
    </div>
  );
};

export default Actions;
