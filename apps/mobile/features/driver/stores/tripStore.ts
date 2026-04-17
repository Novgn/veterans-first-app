/**
 * Zustand store for managing driver trip state.
 *
 * This store will be expanded in future stories to handle:
 * - Current trip details
 * - Trip queue
 * - Status management with persistence
 */

import { create } from 'zustand';

import type { DriverStatus } from '../trips/components/StatusToggle';

interface TripState {
  status: DriverStatus;
  setStatus: (status: DriverStatus) => void;
}

export const useTripStore = create<TripState>((set) => ({
  status: 'offline',
  setStatus: (status) => set({ status }),
}));

// Re-export DriverStatus for convenience
export type { DriverStatus };
