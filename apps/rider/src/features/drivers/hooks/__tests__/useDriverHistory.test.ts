/**
 * useDriverHistory Hook Tests
 *
 * Tests for fetching and aggregating driver history data.
 * Story 2.7: Implement Preferred Driver Selection
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';

import { driverHistoryKeys, useDriverHistory } from '../useDriverHistory';

// Mock Supabase
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockNot = jest.fn();
const mockOrder = jest.fn();

jest.mock('../../../../lib/supabase', () => ({
  useSupabase: () => ({
    from: jest.fn(() => ({
      select: mockSelect,
    })),
  }),
}));

// Setup mock chain
beforeEach(() => {
  jest.clearAllMocks();

  mockSelect.mockReturnValue({
    eq: mockEq,
  });

  mockEq.mockReturnValue({
    eq: mockEq,
    not: mockNot,
  });

  mockNot.mockReturnValue({
    order: mockOrder,
  });
});

// Wrapper component for QueryClientProvider
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

describe('useDriverHistory', () => {
  describe('query key factory', () => {
    it('creates correct query keys', () => {
      expect(driverHistoryKeys.all).toEqual(['driverHistory']);
      expect(driverHistoryKeys.list('rider-123')).toEqual(['driverHistory', 'rider-123']);
    });
  });

  describe('hook behavior', () => {
    it('returns undefined data when riderId is undefined (query disabled)', async () => {
      // When riderId is undefined, enabled: !!riderId evaluates to false
      // so the query doesn't run and data remains undefined
      const { result } = renderHook(() => useDriverHistory(undefined), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Query is disabled, so data is undefined (queryFn never runs)
      expect(result.current.data).toBeUndefined();
    });

    it('returns undefined data when riderId is empty string (query disabled)', async () => {
      // When riderId is empty string, enabled: !!riderId evaluates to false
      // so the query doesn't run and data remains undefined
      const { result } = renderHook(() => useDriverHistory(''), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Query is disabled, so data is undefined (queryFn never runs)
      expect(result.current.data).toBeUndefined();
    });

    it('fetches driver history for valid riderId', async () => {
      const mockRideData = [
        {
          driver_id: 'driver-1',
          scheduled_pickup_time: '2024-01-10T10:00:00Z',
          driver: {
            id: 'driver-1',
            first_name: 'Dave',
            profile_photo_url: null,
          },
          driver_profile: [
            {
              vehicle_make: 'Toyota',
              vehicle_model: 'Camry',
              vehicle_color: 'Silver',
            },
          ],
        },
        {
          driver_id: 'driver-1',
          scheduled_pickup_time: '2024-01-08T10:00:00Z',
          driver: {
            id: 'driver-1',
            first_name: 'Dave',
            profile_photo_url: null,
          },
          driver_profile: [
            {
              vehicle_make: 'Toyota',
              vehicle_model: 'Camry',
              vehicle_color: 'Silver',
            },
          ],
        },
      ];

      mockOrder.mockResolvedValue({ data: mockRideData, error: null });

      const { result } = renderHook(() => useDriverHistory('rider-123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data?.[0]).toEqual({
        driver: {
          id: 'driver-1',
          firstName: 'Dave',
          profilePhotoUrl: null,
          vehicleMake: 'Toyota',
          vehicleModel: 'Camry',
          vehicleColor: 'Silver',
        },
        rideCount: 2,
        lastRideDate: '2024-01-10T10:00:00Z',
      });
    });

    it('sorts drivers by ride count descending', async () => {
      const mockRideData = [
        {
          driver_id: 'driver-1',
          scheduled_pickup_time: '2024-01-10T10:00:00Z',
          driver: { id: 'driver-1', first_name: 'Dave', profile_photo_url: null },
          driver_profile: [
            { vehicle_make: 'Toyota', vehicle_model: 'Camry', vehicle_color: 'Silver' },
          ],
        },
        {
          driver_id: 'driver-2',
          scheduled_pickup_time: '2024-01-09T10:00:00Z',
          driver: { id: 'driver-2', first_name: 'Mike', profile_photo_url: null },
          driver_profile: [
            { vehicle_make: 'Honda', vehicle_model: 'Accord', vehicle_color: 'Blue' },
          ],
        },
        {
          driver_id: 'driver-2',
          scheduled_pickup_time: '2024-01-08T10:00:00Z',
          driver: { id: 'driver-2', first_name: 'Mike', profile_photo_url: null },
          driver_profile: [
            { vehicle_make: 'Honda', vehicle_model: 'Accord', vehicle_color: 'Blue' },
          ],
        },
        {
          driver_id: 'driver-2',
          scheduled_pickup_time: '2024-01-07T10:00:00Z',
          driver: { id: 'driver-2', first_name: 'Mike', profile_photo_url: null },
          driver_profile: [
            { vehicle_make: 'Honda', vehicle_model: 'Accord', vehicle_color: 'Blue' },
          ],
        },
      ];

      mockOrder.mockResolvedValue({ data: mockRideData, error: null });

      const { result } = renderHook(() => useDriverHistory('rider-123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toHaveLength(2);
      expect(result.current.data?.[0]?.driver.firstName).toBe('Mike');
      expect(result.current.data?.[0]?.rideCount).toBe(3);
      expect(result.current.data?.[1]?.driver.firstName).toBe('Dave');
      expect(result.current.data?.[1]?.rideCount).toBe(1);
    });

    it('handles Supabase error', async () => {
      mockOrder.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const { result } = renderHook(() => useDriverHistory('rider-123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error?.message).toContain('Database error');
    });

    it('skips rides with missing driver data', async () => {
      const mockRideData = [
        {
          driver_id: 'driver-1',
          scheduled_pickup_time: '2024-01-10T10:00:00Z',
          driver: { id: 'driver-1', first_name: 'Dave', profile_photo_url: null },
          driver_profile: [
            { vehicle_make: 'Toyota', vehicle_model: 'Camry', vehicle_color: 'Silver' },
          ],
        },
        {
          driver_id: 'driver-2',
          scheduled_pickup_time: '2024-01-09T10:00:00Z',
          driver: null, // Missing driver data
          driver_profile: [
            { vehicle_make: 'Honda', vehicle_model: 'Accord', vehicle_color: 'Blue' },
          ],
        },
        {
          driver_id: 'driver-3',
          scheduled_pickup_time: '2024-01-08T10:00:00Z',
          driver: { id: 'driver-3', first_name: 'Bob', profile_photo_url: null },
          driver_profile: [], // Empty driver profile
        },
      ];

      mockOrder.mockResolvedValue({ data: mockRideData, error: null });

      const { result } = renderHook(() => useDriverHistory('rider-123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Only driver-1 should be included (driver-2 has null driver, driver-3 has empty profile)
      expect(result.current.data).toHaveLength(1);
      expect(result.current.data?.[0]?.driver.firstName).toBe('Dave');
    });
  });
});
