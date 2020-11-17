import axios, { AxiosRequestConfig, AxiosInstance } from 'axios';
import toast from './toast';

const formatErrorMessage = (msg: string | Record<string, string>) => {
  if (typeof msg === 'string') return msg;
  return Object.values(msg).join();
};

const handleResponse = (response: any) => {
  const result = response.data;

  if (result.code) {
    const message = formatErrorMessage(result.msg);
    toast.error(message);
    throw new Error(message);
  }

  return result;
};

const handleError = (error: any) => {
  const { response, message } = error;
  return Promise.reject(response ? new Error(response.data.message || message) : error);
};

interface Instance extends AxiosInstance {
  (config: AxiosRequestConfig): Promise<any>;
}

const createInstance = (): Instance => {
  const instance = axios.create();
  instance.interceptors.response.use(handleResponse, handleError);
  return instance;
};

export default createInstance();
