/**
 * useDriverLocation Hook
 *
 * Real-time hook for tracking driver location via Supabase Realtime.
 * Subscribes to driver location updates and provides smooth location transitions.
 *
 * Features:
 * - Fetches initial driver location on mount
 * - Real-time updates via Supabase postgres_changes
 * - Connection status monitoring
 * - Automatic cleanup on unmount
 *
 * Story 2.10: Implement Real-Time Driver Tracking
 * FR11: Riders can track their driver's real-time location and estimated arrival time
 */

import { useEffect, useState, useCallback, useRef } from 'react';

import { useSupabase } from '../../../lib/supabase';

/**
 * Driver location data
 */
export interface DriverLocation {
  latitude: number;
  longitude: number;
  heading: number | null;
  accuracy: number | null;
  recordedAt: string;
}

/**
 * Raw location data from database
 */
interface RawLocationData {
  id: string;
  driver_id: string;
  latitude: string;
  longitude: string;
  heading: string | null;
  accuracy: string | null;
  recorded_at: string;
}

/**
 * Hook return type
 */
export interface UseDriverLocationResult {
  /** Current driver location, null if not yet received */
  location: DriverLocation | null;
  /** Previous location for animation purposes */
  previousLocation: DriverLocation | null;
  /** Whether the real-time channel is connected */
  isConnected: boolean;
  /** Error message if subscription failed */
  error: string | null;
}

/**
 * Parses raw database location data to DriverLocation
 */
function parseLocationData(data: RawLocationData): DriverLocation {
  return {
    latitude: parseFloat(data.latitude),
    longitude: parseFloat(data.longitude),
    heading: data.heading ? parseFloat(data.heading) : null,
    accuracy: data.accuracy ? parseFloat(data.accuracy) : null,
    recordedAt: data.recorded_at,
  };
}

/**
 * Hook for tracking a driver's real-time location.
 *
 * @param driverId - The UUID of the driver to track, or null to disable tracking
 * @returns Object with location data, connection status, and error state
 *
 * @example
 * ```typescript
 * const { location, isConnected, error } = useDriverLocation(ride.driver_id);
 *
 * if (!location) return <Loading />;
 * return <DriverMap location={location} />;
 * ```
 */
export function useDriverLocation(driverId: string | null): UseDriverLocationResult {
  const supabase = useSupabase();
  const [location, setLocation] = useState<DriverLocation | null>(null);
  const [previousLocation, setPreviousLocation] = useState<DriverLocation | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track if component is mounted to avoid state updates after unmount
  const isMounted = useRef(true);

  /**
   * Fetches the most recent location for a driver
   */
  const fetchInitialLocation = useCallback(async () => {
    if (!driverId) return;

    try {
      const { data, error: queryError } = await supabase
        .from('driver_locations')
        .select('*')
        .eq('driver_id', driverId)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (queryError) {
        if (isMounted.current) {
          setError(`Failed to fetch initial location: ${queryError.message}`);
        }
        return;
      }

      if (data && isMounted.current) {
        setLocation(parseLocationData(data as RawLocationData));
        setError(null);
      }
    } catch (err) {
      if (isMounted.current) {
        setError(`Failed to fetch initial location: ${String(err)}`);
      }
    }
  }, [supabase, driverId]);

  /**
   * Set up real-time subscription
   */
  useEffect(() => {
    isMounted.current = true;

    if (!driverId) {
      setLocation(null);
      setPreviousLocation(null);
      setIsConnected(false);
      setError(null);
      return;
    }

    // Fetch initial location
    fetchInitialLocation();

    // Create real-time subscription channel
    const channelName = `driver:${driverId}:location`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'driver_locations',
          filter: `driver_id=eq.${driverId}`,
        },
        (payload) => {
          if (!isMounted.current) return;

          const newData = payload.new as RawLocationData;
          const newLocation = parseLocationData(newData);

          // Store previous location for animation
          setLocation((prev) => {
            if (prev) {
              setPreviousLocation(prev);
            }
            return newLocation;
          });
        }
      )
      .subscribe((status) => {
        if (!isMounted.current) return;

        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          setError(null);
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setIsConnected(false);
          if (status === 'CHANNEL_ERROR') {
            setError('Real-time connection error. Location updates may be delayed.');
          }
        }
      });

    // Cleanup subscription on unmount or driverId change
    return () => {
      isMounted.current = false;
      supabase.removeChannel(channel);
    };
  }, [supabase, driverId, fetchInitialLocation]);

  return {
    location,
    previousLocation,
    isConnected,
    error,
  };
}
