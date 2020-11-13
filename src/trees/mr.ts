import hx from 'hbuilderx';
import { IMRItem, IReviewer } from '../typings/common';

class MRTreeDataProvider extends hx.TreeDataProvider {
  constructor(context: IContext) {
    super();
    this.context = context;
  }

  async getChildren(element?: IMRItem & ITreeItem) {
    if (element) {
      return Promise.resolve(element.children);
    }

    const list = await this.context.codingServer.getMrList();

    const userId = this.context.userInfo.id;
    const createdList = list.filter((item: IMRItem) => item.author.id === userId);
    const reviewerList = list.filter((item: IMRItem) => item.reviewers.find((r: IReviewer) => r.reviewer.id === userId));

    return Promise.resolve([
      {
        title: `Created By Me (${createdList.length})`,
        children: createdList
      },
      {
        title: `Waiting For My Review (${reviewerList.length})`,
        children: reviewerList
      }
    ]);
  }

  getTreeItem(element: IMRItem & ITreeItem) {
    return {
      label: element.title,
      collapsibleState: element.children ? 1 : 0,
      command: {
        command: element.children ? '' : 'codingPlugin.mrTreeItemClick',
        arguments: [
          element
        ]
      }
    };
  }
}

export default MRTreeDataProvider;
