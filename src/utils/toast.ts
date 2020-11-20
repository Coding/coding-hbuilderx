import hx from 'hbuilderx';

export const info = (msg: string, buttons?: string[]) => {
  return hx.window.showInformationMessage(msg, buttons);
};

export const warn = (msg: string, buttons?: string[]) => {
  return hx.window.showWarningMessage(msg, buttons);
};

export const error = (msg: string, buttons?: string[]) => {
  return hx.window.showErrorMessage(msg, buttons);
};

export default {
  info,
  warn,
  error,
};
