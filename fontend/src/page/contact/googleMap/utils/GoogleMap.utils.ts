// utils/GoogleMap.utils.ts
import { Coordinates, MapLanguage, MapType } from '../types/GoogleMap.types';

export const generateMapUrl = (
  coordinates: Coordinates,
  height: string | number,
  language: MapLanguage,
  label: string,
  mapType: MapType,
  zoom: number
): string => {
  const params = new URLSearchParams({
    width: '100%',
    height: height.toString(),
    hl: language,
    q: `${coordinates.lat},${coordinates.lng}+(${label})`,
    t: mapType,
    z: zoom.toString(),
    ie: 'UTF8',
    iwloc: 'B',
    output: 'embed'
  });
  
  return `https://maps.google.com/maps?${params.toString()}`;
};

export const getContainerStyles = (
  width: string | number,
  height: string | number,
  borderRadius: string,
  customStyle: React.CSSProperties = {}
): React.CSSProperties => ({
  width,
  height,
  borderRadius,
  overflow: 'hidden',
  position: 'relative',
  backgroundColor: '#f5f5f5',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  ...customStyle
});

export const getIframeStyles = (loading: boolean): React.CSSProperties => ({
  border: 0,
  width: '100%',
  height: '100%',
  display: loading ? 'none' : 'block'
});

export const handleMapLoad = (label: string) => {
  console.log(`Map loaded successfully: ${label}`);
};

export const handleMapError = (label: string) => {
  console.error(`Failed to load Google Maps: ${label}`);
};