
import { ApiResponse, Customer, CustomerDetail, IntrospectResponse, Login, LoginResponse, User, UserCreate } from "../types/admin";
import axiosClient from "./axiosClient";
import axios from "axios"; 
import { News } from "../types/service";
const API_URL = process.env.REACT_APP_API_URL;
export const login = async (login : Login): Promise<ApiResponse<LoginResponse>> => {
	const response = await axiosClient.post<ApiResponse<any>>(`/auth/login`,login);
	return response.data;
}
export const checkToken = async (token: string): Promise<ApiResponse<IntrospectResponse>> => {
	const formData = {
		"token": token
	};	
	const response = await axios.post<ApiResponse<IntrospectResponse>>(`${API_URL}/auth/introspect`, formData,
		{
			headers: {
				'Content-Type': 'application/json'
			}
		}
	);
	return response.data;
}
export const getCustomers = async (): Promise<ApiResponse<Customer[]>> => {
	const response = await axiosClient.get<ApiResponse<Customer[]>>(`/customer`);
	return response.data;
} 
export const getCustomerById = async (id: string): Promise<ApiResponse<CustomerDetail>> => {
	const response = await axiosClient.get<ApiResponse<CustomerDetail>>(`/customer/${id}`);
	return response.data;
}
export const updateCustomerStatus = async (
	id: string,
	status: 'NEW' | 'RECEIVED' | 'PROCESSING' | 'COMPLETED' | 'CANCELED'
): Promise<ApiResponse<boolean>> => {
	const response = await axiosClient.put<ApiResponse<boolean>>(
		`/customer/status/${id}?status=${status}`);
	return response.data;
};
export const uploadFile = async (file: File): Promise<ApiResponse<string>> => {
	const formData = new FormData();
	formData.append('file', file);
  
	const response = await axiosClient.post<ApiResponse<string>>(
		`/upload`,
		formData,
		{
			headers: {
				'Content-Type': 'multipart/form-data',
			}
		}
	);
  
	return response.data;
};

  
export const createNews = async(news :News) : Promise<ApiResponse<News>> => {
	const response = await axiosClient.post<ApiResponse<News>>(`/news`, news);
	return response.data;
}
export const updateNews = async(id :string , news : News) : Promise<ApiResponse<News>> => {
	const response = await axiosClient.put<ApiResponse<News>>( `/news/${id}`, news)
	return response.data;
}
export const deleteNews = async(id : string) : Promise<ApiResponse<boolean>> => {
	const response = await axiosClient.delete<ApiResponse<boolean>>(`/news/${id}`);
	return response.data;
}
export const getUsers = async (): Promise<ApiResponse<User[]>> => {
	const response = await axiosClient.get<ApiResponse<User[]>>(`/auth/users`);
	return response.data;
}
export const changePassword = async (userId: string, newPassword: string): Promise<ApiResponse<boolean>> => {
	const response = await axiosClient.put<ApiResponse<boolean>>(`/auth/users/${userId}/password?newPassword=${newPassword}`);
	return response.data;
}
export const changeRole = async (userId: string, role: 'ADMIN' | 'USER'): Promise<ApiResponse<boolean>> => {
	const response = await axiosClient.put<ApiResponse<boolean>>(`/auth/users/${userId}/role?role=${role}`);
	return response.data;
}
export const changeActive = async (userId: string, active: 'ACTIVE' | 'INACTIVE'): Promise<ApiResponse<boolean>> => {
	const response = await axiosClient.put<ApiResponse<boolean>>(
		`/auth/users/${userId}/active?active=${active}`);
	return response.data;	  
}
export const createUser = async (user: UserCreate): Promise<ApiResponse<User>> => {
	const response = await axiosClient.post<ApiResponse<User>>(`/auth/users`, user);
	return response.data;
}
export const editUser = async (userId: string, user: UserCreate): Promise<ApiResponse<User>> => {
	const response = await axiosClient.put<ApiResponse<User>>(`/auth/users/${userId}`, user);
	return response.data;
}
export const myProfile = async (): Promise<ApiResponse<User>> => {
	const response = await axiosClient.get<ApiResponse<User>>(`/auth/me`);
	return response.data;
}
export const logout = async (token : string): Promise<ApiResponse<void>> => {
	const form = {
		"token": token
	}
	const response = await axiosClient.post<ApiResponse<void>>(`/auth/logout`,form);
	sessionStorage.clear();
	return response.data;
}
export const getNotificationById = async (): Promise<ApiResponse<Notification[]>> => {
	const response = await axiosClient.get<ApiResponse<Notification[]>>(`/notifications`);
	return response.data;
}
export const sendMail = async (id : string): Promise<ApiResponse<boolean>> => {
	const response =  await axiosClient.post<ApiResponse<boolean>>(`/news/notificationNews/${id}`);
	return response.data;
}
export const markAsRead = async (notificationId: string): Promise<ApiResponse<boolean>> => {
	const response = await axiosClient.put<ApiResponse<boolean>>(`/notifications/${notificationId}/read`);
	return response.data;
}
export const markAllRead = async (): Promise<ApiResponse<boolean>> => {
	const response = await axiosClient.put<ApiResponse<boolean>>(`/notifications/read`);
	return response.data;
}