import hx from 'hbuilderx';
import ACTIONS, { dispatch } from '../utils/actions';
import toast from '../utils/toast';
import { getMrListParams } from '../utils/mr';
import { IDepot, IMRItem, IReviewer } from '../typings/common';

interface IItem extends ITreeItem {
  _create: boolean;
  _auth: boolean;
  _disabled: boolean;
  _isDepot: boolean;
}

type IElement = IDepot & IMRItem & IItem;

const getCommand = (element: IElement) => {
  if (element.children || element._disabled) return '';
  if (element._auth) return 'codingPlugin.auth';
  if (element._create) return 'codingPlugin.createDepot';
  if (element.vcsType) return 'codingPlugin.depotTreeItemClick';
  return 'codingPlugin.mrTreeItemClick';
};

class DepotMRTreeDataProvider extends hx.TreeDataProvider {
  constructor(context: IContext) {
    super();
    this.context = context;
  }

  getUser() {
    return this.context.codingServer.session?.user;
  }

  getRepoInfo() {
    const { selectedDepot, depots, codingServer } = this.context;
    const user = codingServer.session?.user;
    return getMrListParams(selectedDepot, depots, user);
  }

  async getChildren(element: IElement) {
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

    const repoInfo = this.getRepoInfo();
    const promises = [this.context.codingServer.getDepotList()];
    if (repoInfo) {
      promises.push(this.context.codingServer.getMrList(repoInfo));
    }

    try {
      const [depots, list] = await Promise.all(promises);
      let createdList: IMRItem[] = [];
      let reviewerList: IMRItem[] = [];
      let others = [];
      if (list) {
        createdList = list.filter((item: IMRItem) => item.author.id === user.id);
        reviewerList = list.filter((item: IMRItem) => item.reviewers.find((r: IReviewer) => r.reviewer.id === user.id));
        others = list.filter((item: IMRItem) => {
          const isNotInCreatedList = createdList.findIndex((i) => i.id === item.id) === -1;
          const isNotInReviewerList = reviewerList.findIndex((i) => i.id === item.id) === -1;
          return isNotInCreatedList && isNotInReviewerList;
        });
      }

      dispatch(ACTIONS.SET_DEPOTS, {
        context: this.context,
        value: depots,
      });

      return Promise.resolve([
        {
          name: '+ 创建仓库',
          _create: true,
          _isDepot: true,
        },
        {
          name: '仓库列表',
          children: depots,
          _isDepot: true,
        },
        {
          title: `合并请求列表（当前选中仓库 ${this.context.selectedDepot?.name || '-'}）`,
          children: [
            {
              title: `我创建的 (${createdList?.length})`,
              children: createdList,
            },
            {
              title: `需要我 Review 的 (${reviewerList?.length})`,
              children: reviewerList,
            },
            {
              title: `其他（${others?.length}）`,
              children: others,
            },
          ],
        },
      ]);
    } catch {
      toast.error('获取数据失败');
    }
  }

  getTreeItem(element: IElement) {
    if (element.vcsType || element._isDepot) {
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

    const user = this.getUser();
    return {
      label: element.title,
      collapsibleState: element.children ? 1 : 0,
      command: {
        command: getCommand(element),
        arguments: [user?.team, element],
      },
    };
  }
}

export default DepotMRTreeDataProvider;
