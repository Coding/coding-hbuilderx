interface Window {
  hbuilderx: any;
  __CODING__: string;
}

declare module '*.css' {
  const content: any;
  export default content;
}

interface IMsgModel {
  command: string;
  [key: string]: any;
}
