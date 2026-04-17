/**
 * Tests for useFamilyBookRide (Story 4.4).
 */

import { renderHook } from '@testing-library/react-native';

import { createTestWrapper } from '@/test-utils/queryWrapper';

import { useFamilyBookRide } from '../useFamilyBookRide';

const mockFrom = jest.fn();

jest.mock('@/lib/supabase', () => ({
  useSupabase: () => ({ from: mockFrom }),
}));

jest.mock('@clerk/clerk-expo', () => ({
  useUser: () => ({ user: { id: 'clerk-family' } }),
}));

function mockUserLookup(id = 'family-uuid') {
  return {
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: { id }, error: null }),
      }),
    }),
  };
}

describe('useFamilyBookRide', () => {
  beforeEach(() => jest.clearAllMocks());

  it('inserts ride with booked_by_id set to current user id', async () => {
    const insertSingle = jest.fn().mockResolvedValue({
      data: {
        id: 'ride-1',
        rider_id: 'rider-1',
        booked_by_id: 'family-uuid',
        status: 'pending',
        scheduled_pickup_time: '2099-01-01T10:00:00.000Z',
      },
      error: null,
    });

    const insert = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({ single: insertSingle }),
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') return mockUserLookup();
      if (table === 'rides') return { insert };
      return {};
    });

    const { result } = renderHook(() => useFamilyBookRide(), {
      wrapper: createTestWrapper(),
    });

    await result.current.mutateAsync({
      riderId: 'rider-1',
      pickupAddress: '123 Main',
      dropoffAddress: 'Clinic',
      scheduledPickupTime: '2099-01-01T10:00:00Z',
    });

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        rider_id: 'rider-1',
        booked_by_id: 'family-uuid',
        status: 'pending',
        pickup_address: '123 Main',
        dropoff_address: 'Clinic',
      })
    );
  });

  it('rejects missing required fields', async () => {
    const { result } = renderHook(() => useFamilyBookRide(), {
      wrapper: createTestWrapper(),
    });

    await expect(
      result.current.mutateAsync({
        riderId: 'rider-1',
        pickupAddress: '',
        dropoffAddress: 'X',
        scheduledPickupTime: '2099-01-01T10:00:00Z',
      })
    ).rejects.toThrow(/Pickup address/);
  });

  it('rejects past pickup times', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') return mockUserLookup();
      return {};
    });

    const { result } = renderHook(() => useFamilyBookRide(), {
      wrapper: createTestWrapper(),
    });

    await expect(
      result.current.mutateAsync({
        riderId: 'rider-1',
        pickupAddress: '123 Main',
        dropoffAddress: 'Clinic',
        scheduledPickupTime: '2020-01-01T10:00:00Z',
      })
    ).rejects.toThrow(/future/);
  });
});
