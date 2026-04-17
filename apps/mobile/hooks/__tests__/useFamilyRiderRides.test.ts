/**
 * Tests for family read-only ride hooks (Story 4.3).
 */

import { renderHook, waitFor } from '@testing-library/react-native';

import { createTestWrapper } from '@/test-utils/queryWrapper';

import { useFamilyRideDetail, useFamilyRiderRides } from '../useFamilyRiderRides';

const mockFrom = jest.fn();

jest.mock('@/lib/supabase', () => ({
  useSupabase: () => ({ from: mockFrom }),
}));

jest.mock('@clerk/clerk-expo', () => ({
  useUser: () => ({ user: { id: 'clerk-family-1' } }),
}));

describe('useFamilyRiderRides', () => {
  beforeEach(() => jest.clearAllMocks());

  it('buckets rides into upcoming and history', async () => {
    const rows = [
      {
        id: 'r1',
        rider_id: 'rider-1',
        driver_id: null,
        status: 'confirmed',
        pickup_address: 'A',
        dropoff_address: 'B',
        scheduled_pickup_time: '2026-05-01T10:00:00Z',
        completed_at: null,
        fare_cents: null,
        created_at: '2026-04-01T10:00:00Z',
        updated_at: '2026-04-01T10:00:00Z',
      },
      {
        id: 'r2',
        rider_id: 'rider-1',
        driver_id: 'driver-1',
        status: 'completed',
        pickup_address: 'C',
        dropoff_address: 'D',
        scheduled_pickup_time: '2026-03-01T10:00:00Z',
        completed_at: '2026-03-01T11:00:00Z',
        fare_cents: 2500,
        created_at: '2026-02-01T10:00:00Z',
        updated_at: '2026-03-01T11:00:00Z',
      },
    ];

    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data: rows, error: null }),
        }),
      }),
    });

    const { result } = renderHook(() => useFamilyRiderRides('rider-1'), {
      wrapper: createTestWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.upcoming).toHaveLength(1);
    expect(result.current.data?.upcoming[0].id).toBe('r1');
    expect(result.current.data?.history).toHaveLength(1);
    expect(result.current.data?.history[0].id).toBe('r2');
  });

  it('returns empty buckets when riderId is undefined', async () => {
    const { result } = renderHook(() => useFamilyRiderRides(undefined), {
      wrapper: createTestWrapper(),
    });

    // Query disabled when riderId is undefined — stays in idle/loading-disabled.
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(mockFrom).not.toHaveBeenCalled();
  });
});

describe('useFamilyRideDetail', () => {
  beforeEach(() => jest.clearAllMocks());

  it('fetches ride + events', async () => {
    const ride = {
      id: 'ride-1',
      rider_id: 'rider-1',
      driver_id: 'driver-1',
      status: 'completed',
      pickup_address: 'A',
      dropoff_address: 'B',
      scheduled_pickup_time: '2026-04-01T10:00:00Z',
      completed_at: '2026-04-01T11:00:00Z',
      fare_cents: 2500,
      created_at: '2026-03-01T10:00:00Z',
      updated_at: '2026-04-01T11:00:00Z',
      driver: { id: 'd1', first_name: 'Jane', last_name: 'Doe', profile_photo_url: null },
      rider: { id: 'r1', first_name: 'John', last_name: 'Smith', profile_photo_url: null },
    };

    const events = [
      {
        id: 'e1',
        ride_id: 'ride-1',
        event_type: 'arrived',
        created_at: '2026-04-01T10:55:00Z',
        notes: null,
        photo_url: 'https://example/photo.jpg',
      },
    ];

    mockFrom.mockImplementation((table: string) => {
      if (table === 'rides') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              maybeSingle: jest.fn().mockResolvedValue({ data: ride, error: null }),
            }),
          }),
        };
      }
      if (table === 'ride_events') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({ data: events, error: null }),
            }),
          }),
        };
      }
      return {};
    });

    const { result } = renderHook(() => useFamilyRideDetail('ride-1'), {
      wrapper: createTestWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.id).toBe('ride-1');
    expect(result.current.data?.events).toHaveLength(1);
    expect(result.current.data?.driver?.first_name).toBe('Jane');
  });

  it('returns null when ride does not exist', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'rides') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        };
      }
      return {};
    });

    const { result } = renderHook(() => useFamilyRideDetail('missing'), {
      wrapper: createTestWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });
});
