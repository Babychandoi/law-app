// types/GoogleMap.types.ts

export interface Coordinates {
    lat: number;
    lng: number;
  }
  
  export type MapLanguage = 'en' | 'vi' | 'fr' | 'de' | 'ja' | 'ko';
  export type MapType = 'roadmap' | 'satellite' | 'hybrid' | 'terrain';
  
  export interface GoogleMapProps {
    /** Map dimensions */
    width?: string | number;
    height?: string | number;
    
    /** Location settings */
    coordinates?: Coordinates;
    zoom?: number;
    label?: string;
    
    /** Display options */
    language?: MapLanguage;
    mapType?: MapType;
    
    /** Styling */
    className?: string;
    style?: React.CSSProperties;
    borderRadius?: string;
    
    /** Accessibility */
    ariaLabel?: string;
    
    /** Loading state */
    loading?: boolean;
    loadingText?: string;
  }
  
  export interface LoadingSpinnerProps {
    loadingText: string;
  }