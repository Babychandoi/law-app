import {
  CustomerService,
  Job,
  News,
  PreviousPartner,
  ServiceItem,
  ServiceResponse,
} from '../types/service';
import { ApiResponse } from '../types/types';
import { TotoCompany } from '../types/company';
import axiosClient from './axiosClient';

export const getServices = async (): Promise<ApiResponse<ServiceResponse[]>> => {
  const response = await axiosClient.get<ApiResponse<ServiceResponse[]>>(`/services`);
  return response.data;
};
// Toàn bộ nội dung một trang dịch vụ động theo đường dẫn
export const getServicePage = async (
  href: string
): Promise<ApiResponse<import('../types/servicePage').ServicePageData>> => {
  const response = await axiosClient.get<
    ApiResponse<import('../types/servicePage').ServicePageData>
  >(`/service/page`, { params: { href } });
  return response.data;
};
export const getChildrenServiceByTitle = async (title: string): Promise<ApiResponse<any>> => {
  const response = await axiosClient.get<ApiResponse<any>>(`/services`, { params: { title } });
  return response.data;
};
export const getPreviousPartner = async (): Promise<ApiResponse<PreviousPartner[]>> => {
  const response = await axiosClient.get<ApiResponse<PreviousPartner[]>>(
    `/service/previous-partners`
  );
  return response.data;
};
export const getCompany = async (): Promise<ApiResponse<TotoCompany>> => {
  const response = await axiosClient.get<ApiResponse<TotoCompany>>(`/services/toto`);
  return response.data;
};
export const getServiceHome = async (): Promise<ApiResponse<ServiceItem[]>> => {
  const response = await axiosClient.get<ApiResponse<ServiceItem[]>>(`/services/home`);
  return response.data;
};
export const createCustomerService = async (data: CustomerService): Promise<ApiResponse<any>> => {
  const response = await axiosClient.post<ApiResponse<any>>(`/customer`, data);
  return response.data;
};
export const getJobs = async (): Promise<ApiResponse<Job[]>> => {
  const response = await axiosClient.get<ApiResponse<Job[]>>(`/jobs`);
  return response.data;
};
export const getJobById = async (id: string): Promise<ApiResponse<Job>> => {
  const response = await axiosClient.get<ApiResponse<Job>>(`/jobs/${id}`);
  return response.data;
};
export const searchJobs = async (filters: {
  keywords: string;
  category: string;
  jobType: string;
  location: string;
}) => {
  const response = await axiosClient.get<ApiResponse<Job[]>>(`/jobs/search`, { params: filters });
  return response.data;
};
export const getNew = async (id: string): Promise<ApiResponse<News>> => {
  const response = await axiosClient.get<ApiResponse<News>>(`/news/${id}`);
  return response.data;
};
export const getNews = async (params?: {
  page?: number;
  size?: number;
}): Promise<ApiResponse<News[]>> => {
  const response = await axiosClient.get<ApiResponse<News[]>>(`/news`, { params });
  return response.data;
};
export const addUserNew = async (email: string): Promise<ApiResponse<string>> => {
  const response = await axiosClient.post<ApiResponse<string>>(`/news/subscribe`, null, {
    params: { email },
  });
  return response.data;
};
