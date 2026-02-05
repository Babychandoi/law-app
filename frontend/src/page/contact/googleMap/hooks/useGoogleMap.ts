// hooks/useGoogleMap.ts
import { useState, useCallback, useMemo } from 'react';
import { Coordinates, MapLanguage, MapType } from '../types/GoogleMap.types';
import { generateMapUrl } from '../utils/GoogleMap.utils';

interface UseGoogleMapProps {
  initialCoordinates?: Coordinates;
  initialZoom?: number;
  initialLanguage?: MapLanguage;
  initialMapType?: MapType;
  initialLabel?: string;
}

export const useGoogleMap = ({
  initialCoordinates = { lat: 21.0036983, lng: 105.7919108 },
  initialZoom = 14,
  initialLanguage = 'en',
  initialMapType = 'roadmap',
  initialLabel = 'Location'
}: UseGoogleMapProps = {}) => {
  // State management
  const [coordinates, setCoordinates] = useState<Coordinates>(initialCoordinates);
  const [zoom, setZoom] = useState<number>(initialZoom);
  const [language, setLanguage] = useState<MapLanguage>(initialLanguage);
  const [mapType, setMapType] = useState<MapType>(initialMapType);
  const [label, setLabel] = useState<string>(initialLabel);
  const [loading, setLoading] = useState<boolean>(false);

  // Generate map URL
  const mapUrl = useMemo(() => 
    generateMapUrl(coordinates, 600, language, label, mapType, zoom),
    [coordinates, language, label, mapType, zoom]
  );

  // Action handlers
  const updateLocation = useCallback((newCoordinates: Coordinates, newLabel?: string) => {
    setCoordinates(newCoordinates);
    if (newLabel) setLabel(newLabel);
  }, []);

  const updateMapSettings = useCallback((settings: {
    zoom?: number;
    language?: MapLanguage;
    mapType?: MapType;
  }) => {
    if (settings.zoom !== undefined) setZoom(settings.zoom);
    if (settings.language !== undefined) setLanguage(settings.language);
    if (settings.mapType !== undefined) setMapType(settings.mapType);
  }, []);

  const resetToDefault = useCallback(() => {
    setCoordinates(initialCoordinates);
    setZoom(initialZoom);
    setLanguage(initialLanguage);
    setMapType(initialMapType);
    setLabel(initialLabel);
  }, [initialCoordinates, initialZoom, initialLanguage, initialMapType, initialLabel]);

  // Utility functions
  const zoomIn = useCallback(() => setZoom(prev => Math.min(prev + 1, 20)), []);
  const zoomOut = useCallback(() => setZoom(prev => Math.max(prev - 1, 1)), []);

  return {
    // State
    coordinates,
    zoom,
    language,
    mapType,
    label,
    loading,
    mapUrl,
    
    // Actions
    setCoordinates,
    setZoom,
    setLanguage,
    setMapType,
    setLabel,
    setLoading,
    updateLocation,
    updateMapSettings,
    resetToDefault,
    zoomIn,
    zoomOut
  };
};