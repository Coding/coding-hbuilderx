import hx from 'hbuilderx';
import ACTIONS, { dispatch } from '../utils/actions';
import toast from '../utils/toast';
import { IDepot } from '../typings/common';

interface IItem extends ITreeItem {
  _create: boolean;
  _auth: boolean;
}

const getCommand = (element: IDepot & IItem) => {
  if (element.children) return '';
  if (element._auth) return 'codingPlugin.auth';
  if (element._create) return 'codingPlugin.createDepot';
  return 'codingPlugin.depotTreeItemClick';
};

class DepotTreeDataProvider extends hx.TreeDataProvider {
  constructor(context: IContext) {
    super();
    this.context = context;
  }

  getUser() {
    return this.context.codingServer.session?.user;
  }

  async getChildren(element: IDepot & IItem) {
    const user = this.getUser();
    if (!user) {
      toast.warn('请先绑定 CODING 账户');
      return Promise.resolve([
        {
          name: '绑定 CODING 账户',
          _auth: true,
        },
      ]);
    }

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
          name: '+ 创建仓库',
          _create: true,
        },
        ...depots,
      ]);
    } catch {
      toast.error('获取仓库列表失败');
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
