import hx from 'hbuilderx';
import ACTIONS, { dispatch } from '../utils/actions';
import { IDepot } from '../typings/common';

interface IItem extends ITreeItem {
  _create: boolean;
}

const getCommand = (element: IDepot & IItem) => {
  if (element.children) return '';
  if (element._create) return 'codingPlugin.createDepot';
  return 'codingPlugin.depotTreeItemClick';
};

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

      dispatch(ACTIONS.SET_DEPOTS, {
        context: this.context,
        value: depots,
      });

      return Promise.resolve([
        {
          name: '创建仓库',
          _create: true,
        },
        {
          name: '仓库列表',
          children: depots,
        },
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
        command: getCommand(element),
        arguments: element,
      },
      contextValue: 'createDepot',
    };
  }
}

export default DepotTreeDataProvider;
