// src/lib/constants.ts
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.example.com';

export const ROUTES = {
  HOME: '/',
  NEWS: '/news',
  NEWS_DETAIL: '/news/:slug',
} as const;

export const NEWS_CATEGORIES = {
  HIGHLIGHT_NEWS: 'highlight-news',
  CASE_STUDIES: 'case-studies',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 50,
} as const;
