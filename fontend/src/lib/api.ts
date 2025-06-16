// src/lib/api.ts
import { NewsItem, NewsResponse, ApiResponse, NewsCategory } from '../types';

// Mock data
const mockNewsData: NewsItem[] = [
  {
    id: '7003',
    title: 'Further Simplification of Document Requirements for Intellectual Property Rights Registration in Laos',
    excerpt: 'In a continued effort to streamline the intellectual property (IP) registration process, the Department of Intellectual Property (DIP) of Laos has recently introduced additional simplifications...',
    date: '05/03/2025',
    imageUrl: 'https://ageless.com.vn/wp-content/uploads/2022/06/trademark-Lao-4-e1655785246306-313x209.jpg',
    imageAlt: 'Further Simplification of Document Requirements for Intellectual Property Rights Registration in Laos',
    slug: 'further-simplification-of-document-requirements-for-intellectual-property-rights-registration-in-laos',
    category: 'highlight-news'
  },
  {
    id: '6952',
    title: 'Important Update: FILING PATENT IN MYANMAR NOW OFFICIALLY ACCEPTED',
    excerpt: 'Explore the latest updates on filing patents in Myanmar. Learn about the process, deadlines, and requirements for patent and utility model registrations...',
    date: '01/11/2024',
    imageUrl: 'https://ageless.com.vn/wp-content/uploads/2024/11/myanmar-5-e1730454221296-313x209.png',
    imageAlt: 'Important Update: FILING PATENT IN MYANMAR NOW OFFICIALLY ACCEPTED',
    slug: 'important-update-filing-patent-in-myanmar-now-officially-accepted',
    category: 'highlight-news'
  },
  {
    id: '6785',
    title: 'Case of Infringement of Industrial Property Rights in Vietnam: Details and Analysis',
    excerpt: 'Explore the recent case of industrial property rights infringement in Vietnam, involving counterfeit fashion goods. Understand the legal proceedings...',
    date: '07/08/2024',
    imageUrl: 'https://ageless.com.vn/wp-content/uploads/2024/07/hang-gia-e1722313743289-313x209.png',
    imageAlt: 'Case of Infringement of Industrial Property Rights in Vietnam',
    slug: 'case-of-infringement-of-industrial-property-rights-in-vietnam-details-and-analysis',
    category: 'case-studies'
  },
  {
    id: '6318',
    title: 'Dealing with trademark infringement in Vietnam in the digital environment',
    excerpt: 'Along the development of the internet, cases related to infringement of intellectual property (IP) rights such as trademarks, trade names, etc...',
    date: '09/12/2022',
    imageUrl: 'https://ageless.com.vn/wp-content/uploads/2022/12/sino-5-313x209.png',
    imageAlt: 'Dealing with trademark infringement in Vietnam',
    slug: 'dealing-with-trademark-infringement-in-vietnam',
    category: 'case-studies'
  }
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchNews = async (): Promise<ApiResponse<NewsResponse>> => {
  await delay(1000); // Simulate network delay
  
  return {
    data: {
      items: mockNewsData,
      total: mockNewsData.length,
      page: 1,
      limit: 20
    },
    success: true
  };
};

export const fetchNewsByCategory = async (category: NewsCategory): Promise<ApiResponse<NewsResponse>> => {
  await delay(800);
  
  const filteredItems = mockNewsData.filter(item => item.category === category);
  
  return {
    data: {
      items: filteredItems,
      total: filteredItems.length,
      page: 1,
      limit: 20
    },
    success: true
  };
};

export const fetchNewsById = async (id: string): Promise<ApiResponse<NewsItem | null>> => {
  await delay(500);
  
  const item = mockNewsData.find(news => news.id === id);
  
  return {
    data: item || null,
    success: !!item,
    message: item ? undefined : 'News item not found'
  };
};
