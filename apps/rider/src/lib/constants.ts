/**
 * Application constants from environment variables.
 *
 * IMPORTANT: All EXPO_PUBLIC_* variables must be set in your .env file for production.
 * Fallback values are for development only and should never reach production.
 */

// Support Phone
const FALLBACK_PHONE = '1-800-555-0199';
export const SUPPORT_PHONE = process.env.EXPO_PUBLIC_SUPPORT_PHONE || FALLBACK_PHONE;

// Google Places API Key (required for address search)
export const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || '';

// Warn in development if using fallback values
if (__DEV__) {
  if (SUPPORT_PHONE === FALLBACK_PHONE) {
    console.warn(
      '⚠️ SUPPORT_PHONE is using fallback number. Set EXPO_PUBLIC_SUPPORT_PHONE in .env for production.'
    );
  }

  if (!GOOGLE_PLACES_API_KEY) {
    console.warn(
      '⚠️ GOOGLE_PLACES_API_KEY is not set. Set EXPO_PUBLIC_GOOGLE_PLACES_API_KEY in .env for address search to work.'
    );
  }
}
