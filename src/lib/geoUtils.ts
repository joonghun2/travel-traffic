/**
 * Geolocation and travel time calculation utilities for Seoul spots.
 */

// Earth radius in kilometers
const EARTH_RADIUS_KM = 6371;

/**
 * Calculates the Haversine distance between two coordinates in kilometers.
 */
export function calculateDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_KM * c;

  // Round to 1 decimal place (e.g. 1.8 km)
  return Math.round(distance * 10) / 10;
}

/**
 * Estimates walking travel time in minutes.
 * Factors in Seoul urban detour coefficient (1.3) and average walking speed (4.5 km/h).
 */
export function estimateWalkMinutes(distanceKm: number): number {
  if (distanceKm <= 0) return 0;
  // Real walking path is roughly 1.3x straight-line distance
  const walkingDistance = distanceKm * 1.3;
  // Speed: 4.5 km/h -> 75 meters/min
  const minutes = Math.round((walkingDistance / 4.5) * 60);
  return Math.max(1, minutes);
}

/**
 * Estimates public transit / driving travel time in minutes.
 * 5 min transfer/waiting overhead + ~20 km/h average speed in Seoul traffic.
 */
export function estimateTransitMinutes(distanceKm: number): number {
  if (distanceKm <= 0) return 0;
  if (distanceKm < 0.8) {
    // Under 800m, walking is usually faster or equal
    return estimateWalkMinutes(distanceKm);
  }
  const transitTime = 5 + Math.round((distanceKm / 20) * 60);
  return transitTime;
}

/**
 * Returns formatted distance string (e.g., "650m" or "2.4km").
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }
  return `${distanceKm.toFixed(1)}km`;
}

/**
 * Generates direct navigation URL for Kakao Map (Web / App).
 */
export function getKakaoNavUrl(
  spotName: string,
  lat: number,
  lng: number,
  originLat?: number,
  originLng?: number
): string {
  const encName = encodeURIComponent(spotName);
  if (originLat && originLng) {
    return `https://map.kakao.com/link/to/${encName},${lat},${lng}`;
  }
  return `https://map.kakao.com/link/to/${encName},${lat},${lng}`;
}

/**
 * Generates direct navigation URL for Naver Map (Mobile / Web).
 */
export function getNaverNavUrl(spotName: string, lat: number, lng: number): string {
  const encName = encodeURIComponent(spotName);
  return `https://m.map.naver.com/route.nhn?menu=route&ename=${encName}&ex=${lng}&ey=${lat}`;
}

/**
 * Generates direct navigation URL for Google Maps (Directions / Search).
 */
export function getGoogleNavUrl(
  spotName: string,
  lat: number,
  lng: number,
  originLat?: number,
  originLng?: number
): string {
  if (originLat && originLng) {
    return `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${lat},${lng}&travelmode=transit`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

