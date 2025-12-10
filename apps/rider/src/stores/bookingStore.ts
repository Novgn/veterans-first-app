import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * Destination interface for booking flow.
 * Compatible with SavedDestination from database.
 */
export interface Destination {
  id: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;
  isDefaultPickup?: boolean;
  isDefaultDropoff?: boolean;
}

/**
 * SavedDestination interface from database for quick reference.
 * Used by loadSavedDestinations action.
 */
export interface SavedDestinationRef {
  id: string;
  label: string;
  address: string;
  lat: number;
  lng: number;
  place_id: string | null;
  is_default_pickup: boolean;
  is_default_dropoff: boolean;
}

interface BookingState {
  // Booking flow state
  currentStep: number;
  pickupDestination: Destination | null;
  dropoffDestination: Destination | null;
  selectedDate: string | null;
  selectedTime: string | null;
  notes: string;

  // Saved destinations cache for booking wizard
  savedDestinations: Destination[];

  // Actions
  setCurrentStep: (step: number) => void;
  setPickupDestination: (destination: Destination | null) => void;
  setDropoffDestination: (destination: Destination | null) => void;
  setSelectedDate: (date: string | null) => void;
  setSelectedTime: (time: string | null) => void;
  setNotes: (notes: string) => void;
  loadSavedDestinations: (destinations: SavedDestinationRef[]) => void;
  resetBooking: () => void;
}

const initialState = {
  currentStep: 1,
  pickupDestination: null,
  dropoffDestination: null,
  selectedDate: null,
  selectedTime: null,
  notes: '',
  savedDestinations: [],
};

/**
 * Converts SavedDestinationRef from database to Destination for booking.
 */
function convertToDestination(saved: SavedDestinationRef): Destination {
  return {
    id: saved.id,
    name: saved.label,
    address: saved.address,
    latitude: saved.lat,
    longitude: saved.lng,
    placeId: saved.place_id ?? undefined,
    isDefaultPickup: saved.is_default_pickup,
    isDefaultDropoff: saved.is_default_dropoff,
  };
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      ...initialState,
      setCurrentStep: (step) => set({ currentStep: step }),
      setPickupDestination: (destination) => set({ pickupDestination: destination }),
      setDropoffDestination: (destination) => set({ dropoffDestination: destination }),
      setSelectedDate: (date) => set({ selectedDate: date }),
      setSelectedTime: (time) => set({ selectedTime: time }),
      setNotes: (notes) => set({ notes }),
      loadSavedDestinations: (destinations) =>
        set({
          savedDestinations: destinations.map(convertToDestination),
        }),
      resetBooking: () =>
        set({
          currentStep: 1,
          pickupDestination: null,
          dropoffDestination: null,
          selectedDate: null,
          selectedTime: null,
          notes: '',
          // Note: savedDestinations is NOT reset to preserve cache
        }),
    }),
    {
      name: 'veterans-1st-booking-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
