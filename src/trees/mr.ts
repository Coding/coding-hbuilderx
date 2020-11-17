import hx from 'hbuilderx';
import toast from '../utils/toast';
import { getMrListParams } from '../utils/mr';
import { IMRItem, IRepoInfo, IReviewer } from '../typings/common';

interface IItem extends ITreeItem {
  _disabled: boolean;
  _create: boolean;
}

const getCommand = (element: IMRItem & IItem) => {
  if (element.children || element._disabled) return '';
  if (element._create) return 'codingPlugin.createDepot';
  return 'codingPlugin.mrTreeItemClick';
};

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
        return Promise.resolve([
          {
            title: '+ 创建仓库',
            _create: true,
          },
        ]);
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
          title: `Created By Me (${createdList?.length})`,
          children: createdList,
        },
        {
          title: `Waiting For My Review (${reviewerList?.length})`,
          children: reviewerList,
        },
      ]);
    } catch {
      toast.error('获取MR列表失败');
      Promise.resolve([]);
    }
  }

  getTreeItem(element: IMRItem & IItem) {
    const repoInfo = this.getRepoInfo() as IRepoInfo;

    return {
      label: element.title,
      collapsibleState: element.children ? 1 : 0,
      command: {
        command: getCommand(element),
        arguments: [repoInfo?.team, element],
      },
    };
  }
}

export default MRTreeDataProvider;
