import { LandingPageConfig, LandingPagePayload, LandingPageView } from '../types/landing';
import { ApiResponse } from '../types/types';
import axiosClient from './axiosClient';

/** Public — chỉ trả landing đã xuất bản, bản nháp coi như 404. */
export const getLandingPage = async (slug: string): Promise<ApiResponse<LandingPageView>> => {
  const response = await axiosClient.get<ApiResponse<LandingPageView>>(`/landing/page`, {
    params: { slug },
  });
  return response.data;
};

/* ===== Admin ===== */

export const getLandingPages = async (): Promise<ApiResponse<LandingPageConfig[]>> => {
  const response = await axiosClient.get<ApiResponse<LandingPageConfig[]>>(`/landing`);
  return response.data;
};

export const createLandingPage = async (
  data: LandingPagePayload
): Promise<ApiResponse<LandingPageConfig>> => {
  const response = await axiosClient.post<ApiResponse<LandingPageConfig>>(`/landing`, data);
  return response.data;
};

export const updateLandingPage = async (
  id: string,
  data: LandingPagePayload
): Promise<ApiResponse<LandingPageConfig>> => {
  const response = await axiosClient.put<ApiResponse<LandingPageConfig>>(`/landing/${id}`, data);
  return response.data;
};

export const deleteLandingPage = async (id: string): Promise<ApiResponse<boolean>> => {
  const response = await axiosClient.delete<ApiResponse<boolean>>(`/landing/${id}`);
  return response.data;
};
