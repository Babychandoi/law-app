import { ReactNode } from 'react';

export interface Section {
  id: string;
  title: string;
  content: string;
  icon: ReactNode;
}
export interface ApiResponse<T> {
  code : number;
  message : string;
  data : T;
}