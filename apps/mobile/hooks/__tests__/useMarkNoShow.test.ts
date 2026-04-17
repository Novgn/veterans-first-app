/**
 * Tests for useMarkNoShow (Story 3.10)
 */

import { renderHook } from '@testing-library/react-native';

import { createTestWrapper } from '@/test-utils/queryWrapper';

import { useMarkNoShow } from '../useMarkNoShow';

const mockFrom = jest.fn();

jest.mock('@/lib/supabase', () => ({
  useSupabase: () => ({ from: mockFrom }),
}));

jest.mock('@clerk/clerk-expo', () => ({
  useAuth: () => ({ userId: 'clerk-driver', isSignedIn: true }),
}));

function setupHappyPath() {
  const usersSelect = jest.fn().mockReturnValue({
    eq: () => ({
      single: jest.fn().mockResolvedValue({ data: { id: 'driver-uuid' }, error: null }),
    }),
  });
  const ridesUpdate = jest.fn().mockReturnValue({
    eq: jest.fn().mockResolvedValue({ error: null }),
  });
  const eventsInsert = jest.fn().mockResolvedValue({ error: null });

  mockFrom.mockImplementation((table: string) => {
    if (table === 'users') return { select: usersSelect };
    if (table === 'rides') return { update: ridesUpdate };
    if (table === 'ride_events') return { insert: eventsInsert };
    return {};
  });

  return { ridesUpdate, eventsInsert };
}

describe('useMarkNoShow', () => {
  beforeEach(() => jest.clearAllMocks());

  it('sets ride status to no_show and inserts matching event', async () => {
    const { ridesUpdate, eventsInsert } = setupHappyPath();

    const { result } = renderHook(() => useMarkNoShow(), { wrapper: createTestWrapper() });
    await result.current.mutateAsync({
      rideId: 'ride-1',
      notes: 'Waited 10 min, no answer',
      location: { lat: 1, lng: 2 },
    });

    expect(ridesUpdate).toHaveBeenCalledWith(expect.objectContaining({ status: 'no_show' }));
    expect(eventsInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        ride_id: 'ride-1',
        event_type: 'no_show',
        driver_id: 'driver-uuid',
        lat: 1,
        lng: 2,
        notes: 'Waited 10 min, no answer',
      })
    );
  });

  it('bubbles up ride update errors', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') {
        return {
          select: () => ({
            eq: () => ({
              single: jest.fn().mockResolvedValue({ data: { id: 'driver-uuid' }, error: null }),
            }),
          }),
        };
      }
      if (table === 'rides') {
        return {
          update: () => ({
            eq: jest.fn().mockResolvedValue({ error: { message: 'Ride update failed' } }),
          }),
        };
      }
      return {};
    });

    const { result } = renderHook(() => useMarkNoShow(), { wrapper: createTestWrapper() });
    await expect(result.current.mutateAsync({ rideId: 'ride-x' })).rejects.toMatchObject({
      message: 'Ride update failed',
    });
  });
});
