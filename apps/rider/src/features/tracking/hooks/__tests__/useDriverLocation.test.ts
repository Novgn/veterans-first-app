/**
 * Tests for useDriverLocation hook
 *
 * Story 2.10: Implement Real-Time Driver Tracking
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';

import { useDriverLocation } from '../useDriverLocation';

// Mock the Supabase client
const mockMaybeSingle = jest.fn();
const mockLimit = jest.fn(() => ({ maybeSingle: mockMaybeSingle }));
const mockOrder = jest.fn(() => ({ limit: mockLimit }));
const mockEq = jest.fn(() => ({ order: mockOrder }));
const mockSelect = jest.fn(() => ({ eq: mockEq }));
const mockFrom = jest.fn(() => ({ select: mockSelect }));

const mockSubscribe = jest.fn();
const mockOn = jest.fn(() => ({ subscribe: mockSubscribe }));
const mockChannel = jest.fn(() => ({ on: mockOn }));
const mockRemoveChannel = jest.fn();

jest.mock('../../../../lib/supabase', () => ({
  useSupabase: () => ({
    from: mockFrom,
    channel: mockChannel,
    removeChannel: mockRemoveChannel,
  }),
}));

describe('useDriverLocation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
    mockSubscribe.mockImplementation((callback) => {
      callback('SUBSCRIBED');
      return { unsubscribe: jest.fn() };
    });
  });

  it('returns null location when driverId is null', () => {
    const { result } = renderHook(() => useDriverLocation(null));

    expect(result.current.location).toBeNull();
    expect(result.current.isConnected).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('fetches initial location on mount', async () => {
    const mockLocation = {
      id: 'loc-1',
      driver_id: 'driver-123',
      latitude: '37.7749',
      longitude: '-122.4194',
      heading: '90.5',
      accuracy: '10.0',
      recorded_at: '2025-12-13T12:00:00Z',
    };

    mockMaybeSingle.mockResolvedValue({ data: mockLocation, error: null });

    const { result } = renderHook(() => useDriverLocation('driver-123'));

    await waitFor(() => {
      expect(result.current.location).not.toBeNull();
    });

    expect(result.current.location).toEqual({
      latitude: 37.7749,
      longitude: -122.4194,
      heading: 90.5,
      accuracy: 10.0,
      recordedAt: '2025-12-13T12:00:00Z',
    });
  });

  it('creates subscription channel with correct name', () => {
    renderHook(() => useDriverLocation('driver-123'));

    expect(mockChannel).toHaveBeenCalledWith('driver:driver-123:location');
  });

  it('subscribes to INSERT events on driver_locations table', () => {
    renderHook(() => useDriverLocation('driver-123'));

    expect(mockOn).toHaveBeenCalledWith(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'driver_locations',
        filter: 'driver_id=eq.driver-123',
      },
      expect.any(Function)
    );
  });

  it('sets isConnected to true when subscription succeeds', async () => {
    mockSubscribe.mockImplementation((callback) => {
      callback('SUBSCRIBED');
      return { unsubscribe: jest.fn() };
    });

    const { result } = renderHook(() => useDriverLocation('driver-123'));

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });
  });

  it('handles subscription error', async () => {
    mockSubscribe.mockImplementation((callback) => {
      callback('CHANNEL_ERROR');
      return { unsubscribe: jest.fn() };
    });

    const { result } = renderHook(() => useDriverLocation('driver-123'));

    await waitFor(() => {
      expect(result.current.isConnected).toBe(false);
      expect(result.current.error).toBeTruthy();
    });
  });

  it('cleans up channel on unmount', () => {
    const { unmount } = renderHook(() => useDriverLocation('driver-123'));

    unmount();

    expect(mockRemoveChannel).toHaveBeenCalled();
  });

  it('handles null heading and accuracy', async () => {
    const mockLocation = {
      id: 'loc-1',
      driver_id: 'driver-123',
      latitude: '37.7749',
      longitude: '-122.4194',
      heading: null,
      accuracy: null,
      recorded_at: '2025-12-13T12:00:00Z',
    };

    mockMaybeSingle.mockResolvedValue({ data: mockLocation, error: null });

    const { result } = renderHook(() => useDriverLocation('driver-123'));

    await waitFor(() => {
      expect(result.current.location).not.toBeNull();
    });

    expect(result.current.location?.heading).toBeNull();
    expect(result.current.location?.accuracy).toBeNull();
  });

  it('handles fetch error gracefully', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: null,
      error: { message: 'Network error' },
    });

    const { result } = renderHook(() => useDriverLocation('driver-123'));

    await waitFor(() => {
      expect(result.current.error).toContain('Failed to fetch initial location');
    });
  });

  it('resets state when driverId changes to null', async () => {
    const mockLocation = {
      id: 'loc-1',
      driver_id: 'driver-123',
      latitude: '37.7749',
      longitude: '-122.4194',
      heading: null,
      accuracy: null,
      recorded_at: '2025-12-13T12:00:00Z',
    };

    mockMaybeSingle.mockResolvedValue({ data: mockLocation, error: null });

    const { result, rerender } = renderHook(({ driverId }) => useDriverLocation(driverId), {
      initialProps: { driverId: 'driver-123' as string | null },
    });

    await waitFor(() => {
      expect(result.current.location).not.toBeNull();
    });

    // Change driverId to null
    rerender({ driverId: null });

    expect(result.current.location).toBeNull();
    expect(result.current.isConnected).toBe(false);
  });
});
