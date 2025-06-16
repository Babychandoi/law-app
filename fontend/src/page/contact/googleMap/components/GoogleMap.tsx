// components/GoogleMap.tsx
import React, { useMemo } from 'react';
import { GoogleMapProps } from '../types/GoogleMap.types';
import { DEFAULT_PROPS } from '../constants/GoogleMap.constants';
import { 
  generateMapUrl, 
  getContainerStyles, 
  getIframeStyles,
  handleMapLoad,
  handleMapError 
} from '../utils/GoogleMap.utils';
import LoadingSpinner from './LoadingSpinner';

const GoogleMap: React.FC<GoogleMapProps> = (props) => {
  // Merge props with defaults
  const config = { ...DEFAULT_PROPS, ...props };
  const {
    width,
    height,
    coordinates,
    zoom,
    language,
    mapType,
    label,
    className = '',
    style = {},
    borderRadius,
    ariaLabel,
    loading,
    loadingText
  } = config;

  // Generate map URL with memoization for performance
  const mapUrl = useMemo(() => 
    generateMapUrl(coordinates, height, language, label, mapType, zoom),
    [coordinates, height, language, label, mapType, zoom]
  );

  // Compute styles
  const containerStyles = getContainerStyles(width, height, borderRadius, style);
  const iframeStyles = getIframeStyles(loading);

  return (
    <div 
      className={`google-map-container ${className}`}
      style={containerStyles}
      role="img"
      aria-label={ariaLabel || `Bản đồ hiển thị ${label}`}
    >
      {loading && <LoadingSpinner loadingText={loadingText} />}
      
      <iframe
        src={mapUrl}
        style={iframeStyles}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={`Bản đồ Google Maps - ${label}`}
        onLoad={() => handleMapLoad(label)}
        onError={() => handleMapError(label)}
      />
    </div>
  );
};

export default GoogleMap;