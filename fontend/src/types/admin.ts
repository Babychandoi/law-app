export interface Login {
    username: string;
    password: string;
}
export interface ApiResponse <T> {
    code: number;
    message: string;
    data: T;
}
export interface LoginResponse {
    token : string;
    refreshToken : string;
}
export interface IntrospectResponse {
    valid : boolean;
}
export interface Customer {
    id: string;
    name: string;
    serviceId: string;
    serviceName: string;
    status: 'NEW' | 'RECEIVED' | 'PROCESSING' | 'COMPLETED' | 'CANCELED';
    createdAt: string;
    email: string;
    phone: string;
  }
  
export interface CustomerDetail extends Customer {
    description: string;
    updatedAt: string;
    completedAt?: string;
    cancelledAt?: string;
  }
export interface Service {
    id : string;
    title: string;
}
export interface User {
    id: string;
    username: string;
    password: string;
    email: string;
    phoneNumber: string;
    fullName: string;
    position : string;
    role: 'ADMIN' | 'USER';
    active: 'ACTIVE' | 'INACTIVE';
    createdAt: Date;
}
export interface UserCreate {
    username: string;
    password?: string;
    email: string;
    phoneNumber: string;
    fullName: string;
    role?: 'ADMIN' | 'USER';
    position : string;
}