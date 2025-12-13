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
