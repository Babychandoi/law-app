
import axios from "axios";
import { CustomerService, Job, News, PreviousPartner, ServiceItem, ServiceResponse } from "../types/service";
import { ChildrenServiceResponse } from "../types/service";
import { ApiResponse } from "../types/types";
import { TotoCompany } from "../types/company";

const API_URL = process.env.REACT_APP_API_URL;

export const getServices = async (): Promise<ApiResponse<ServiceResponse[]>> => {
		const response = await axios.get<ApiResponse<ServiceResponse[]>>(`${API_URL}/services`);
		return response.data;
}
export const getChildrenServiceByTitle = async (title: string): Promise<ApiResponse<any>> => {
	const response = await axios.get<ApiResponse<any>>(`${API_URL}/services`, { params: { title } });
	return response.data;
}
export const getPreviousPartner = async (): Promise<ApiResponse<PreviousPartner[]>> => {
	const response = await axios.get<ApiResponse<PreviousPartner[]>>(`${API_URL}/service/previous-partners`);
	return response.data;
}
export const getCompany = async() : Promise<ApiResponse<TotoCompany>> => {
	const response = await axios.get<ApiResponse<TotoCompany>>(`${API_URL}/services/toto`);
	return response.data;
}
export const getServiceHome = async (): Promise<ApiResponse<ServiceItem[]>> => {
	const response = await axios.get<ApiResponse<ServiceItem[]>>(`${API_URL}/services/home`);
	return response.data;
}
export const createCustomerService = async (data: CustomerService): Promise<ApiResponse<any>> => {
	const response = await axios.post<ApiResponse<any>>(`${API_URL}/customer`, data);
	return response.data;
}
export const getJobs = async (): Promise<ApiResponse<Job[]>> => {
	const response = await axios.get<ApiResponse<Job[]>>(`${API_URL}/jobs`);
	return response.data;
}
export const getJobById = async (id: string): Promise<ApiResponse<Job>> => {
	const response = await axios.get<ApiResponse<Job>>(`${API_URL}/jobs/${id}`);
	return response.data;
}
export const searchJobs = async (filters: { keywords: string; category: string; jobType: string; location: string }) =>{
	const response = await axios.get<ApiResponse<Job[]>>(`${API_URL}/jobs/search`, { params: filters });
	return response.data;
}
export const getNew = async (id : string): Promise<ApiResponse<News>> => {
	const response = await axios.get<ApiResponse<News>>(`${API_URL}/news/${id}`);
	return response.data;
}
export const getNews = async (): Promise<ApiResponse<News[]>> => {
	const response = await axios.get<ApiResponse<News[]>>(`${API_URL}/news`);
	return response.data;
}
export const addUserNew = async (email: string): Promise<ApiResponse<Boolean>> => {
	const response = await axios.post<ApiResponse<Boolean>> (`${API_URL}/news/subscribe?email=${email}`);
	return response.data;
}
