# Story 2.10: Implement Real-Time Driver Tracking

Status: done

## Story

As a rider,
I want to see my driver's location on a map with live ETA,
So that I know exactly when they'll arrive.

## Acceptance Criteria

1. **Given** a ride status is 'en_route' or 'arrived', **When** the rider views the ride, **Then** they see:
   - Map showing driver's current location
   - Route from driver to pickup
   - Live ETA updating every 30 seconds
   - Driver vehicle icon moving on map

2. **Given** driver location updates, **When** new position is received via real-time subscription, **Then**:
   - Map smoothly animates driver marker to new position
   - ETA recalculates based on new position
   - No jarring jumps or teleporting

3. **Given** driver arrives at pickup, **When** status changes to 'arrived', **Then**:
   - "Driver Arrived" banner displays prominently
   - Map shows driver at pickup location
   - Sound/haptic feedback (if enabled)

4. **And** real-time tracking uses:
   - Supabase Realtime subscription to `driver:{id}:location` channel
   - Query invalidation on location events
   - 30-second ETA refresh interval
   - Smooth marker animation with React Native Animated

5. **And** map component requirements:
   - Uses react-native-maps with Google Maps provider
   - Driver marker shows vehicle icon (not generic pin)
   - Pickup location marked with distinct icon
   - Route polyline showing path to pickup
   - Map auto-centers on driver with pickup in view

6. **And** accessibility requirements met:
   - ETA announced to screen readers on update
   - "Driver Arrived" announcement for VoiceOver/TalkBack
   - Map has accessibilityLabel describing driver location
   - Non-visual ETA display (text) always visible

## Tasks / Subtasks

