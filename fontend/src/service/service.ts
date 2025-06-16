
import axios from "axios";
import { ServiceResponse } from "../types/service";
import { ApiResponse } from "../types/types";
const API_URL = "http://localhost:8080";

export const getServices = async (): Promise<ApiResponse<ServiceResponse[]>> => {
		const response = await axios.get<ApiResponse<ServiceResponse[]>>(`${API_URL}/services`);
		return response.data;
}