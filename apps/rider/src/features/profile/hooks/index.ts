export {
  useDestinations,
  useCreateDestination,
  useUpdateDestination,
  useDeleteDestination,
  destinationKeys,
  type SavedDestination,
  type NewSavedDestination,
  type UpdateSavedDestination,
} from './useDestinations';

// Story 2.12: Profile Management hooks
export { useProfile, profileKeys, type RiderProfile } from './useProfile';
export { useUpdateProfile, type UpdateProfileInput } from './useUpdateProfile';

// Story 2.13: Accessibility Preferences hooks
export {
  useAccessibilityPreferences,
  accessibilityKeys,
  type MobilityAidType,
  type AccessibilityPreferences,
} from './useAccessibilityPreferences';
export { useUpdateAccessibilityPreferences } from './useUpdateAccessibilityPreferences';

// Story 2.14: Comfort Preferences hooks
export {
  useComfortPreferences,
  comfortKeys,
  type TemperaturePreference,
  type ConversationPreference,
  type MusicPreference,
  type ComfortPreferences,
} from './useComfortPreferences';
export { useUpdateComfortPreferences } from './useUpdateComfortPreferences';
