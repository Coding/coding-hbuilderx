import hx from 'hbuilderx';
import MRCustomEditorProvider from '../customEditors/mergeRequest';
import ACTIONS, { dispatch } from '../utils/actions';

function registerCustomEditors(context: IContext) {
  const mrCustomEditor = new MRCustomEditorProvider(context);
  hx.window.registerCustomEditorProvider('customEditor.mrDetail', mrCustomEditor);

  dispatch(ACTIONS.SET_MR_CUSTOM_EDITOR, {
    context,
    value: mrCustomEditor,
  });
}

export default registerCustomEditors;
