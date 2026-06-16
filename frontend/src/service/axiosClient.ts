import axios from 'axios';
import { ApiResponse, LoginResponse } from '../types/admin';
import { toast } from 'react-toastify';

const axiosClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000,
  withCredentials: true, // send/receive httpOnly auth cookies
});

// Tokens now live in httpOnly cookies — nothing to inject from JS.
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) {
      return Promise.reject(error);
    }
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        return axiosClient(originalRequest);
      } else {
        window.location.href = '/2025/luatpoip/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;

let refreshInFlight: Promise<boolean> | null = null;

/**
 * Refresh the access token. The refresh token is sent automatically as an httpOnly cookie; the
 * backend rotates both and sets new cookies. Concurrent 401s share one in-flight refresh.
 */
export async function tryRefreshToken(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    try {
      const response = await axios.post<ApiResponse<LoginResponse>>(
        `${process.env.REACT_APP_API_URL}/auth/refresh`,
        {},
        { timeout: 20000, withCredentials: true }
      );
      // Success = backend set fresh cookies (HTTP 200). Body tokens are legacy and ignored.
      return response.data.code === 200;
    } catch (error) {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}
