/**
 * Tests for useRideOffer hook
 * Tests pending offer fetching, countdown timer, and real-time subscriptions
 */

import { renderHook, waitFor, act } from '@testing-library/react-native';

import { createTestWrapper } from '../../../../test-utils/queryWrapper';
import { useRideOffer, offerKeys } from '../useRideOffer';

// Mock Supabase client
const mockFrom = jest.fn();
const mockChannel = jest.fn();
const mockRemoveChannel = jest.fn();

jest.mock('../../../../lib/supabase', () => ({
  useSupabase: () => ({
    from: mockFrom,
    channel: mockChannel,
    removeChannel: mockRemoveChannel,
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

describe('useRideOffer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Setup default channel mock
    mockChannel.mockReturnValue({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockReturnThis(),
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('offerKeys', () => {
    it('generates correct query keys', () => {
      expect(offerKeys.all).toEqual(['ride-offers']);
      expect(offerKeys.pending('driver-1')).toEqual(['ride-offers', 'pending', 'driver-1']);
    });
  });

  describe('query behavior', () => {
    it('returns pending offer with ride details', async () => {
      // Set expiry 5 minutes in the future
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

      // Mock user lookup
      const mockUserSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 'driver-uuid' },
            error: null,
          }),
        }),
      });

      // Mock offers query
      const mockOffersSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                maybeSingle: jest.fn().mockResolvedValue({
                  data: {
                    id: 'offer-1',
                    ride_id: 'ride-1',
                    offered_at: '2026-01-13T09:55:00Z',
                    expires_at: expiresAt,
                    status: 'pending',
                    ride: {
                      id: 'ride-1',
                      pickup_address: '123 Main St',
                      dropoff_address: '456 Oak Ave',
                      scheduled_pickup_time: '2026-01-13T10:00:00Z',
                      rider: {
                        id: 'rider-uuid',
                        first_name: 'Margaret',
                        last_name: 'Smith',
                        phone: '+1234567890',
                        profile_photo_url: null,
                      },
                      rider_preferences: {
                        mobility_aid: 'walker',
                        needs_door_assistance: true,
                        needs_package_assistance: false,
                        extra_vehicle_space: false,
                        special_equipment_notes: 'Uses walker',
                      },
                    },
                  },
                  error: null,
                }),
              }),
            }),
          }),
        }),
      });

      mockFrom.mockImplementation((table: string) => {
        if (table === 'users') {
          return { select: mockUserSelect };
        }
        if (table === 'ride_offers') {
          return { select: mockOffersSelect };
        }
        return { select: jest.fn() };
      });

      const { result } = renderHook(() => useRideOffer(), {
        wrapper: createTestWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toMatchObject({
        id: 'offer-1',
        rideId: 'ride-1',
        status: 'pending',
        ride: {
          pickupAddress: '123 Main St',
          dropoffAddress: '456 Oak Ave',
          rider: {
            firstName: 'Margaret',
            lastName: 'Smith',
          },
          riderPreferences: {
            mobilityAid: 'walker',
            needsDoorAssistance: true,
          },
        },
      });
    });

    it('returns null when no pending offer exists', async () => {
      const mockUserSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 'driver-uuid' },
            error: null,
          }),
        }),
      });

      const mockOffersSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                maybeSingle: jest.fn().mockResolvedValue({
                  data: null,
                  error: null,
                }),
              }),
            }),
          }),
        }),
      });

      mockFrom.mockImplementation((table: string) => {
        if (table === 'users') {
          return { select: mockUserSelect };
        }
        if (table === 'ride_offers') {
          return { select: mockOffersSelect };
        }
        return { select: jest.fn() };
      });

      const { result } = renderHook(() => useRideOffer(), {
        wrapper: createTestWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeNull();
      expect(result.current.timeRemaining).toBeNull();
    });

    it('returns null when user not found', async () => {
      const mockUserSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST116', message: 'No rows found' },
          }),
        }),
      });

      mockFrom.mockImplementation(() => ({ select: mockUserSelect }));

      const { result } = renderHook(() => useRideOffer(), {
        wrapper: createTestWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeNull();
    });
  });

  describe('countdown timer', () => {
    it('calculates time remaining correctly', async () => {
      // Set expiry 2 minutes in the future
      const expiresAt = new Date(Date.now() + 2 * 60 * 1000).toISOString();

      const mockUserSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 'driver-uuid' },
            error: null,
          }),
        }),
      });

      const mockOffersSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                maybeSingle: jest.fn().mockResolvedValue({
                  data: {
                    id: 'offer-1',
                    ride_id: 'ride-1',
                    offered_at: '2026-01-13T09:58:00Z',
                    expires_at: expiresAt,
                    status: 'pending',
                    ride: {
                      id: 'ride-1',
                      pickup_address: '123 Main St',
                      dropoff_address: '456 Oak Ave',
                      scheduled_pickup_time: '2026-01-13T10:00:00Z',
                      rider: {
                        id: 'rider-uuid',
                        first_name: 'John',
                        last_name: 'Doe',
                        phone: '+1234567890',
                        profile_photo_url: null,
                      },
                      rider_preferences: null,
                    },
                  },
                  error: null,
                }),
              }),
            }),
          }),
        }),
      });

      mockFrom.mockImplementation((table: string) => {
        if (table === 'users') {
          return { select: mockUserSelect };
        }
        if (table === 'ride_offers') {
          return { select: mockOffersSelect };
        }
        return { select: jest.fn() };
      });

      const { result } = renderHook(() => useRideOffer(), {
        wrapper: createTestWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Time remaining should be approximately 120 seconds
      expect(result.current.timeRemaining).toBeGreaterThan(115);
      expect(result.current.timeRemaining).toBeLessThanOrEqual(120);
    });

    it('counts down each second', async () => {
      const expiresAt = new Date(Date.now() + 60 * 1000).toISOString();

      const mockUserSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 'driver-uuid' },
            error: null,
          }),
        }),
      });

      const mockOffersSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                maybeSingle: jest.fn().mockResolvedValue({
                  data: {
                    id: 'offer-1',
                    ride_id: 'ride-1',
                    offered_at: '2026-01-13T09:59:00Z',
                    expires_at: expiresAt,
                    status: 'pending',
                    ride: {
                      id: 'ride-1',
                      pickup_address: '123 Main St',
                      dropoff_address: '456 Oak Ave',
                      scheduled_pickup_time: '2026-01-13T10:00:00Z',
                      rider: null,
                      rider_preferences: null,
                    },
                  },
                  error: null,
                }),
              }),
            }),
          }),
        }),
      });

      mockFrom.mockImplementation((table: string) => {
        if (table === 'users') {
          return { select: mockUserSelect };
        }
        if (table === 'ride_offers') {
          return { select: mockOffersSelect };
        }
        return { select: jest.fn() };
      });

      const { result } = renderHook(() => useRideOffer(), {
        wrapper: createTestWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      const initialTime = result.current.timeRemaining;
      expect(initialTime).toBeGreaterThan(55);

      // Advance by 5 seconds
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Should have decreased by ~5 seconds
      expect(result.current.timeRemaining).toBeLessThan(initialTime! - 4);
    });
  });

  describe('real-time subscriptions', () => {
    it('sets up subscription for new offers', () => {
      const onMock = jest.fn().mockReturnThis();
      const subscribeMock = jest.fn().mockReturnThis();

      mockChannel.mockReturnValue({
        on: onMock,
        subscribe: subscribeMock,
      });

      mockFrom.mockImplementation(() => ({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'driver-uuid' },
              error: null,
            }),
          }),
        }),
      }));

      renderHook(() => useRideOffer(), {
        wrapper: createTestWrapper(),
      });

      expect(mockChannel).toHaveBeenCalledWith(`driver:${mockUserId}:offers`);
      expect(onMock).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          event: 'INSERT',
          schema: 'public',
          table: 'ride_offers',
        }),
        expect.any(Function)
      );
      expect(subscribeMock).toHaveBeenCalled();
    });
  });
});
