/**
 * usePreferredDriver Hook Tests
 *
 * Tests for fetching and updating user's default preferred driver.
 * Story 2.7: Implement Preferred Driver Selection
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor, act } from '@testing-library/react-native';
import React from 'react';

import { preferredDriverKeys, usePreferredDriver } from '../usePreferredDriver';

// Mock Supabase
const mockFrom = jest.fn();
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockMaybeSingle = jest.fn();
const mockSingle = jest.fn();
const mockUpsert = jest.fn();

jest.mock('@/lib/supabase', () => ({
  useSupabase: () => ({
    from: mockFrom,
  }),
}));

// Setup mock chain
beforeEach(() => {
  jest.clearAllMocks();

  mockFrom.mockImplementation((table: string) => {
    if (table === 'rider_preferences') {
      return {
        select: mockSelect,
        upsert: mockUpsert,
      };
    }
    if (table === 'users') {
      return {
        select: mockSelect,
      };
    }
    return { select: mockSelect };
  });

  mockSelect.mockReturnValue({
    eq: mockEq,
  });

  mockEq.mockReturnValue({
    maybeSingle: mockMaybeSingle,
    single: mockSingle,
  });
});

// Wrapper component for QueryClientProvider
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

describe('usePreferredDriver', () => {
  describe('query key factory', () => {
    it('creates correct query keys', () => {
      expect(preferredDriverKeys.all).toEqual(['preferredDriver']);
      expect(preferredDriverKeys.detail('user-123')).toEqual(['preferredDriver', 'user-123']);
    });
  });

  describe('query behavior', () => {
    it('returns undefined preferredDriver when userId is undefined (query disabled)', async () => {
      // When userId is undefined, enabled: !!userId evaluates to false
      // so the query doesn't run and preferredDriver remains undefined
      const { result } = renderHook(() => usePreferredDriver(undefined), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Query is disabled, so preferredDriver is undefined (queryFn never runs)
      expect(result.current.preferredDriver).toBeUndefined();
    });

    it('returns null when no preferences exist', async () => {
      mockMaybeSingle.mockResolvedValue({
        data: null,
        error: null,
      });

      const { result } = renderHook(() => usePreferredDriver('user-123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.preferredDriver).toEqual({
        preferredDriverId: null,
        driver: null,
      });
    });

    it('returns null when no preferred driver set', async () => {
      mockMaybeSingle.mockResolvedValue({
        data: { default_preferred_driver_id: null },
        error: null,
      });

      const { result } = renderHook(() => usePreferredDriver('user-123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.preferredDriver).toEqual({
        preferredDriverId: null,
        driver: null,
      });
    });

    it('returns driver data when preferred driver is set', async () => {
      // First call: get preferences
      mockMaybeSingle.mockResolvedValueOnce({
        data: { default_preferred_driver_id: 'driver-123' },
        error: null,
      });

      // Second call: get driver details
      mockSingle.mockResolvedValueOnce({
        data: {
          id: 'driver-123',
          first_name: 'Dave',
          profile_photo_url: 'https://example.com/photo.jpg',
          driver_profile: [
            {
              vehicle_make: 'Toyota',
              vehicle_model: 'Camry',
              vehicle_color: 'Silver',
            },
          ],
        },
        error: null,
      });

      const { result } = renderHook(() => usePreferredDriver('user-123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.preferredDriver).toEqual({
        preferredDriverId: 'driver-123',
        driver: {
          id: 'driver-123',
          firstName: 'Dave',
          profilePhotoUrl: 'https://example.com/photo.jpg',
          vehicleMake: 'Toyota',
          vehicleModel: 'Camry',
          vehicleColor: 'Silver',
        },
      });
    });

    it('handles missing driver profile gracefully', async () => {
      mockMaybeSingle.mockResolvedValueOnce({
        data: { default_preferred_driver_id: 'driver-123' },
        error: null,
      });

      mockSingle.mockResolvedValueOnce({
        data: {
          id: 'driver-123',
          first_name: 'Dave',
          profile_photo_url: null,
          driver_profile: [], // Empty profile
        },
        error: null,
      });

      const { result } = renderHook(() => usePreferredDriver('user-123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.preferredDriver).toEqual({
        preferredDriverId: 'driver-123',
        driver: null,
      });
    });

    it('handles driver fetch error', async () => {
      mockMaybeSingle.mockResolvedValueOnce({
        data: { default_preferred_driver_id: 'driver-123' },
        error: null,
      });

      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { message: 'Driver not found' },
      });

      const { result } = renderHook(() => usePreferredDriver('user-123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should return driverId but null driver when driver fetch fails
      expect(result.current.preferredDriver).toEqual({
        preferredDriverId: 'driver-123',
        driver: null,
      });
    });

    it('handles preferences fetch error', async () => {
      mockMaybeSingle.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const { result } = renderHook(() => usePreferredDriver('user-123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      expect(result.current.error?.message).toContain('Database error');
    });
  });

  describe('mutation behavior', () => {
    it('provides updatePreferredDriver mutation', async () => {
      mockMaybeSingle.mockResolvedValue({ data: null, error: null });

      const { result } = renderHook(() => usePreferredDriver('user-123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.updatePreferredDriver).toBeDefined();
      expect(typeof result.current.updatePreferredDriver.mutate).toBe('function');
      expect(typeof result.current.updatePreferredDriver.mutateAsync).toBe('function');
    });

    it('provides clearPreferredDriver convenience function', async () => {
      mockMaybeSingle.mockResolvedValue({ data: null, error: null });

      const { result } = renderHook(() => usePreferredDriver('user-123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.clearPreferredDriver).toBeDefined();
      expect(typeof result.current.clearPreferredDriver.mutateAsync).toBe('function');
    });

    it('updates preferred driver successfully', async () => {
      mockMaybeSingle.mockResolvedValue({ data: null, error: null });
      mockUpsert.mockResolvedValue({ error: null });

      const { result } = renderHook(() => usePreferredDriver('user-123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updatePreferredDriver.mutateAsync('driver-456');
      });

      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-123',
          default_preferred_driver_id: 'driver-456',
        }),
        { onConflict: 'user_id' }
      );
    });

    it('clears preferred driver by setting null', async () => {
      mockMaybeSingle.mockResolvedValue({ data: null, error: null });
      mockUpsert.mockResolvedValue({ error: null });

      const { result } = renderHook(() => usePreferredDriver('user-123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.clearPreferredDriver.mutateAsync();
      });

      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-123',
          default_preferred_driver_id: null,
        }),
        { onConflict: 'user_id' }
      );
    });

    it('throws error when userId not provided for mutation', async () => {
      const { result } = renderHook(() => usePreferredDriver(undefined), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(result.current.updatePreferredDriver.mutateAsync('driver-123')).rejects.toThrow(
        'User ID required'
      );
    });

    it('handles mutation error', async () => {
      mockMaybeSingle.mockResolvedValue({ data: null, error: null });
      mockUpsert.mockResolvedValue({
        error: { message: 'Update failed' },
      });

      const { result } = renderHook(() => usePreferredDriver('user-123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(result.current.updatePreferredDriver.mutateAsync('driver-456')).rejects.toThrow(
        'Update failed'
      );
    });
  });
});
