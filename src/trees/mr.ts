import hx from 'hbuilderx';
import toast from '../utils/toast';
import { getMrListParams } from '../utils/mr';
import { IMRItem, IRepoInfo, IReviewer } from '../typings/common';

interface IItem extends ITreeItem {
  _disabled: boolean;
}

class MRTreeDataProvider extends hx.TreeDataProvider {
  constructor(context: IContext) {
    super();
    this.context = context;
  }

  getRepoInfo() {
    const { repoInfo, selectedDepot, depots, codingServer } = this.context;
    const user = codingServer.session?.user;
    return getMrListParams(repoInfo, selectedDepot, depots, user);
  }

  async getChildren(element?: IMRItem & IItem) {
    if (element) {
      return Promise.resolve(element.children);
    }

    try {
      const user = this.context.codingServer.session?.user;
      const userId = user?.id;

      const repoInfo = this.getRepoInfo();

      if (!repoInfo) {
        toast.warn('请先到扩展视图`CODING 仓库`中创建仓库');
        return;
      }

      const list = await this.context.codingServer.getMrList(repoInfo);
      const createdList = list.filter((item: IMRItem) => item.author.id === userId);
      const reviewerList = list.filter((item: IMRItem) =>
        item.reviewers.find((r: IReviewer) => r.reviewer.id === userId),
      );

      return Promise.resolve([
        {
          title: `当前代码仓库：${repoInfo.repo}`,
          _disabled: true,
        },
        {
          title: `Created By Me (${createdList.length})`,
          children: createdList,
        },
        {
          title: `Waiting For My Review (${reviewerList.length})`,
          children: reviewerList,
        },
      ]);
    } catch {
      console.error('获取MR列表失败');
      Promise.resolve([]);
    }
  }

  getTreeItem(element: IMRItem & IItem) {
    const repoInfo = this.getRepoInfo() as IRepoInfo;

    return {
      label: element.title,
      collapsibleState: element.children ? 1 : 0,
      command: {
        command: element.children || element._disabled ? '' : 'codingPlugin.mrTreeItemClick',
        arguments: [repoInfo.team, element],
      },
    };
  }
}

export default MRTreeDataProvider;
