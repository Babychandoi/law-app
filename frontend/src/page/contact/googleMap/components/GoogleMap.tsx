// components/GoogleMap.tsx
import React, { useEffect, useMemo } from 'react';
import { GoogleMapProps } from '../types/GoogleMap.types';
import { DEFAULT_PROPS } from '../constants/GoogleMap.constants';
import { generateMapUrl, getContainerStyles, getIframeStyles } from '../utils/GoogleMap.utils';
import LoadingSpinner from './LoadingSpinner';

function ensureResourceHint(rel: 'dns-prefetch' | 'preconnect', href: string) {
  if (typeof document === 'undefined') return;
  if (document.querySelector(`link[rel="${rel}"][href="${href}"]`)) return;

  const link = document.createElement('link');
  link.rel = rel;
  link.href = href;
  if (rel === 'preconnect') {
    link.crossOrigin = '';
  }
  document.head.appendChild(link);
}

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
    loadingText,
  } = config;

  // Generate map URL with memoization for performance
  const mapUrl = useMemo(
    () => generateMapUrl(coordinates, height, language, label, mapType, zoom),
    [coordinates, height, language, label, mapType, zoom]
  );

  // Compute styles
  const containerStyles = getContainerStyles(width, height, borderRadius, style);
  const iframeStyles = getIframeStyles(loading);

  useEffect(() => {
    ensureResourceHint('dns-prefetch', 'https://maps.google.com');
    ensureResourceHint('preconnect', 'https://maps.google.com');
  }, []);

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
      />
    </div>
  );
};

export default GoogleMap;
