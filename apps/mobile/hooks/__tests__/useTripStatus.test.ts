/**
 * Tests for useTripStatus (Story 3.4)
 *
 * Verifies:
 *   - Status transitions update rides + record ride_events
 *   - assigned → en_route path is covered end-to-end
 *   - DB errors bubble out through the mutation
 *   - Transition validators behave correctly
 */

import { renderHook } from '@testing-library/react-native';

import { createTestWrapper } from '@/test-utils/queryWrapper';

import {
  STATUS_TO_EVENT,
  VALID_TRANSITIONS,
  isValidTransition,
  useTripStatus,
} from '../useTripStatus';

const mockFrom = jest.fn();

jest.mock('@/lib/supabase', () => ({
  useSupabase: () => ({
    from: mockFrom,
  }),
}));

jest.mock('@clerk/clerk-expo', () => ({
  useAuth: () => ({ userId: 'clerk-123', isSignedIn: true }),
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
    return { select: jest.fn(), update: jest.fn(), insert: jest.fn() };
  });

  return { usersSelect, ridesUpdate, eventsInsert };
}

describe('useTripStatus — transition maps', () => {
  it('maps every status except assigned to an event type', () => {
    expect(STATUS_TO_EVENT).toEqual({
      assigned: null,
      en_route: 'en_route',
      arrived: 'arrived',
      in_progress: 'trip_started',
      completed: 'trip_completed',
    });
  });

  it('enforces strict forward progression via VALID_TRANSITIONS', () => {
    expect(VALID_TRANSITIONS.assigned).toBe('en_route');
    expect(VALID_TRANSITIONS.en_route).toBe('arrived');
    expect(VALID_TRANSITIONS.arrived).toBe('in_progress');
    expect(VALID_TRANSITIONS.in_progress).toBe('completed');
    expect(VALID_TRANSITIONS.completed).toBeNull();
  });

  it('isValidTransition accepts only the next forward step', () => {
    expect(isValidTransition('assigned', 'en_route')).toBe(true);
    expect(isValidTransition('assigned', 'arrived')).toBe(false);
    expect(isValidTransition('en_route', 'assigned')).toBe(false);
    expect(isValidTransition('completed', 'en_route')).toBe(false);
  });
});

describe('useTripStatus — mutation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates ride status and writes a ride_event with location', async () => {
    const { ridesUpdate, eventsInsert } = setupHappyPath();

    const { result } = renderHook(() => useTripStatus(), { wrapper: createTestWrapper() });

    await result.current.mutateAsync({
      rideId: 'ride-1',
      newStatus: 'en_route',
      location: { lat: 40.7128, lng: -74.006 },
    });

    expect(ridesUpdate).toHaveBeenCalledWith(expect.objectContaining({ status: 'en_route' }));
    expect(eventsInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        ride_id: 'ride-1',
        event_type: 'en_route',
        driver_id: 'driver-uuid',
        lat: 40.7128,
        lng: -74.006,
      })
    );
  });

  it('records null lat/lng when no location provided', async () => {
    const { eventsInsert } = setupHappyPath();

    const { result } = renderHook(() => useTripStatus(), { wrapper: createTestWrapper() });
    await result.current.mutateAsync({ rideId: 'ride-2', newStatus: 'arrived' });

    expect(eventsInsert).toHaveBeenCalledWith(expect.objectContaining({ lat: null, lng: null }));
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
      return { insert: jest.fn() };
    });

    const { result } = renderHook(() => useTripStatus(), { wrapper: createTestWrapper() });
    await expect(
      result.current.mutateAsync({ rideId: 'ride-3', newStatus: 'in_progress' })
    ).rejects.toMatchObject({ message: 'Ride update failed' });
  });

  it('throws when driver record cannot be resolved', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') {
        return {
          select: () => ({
            eq: () => ({
              single: jest.fn().mockResolvedValue({ data: null, error: { message: 'not found' } }),
            }),
          }),
        };
      }
      return { update: jest.fn(), insert: jest.fn() };
    });

    const { result } = renderHook(() => useTripStatus(), { wrapper: createTestWrapper() });
    await expect(
      result.current.mutateAsync({ rideId: 'ride-4', newStatus: 'en_route' })
    ).rejects.toThrow('Driver not found');
  });
});
