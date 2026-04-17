/**
 * DriverTrackingMap Component
 *
 * Displays a map showing driver's current location and route to pickup.
 * Features smooth marker animation and auto-centering.
 *
 * UX Requirements:
 * - Driver marker with vehicle icon (not generic pin)
 * - Pickup marker with distinct icon
 * - Route polyline showing path
 * - Auto-center to show both markers
 * - Smooth animation on location updates
 *
 * Story 2.10: Implement Real-Time Driver Tracking
 * FR11: Riders can track their driver's real-time location and estimated arrival time
 */

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Region } from 'react-native-maps';

/**
 * Location coordinates
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Driver location with heading
 */
export interface DriverMapLocation extends Coordinates {
  heading: number | null;
}

/**
 * Pickup location with address
 */
export interface PickupMapLocation extends Coordinates {
  address: string;
}

interface DriverTrackingMapProps {
  /** Current driver location */
  driverLocation: DriverMapLocation;
  /** Pickup location */
  pickupLocation: PickupMapLocation;
  /** Optional additional styles */
  className?: string;
  /** Test ID for testing */
  testID?: string;
}

/**
 * Calculates distance between two points using Haversine formula
 * @returns Distance in miles
 */
export function calculateDistance(point1: Coordinates, point2: Coordinates): number {
  const R = 3959; // Earth radius in miles
  const dLat = toRad(point2.latitude - point1.latitude);
  const dLon = toRad(point2.longitude - point1.longitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.latitude)) *
      Math.cos(toRad(point2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Converts degrees to radians
 */
function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Calculates region to fit both driver and pickup locations
 */
function calculateRegion(driver: Coordinates, pickup: Coordinates): Region {
  const minLat = Math.min(driver.latitude, pickup.latitude);
  const maxLat = Math.max(driver.latitude, pickup.latitude);
  const minLng = Math.min(driver.longitude, pickup.longitude);
  const maxLng = Math.max(driver.longitude, pickup.longitude);

  const latDelta = (maxLat - minLat) * 1.5 || 0.01; // Add padding, default for same point
  const lngDelta = (maxLng - minLng) * 1.5 || 0.01;

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max(latDelta, 0.01), // Minimum zoom level
    longitudeDelta: Math.max(lngDelta, 0.01),
  };
}

/**
 * DriverTrackingMap displays a map with the driver's current location
 * and the route to the pickup point.
 */
export function DriverTrackingMap({
  driverLocation,
  pickupLocation,
  className = '',
  testID,
}: DriverTrackingMapProps) {
  const mapRef = useRef<MapView>(null);

  // Fit map to show both markers when locations change
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.fitToCoordinates(
        [
          { latitude: driverLocation.latitude, longitude: driverLocation.longitude },
          { latitude: pickupLocation.latitude, longitude: pickupLocation.longitude },
        ],
        {
          edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
          animated: true,
        }
      );
    }
  }, [
    driverLocation.latitude,
    driverLocation.longitude,
    pickupLocation.latitude,
    pickupLocation.longitude,
  ]);

  const distanceMiles = calculateDistance(driverLocation, pickupLocation);
  const accessibilityLabel = `Map showing your driver ${distanceMiles.toFixed(1)} miles away from pickup location at ${pickupLocation.address}`;

  const initialRegion = calculateRegion(driverLocation, pickupLocation);

  return (
    <View
      className={`h-64 overflow-hidden rounded-2xl ${className}`}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
      testID={testID}>
      <MapView
        ref={mapRef}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        style={StyleSheet.absoluteFillObject}
        initialRegion={initialRegion}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        rotateEnabled={false}
        pitchEnabled={false}
        toolbarEnabled={false}>
        {/* Driver Marker */}
        <Marker
          coordinate={{
            latitude: driverLocation.latitude,
            longitude: driverLocation.longitude,
          }}
          title="Your Driver"
          description="On the way to pick you up"
          rotation={driverLocation.heading ?? 0}
          anchor={{ x: 0.5, y: 0.5 }}
          tracksViewChanges={false}>
          <View
            className="h-10 w-10 items-center justify-center rounded-full bg-primary shadow-md"
            accessibilityLabel="Driver location">
            <Ionicons name="car" size={24} color="white" />
          </View>
        </Marker>

        {/* Pickup Marker */}
        <Marker
          coordinate={{
            latitude: pickupLocation.latitude,
            longitude: pickupLocation.longitude,
          }}
          title="Pickup"
          description={pickupLocation.address}
          anchor={{ x: 0.5, y: 1.0 }}
          tracksViewChanges={false}>
          <View className="items-center" accessibilityLabel="Pickup location">
            <View className="h-8 w-8 items-center justify-center rounded-full bg-secondary shadow-md">
              <Ionicons name="location" size={20} color="white" />
            </View>
            {/* Pin pointer */}
            <View className="-mt-1 h-0 w-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent border-t-secondary" />
          </View>
        </Marker>

        {/* Route Polyline (straight line for MVP, could be actual route with Directions API) */}
        <Polyline
          coordinates={[
            { latitude: driverLocation.latitude, longitude: driverLocation.longitude },
            { latitude: pickupLocation.latitude, longitude: pickupLocation.longitude },
          ]}
          strokeColor="#1E40AF"
          strokeWidth={3}
          lineDashPattern={[10, 5]}
        />
      </MapView>
    </View>
  );
}
