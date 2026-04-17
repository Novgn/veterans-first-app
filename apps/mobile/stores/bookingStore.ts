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

/**
 * Recurring ride frequency type
 */
export type RecurringFrequency = 'daily' | 'weekly' | 'custom' | null;

interface BookingState {
  // Booking flow state
  currentStep: number;
  pickupDestination: Destination | null;
  dropoffDestination: Destination | null;
  selectedDate: string | null;
  selectedTime: string | null;
  notes: string;

  // Recurring ride state
  isRecurring: boolean;
  recurringFrequency: RecurringFrequency;
  recurringDays: string[]; // e.g., ['mon', 'wed', 'fri']
  recurringEndDate: string | null; // null = ongoing

  // Preferred driver state (Story 2.7)
  preferredDriverId: string | null;
  preferredDriverName: string | null;

  // Saved destinations cache for booking wizard
  savedDestinations: Destination[];

  // Booking result state (Story 2.5)
  lastBookingId: string | null;
  lastBookingConfirmation: string | null;

  // Actions
  setCurrentStep: (step: number) => void;
  setPickupDestination: (destination: Destination | null) => void;
  setDropoffDestination: (destination: Destination | null) => void;
  setSelectedDate: (date: string | null) => void;
  setSelectedTime: (time: string | null) => void;
  setNotes: (notes: string) => void;
  loadSavedDestinations: (destinations: SavedDestinationRef[]) => void;
  resetBooking: () => void;

  // Recurring ride actions
  setIsRecurring: (isRecurring: boolean) => void;
  setRecurringFrequency: (frequency: RecurringFrequency) => void;
  setRecurringDays: (days: string[]) => void;
  setRecurringEndDate: (date: string | null) => void;

  // Preferred driver action (Story 2.7)
  setPreferredDriver: (driverId: string | null, driverName: string | null) => void;

  // Booking result action (Story 2.5)
  setLastBookingResult: (id: string, confirmation: string) => void;
}

const initialState = {
  currentStep: 1,
  pickupDestination: null,
  dropoffDestination: null,
  selectedDate: null,
  selectedTime: null,
  notes: '',
  savedDestinations: [],
  // Recurring ride state
  isRecurring: false,
  recurringFrequency: null as RecurringFrequency,
  recurringDays: [] as string[],
  recurringEndDate: null as string | null,
  // Preferred driver state (Story 2.7)
  preferredDriverId: null as string | null,
  preferredDriverName: null as string | null,
  // Booking result state (Story 2.5)
  lastBookingId: null as string | null,
  lastBookingConfirmation: null as string | null,
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
          // Reset recurring ride state
          isRecurring: false,
          recurringFrequency: null,
          recurringDays: [],
          recurringEndDate: null,
          // Reset preferred driver state (Story 2.7)
          preferredDriverId: null,
          preferredDriverName: null,
          // Reset booking result state (Story 2.5)
          lastBookingId: null,
          lastBookingConfirmation: null,
          // Note: savedDestinations is NOT reset to preserve cache
        }),
      // Recurring ride actions
      setIsRecurring: (isRecurring) => set({ isRecurring }),
      setRecurringFrequency: (frequency) => set({ recurringFrequency: frequency }),
      setRecurringDays: (days) => set({ recurringDays: days }),
      setRecurringEndDate: (date) => set({ recurringEndDate: date }),
      // Preferred driver action (Story 2.7)
      setPreferredDriver: (driverId, driverName) =>
        set({ preferredDriverId: driverId, preferredDriverName: driverName }),
      // Booking result action (Story 2.5)
      setLastBookingResult: (id, confirmation) =>
        set({
          lastBookingId: id,
          lastBookingConfirmation: confirmation,
        }),
    }),
    {
      name: 'veterans-1st-booking-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
