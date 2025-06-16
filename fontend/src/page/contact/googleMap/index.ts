// index.ts
export { default as GoogleMap } from './components/GoogleMap';
export { default as LoadingSpinner } from './components/LoadingSpinner';
export { useGoogleMap } from './hooks/useGoogleMap';
export { FAMOUS_LOCATIONS, DEFAULT_PROPS } from './constants/GoogleMap.constants';
export type { 
  GoogleMapProps, 
  Coordinates, 
  MapLanguage, 
  MapType,
  LoadingSpinnerProps 
} from './types/GoogleMap.types';
export { 
  generateMapUrl, 
  getContainerStyles, 
  getIframeStyles 
} from './utils/GoogleMap.utils';