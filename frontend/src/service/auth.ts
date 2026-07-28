import axiosClient from './axiosClient';

export interface MeResponse {
  id: string;
  username: string;
  fullName: string;
  role: string; // "ADMIN" | "USER"
  position?: string;
  email?: string;
}

interface ApiResponse<T> {
  code: number;
  message?: string;
  data: T;
}

let cached: MeResponse | null = null;

/**
 * Current user from the backend (replaces decoding the JWT client-side, which is impossible now
 * that the token lives in an httpOnly cookie). Cached per page load.
 */
export async function getMe(force = false): Promise<MeResponse | null> {
  if (cached && !force) return cached;
  try {
    const res = await axiosClient.get<ApiResponse<MeResponse>>('/auth/me');
    cached = res.data.data;
    return cached;
  } catch {
    cached = null;
    return null;
  }
}

export function clearMe(): void {
  cached = null;
}

/** Short-lived token for the STOMP/WebSocket handshake. Not cached — fetch right before connect. */
export async function getWsToken(): Promise<string | null> {
  try {
    const res = await axiosClient.get<ApiResponse<string>>('/auth/ws-token');
    return res.data.data;
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  try {
    await axiosClient.post('/auth/logout', {});
  } finally {
    clearMe();
  }
}
