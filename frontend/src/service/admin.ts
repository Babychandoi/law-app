import {
  ApiResponse,
  Customer,
  CustomerDetail,
  IntrospectResponse,
  Login,
  LoginResponse,
  User,
  UserCreate,
} from '../types/admin';
import axiosClient from './axiosClient';
import axios from 'axios';
import { News } from '../types/service';
const API_URL = process.env.REACT_APP_API_URL;
export const login = async (login: Login): Promise<ApiResponse<LoginResponse>> => {
  const response = await axiosClient.post<ApiResponse<any>>(`/auth/login`, login);
  return response.data;
};
export const checkToken = async (token: string): Promise<ApiResponse<IntrospectResponse>> => {
  const formData = {
    token: token,
  };
  const response = await axios.post<ApiResponse<IntrospectResponse>>(
    `${API_URL}/auth/introspect`,
    formData,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
};
export const getCustomers = async (): Promise<ApiResponse<Customer[]>> => {
  const response = await axiosClient.get<ApiResponse<Customer[]>>(`/customer`);
  return response.data;
};
export const getCustomerById = async (id: string): Promise<ApiResponse<CustomerDetail>> => {
  const response = await axiosClient.get<ApiResponse<CustomerDetail>>(`/customer/${id}`);
  return response.data;
};
export const updateCustomerStatus = async (
  id: string,
  status: 'NEW' | 'RECEIVED' | 'PROCESSING' | 'COMPLETED' | 'CANCELED'
): Promise<ApiResponse<boolean>> => {
  const response = await axiosClient.put<ApiResponse<boolean>>(
    `/customer/status/${id}?status=${status}`
  );
  return response.data;
};
export const uploadFile = async (file: File): Promise<ApiResponse<string>> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axiosClient.post<ApiResponse<string>>(`/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export interface AdminChildrenService {
  id: string;
  title: string;
  href?: string;
  description?: string;
  image?: string;
}

// Lấy toàn bộ dịch vụ con (để admin chọn đổi ảnh)
export const getAllChildrenServices = async (): Promise<ApiResponse<AdminChildrenService[]>> => {
  const response = await axiosClient.get<ApiResponse<AdminChildrenService[]>>(`/service/children`);
  return response.data;
};

// Cập nhật ảnh cho 1 dịch vụ con
export const updateServiceImage = async (
  id: string,
  image: string
): Promise<ApiResponse<boolean>> => {
  const response = await axiosClient.put<ApiResponse<boolean>>(`/service/children/${id}/image`, {
    image,
  });
  return response.data;
};

// ===== CMS: quản lý dịch vụ hoàn toàn qua admin =====

export interface ServicePayload {
  title: string;
  href: string;
  description?: string;
  icon?: string;
  image?: string;
  descriptionHome?: string;
  parentServiceId?: string;
}

// Tạo nhóm dịch vụ cha (hiện trong navbar). Trả về boolean theo ServiceController.
export const createParentService = async (
  title: string,
  href: string,
  icon?: string
): Promise<boolean> => {
  const response = await axiosClient.post<boolean>(`/services`, { title, href, icon });
  return response.data;
};

export const createService = async (
  data: ServicePayload
): Promise<ApiResponse<AdminChildrenService>> => {
  const response = await axiosClient.post<ApiResponse<AdminChildrenService>>(
    `/service/children`,
    data
  );
  return response.data;
};

export const updateService = async (
  id: string,
  data: ServicePayload
): Promise<ApiResponse<boolean>> => {
  const response = await axiosClient.put<ApiResponse<boolean>>(`/service/children/${id}`, data);
  return response.data;
};

export const deleteService = async (id: string): Promise<ApiResponse<boolean>> => {
  const response = await axiosClient.delete<ApiResponse<boolean>>(`/service/children/${id}`);
  return response.data;
};

export const saveServiceHero = async (
  id: string,
  hero: { title: string; subtitle?: string; description?: string }
): Promise<ApiResponse<boolean>> => {
  const response = await axiosClient.put<ApiResponse<boolean>>(
    `/service/children/${id}/hero`,
    hero
  );
  return response.data;
};

export const saveServiceProcess = async (
  id: string,
  steps: unknown[]
): Promise<ApiResponse<boolean>> => {
  const response = await axiosClient.put<ApiResponse<boolean>>(
    `/service/children/${id}/process`,
    steps
  );
  return response.data;
};

export const saveServicePricing = async (
  id: string,
  plans: unknown[]
): Promise<ApiResponse<boolean>> => {
  const response = await axiosClient.put<ApiResponse<boolean>>(
    `/service/children/${id}/pricing`,
    plans
  );
  return response.data;
};

export const getServiceSections = async (
  id: string
): Promise<ApiResponse<import('../types/servicePage').ServiceSection[]>> => {
  const response = await axiosClient.get<
    ApiResponse<import('../types/servicePage').ServiceSection[]>
  >(`/service/children/${id}/sections`);
  return response.data;
};

export const saveServiceSections = async (
  id: string,
  sections: import('../types/servicePage').ServiceSection[]
): Promise<ApiResponse<boolean>> => {
  const response = await axiosClient.put<ApiResponse<boolean>>(
    `/service/children/${id}/sections`,
    sections
  );
  return response.data;
};

export const createNews = async (news: News): Promise<ApiResponse<News>> => {
  const response = await axiosClient.post<ApiResponse<News>>(`/news`, news);
  return response.data;
};
export const updateNews = async (id: string, news: News): Promise<ApiResponse<News>> => {
  const response = await axiosClient.put<ApiResponse<News>>(`/news/${id}`, news);
  return response.data;
};
export const deleteNews = async (id: string): Promise<ApiResponse<boolean>> => {
  const response = await axiosClient.delete<ApiResponse<boolean>>(`/news/${id}`);
  return response.data;
};
export const getUsers = async (): Promise<ApiResponse<User[]>> => {
  const response = await axiosClient.get<ApiResponse<User[]>>(`/auth/users`);
  return response.data;
};
export const changePassword = async (
  userId: string,
  newPassword: string
): Promise<ApiResponse<boolean>> => {
  const response = await axiosClient.put<ApiResponse<boolean>>(
    `/auth/users/${userId}/password?newPassword=${newPassword}`
  );
  return response.data;
};
export const changeRole = async (
  userId: string,
  role: 'ADMIN' | 'USER'
): Promise<ApiResponse<boolean>> => {
  const response = await axiosClient.put<ApiResponse<boolean>>(
    `/auth/users/${userId}/role?role=${role}`
  );
  return response.data;
};
export const changeActive = async (
  userId: string,
  active: 'ACTIVE' | 'INACTIVE'
): Promise<ApiResponse<boolean>> => {
  const response = await axiosClient.put<ApiResponse<boolean>>(
    `/auth/users/${userId}/active?active=${active}`
  );
  return response.data;
};
export const createUser = async (user: UserCreate): Promise<ApiResponse<User>> => {
  const response = await axiosClient.post<ApiResponse<User>>(`/auth/users`, user);
  return response.data;
};
export const editUser = async (userId: string, user: UserCreate): Promise<ApiResponse<User>> => {
  const response = await axiosClient.put<ApiResponse<User>>(`/auth/users/${userId}`, user);
  return response.data;
};
export const myProfile = async (): Promise<ApiResponse<User>> => {
  const response = await axiosClient.get<ApiResponse<User>>(`/auth/me`);
  return response.data;
};
export const logout = async (token: string): Promise<ApiResponse<void>> => {
  const form = {
    token: token,
  };
  const response = await axiosClient.post<ApiResponse<void>>(`/auth/logout`, form);
  sessionStorage.clear();
  return response.data;
};
export const getNotificationById = async (): Promise<ApiResponse<Notification[]>> => {
  const response = await axiosClient.get<ApiResponse<Notification[]>>(`/notifications`);
  return response.data;
};
export const sendMail = async (id: string): Promise<ApiResponse<boolean>> => {
  const response = await axiosClient.post<ApiResponse<boolean>>(`/news/notificationNews/${id}`);
  return response.data;
};
export const markAsRead = async (notificationId: string): Promise<ApiResponse<boolean>> => {
  const response = await axiosClient.put<ApiResponse<boolean>>(
    `/notifications/${notificationId}/read`
  );
  return response.data;
};
export const markAllRead = async (): Promise<ApiResponse<boolean>> => {
  const response = await axiosClient.put<ApiResponse<boolean>>(`/notifications/read`);
  return response.data;
};
