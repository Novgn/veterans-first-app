/**
 * Tests for useLocationCapture (Story 3.4)
 *
 * Verifies:
 *   - Permission granted → returns coords
 *   - Permission denied → returns null + sets error
 *   - Underlying SDK throws → returns null gracefully
 */

import { act, renderHook } from '@testing-library/react-native';
import * as Location from 'expo-location';

import { useLocationCapture } from '../useLocationCapture';

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  Accuracy: { High: 4 },
}));

const mockedLocation = Location as jest.Mocked<typeof Location>;

describe('useLocationCapture', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns coordinates when permission granted', async () => {
    mockedLocation.requestForegroundPermissionsAsync.mockResolvedValue({
      status: 'granted',
      granted: true,
      expires: 'never',
      canAskAgain: true,
    } as unknown as Awaited<ReturnType<typeof Location.requestForegroundPermissionsAsync>>);
    mockedLocation.getCurrentPositionAsync.mockResolvedValue({
      coords: {
        latitude: 34.05,
        longitude: -118.25,
        altitude: null,
        accuracy: 5,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    } as unknown as Awaited<ReturnType<typeof Location.getCurrentPositionAsync>>);

    const { result } = renderHook(() => useLocationCapture());

    let coords: { lat: number; lng: number } | null = null;
    await act(async () => {
      coords = await result.current.captureLocation();
    });

    expect(coords).toEqual({ lat: 34.05, lng: -118.25 });
    expect(result.current.error).toBeNull();
  });

  it('returns null and sets error when permission denied', async () => {
    mockedLocation.requestForegroundPermissionsAsync.mockResolvedValue({
      status: 'denied',
      granted: false,
      expires: 'never',
      canAskAgain: false,
    } as unknown as Awaited<ReturnType<typeof Location.requestForegroundPermissionsAsync>>);

    const { result } = renderHook(() => useLocationCapture());

    let coords: { lat: number; lng: number } | null = null;
    await act(async () => {
      coords = await result.current.captureLocation();
    });

    expect(coords).toBeNull();
    expect(result.current.error).toBe('Location permission denied');
    expect(mockedLocation.getCurrentPositionAsync).not.toHaveBeenCalled();
  });

  it('returns null and surfaces error when SDK throws', async () => {
    mockedLocation.requestForegroundPermissionsAsync.mockResolvedValue({
      status: 'granted',
      granted: true,
      expires: 'never',
      canAskAgain: true,
    } as unknown as Awaited<ReturnType<typeof Location.requestForegroundPermissionsAsync>>);
    mockedLocation.getCurrentPositionAsync.mockRejectedValue(new Error('GPS timeout'));

    const { result } = renderHook(() => useLocationCapture());

    let coords: { lat: number; lng: number } | null = null;
    await act(async () => {
      coords = await result.current.captureLocation();
    });

    expect(coords).toBeNull();
    expect(result.current.error).toBe('GPS timeout');
  });
});
