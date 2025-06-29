
import axios from "axios";
import { Hero, PreviousPartner, Process, ProcessStep, ServiceResponse } from "../types/service";
import { ChildrenServiceResponse } from "../types/service";
import { ApiResponse } from "../types/types";
import { TotoCompany } from "../types/company";
const API_URL = "http://localhost:8080";

export const getServices = async (): Promise<ApiResponse<ServiceResponse[]>> => {
		const response = await axios.get<ApiResponse<ServiceResponse[]>>(`${API_URL}/services`);
		return response.data;
}
export const getChildrenServiceById = async (id: string): Promise<ApiResponse<ChildrenServiceResponse[]>> => {
	const response = await axios.get<ApiResponse<ChildrenServiceResponse[]>>(`${API_URL}/services/${id}`);
	return response.data;
}
export const getPricingByServiceId = async (id: string): Promise<ApiResponse<any>> => {
	const response = await axios.get<ApiResponse<any>>(`${API_URL}/services/fee/${id}`);
	return response.data;
}
export const getHeroByServiceId = async (id: string): Promise<ApiResponse<Hero>> => {
	const response = await axios.get<ApiResponse<Hero>>(`${API_URL}/service/hero/${id}`);
	return response.data;
}
export const getProcessByServiceId = async (id: string): Promise<ApiResponse<Process[]>> => {
	const response = await axios.get<ApiResponse<Process[]>>(`${API_URL}/service/process/${id}`);
	return response.data;
}
export const getPreviousPartner = async (): Promise<ApiResponse<PreviousPartner[]>> => {
	const response = await axios.get<ApiResponse<PreviousPartner[]>>(`${API_URL}/service/previous-partners`);
	return response.data;
}
export const getProcessTimeLineByServiceId = async(id:string) :  Promise<ApiResponse<ProcessStep[]>> => {
	const response = await axios.get<ApiResponse<ProcessStep[]>>(`${API_URL}/service/process-timeline/${id}`);
	return response.data;
}
export const getCompany = async() : Promise<ApiResponse<TotoCompany>> => {
	const response = await axios.get<ApiResponse<TotoCompany>>(`${API_URL}/services/toto`);
	return response.data;
}