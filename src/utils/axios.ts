import axios, { AxiosRequestConfig, AxiosInstance } from 'axios';

const handleResponse = (response: any) => {
  return response.data;
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
