import hx from 'hbuilderx';
import ACTIONS, { dispatch } from '../utils/actions';
import toast from '../utils/toast';
import { getMrListParams } from '../utils/mr';
import { IDepot, IMRItem, IReviewer } from '../typings/common';

interface IItem extends ITreeItem {
  _create: boolean;
  _auth: boolean;
  _login: boolean;
  _disabled: boolean;
  _isDepot: boolean;
}

type IElement = IDepot & IMRItem & IItem;

const getCommand = (element: IElement) => {
  if (element.children || element._disabled) return '';
  if (element._login) return 'codingPlugin.login';
  if (element._auth) return 'codingPlugin.auth';
  if (element._create) return 'codingPlugin.createDepot';
  if (element.vcsType) return 'codingPlugin.depotTreeItemClick';
  return 'codingPlugin.mrTreeItemClick';
};

class DepotMRTreeDataProvider extends hx.TreeDataProvider {
  constructor(context: IContext) {
    super();
    this.context = context;
    this.user = null;
  }

  getRepoInfo() {
    const { selectedDepot, depots } = this.context;
    return getMrListParams(selectedDepot, depots, this.user);
  }

  async getChildren(element: IElement) {
    const { codingServer, token } = this.context;

    if (!this.user) {
      this.user = await codingServer.getUserInfo(token);
    }

    if (!this.user) {
      return Promise.resolve([
        {
          name: '登录 CODING',
          _login: true,
          _isDepot: true,
        },
      ]);
    }

    dispatch(ACTIONS.SET_USER_INFO, {
      context: this.context,
      value: this.user,
    });

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
        createdList = list.filter((item: IMRItem) => item.author.id === this.user.id);
        reviewerList = list.filter((item: IMRItem) =>
          item.reviewers.find((r: IReviewer) => r.reviewer.id === this.user.id),
        );
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
          title: `合并请求列表（当前仓库 ${this.context.selectedDepot?.name || '-'}）`,
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

    return {
      label: element.title,
      collapsibleState: element.children ? 1 : 0,
      command: {
        command: getCommand(element),
        arguments: [this.user, element],
      },
    };
  }
}

export default DepotMRTreeDataProvider;
