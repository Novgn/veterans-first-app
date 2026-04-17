/**
 * Tests for useDriverTrips hook
 * Tests driver trip queue fetching, real-time subscriptions, and caching
 */

import { renderHook, waitFor } from '@testing-library/react-native';

import { createTestWrapper } from '@/test-utils/queryWrapper';
import { useDriverTrips, tripKeys } from '../useDriverTrips';

// Mock Supabase client
const mockFrom = jest.fn();
const mockChannel = jest.fn();
const mockRemoveChannel = jest.fn();

jest.mock('@/lib/supabase', () => ({
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

describe('useDriverTrips', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default channel mock
    mockChannel.mockReturnValue({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockReturnThis(),
    });
  });

  describe('tripKeys', () => {
    it('generates correct query keys', () => {
      expect(tripKeys.all).toEqual(['driver-trips']);
      expect(tripKeys.list('driver-1')).toEqual(['driver-trips', 'list', 'driver-1']);
      expect(tripKeys.detail('trip-1')).toEqual(['driver-trips', 'detail', 'trip-1']);
    });
  });

  describe('query behavior', () => {
    it('fetches driver trips with correct query', async () => {
      // Mock user lookup
      const mockUserSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 'driver-uuid' },
            error: null,
          }),
        }),
      });

      // Mock rides query
      const mockRidesSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          in: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [
                {
                  id: 'trip-1',
                  status: 'assigned',
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
                  rider_preferences: {
                    mobility_aid: 'walker',
                    needs_door_assistance: true,
                    needs_package_assistance: false,
                    extra_vehicle_space: false,
                    special_equipment_notes: 'Uses walker',
                    comfort_temperature: 'warm',
                    conversation_preference: 'some',
                    music_preference: 'soft',
                    other_notes: null,
                  },
                },
              ],
              error: null,
            }),
          }),
        }),
      });

      mockFrom.mockImplementation((table: string) => {
        if (table === 'users') {
          return { select: mockUserSelect };
        }
        if (table === 'rides') {
          return { select: mockRidesSelect };
        }
        return { select: jest.fn() };
      });

      const { result } = renderHook(() => useDriverTrips(), {
        wrapper: createTestWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data?.[0]).toMatchObject({
        id: 'trip-1',
        status: 'assigned',
        pickupAddress: '123 Main St',
        dropoffAddress: '456 Oak Ave',
        rider: {
          firstName: 'John',
          lastName: 'Doe',
        },
        riderPreferences: {
          mobilityAid: 'walker',
          needsDoorAssistance: true,
        },
      });
    });

    it('returns empty array when no user found', async () => {
      const mockUserSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      });

      mockFrom.mockImplementation((table: string) => {
        if (table === 'users') {
          return { select: mockUserSelect };
        }
        return { select: jest.fn() };
      });

      const { result } = renderHook(() => useDriverTrips(), {
        wrapper: createTestWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });

    it('fetches rides across all active driver statuses (Story 3.4)', async () => {
      const mockInFn = jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      });

      const mockEqFn = jest.fn().mockReturnValue({
        in: mockInFn,
      });

      mockFrom.mockImplementation((table: string) => {
        if (table === 'users') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: { id: 'driver-uuid' },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'rides') {
          return {
            select: jest.fn().mockReturnValue({
              eq: mockEqFn,
            }),
          };
        }
        return { select: jest.fn() };
      });

      const { result } = renderHook(() => useDriverTrips(), {
        wrapper: createTestWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockInFn).toHaveBeenCalledWith('status', [
        'assigned',
        'confirmed',
        'en_route',
        'arrived',
        'in_progress',
      ]);
    });
  });

  describe('real-time subscriptions', () => {
    it('sets up real-time subscription for driver trips', () => {
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

      renderHook(() => useDriverTrips(), {
        wrapper: createTestWrapper(),
      });

      expect(mockChannel).toHaveBeenCalledWith(`driver:${mockUserId}:trips`);
      expect(onMock).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          event: '*',
          schema: 'public',
          table: 'rides',
        }),
        expect.any(Function)
      );
      expect(subscribeMock).toHaveBeenCalled();
    });
  });
});
