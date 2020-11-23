import hx from 'hbuilderx';
import ACTIONS, { dispatch } from '../utils/actions';
import toast from '../utils/toast';
import { getMrListParams } from '../utils/mr';
import { IDepot, IMRItem, IReviewer, IRepoInfo } from '../typings/common';

interface IItem extends ITreeItem {
  _create: boolean;
  _pick: boolean;
  _auth: boolean;
  _login: boolean;
  _disabled: boolean;
  _isDepot: boolean;
}

type IElement = IDepot & IMRItem & IItem;

const LOGIN = [
  {
    name: '登录 CODING',
    _login: true,
    _isDepot: true,
  },
];

const AUTH = [
  {
    name: 'CODING 授权',
    _auth: true,
    _isDepot: true,
  },
];

const getCommand = (element: IElement) => {
  if (element.children || element._disabled) return '';
  if (element._login) return 'codingPlugin.login';
  if (element._auth) return 'codingPlugin.auth';
  if (element._pick) return 'codingPlugin.pickDepot';
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
    const { selectedDepot } = this.context;
    return getMrListParams(selectedDepot, this.user);
  }

  async getUser() {
    const { codingServer, token } = this.context;
    if (!this.user) {
      this.user = await codingServer.getUserInfo(token);
      if (this.user) {
        dispatch(ACTIONS.SET_USER_INFO, {
          context: this.context,
          value: this.user,
        });
      }
    }
    return this.user;
  }

  async getData(repoInfo?: IRepoInfo) {
    const { codingServer } = this.context;
    const promises = [codingServer.getDepotList(this.user.team, this.context.repoInfo?.project)];
    if (repoInfo) {
      promises.push(codingServer.getMrList(repoInfo));
    }

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

    return {
      depots,
      MRList: [createdList, reviewerList, others],
    };
  }

  async getMenus(repoInfo?: IRepoInfo) {
    const {
      depots,
      MRList: [createdList, reviewerList, others],
    } = await this.getData(repoInfo);

    return [
      {
        name: '+ 创建仓库',
        _create: true,
        _isDepot: true,
      },
      {
        name: `切换仓库（仓库总数：${depots.length}）`,
        _pick: true,
        _isDepot: true,
      },
      {
        title: `合并请求列表（当前仓库：${repoInfo?.repo || '-'}）`,
        _disabled: true,
      },
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
    ];
  }

  async getChildren(element: IElement) {
    if (!this.context.token) {
      return Promise.resolve(AUTH);
    }

    if (!this.user) {
      try {
        this.user = await this.getUser();
      } catch (err) {
        if (err.code === 1000) {
          return Promise.resolve(LOGIN);
        }
      }
    }

    if (!this.user) {
      return Promise.resolve(LOGIN);
    }

    if (element) {
      return Promise.resolve(element.children);
    }

    const repoInfo = await this.getRepoInfo();

    try {
      const menus = await this.getMenus(repoInfo);
      return Promise.resolve(menus);
    } catch (err) {
      const { code } = err;
      if (code === 1100 || code === 1400) {
        toast.error(`请登录 ${repoInfo?.repo} 代码仓库对应的服务`);
        return Promise.resolve(LOGIN);
      }
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
