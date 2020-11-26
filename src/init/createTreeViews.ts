import hx from 'hbuilderx';
import DepotTreeDataProvider from '../trees/depot';
import MRTreeDataProvider from '../trees/mr';
import DepotMRTreeDataProvider from '../trees/depotMR';

const { createTreeView } = hx.window;

const TREE_VIEWS = [
  {
    id: 'codingPlugin.treeMR',
    treeDataProvider: MRTreeDataProvider,
  },
  {
    id: 'codingPlugin.treeDepot',
    treeDataProvider: DepotTreeDataProvider,
  },
  {
    id: 'codingPlugin.treeDepotMR',
    treeDataProvider: DepotMRTreeDataProvider,
  },
];

function createTreeViews(context: IContext) {
  TREE_VIEWS.forEach(({ id, treeDataProvider }) => {
    context.subscriptions.push(
      createTreeView(id, {
        showCollapseAll: false,
        treeDataProvider: new treeDataProvider(context),
      }),
    );
  });
}

export default createTreeViews;
