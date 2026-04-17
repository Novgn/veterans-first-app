/**
 * Builds a platform-appropriate maps deep link for turn-by-turn navigation
 * (Story 3.5). Pure utility — no side effects, no DB.
 *
 * Preference order:
 *   iOS → Apple Maps (`maps://?daddr=...`)
 *   Android/web/other → Google Maps deep link + https fallback
 *
 * If coordinates are available, they are used for the destination; otherwise
 * the raw address is passed and the provider resolves it. The `https` URL is
 * always returned as a fallback so callers can try the native link first and
 * fall back if it fails to open.
 */

import { Platform } from 'react-native';

export interface NavigationTarget {
  address: string;
  lat?: number | null;
  lng?: number | null;
}

export interface NavigationUrls {
  /** Platform-preferred native deep link (maps://, comgooglemaps://) */
  primary: string;
  /** Always-openable https fallback */
  fallback: string;
}

/**
 * Produce a maps URL for the given destination.
 *
 * When both lat/lng are present, they take precedence over address because
 * they uniquely identify the pin (robust to partial/typed addresses).
 */
export function buildNavigationUrl(target: NavigationTarget): NavigationUrls {
  const hasCoords = typeof target.lat === 'number' && typeof target.lng === 'number';
  const destination = hasCoords ? `${target.lat},${target.lng}` : target.address.trim();
  const encoded = encodeURIComponent(destination);

  const fallback = `https://www.google.com/maps/dir/?api=1&destination=${encoded}`;

  const primary =
    Platform.OS === 'ios'
      ? `maps://?daddr=${encoded}`
      : `comgooglemaps://?daddr=${encoded}&directionsmode=driving`;

  return { primary, fallback };
}
