import axios from 'axios';
import { config } from '@/config';

export const api = axios.create({
  baseURL: config.baseUrl,
  timeout: config.apiTimeout,
});

api.interceptors.request.use(async (config) => {
  // const token = await getToken();
  // if (token) {
  //   config.headers.Authorization = `Bearer ${token}`;
  // }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // logout / refresh / redirect
    }
    return Promise.reject(err);
  }
);