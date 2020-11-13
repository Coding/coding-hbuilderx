"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.proxyCtx = exports.proxy = void 0;
exports.proxy = (target, source, key) => {
    Object.defineProperty(target, key, {
        get() {
            return target[source][key];
        },
        set(newValue) {
            target[source][key] = newValue;
        }
    });
};
exports.proxyCtx = (target) => {
    const keys = Object.keys(target.ctx);
    keys.forEach(k => exports.proxy(target, 'ctx', k));
};
