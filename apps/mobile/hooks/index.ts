// Consolidated hooks barrel. Re-exports every hook in this directory so
// callers can import `from '@/hooks'` rather than chasing per-file paths.
// For tree-shaking, callers can also import directly: `from '@/hooks/useX'`.

export { useAcceptRide, type AcceptRideInput } from './useAcceptRide';
export {
  accessibilityKeys,
  useAccessibilityPreferences,
  type AccessibilityPreferences,
  type MobilityAidType,
} from './useAccessibilityPreferences';
export { useBookRide, type BookingRequest, type BookingResponse } from './useBookRide';
export { useCancelRide, type CancelRideRequest, type CancelRideResponse } from './useCancelRide';
export {
  comfortKeys,
  useComfortPreferences,
  type ComfortPreferences,
  type ConversationPreference,
  type MusicPreference,
  type TemperaturePreference,
} from './useComfortPreferences';
export { useDeclineRide, type DeclineRideInput } from './useDeclineRide';
export {
  destinationKeys,
  useCreateDestination,
  useDeleteDestination,
  useDestinations,
  useUpdateDestination,
  type NewSavedDestination,
  type SavedDestination,
  type UpdateSavedDestination,
} from './useDestinations';
export { driverHistoryKeys, useDriverHistory, type DriverHistoryItem } from './useDriverHistory';
export {
  useDriverLocation,
  type DriverLocation,
  type UseDriverLocationResult,
} from './useDriverLocation';
export { tripKeys, useDriverTrips, type DriverTrip } from './useDriverTrips';
export { useModifyRide, type ModifyRideRequest, type ModifyRideResponse } from './useModifyRide';
export {
  preferredDriverKeys,
  usePreferredDriver,
  type PreferredDriverData,
} from './usePreferredDriver';
export { profileKeys, useProfile, type RiderProfile } from './useProfile';
export { useRide, type Ride, type RideDriverInfo, type RideWithDriverInfo } from './useRide';
export { offerKeys, useRideOffer, type RideOffer } from './useRideOffer';
export { ridesKeys, useRides } from './useRides';
export { riderHistoryKeys, useRiderHistory } from './useRiderHistory';
export { useTrip } from './useTrip';
export {
  useUndoCancellation,
  type UndoCancellationRequest,
  type UndoCancellationResponse,
} from './useUndoCancellation';
export { useUpdateAccessibilityPreferences } from './useUpdateAccessibilityPreferences';
export { useUpdateComfortPreferences } from './useUpdateComfortPreferences';
export { useUpdateProfile, type UpdateProfileInput } from './useUpdateProfile';
export {
  useTripStatus,
  STATUS_TO_EVENT,
  VALID_TRANSITIONS,
  isValidTransition,
  type RideStatus,
  type RideEventType,
  type TripStatusInput,
} from './useTripStatus';
export {
  useLocationCapture,
  type LocationResult,
  type UseLocationCaptureResult,
} from './useLocationCapture';
