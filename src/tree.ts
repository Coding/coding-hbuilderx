import hx from 'hbuilderx';

class TreeDataProvider extends hx.TreeDataProvider {
  constructor(treeData: ITreeItem[]) {
    super();
    this._treeData = treeData;
  }

  getChildren(element: ITreeItem) {
    return new Promise(resolve => {
      if (!element) {
        resolve(this._treeData);
      } else {
        resolve(element.children);
      }
    });
  }

  getTreeItem(element: ITreeItem) {
    return {
      label: element.name,
      collapsibleState: element.children ? 1 : 0,
      command: {
        command: element.children ? '' : 'codingPlugin.treeItemClick',
        arguments: [
          element.name
        ]
      }
    };
  }
}

export default TreeDataProvider;
