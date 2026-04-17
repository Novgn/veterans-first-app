/**
 * Tests for useDeclineRide hook
 * Tests declining ride offers with optional reasons
 */

import { renderHook, waitFor } from '@testing-library/react-native';

import { createTestWrapper, createQueryClient } from '@/test-utils/queryWrapper';
import { useDeclineRide } from '../useDeclineRide';
import { offerKeys } from '../useRideOffer';

// Mock Supabase client
const mockFrom = jest.fn();

jest.mock('@/lib/supabase', () => ({
  useSupabase: () => ({
    from: mockFrom,
  }),
}));

// Mock Clerk
const mockUserId = 'test-clerk-id';
jest.mock('@clerk/clerk-expo', () => ({
  useAuth: () => ({
    userId: mockUserId,
    isSignedIn: true,
  }),
}));

describe('useDeclineRide', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('mutation behavior', () => {
    it('updates offer and ride status on decline without reason', async () => {
      const mockOfferUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      });

      const mockRideUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      });

      mockFrom.mockImplementation((table: string) => {
        if (table === 'ride_offers') {
          return { update: mockOfferUpdate };
        }
        if (table === 'rides') {
          return { update: mockRideUpdate };
        }
        return { update: jest.fn() };
      });

      const { result } = renderHook(() => useDeclineRide(), {
        wrapper: createTestWrapper(),
      });

      await result.current.mutateAsync({
        offerId: 'offer-1',
        rideId: 'ride-1',
      });

      expect(mockOfferUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'declined',
          decline_reason: null,
        })
      );

      expect(mockRideUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'confirmed',
          driver_id: null,
        })
      );
    });

    it('includes decline reason when provided', async () => {
      const mockOfferUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      });

      const mockRideUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      });

      mockFrom.mockImplementation((table: string) => {
        if (table === 'ride_offers') {
          return { update: mockOfferUpdate };
        }
        if (table === 'rides') {
          return { update: mockRideUpdate };
        }
        return { update: jest.fn() };
      });

      const { result } = renderHook(() => useDeclineRide(), {
        wrapper: createTestWrapper(),
      });

      await result.current.mutateAsync({
        offerId: 'offer-1',
        rideId: 'ride-1',
        reason: 'Schedule conflict',
      });

      expect(mockOfferUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'declined',
          decline_reason: 'Schedule conflict',
        })
      );
    });

    it('throws error if offer update fails', async () => {
      const mockOfferUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          error: { message: 'Offer update failed' },
        }),
      });

      mockFrom.mockImplementation((table: string) => {
        if (table === 'ride_offers') {
          return { update: mockOfferUpdate };
        }
        return { update: jest.fn() };
      });

      const { result } = renderHook(() => useDeclineRide(), {
        wrapper: createTestWrapper(),
      });

      await expect(
        result.current.mutateAsync({
          offerId: 'offer-1',
          rideId: 'ride-1',
        })
      ).rejects.toMatchObject({ message: 'Offer update failed' });
    });

    it('throws error if ride update fails', async () => {
      const mockOfferUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      });

      const mockRideUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          error: { message: 'Ride update failed' },
        }),
      });

      mockFrom.mockImplementation((table: string) => {
        if (table === 'ride_offers') {
          return { update: mockOfferUpdate };
        }
        if (table === 'rides') {
          return { update: mockRideUpdate };
        }
        return { update: jest.fn() };
      });

      const { result } = renderHook(() => useDeclineRide(), {
        wrapper: createTestWrapper(),
      });

      await expect(
        result.current.mutateAsync({
          offerId: 'offer-1',
          rideId: 'ride-1',
        })
      ).rejects.toMatchObject({ message: 'Ride update failed' });
    });
  });

  describe('query invalidation', () => {
    it('invalidates offer queries on success', async () => {
      const mockOfferUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      });

      const mockRideUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      });

      mockFrom.mockImplementation((table: string) => {
        if (table === 'ride_offers') {
          return { update: mockOfferUpdate };
        }
        if (table === 'rides') {
          return { update: mockRideUpdate };
        }
        return { update: jest.fn() };
      });

      const queryClient = createQueryClient();
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useDeclineRide(), {
        wrapper: createTestWrapper(queryClient),
      });

      await result.current.mutateAsync({
        offerId: 'offer-1',
        rideId: 'ride-1',
      });

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: offerKeys.all });
      });
    });
  });
});
