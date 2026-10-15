/**
 * Utility functions for Maps and Turn-by-Turn GPS Navigation
 * Mirrors the mobile app's Google Maps integration with web enhancements.
 */

export function buildAddressQuery(...parts: (string | number | undefined | null)[]): string {
  return parts
    .filter(Boolean)
    .map(p => String(p).trim())
    .filter(p => p.length > 0)
    .join(', ');
}

/**
 * Returns Google Maps search URL (works on both mobile and web browsers)
 */
export function getGoogleMapsSearchUrl(query: string): string {
  const encoded = encodeURIComponent(query.trim());
  return `https://www.google.com/maps/search/?api=1&query=${encoded}`;
}

/**
 * Returns Google Maps turn-by-turn directions URL
 */
export function getGoogleMapsDirectionsUrl(destination: string, origin?: string): string {
  const destEncoded = encodeURIComponent(destination.trim());
  if (origin && origin.trim()) {
    const originEncoded = encodeURIComponent(origin.trim());
    return `https://www.google.com/maps/dir/?api=1&origin=${originEncoded}&destination=${destEncoded}`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${destEncoded}`;
}

/**
 * Returns an embeddable Google Maps iframe URL with zero API key requirement
 */
export function getGoogleMapsEmbedUrl(query: string): string {
  const encoded = encodeURIComponent(query.trim() || 'Ahmedabad, Gujarat');
  return `https://maps.google.com/maps?q=${encoded}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
}

/**
 * Opens Google Maps in a new tab/window for directions or search
 */
export function openGoogleMapsDirections(destination: string) {
  if (!destination) return;
  const url = getGoogleMapsDirectionsUrl(destination);
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Opens Google Maps search in a new tab
 */
export function openGoogleMapsSearch(query: string) {
  if (!query) return;
  const url = getGoogleMapsSearchUrl(query);
  window.open(url, '_blank', 'noopener,noreferrer');
}
