"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const handleResponse = (response) => {
    return response.data;
};
const handleError = (error) => {
    const { response, message } = error;
    return Promise.reject(response ? new Error(response.data.message || message) : error);
};
const createInstance = () => {
    const instance = axios_1.default.create();
    instance.interceptors.response.use(handleResponse, handleError);
    return instance;
};
exports.default = createInstance();