- [x] Task 1: Create driver_locations database table and migration (AC: #4)
  - [x] Create migration `supabase/migrations/0012_driver_locations.sql`
  - [x] Define driver_locations table with id, driver_id, latitude, longitude, heading, accuracy, recorded_at
  - [x] Add index on driver_id for efficient queries
  - [x] Add RLS policies for driver write access and rider read access (when assigned)
  - [x] Generate types with `npm run db:generate`

- [x] Task 2: Install and configure react-native-maps (AC: #5)
  - [x] Install react-native-maps: `npx expo install react-native-maps`
  - [x] Configure Google Maps API key in app.config.js/app.json
  - [x] Add Google Maps iOS/Android config as needed
  - [x] Create basic map component to verify installation

- [x] Task 3: Create useDriverLocation hook with real-time subscription (AC: #1, #2, #4)
  - [x] Create `src/features/tracking/hooks/useDriverLocation.ts`
  - [x] Subscribe to Supabase Realtime `driver:{driverId}:location` channel
  - [x] Handle INSERT events for new location updates
  - [x] Return latest location with latitude, longitude, heading
  - [x] Clean up subscription on unmount
  - [x] Add unit tests for hook (10 tests)

- [x] Task 4: Create DriverTrackingMap component (AC: #1, #5, #6)
  - [x] Create `src/features/tracking/components/DriverTrackingMap.tsx`
  - [x] Display MapView with driver marker and pickup marker
  - [x] Show route polyline from driver to pickup (straight line for MVP)
  - [x] Auto-center map to show both driver and pickup with fitToCoordinates
  - [x] Add comprehensive accessibility labels
  - [x] Add unit tests for component (11 tests)

- [x] Task 5: Create ETADisplay component with auto-refresh (AC: #1, #2, #6)
  - [x] Create `src/features/tracking/components/ETADisplay.tsx`
  - [x] Calculate ETA based on distance and average speed (25 mph)
  - [x] Display time in human-readable format ("5 min", "< 1 min", "Arriving now")
  - [x] Auto-refresh calculation every 30 seconds
  - [x] Announce significant ETA changes (>= 2 min) to screen reader
  - [x] Add unit tests for component (14 tests)

- [x] Task 6: Create DriverArrivedBanner component (AC: #3, #6)
  - [x] Create `src/features/tracking/components/DriverArrivedBanner.tsx`
  - [x] Display prominent "Driver Arrived" message
  - [x] Include vehicle description reminder
  - [x] Trigger haptic feedback on arrival (expo-haptics)
  - [x] Announce arrival to screen reader
  - [x] Add unit tests for component (13 tests)

- [x] Task 7: Integrate tracking into ride detail screen (AC: #1, #2, #3)
  - [x] Update `app/rides/[id].tsx` to show tracking when status is in_progress/arrived
  - [x] Conditionally render DriverTrackingMap when tracking is active
  - [x] Show ETADisplay below map with live updates
  - [x] Show DriverArrivedBanner when status is 'arrived'
  - [x] Add connection status indicator for real-time updates
  - [x] Maintain existing DriverCard and action buttons below tracking

- [x] Task 8: Test and verify (AC: #6)
  - [x] All new components have unit tests (48 tracking tests, 319 total)
  - [x] Real-time subscription properly handles location updates
  - [x] Map renders correctly with markers and polyline
  - [x] ETA updates smoothly with 30-second refresh
  - [x] Accessibility announcements work correctly
  - [x] All touch targets 48dp+ minimum

## Dev Notes

### Critical Requirements Summary

This story implements **Real-Time Driver Tracking** with live map display and ETA updates. This is a P0 feature for rider confidence and transparency.

**FR Coverage:**

- FR11: Riders can track their driver's real-time location and estimated arrival time

**UX Philosophy:** "Transparency at every step. Riders should always know exactly when their driver will arrive without needing to call."

**References:**

- [Source: docs/epics.md#Story-2.10]
- [Source: docs/prd.md#FR11]
- [Source: docs/architecture.md#Supabase-Realtime]
- [Source: docs/architecture.md#Communication-Patterns]

### Technical Stack (MUST USE)

| Dependency              | Version   | Purpose                                    |
| ----------------------- | --------- | ------------------------------------------ |
| react-native-maps       | (install) | Map display with markers and polylines     |
| expo-location           | 19.0.8    | Already installed - location permissions   |
| @supabase/supabase-js   | 2.x       | Real-time subscriptions to driver location |
| @tanstack/react-query   | 5.x       | Query management for location data         |
| react-native-reanimated | ~4.1.1    | Smooth marker animations                   |

### File Structure Requirements

```
apps/rider/
├── app/
│   └── rides/
│       └── [id].tsx                             # MODIFY: Add tracking view
├── src/
│   ├── features/
│   │   ├── tracking/                            # NEW: Tracking feature
│   │   │   ├── components/
│   │   │   │   ├── DriverTrackingMap.tsx        # NEW: Map with driver location
│   │   │   │   ├── ETADisplay.tsx               # NEW: ETA countdown
│   │   │   │   ├── DriverArrivedBanner.tsx      # NEW: Arrival notification
│   │   │   │   ├── __tests__/
│   │   │   │   │   ├── DriverTrackingMap.test.tsx
│   │   │   │   │   ├── ETADisplay.test.tsx
│   │   │   │   │   └── DriverArrivedBanner.test.tsx
│   │   │   │   └── index.ts
│   │   │   ├── hooks/
│   │   │   │   ├── useDriverLocation.ts         # NEW: Real-time location hook
│   │   │   │   ├── __tests__/
│   │   │   │   │   └── useDriverLocation.test.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   └── rides/                               # EXISTS
│   │       └── ...
supabase/
├── migrations/
│   └── 0012_driver_locations.sql                # NEW: Driver locations table
```

### Database Schema (NEW TABLE)

```sql
-- supabase/migrations/0012_driver_locations.sql
CREATE TABLE driver_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  heading DECIMAL(5, 2),  -- Direction in degrees (0-360)
  accuracy DECIMAL(6, 2), -- GPS accuracy in meters
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT driver_locations_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES users(id)
);

-- Index for efficient lookups by driver
CREATE INDEX idx_driver_locations_driver_id ON driver_locations(driver_id);

-- Index for time-based queries
CREATE INDEX idx_driver_locations_recorded_at ON driver_locations(recorded_at DESC);

-- RLS Policies
ALTER TABLE driver_locations ENABLE ROW LEVEL SECURITY;

-- Drivers can insert/update their own location
CREATE POLICY "Drivers can manage own location"
  ON driver_locations
  FOR ALL
  USING (auth.uid() = driver_id)
  WITH CHECK (auth.uid() = driver_id);

-- Riders can read driver location when driver is assigned to their ride
CREATE POLICY "Riders can view assigned driver location"
  ON driver_locations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM rides
      WHERE rides.driver_id = driver_locations.driver_id
      AND rides.rider_id = auth.uid()
      AND rides.status IN ('assigned', 'en_route', 'arrived', 'in_progress')
    )
  );
```

### Architecture Patterns

**Supabase Realtime Channel Pattern:**

From architecture.md:

```
| Channel Pattern           | Use Case                    |
| ------------------------- | --------------------------- |
| `driver:{id}:location`    | Driver GPS updates          |
```

**useDriverLocation Hook Pattern:**

```typescript
// src/features/tracking/hooks/useDriverLocation.ts
import { useEffect, useState } from "react";
import { useSupabase } from "../../../lib/supabase";

export interface DriverLocation {
  latitude: number;
  longitude: number;
  heading: number | null;
  accuracy: number | null;
  recordedAt: string;
}

export function useDriverLocation(driverId: string | null) {
  const supabase = useSupabase();
  const [location, setLocation] = useState<DriverLocation | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!driverId) return;

    // Fetch initial location
    const fetchInitialLocation = async () => {
      const { data } = await supabase
        .from("driver_locations")
        .select("*")
        .eq("driver_id", driverId)
        .order("recorded_at", { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setLocation({
          latitude: parseFloat(data.latitude),
          longitude: parseFloat(data.longitude),
          heading: data.heading ? parseFloat(data.heading) : null,
          accuracy: data.accuracy ? parseFloat(data.accuracy) : null,
          recordedAt: data.recorded_at,
        });
      }
    };

    fetchInitialLocation();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`driver:${driverId}:location`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "driver_locations",
          filter: `driver_id=eq.${driverId}`,
        },
        (payload) => {
          const data = payload.new as any;
          setLocation({
            latitude: parseFloat(data.latitude),
            longitude: parseFloat(data.longitude),
            heading: data.heading ? parseFloat(data.heading) : null,
            accuracy: data.accuracy ? parseFloat(data.accuracy) : null,
            recordedAt: data.recorded_at,
          });
        }
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, driverId]);

  return { location, isConnected };
}
```

**DriverTrackingMap Component Pattern:**

```typescript
// src/features/tracking/components/DriverTrackingMap.tsx
import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

interface DriverTrackingMapProps {
  driverLocation: {
    latitude: number;
    longitude: number;
    heading: number | null;
  };
  pickupLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  className?: string;
}

export function DriverTrackingMap({
  driverLocation,
  pickupLocation,
  className = '',
}: DriverTrackingMapProps) {
  const mapRef = useRef<MapView>(null);

  // Animated values for smooth marker movement
  const animatedLat = useSharedValue(driverLocation.latitude);
  const animatedLng = useSharedValue(driverLocation.longitude);

  useEffect(() => {
    // Animate to new position
    animatedLat.value = withTiming(driverLocation.latitude, { duration: 1000 });
    animatedLng.value = withTiming(driverLocation.longitude, { duration: 1000 });

    // Fit map to show both markers
    mapRef.current?.fitToCoordinates(
      [
        { latitude: driverLocation.latitude, longitude: driverLocation.longitude },
        { latitude: pickupLocation.latitude, longitude: pickupLocation.longitude },
      ],
      {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      }
    );
  }, [driverLocation.latitude, driverLocation.longitude]);

  const accessibilityLabel = `Map showing your driver ${
    calculateDistance(driverLocation, pickupLocation).toFixed(1)
  } miles away from pickup location`;

  return (
    <View
      className={`h-64 overflow-hidden rounded-2xl ${className}`}
      accessibilityLabel={accessibilityLabel}
    >
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude: (driverLocation.latitude + pickupLocation.latitude) / 2,
          longitude: (driverLocation.longitude + pickupLocation.longitude) / 2,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* Driver Marker */}
        <Marker
          coordinate={{
            latitude: driverLocation.latitude,
            longitude: driverLocation.longitude,
          }}
          title="Your Driver"
          rotation={driverLocation.heading || 0}
        >
          <View className="h-10 w-10 items-center justify-center rounded-full bg-primary">
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
        >
          <View className="h-10 w-10 items-center justify-center rounded-full bg-secondary">
            <Ionicons name="location" size={24} color="white" />
          </View>
        </Marker>

        {/* Route Polyline */}
        <Polyline
          coordinates={[
            { latitude: driverLocation.latitude, longitude: driverLocation.longitude },
            { latitude: pickupLocation.latitude, longitude: pickupLocation.longitude },
          ]}
          strokeColor="#1E40AF"
          strokeWidth={3}
          lineDashPattern={[5, 5]}
        />
      </MapView>
    </View>
  );
}

function calculateDistance(
  point1: { latitude: number; longitude: number },
  point2: { latitude: number; longitude: number }
): number {
  // Haversine formula for distance calculation
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

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
```

**ETADisplay Component Pattern:**

```typescript
// src/features/tracking/components/ETADisplay.tsx
import { useEffect, useState, useCallback } from 'react';
import { View, Text, AccessibilityInfo } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ETADisplayProps {
  driverLocation: { latitude: number; longitude: number };
  pickupLocation: { latitude: number; longitude: number };
  averageSpeedMph?: number;
  refreshIntervalMs?: number;
}

export function ETADisplay({
  driverLocation,
  pickupLocation,
  averageSpeedMph = 25, // Urban driving average
  refreshIntervalMs = 30000, // 30 seconds
}: ETADisplayProps) {
  const [etaMinutes, setEtaMinutes] = useState<number>(0);
  const [lastAnnounced, setLastAnnounced] = useState<number>(0);

  const calculateETA = useCallback(() => {
    const distanceMiles = calculateDistance(driverLocation, pickupLocation);
    const timeHours = distanceMiles / averageSpeedMph;
    const timeMinutes = Math.max(1, Math.round(timeHours * 60));
    return timeMinutes;
  }, [driverLocation, pickupLocation, averageSpeedMph]);

  useEffect(() => {
    const newEta = calculateETA();
    setEtaMinutes(newEta);

    // Announce significant ETA changes to screen reader
    if (Math.abs(newEta - lastAnnounced) >= 2 || newEta <= 2) {
      AccessibilityInfo.announceForAccessibility(
        newEta <= 1
          ? 'Driver arriving in less than 1 minute'
          : `Driver arriving in approximately ${newEta} minutes`
      );
      setLastAnnounced(newEta);
    }

    // Set up refresh interval
    const interval = setInterval(() => {
      setEtaMinutes(calculateETA());
    }, refreshIntervalMs);

    return () => clearInterval(interval);
  }, [calculateETA, refreshIntervalMs, lastAnnounced]);

  const displayText = etaMinutes <= 1 ? '< 1 min' : `${etaMinutes} min`;

  return (
    <View
      className="flex-row items-center rounded-xl bg-primary/10 px-4 py-3"
      accessibilityLabel={`Estimated arrival: ${displayText}`}
      accessibilityRole="text"
    >
      <Ionicons name="time-outline" size={24} color="#1E40AF" />
      <View className="ml-3">
        <Text className="text-sm text-gray-600">Estimated Arrival</Text>
        <Text className="text-2xl font-bold text-primary">{displayText}</Text>
      </View>
    </View>
  );
}

// Haversine formula (same as above, could be shared util)
function calculateDistance(
  point1: { latitude: number; longitude: number },
  point2: { latitude: number; longitude: number }
): number {
  const R = 3959;
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

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
```

### What Already Exists (DO NOT RECREATE)

**From Story 2.8 (My Rides Screen):**

- Ride detail screen at `app/rides/[id].tsx`
- `useRide` hook with driver info
- Real-time subscription pattern in `useRides.ts`
- DriverCard component
- StatusTimeline component

**From Story 2.7 (Preferred Driver):**

- DriverCard component at `src/features/drivers/`
- Driver profile data structures

**Existing Dependencies:**

- `expo-location` (19.0.8) - already installed
- `@supabase/supabase-js` - already configured
- `react-native-reanimated` (~4.1.1) - already installed

### Previous Story Intelligence (Story 2.8)

**Key Learnings:**

- Real-time subscriptions work well with `postgres_changes` events
- Use `supabase.channel()` and `supabase.removeChannel()` for cleanup
- Query invalidation pattern: `queryClient.invalidateQueries({ queryKey: ['rides'] })`
- All touch targets 48dp+ minimum
- Use NativeWind classes exclusively

**Code Patterns from 2.8:**

- Screen wrapper: `<SafeAreaView className="flex-1 bg-background">`
- Cards: `rounded-2xl bg-white p-4 shadow-sm`
- Real-time channel naming: `rides:${userId}` or `driver:${driverId}:location`

### Git Intelligence (Recent Commits)

```
49e3b2e feat(rider): implement rider app shell and 3-tap booking flow (Stories 2.1-2.5)
```

**Commit Pattern:** `feat(rider): implement real-time driver tracking with live ETA (Story 2.10)`

### Google Maps Setup Requirements

**Android (app.json):**

```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_GOOGLE_MAPS_API_KEY"
        }
      }
    }
  }
}
```

**iOS (app.json):**

```json
{
  "expo": {
    "ios": {
      "config": {
        "googleMapsApiKey": "YOUR_GOOGLE_MAPS_API_KEY"
      }
    }
  }
}
```

**Note:** API key should come from environment variable `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`

### ETA Calculation Notes

Simple distance-based ETA is acceptable for MVP:

- Average urban speed: 25 mph
- Formula: `ETA_minutes = (distance_miles / 25) * 60`
- Round to nearest minute, minimum 1 minute

Future enhancement: Use Google Directions API for accurate traffic-aware ETA.

### Anti-Patterns to Avoid

- **DO NOT** poll for location updates - use real-time subscriptions
- **DO NOT** create jarring marker jumps - use animation
- **DO NOT** make map full-screen blocking other content
- **DO NOT** forget to clean up subscriptions on unmount
- **DO NOT** update ETA too frequently (every second) - causes UI flicker
- **DO NOT** forget accessibility announcements for screen readers
- **DO NOT** hardcode API keys - use environment variables

### Testing Checklist

- [x] Driver location subscription connects successfully
- [x] Map displays with driver and pickup markers
- [x] Driver marker renders with vehicle icon
- [x] ETA updates every 30 seconds
- [x] ETA recalculates on location change
- [x] "Driver Arrived" banner shows when status is 'arrived'
- [x] Screen reader announces ETA changes
- [x] Screen reader announces driver arrival
- [x] Map has proper accessibility label
- [x] All touch targets are 48dp+

## Dev Agent Record

### Context Reference

- docs/architecture.md (Supabase Realtime channels, Communication Patterns)
- docs/epics.md (Epic 2, Story 2.10, FR11)
- docs/prd.md (FR11 - Real-time driver tracking)
- docs/sprint-artifacts/2-8-implement-my-rides-screen-with-upcoming-rides.md (Real-time patterns)
- apps/rider/src/features/rides/ (Existing ride hooks)
- apps/rider/src/lib/supabase.ts (Supabase client)

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- Implemented real-time driver tracking with Supabase Realtime subscriptions
- Created driver_locations database table with RLS policies
- Installed react-native-maps and expo-haptics for map display and haptic feedback
- useDriverLocation hook subscribes to `driver:{id}:location` channel for live updates
- DriverTrackingMap shows driver marker with vehicle icon, pickup marker, and route polyline
- ETADisplay calculates ETA using Haversine formula with 30-second auto-refresh
- DriverArrivedBanner displays prominently with haptic feedback and screen reader announcement
- All components integrated into ride detail screen with conditional rendering based on ride status
- Connection status indicator shows when reconnecting to real-time updates
- 48 tracking-specific tests pass, 319 total tests pass
- TypeScript compiles without errors

### File List

**New Files Created:**

- `supabase/migrations/0012_driver_locations.sql` - Database migration for driver location tracking
- `apps/rider/src/features/tracking/hooks/useDriverLocation.ts` - Real-time location subscription hook
- `apps/rider/src/features/tracking/hooks/__tests__/useDriverLocation.test.ts` - Hook tests (10 tests)
- `apps/rider/src/features/tracking/hooks/index.ts` - Hooks exports
- `apps/rider/src/features/tracking/components/DriverTrackingMap.tsx` - Map component
- `apps/rider/src/features/tracking/components/__tests__/DriverTrackingMap.test.tsx` - Map tests (11 tests)
- `apps/rider/src/features/tracking/components/ETADisplay.tsx` - ETA display component
- `apps/rider/src/features/tracking/components/__tests__/ETADisplay.test.tsx` - ETA tests (14 tests)
- `apps/rider/src/features/tracking/components/DriverArrivedBanner.tsx` - Arrival banner component
- `apps/rider/src/features/tracking/components/__tests__/DriverArrivedBanner.test.tsx` - Banner tests (13 tests)
- `apps/rider/src/features/tracking/components/index.ts` - Components exports
- `apps/rider/src/features/tracking/index.ts` - Feature exports

**Modified Files:**

- `packages/shared/src/db/schema.ts` - Added driverLocations Drizzle schema
- `apps/rider/app.json` - Added Google Maps API configuration
- `apps/rider/app/rides/[id].tsx` - Integrated tracking components

## Change Log

| Date       | Change                                                            | Author                |
| ---------- | ----------------------------------------------------------------- | --------------------- |
| 2025-12-13 | Story created with comprehensive developer context by BMad Method | Create-Story Workflow |
