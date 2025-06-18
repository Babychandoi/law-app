
import axios from "axios";
import { ServiceResponse } from "../types/service";
import { ChildrenServiceResponse } from "../types/service";
import { ApiResponse } from "../types/types";
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