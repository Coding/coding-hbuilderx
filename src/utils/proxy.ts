export const proxy = (target: IObject, source: string, key: string) => {
  Object.defineProperty(target, key, {
    get() {
      return target[source][key];
    },
    set(newValue) {
      target[source][key] = newValue;
    }
  });
};

export const proxyCtx = (target: IObject) => {
  const keys = Object.keys(target.ctx);
  keys.forEach(k => proxy(target, 'ctx', k));
};
