// src/types/index.ts
export interface NewsItem {
    id: string;
    title: string;
    excerpt: string;
    date: string;
    imageUrl: string;
    imageAlt: string;
    slug: string;
    category: 'highlight-news' | 'case-studies';
    productId?: string;
  }
  
  export interface BreadcrumbItem {
    name: string;
    href: string;
  }
  
  export type NewsCategory = 'highlight-news' | 'case-studies';
  
  export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
  }
  
  export interface NewsResponse {
    items: NewsItem[];
    total: number;
    page: number;
    limit: number;
  }
  