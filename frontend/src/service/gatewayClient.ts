import axios from 'axios';
import { tryRefreshToken } from './axiosClient';

/**
 * Axios client pointed at the API gateway (staff-chat microservice lives behind it).
 * Reuses the same sessionStorage token + refresh flow as the monolith client.
 */
const gatewayClient = axios.create({
  baseURL: process.env.REACT_APP_GATEWAY_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

gatewayClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('accessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

gatewayClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      sessionStorage.getItem('refreshToken')
    ) {
      originalRequest._retry = true;
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        originalRequest.headers.Authorization = `Bearer ${sessionStorage.getItem('accessToken')}`;
        return gatewayClient(originalRequest);
      }
      sessionStorage.clear();
      window.location.href = '/2025/luatpoip/admin/login';
    }
    return Promise.reject(error);
  }
);

export default gatewayClient;
