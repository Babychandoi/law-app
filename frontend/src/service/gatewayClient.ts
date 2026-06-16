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
    // Refresh-and-replay on 401; no redirect here (avoids reload loops). The dashboard guard
    // (getMe in home/index.tsx) handles navigation to the login page when the session is gone.
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        return gatewayClient(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);

export default gatewayClient;
