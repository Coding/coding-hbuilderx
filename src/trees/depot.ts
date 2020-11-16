import hx from 'hbuilderx';
import { IDepot } from '../typings/common';

interface IItem extends ITreeItem {
  disableClick: boolean;
}

class DepotTreeDataProvider extends hx.TreeDataProvider {
  constructor(context: IContext) {
    super();
    this.context = context;
  }

  async getChildren(element: IDepot & IItem) {
    if (element) {
      return Promise.resolve(element.children);
    }

    try {
      const depots = await this.context.codingServer.getDepotList();
      return Promise.resolve([
        {
          name: '创建仓库',
          disableClick: true,
        },
        {
          name: '仓库列表',
          children: depots
        }
      ]);
    } catch {
      console.error('获取仓库列表失败');
    }
  }

  getTreeItem(element: IDepot & IItem) {
    return {
      label: element.name,
      collapsibleState: element.children ? 1 : 0,
      command: {
        command: (element.children || element.disableClick) ? '' : 'codingPlugin.depotTreeItemClick',
        arguments: element
      }
    };
  }
}

export default DepotTreeDataProvider;
