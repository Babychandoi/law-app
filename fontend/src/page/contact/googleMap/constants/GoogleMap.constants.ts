// constants/GoogleMap.constants.ts
import { GoogleMapProps } from '../types/GoogleMap.types';

export const DEFAULT_PROPS: Required<Omit<GoogleMapProps, 'className' | 'style' | 'ariaLabel'>> = {
  width: '100%',
  height: 600,
  coordinates: { lat: 21.0036983, lng: 105.7919108 },
  zoom: 14,
  language: 'en',
  mapType: 'roadmap',
  label: 'Luật TAGA',
  borderRadius: '8px',
  loading: false,
  loadingText: 'Đang tải bản đồ...'
};

export const FAMOUS_LOCATIONS = {
  taga: { lat: 21.0036983, lng: 105.7919108, label: 'Luật TAGA' },
  hoanKiem: { lat: 21.0285, lng: 105.8542, label: 'Hồ Hoàn Kiếm' },
  onePillar: { lat: 21.0368, lng: 105.8344, label: 'Chùa Một Cột' },
  literature: { lat: 21.0227, lng: 105.8356, label: 'Văn Miếu' },
  hoChiMinhMausoleum: { lat: 21.0368, lng: 105.8345, label: 'Lăng Chủ Tịch Hồ Chí Minh' },
  templeOfLiterature: { lat: 21.0227, lng: 105.8356, label: 'Văn Miếu Quốc Tử Giám' }
} as const;