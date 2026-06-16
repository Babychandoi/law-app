import axios from 'axios';
import { tryRefreshToken } from './axiosClient';

/**
 * Axios client pointed at the API gateway (staff-chat microservice lives behind it).
 * Auth is the shared httpOnly cookie on *.luatpoip.com — sent automatically with withCredentials.
 */
const gatewayClient = axios.create({
  baseURL: process.env.REACT_APP_GATEWAY_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
  withCredentials: true,
});

gatewayClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        return gatewayClient(originalRequest);
      }
      window.location.href = '/2025/luatpoip/admin/login';
    }
    return Promise.reject(error);
  }
);

export default gatewayClient;
