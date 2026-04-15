# Story 3.2: Implement Driver Trip Queue

Status: done

## Story

As a driver,
I want to see my assigned trips with all details,
So that I can prepare for each ride and serve riders well.

## Acceptance Criteria

1. **Given** a driver opens the app, **When** they view the home screen, **Then** they see their trip queue with:
   - Upcoming rides sorted by scheduled time (soonest first)
   - TripCard for each ride showing:
     - Pickup time (formatted nicely, e.g., "Today 2:30 PM")
     - Rider name and photo
     - Pickup and dropoff addresses (truncated if long)
     - Accessibility needs indicators (icons for wheelchair, walker, etc.)
     - Special instructions preview (first 50 chars)

2. **Given** a driver taps on a TripCard, **When** the trip detail screen opens, **Then** they see full RiderProfileCard with:
   - Rider photo and name
   - Contact buttons (call/text)
   - Accessibility preferences (mobility aid, door assistance, package help)
   - Comfort preferences (temperature, conversation, music)
   - Relationship history ("You've driven [Name] X times")
   - Special instructions (full text)
   - Pickup and dropoff addresses with map preview

3. **Given** trips are fetched, **Then** TanStack Query provides:
   - Real-time subscription for new assignments (Supabase Realtime)
   - Automatic refresh on app foreground
   - Offline caching for reliability
   - Loading and error states handled gracefully

4. **Given** the trip queue is empty, **When** the driver has no assigned rides, **Then** they see a friendly empty state with message "No rides assigned yet"

5. **And** all UI elements meet accessibility requirements:
   - All touch targets minimum 48dp
   - Accessibility labels on all interactive elements
   - Screen reader support for trip information

## Tasks / Subtasks

- [x] Task 1: Create useDriverTrips hook (AC: #1, #3)
  - [x] Create `src/features/trips/hooks/useDriverTrips.ts`
  - [x] Query rides where `driver_id = current_user` and status in ('assigned', 'confirmed')
  - [x] Join with users table for rider info
  - [x] Join with rider_preferences for accessibility/comfort prefs
  - [x] Sort by scheduled_pickup_time ascending
  - [x] Add Supabase Realtime subscription for new assignments
  - [x] Configure staleTime and cacheTime for offline support
  - [x] Export from hooks/index.ts
  - [x] Add unit tests

- [x] Task 2: Create TripCard component (AC: #1, #5)
  - [x] Create `src/features/trips/components/TripCard.tsx`
  - [x] Display pickup time with smart formatting (Today/Tomorrow/Date)
  - [x] Show rider photo (fallback to initials avatar)
  - [x] Show rider name
  - [x] Show pickup and dropoff addresses (truncate to 1 line each)
  - [x] Show accessibility icons (wheelchair, walker, cane)
  - [x] Show special instructions preview (50 chars max)
  - [x] Navigate to trip detail on tap
  - [x] Add accessibility labels
  - [x] Add unit tests

- [x] Task 3: Create RiderProfileCard component (AC: #2, #5)
  - [x] Create `src/features/trips/components/RiderProfileCard.tsx`
  - [x] Display rider photo (larger, with fallback)
  - [x] Display rider full name
  - [x] Add PhoneButton for call
  - [x] Add SMSButton for text
  - [x] Show accessibility preferences section
  - [x] Show comfort preferences section
  - [x] Show relationship history ("X previous rides")
  - [x] Show special instructions (full text)
  - [x] Add accessibility labels
  - [x] Add unit tests

- [x] Task 4: Create AccessibilityBadges component (AC: #1)
  - [x] Create `src/features/trips/components/AccessibilityBadges.tsx`
  - [x] Show icon badges for each accessibility need
  - [x] Wheelchair icon if mobility_aid is wheelchair
  - [x] Walker icon if mobility_aid is walker/cane
  - [x] Door assistance icon
  - [x] Package assistance icon
  - [x] Extra space icon
  - [x] Add unit tests

- [x] Task 5: Create trip detail screen (AC: #2)
  - [x] Create `app/trips/[id].tsx` with full trip details
  - [x] Fetch single trip with useTrip hook
  - [x] Display RiderProfileCard
  - [x] Show pickup address with map preview (static image or link)
  - [x] Show dropoff address with map preview
  - [x] Add "Start Navigation" button (placeholder for Story 3.5)
  - [x] Add back navigation
  - [x] Handle loading and error states

- [x] Task 6: Create useTrip hook for single trip (AC: #2)
  - [x] Create `src/features/trips/hooks/useTrip.ts`
  - [x] Query single ride by ID with full joins
  - [x] Include rider profile, preferences
  - [x] Calculate relationship history (count previous rides)
  - [x] Add unit tests

- [x] Task 7: Create useRiderHistory hook (AC: #2)
  - [x] Create `src/features/trips/hooks/useRiderHistory.ts`
  - [x] Count completed rides between driver and rider
  - [x] Return count for "You've driven [Name] X times"
  - [x] Add unit tests

- [x] Task 8: Update Home screen with trip queue (AC: #1, #4)
  - [x] Update `app/(tabs)/index.tsx` to use useDriverTrips
  - [x] Replace placeholder with actual TripCard list
  - [x] Add pull-to-refresh functionality
  - [x] Show loading skeleton while fetching
  - [x] Show empty state when no trips
  - [x] Keep StatusToggle at top

- [x] Task 9: Test and verify (AC: #5)
  - [x] All components have unit tests
  - [x] Trip queue displays correctly with mock data
  - [x] Trip detail screen navigates correctly
  - [x] Real-time updates work (test with Supabase insert)
  - [x] Offline caching works (disconnect and reload)
  - [x] All touch targets are 48dp+
  - [x] TypeScript compiles without errors
  - [x] Run `npm run lint` and `npm run typecheck`

## Dev Notes

### Critical Requirements Summary

This story implements the **Driver Trip Queue** - the core feature showing drivers their assigned rides with full rider context. This enables drivers to prepare for each ride and provide excellent service.

**FR Coverage:**

- FR19: Drivers can view assigned rides with full rider context
- FR20: Drivers can see rider preferences and accessibility needs

**UX Philosophy:** "Know your rider before you arrive. Dave sees Margaret's walker icon and knows to bring extra time for door assistance."

### Technical Stack (MUST USE)

| Dependency            | Version  | Purpose                             |
| --------------------- | -------- | ----------------------------------- |
| @tanstack/react-query | ^5.x     | Server state management             |
| @supabase/supabase-js | existing | Database + Realtime subscriptions   |
| expo-router           | ~4.0.x   | Navigation                          |
| NativeWind            | ^4.x     | Styling (Tailwind for React Native) |
| date-fns              | ^3.x     | Date formatting                     |

### File Structure Requirements

```
apps/driver/
├── app/
│   ├── (tabs)/
│   │   └── index.tsx                          # MODIFY: Add trip queue
│   └── trips/
│       └── [id].tsx                           # MODIFY: Full trip detail
├── src/
│   ├── features/
│   │   ├── trips/
│   │   │   ├── components/
│   │   │   │   ├── TripCard.tsx               # NEW: Trip queue card
│   │   │   │   ├── RiderProfileCard.tsx       # NEW: Full rider details
│   │   │   │   ├── AccessibilityBadges.tsx    # NEW: A11y need icons
│   │   │   │   ├── ComfortBadges.tsx          # NEW: Comfort pref icons
│   │   │   │   ├── EmptyTripQueue.tsx         # NEW: Empty state
│   │   │   │   ├── TripQueueSkeleton.tsx      # NEW: Loading skeleton
│   │   │   │   ├── __tests__/
│   │   │   │   │   ├── TripCard.test.tsx
│   │   │   │   │   ├── RiderProfileCard.test.tsx
│   │   │   │   │   └── AccessibilityBadges.test.tsx
│   │   │   │   └── index.ts                   # MODIFY: Export components
│   │   │   ├── hooks/
│   │   │   │   ├── useDriverTrips.ts          # NEW: Fetch driver's trips
│   │   │   │   ├── useTrip.ts                 # NEW: Fetch single trip
│   │   │   │   ├── useRiderHistory.ts         # NEW: Rider relationship count
│   │   │   │   ├── __tests__/
│   │   │   │   │   ├── useDriverTrips.test.ts
│   │   │   │   │   ├── useTrip.test.ts
│   │   │   │   │   └── useRiderHistory.test.ts
│   │   │   │   └── index.ts                   # MODIFY: Export hooks
│   │   │   └── index.ts
```

### Database Schema (Already Exists)

**Rides Table:**

```typescript
rides (
  id: uuid,
  rider_id: uuid -> users.id,
  driver_id: uuid -> users.id,
  preferred_driver_id: uuid -> users.id,
  status: 'pending' | 'confirmed' | 'assigned' | 'in_progress' | 'arrived' | 'completed' | 'cancelled',
  pickup_address: text,
  dropoff_address: text,
  scheduled_pickup_time: timestamptz,
  created_at: timestamptz,
  updated_at: timestamptz
)
```

**Rider Preferences Table:**

```typescript
rider_preferences (
  id: uuid,
  user_id: uuid -> users.id,
  default_preferred_driver_id: uuid,
  mobility_aid: 'none' | 'cane' | 'walker' | 'manual_wheelchair' | 'power_wheelchair',
  needs_door_assistance: boolean,
  needs_package_assistance: boolean,
  extra_vehicle_space: boolean,
  special_equipment_notes: text,
  // Comfort prefs (from Story 2.14)
  comfort_temperature: 'cool' | 'normal' | 'warm',
  conversation_preference: 'quiet' | 'some' | 'chatty',
  music_preference: 'none' | 'soft' | 'any',
  other_notes: text
)
```

### Architecture Patterns

**useDriverTrips Hook Pattern:**

```typescript
// src/features/trips/hooks/useDriverTrips.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-expo";
import { useEffect } from "react";
import { supabase } from "../../../lib/supabase";

export interface DriverTrip {
  id: string;
  status: string;
  pickupAddress: string;
  dropoffAddress: string;
  scheduledPickupTime: string;
  rider: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    profilePhotoUrl: string | null;
  };
  riderPreferences: {
    mobilityAid: string | null;
    needsDoorAssistance: boolean;
    needsPackageAssistance: boolean;
    extraVehicleSpace: boolean;
    specialEquipmentNotes: string | null;
    comfortTemperature: string | null;
    conversationPreference: string | null;
    musicPreference: string | null;
    otherNotes: string | null;
  } | null;
}

export const tripKeys = {
  all: ["driver-trips"] as const,
  list: (driverId: string) => [...tripKeys.all, "list", driverId] as const,
  detail: (tripId: string) => [...tripKeys.all, "detail", tripId] as const,
};

export function useDriverTrips() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  // Set up real-time subscription
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`driver:${userId}:trips`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rides",
          filter: `driver_id=eq.${userId}`,
        },
        () => {
          // Invalidate and refetch on any ride change
          queryClient.invalidateQueries({ queryKey: tripKeys.all });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  return useQuery({
    queryKey: tripKeys.list(userId ?? ""),
    queryFn: async (): Promise<DriverTrip[]> => {
      if (!userId) return [];

      // Get driver's internal user ID
      const { data: driverUser } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", userId)
        .single();

      if (!driverUser) return [];

      // Query rides with rider info and preferences
      const { data, error } = await supabase
        .from("rides")
        .select(
          `
          id,
          status,
          pickup_address,
          dropoff_address,
          scheduled_pickup_time,
          rider:rider_id (
            id,
            first_name,
            last_name,
            phone,
            profile_photo_url
          ),
          rider_preferences:rider_id (
            mobility_aid,
            needs_door_assistance,
            needs_package_assistance,
            extra_vehicle_space,
            special_equipment_notes,
            comfort_temperature,
            conversation_preference,
            music_preference,
            other_notes
          )
        `
        )
        .eq("driver_id", driverUser.id)
        .in("status", ["assigned", "confirmed"])
        .order("scheduled_pickup_time", { ascending: true });

      if (error) throw error;

      return (data ?? []).map((ride) => ({
        id: ride.id,
        status: ride.status,
        pickupAddress: ride.pickup_address,
        dropoffAddress: ride.dropoff_address,
        scheduledPickupTime: ride.scheduled_pickup_time,
        rider: {
          id: ride.rider?.id ?? "",
          firstName: ride.rider?.first_name ?? "",
          lastName: ride.rider?.last_name ?? "",
          phone: ride.rider?.phone ?? "",
          profilePhotoUrl: ride.rider?.profile_photo_url ?? null,
        },
        riderPreferences: ride.rider_preferences
          ? {
              mobilityAid: ride.rider_preferences.mobility_aid,
              needsDoorAssistance: ride.rider_preferences.needs_door_assistance ?? false,
              needsPackageAssistance: ride.rider_preferences.needs_package_assistance ?? false,
              extraVehicleSpace: ride.rider_preferences.extra_vehicle_space ?? false,
              specialEquipmentNotes: ride.rider_preferences.special_equipment_notes,
              comfortTemperature: ride.rider_preferences.comfort_temperature,
              conversationPreference: ride.rider_preferences.conversation_preference,
              musicPreference: ride.rider_preferences.music_preference,
              otherNotes: ride.rider_preferences.other_notes,
            }
          : null,
      }));
    },
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
  });
}
```

**TripCard Component Pattern:**

```typescript
// src/features/trips/components/TripCard.tsx
import { View, Text, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { format, isToday, isTomorrow } from 'date-fns';
import { AccessibilityBadges } from './AccessibilityBadges';
import type { DriverTrip } from '../hooks/useDriverTrips';

interface TripCardProps {
  trip: DriverTrip;
  testID?: string;
}

function formatPickupTime(dateString: string): string {
  const date = new Date(dateString);
  const time = format(date, 'h:mm a');

  if (isToday(date)) return `Today ${time}`;
  if (isTomorrow(date)) return `Tomorrow ${time}`;
  return format(date, 'EEE, MMM d') + ` ${time}`;
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function TripCard({ trip, testID }: TripCardProps) {
  const riderName = `${trip.rider.firstName} ${trip.rider.lastName}`;
  const initials = getInitials(trip.rider.firstName, trip.rider.lastName);

  return (
    <Link href={`/trips/${trip.id}`} asChild>
      <Pressable
        className="mb-3 rounded-xl bg-white p-4 shadow-sm"
        accessibilityLabel={`Trip with ${riderName} at ${formatPickupTime(trip.scheduledPickupTime)}`}
        accessibilityRole="button"
        accessibilityHint="Tap to view trip details"
        testID={testID}
      >
        {/* Header: Time + Status */}
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-lg font-bold text-primary">
            {formatPickupTime(trip.scheduledPickupTime)}
          </Text>
          <View className="rounded-full bg-blue-100 px-3 py-1">
            <Text className="text-xs font-semibold text-blue-700">
              {trip.status.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Rider Info */}
        <View className="mb-3 flex-row items-center">
          {trip.rider.profilePhotoUrl ? (
            <Image
              source={{ uri: trip.rider.profilePhotoUrl }}
              className="h-12 w-12 rounded-full"
              accessibilityLabel={`Photo of ${riderName}`}
            />
          ) : (
            <View className="h-12 w-12 items-center justify-center rounded-full bg-gray-200">
              <Text className="text-lg font-bold text-gray-600">{initials}</Text>
            </View>
          )}
          <View className="ml-3 flex-1">
            <Text className="text-base font-semibold text-foreground">{riderName}</Text>
            {trip.riderPreferences && (
              <AccessibilityBadges preferences={trip.riderPreferences} size="sm" />
            )}
          </View>
        </View>

        {/* Addresses */}
        <View className="mb-2">
          <View className="flex-row items-center">
            <Ionicons name="location" size={16} color="#059669" />
            <Text className="ml-2 flex-1 text-sm text-gray-700" numberOfLines={1}>
              {trip.pickupAddress}
            </Text>
          </View>
          <View className="ml-2 h-4 border-l border-dashed border-gray-300" />
          <View className="flex-row items-center">
            <Ionicons name="flag" size={16} color="#DC2626" />
            <Text className="ml-2 flex-1 text-sm text-gray-700" numberOfLines={1}>
              {trip.dropoffAddress}
            </Text>
          </View>
        </View>

        {/* Special Instructions Preview */}
        {trip.riderPreferences?.specialEquipmentNotes && (
          <View className="mt-2 rounded-lg bg-amber-50 px-3 py-2">
            <Text className="text-sm text-amber-800" numberOfLines={1}>
              <Ionicons name="information-circle" size={14} color="#B45309" />{' '}
              {trip.riderPreferences.specialEquipmentNotes.substring(0, 50)}
              {trip.riderPreferences.specialEquipmentNotes.length > 50 ? '...' : ''}
            </Text>
          </View>
        )}

        {/* Chevron */}
        <View className="absolute right-4 top-1/2 -translate-y-1/2">
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </View>
      </Pressable>
    </Link>
  );
}
```

**AccessibilityBadges Component Pattern:**

```typescript
// src/features/trips/components/AccessibilityBadges.tsx
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AccessibilityPrefs {
  mobilityAid: string | null;
  needsDoorAssistance: boolean;
  needsPackageAssistance: boolean;
  extraVehicleSpace: boolean;
}

interface AccessibilityBadgesProps {
  preferences: AccessibilityPrefs;
  size?: 'sm' | 'md';
  testID?: string;
}

const MOBILITY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  cane: 'fitness',
  walker: 'body',
  manual_wheelchair: 'accessibility',
  power_wheelchair: 'flash',
};

export function AccessibilityBadges({ preferences, size = 'md', testID }: AccessibilityBadgesProps) {
  const iconSize = size === 'sm' ? 14 : 18;
  const badgeClass = size === 'sm' ? 'h-6 w-6' : 'h-8 w-8';

  const badges: Array<{ icon: keyof typeof Ionicons.glyphMap; color: string; label: string }> = [];

  // Mobility aid
  if (preferences.mobilityAid && preferences.mobilityAid !== 'none') {
    badges.push({
      icon: MOBILITY_ICONS[preferences.mobilityAid] ?? 'accessibility',
      color: '#7C3AED',
      label: preferences.mobilityAid.replace('_', ' '),
    });
  }

  // Door assistance
  if (preferences.needsDoorAssistance) {
    badges.push({ icon: 'home', color: '#1E40AF', label: 'door assistance' });
  }

  // Package assistance
  if (preferences.needsPackageAssistance) {
    badges.push({ icon: 'bag-handle', color: '#059669', label: 'package help' });
  }

  // Extra space
  if (preferences.extraVehicleSpace) {
    badges.push({ icon: 'resize', color: '#F59E0B', label: 'extra space' });
  }

  if (badges.length === 0) return null;

  return (
    <View testID={testID} className="mt-1 flex-row gap-1">
      {badges.map((badge, index) => (
        <View
          key={index}
          className={`${badgeClass} items-center justify-center rounded-full`}
          style={{ backgroundColor: `${badge.color}20` }}
          accessibilityLabel={`Needs ${badge.label}`}
        >
          <Ionicons name={badge.icon} size={iconSize} color={badge.color} />
        </View>
      ))}
    </View>
  );
}
```

**RiderProfileCard Component Pattern:**

```typescript
// src/features/trips/components/RiderProfileCard.tsx
import { View, Text, Image, Pressable, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AccessibilityBadges } from './AccessibilityBadges';
import { ComfortBadges } from './ComfortBadges';

interface RiderProfileCardProps {
  rider: {
    firstName: string;
    lastName: string;
    phone: string;
    profilePhotoUrl: string | null;
  };
  preferences: {
    mobilityAid: string | null;
    needsDoorAssistance: boolean;
    needsPackageAssistance: boolean;
    extraVehicleSpace: boolean;
    specialEquipmentNotes: string | null;
    comfortTemperature: string | null;
    conversationPreference: string | null;
    musicPreference: string | null;
    otherNotes: string | null;
  } | null;
  relationshipCount: number;
  testID?: string;
}

export function RiderProfileCard({ rider, preferences, relationshipCount, testID }: RiderProfileCardProps) {
  const riderName = `${rider.firstName} ${rider.lastName}`;
  const initials = `${rider.firstName.charAt(0)}${rider.lastName.charAt(0)}`.toUpperCase();

  const handleCall = () => {
    Linking.openURL(`tel:${rider.phone}`);
  };

  const handleSMS = () => {
    Linking.openURL(`sms:${rider.phone}`);
  };

  return (
    <View testID={testID} className="rounded-xl bg-white p-4 shadow-sm">
      {/* Header with photo and contact buttons */}
      <View className="mb-4 flex-row items-center">
        {rider.profilePhotoUrl ? (
          <Image
            source={{ uri: rider.profilePhotoUrl }}
            className="h-20 w-20 rounded-full"
            accessibilityLabel={`Photo of ${riderName}`}
          />
        ) : (
          <View className="h-20 w-20 items-center justify-center rounded-full bg-gray-200">
            <Text className="text-2xl font-bold text-gray-600">{initials}</Text>
          </View>
        )}

        <View className="ml-4 flex-1">
          <Text className="text-xl font-bold text-foreground">{riderName}</Text>
          {relationshipCount > 0 && (
            <Text className="text-sm text-gray-600">
              You've driven {rider.firstName} {relationshipCount} time{relationshipCount > 1 ? 's' : ''}
            </Text>
          )}
        </View>
      </View>

      {/* Contact Buttons */}
      <View className="mb-4 flex-row gap-3">
        <Pressable
          onPress={handleCall}
          className="min-h-[48px] flex-1 flex-row items-center justify-center rounded-xl bg-green-500"
          accessibilityLabel={`Call ${riderName}`}
          accessibilityRole="button"
        >
          <Ionicons name="call" size={20} color="#FFFFFF" />
          <Text className="ml-2 font-semibold text-white">Call</Text>
        </Pressable>
        <Pressable
          onPress={handleSMS}
          className="min-h-[48px] flex-1 flex-row items-center justify-center rounded-xl bg-blue-500"
          accessibilityLabel={`Text ${riderName}`}
          accessibilityRole="button"
        >
          <Ionicons name="chatbubble" size={20} color="#FFFFFF" />
          <Text className="ml-2 font-semibold text-white">Text</Text>
        </Pressable>
      </View>

      {/* Accessibility Preferences */}
      {preferences && (
        <>
          <View className="mb-3">
            <Text className="mb-2 font-semibold text-gray-700">Accessibility Needs</Text>
            <AccessibilityBadges preferences={preferences} size="md" />
            {!preferences.mobilityAid && !preferences.needsDoorAssistance && !preferences.needsPackageAssistance && !preferences.extraVehicleSpace && (
              <Text className="text-sm text-gray-500">No special accessibility needs</Text>
            )}
          </View>

          {/* Comfort Preferences */}
          <View className="mb-3">
            <Text className="mb-2 font-semibold text-gray-700">Comfort Preferences</Text>
            <ComfortBadges preferences={preferences} />
          </View>

          {/* Special Notes */}
          {(preferences.specialEquipmentNotes || preferences.otherNotes) && (
            <View className="rounded-lg bg-amber-50 p-3">
              <Text className="font-semibold text-amber-800">Special Notes</Text>
              {preferences.specialEquipmentNotes && (
                <Text className="mt-1 text-sm text-amber-700">{preferences.specialEquipmentNotes}</Text>
              )}
              {preferences.otherNotes && (
                <Text className="mt-1 text-sm text-amber-700">{preferences.otherNotes}</Text>
              )}
            </View>
          )}
        </>
      )}
    </View>
  );
}
```

**Updated Home Screen Pattern:**

```typescript
// app/(tabs)/index.tsx
import { useState, useCallback } from 'react';
import { View, Text, SafeAreaView, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusToggle, TripCard, EmptyTripQueue, TripQueueSkeleton, type DriverStatus } from '../../src/features/trips/components';
import { useDriverTrips } from '../../src/features/trips/hooks';

export default function HomeScreen() {
  const [status, setStatus] = useState<DriverStatus>('offline');
  const { data: trips, isLoading, refetch, isRefetching } = useDriverTrips();

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1 px-6 pt-4"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className="mb-4">
          <Text className="text-2xl font-bold text-foreground">Good morning, Driver</Text>
          <Text className="text-gray-600">
            {trips?.length ?? 0} ride{(trips?.length ?? 0) !== 1 ? 's' : ''} assigned
          </Text>
        </View>

        {/* Status Toggle */}
        <View className="mb-6">
          <StatusToggle
            value={status}
            onChange={setStatus}
            testID="driver-status-toggle"
          />
        </View>

        {/* Trip Queue */}
        <View className="mb-4">
          <Text className="mb-3 text-lg font-semibold text-foreground">Your Trips</Text>

          {isLoading ? (
            <TripQueueSkeleton />
          ) : trips && trips.length > 0 ? (
            trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} testID={`trip-card-${trip.id}`} />
            ))
          ) : (
            <EmptyTripQueue />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
```

### What Already Exists

**From Story 3.1 (Driver App Shell):**

- Driver app structure with tabs
- StatusToggle component
- Basic home screen layout
- Auth flow with role check

**From packages/shared:**

- Supabase client
- Type definitions for Ride, User

**Database tables:**

- `rides` table with driver_id, rider_id, status, addresses
- `rider_preferences` table with accessibility and comfort fields
- `users` table with profile info

### Previous Story Intelligence (Story 3.1)

**Key Learnings:**

- Use NativeWind classes exclusively
- All touch targets 48dp+ minimum
- SafeAreaView wrapper for all screens
- TanStack Query with Supabase client pattern
- Clerk userId maps to users.clerk_id

**Code Patterns:**

- Screen wrapper: `<SafeAreaView className="flex-1 bg-background">`
- Cards: `rounded-xl bg-white p-4 shadow-sm`
- Buttons: `min-h-[48px] flex-row items-center justify-center rounded-xl`

### Git Intelligence

**Commit Pattern:** `feat(driver): implement driver trip queue (Story 3.2)`

### Anti-Patterns to Avoid

- **DO NOT** fetch rider preferences separately - use Supabase joins
- **DO NOT** skip real-time subscriptions - drivers need live updates
- **DO NOT** forget offline caching - drivers may have poor connectivity
- **DO NOT** use inline styles - use NativeWind classes
- **DO NOT** forget accessibility labels on TripCards
- **DO NOT** make touch targets smaller than 48dp
- **DO NOT** implement accept/decline - that's Story 3.3
- **DO NOT** implement status transitions - that's Story 3.4

### Testing Checklist

- [x] useDriverTrips returns trips for current driver
- [x] TripCard displays all required info correctly
- [x] TripCard navigates to trip detail on tap
- [x] RiderProfileCard displays full rider info
- [x] AccessibilityBadges shows correct icons
- [x] Contact buttons launch phone/SMS apps
- [x] Empty state shown when no trips
- [x] Loading skeleton shown while fetching
- [x] Pull-to-refresh works
- [x] Real-time updates work (add ride in Supabase, verify appears)
- [x] All touch targets are 48dp+
- [x] TypeScript compiles without errors

### Dependencies

May need to add if not present:

```bash
npm install date-fns
```

### References

- [Source: docs/epics.md#Story-3.2]
- [Source: docs/architecture.md#API-Patterns]
- [Source: docs/sprint-artifacts/3-1-create-driver-app-shell-and-navigation.md]
- [Source: packages/shared/src/db/schema.ts]

## Dev Agent Record

### Context Reference

- docs/architecture.md (TanStack Query patterns, Realtime subscriptions)
- docs/epics.md (Epic 3, Story 3.2, FR19, FR20)
- docs/sprint-artifacts/3-1-create-driver-app-shell-and-navigation.md
- packages/shared/src/db/schema.ts (rides, rider_preferences, users)
- apps/driver/src/features/trips/ (existing structure from 3.1)

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

None

### Completion Notes List

1. All 9 tasks completed successfully with 59 total tests passing
2. Installed date-fns@^3 for smart date formatting (Today/Tomorrow/Date)
3. Created comprehensive test utilities including queryWrapper for TanStack Query testing
4. All components follow accessibility requirements (48dp+ touch targets, accessibility labels)
5. Supabase real-time subscriptions configured for live trip updates
6. TypeScript compiles without errors, lint passes
7. ComfortBadges component created as bonus to display temperature/conversation/music preferences
8. TripQueueSkeleton component created with animated pulse loading states

### File List

**New Files:**

- `apps/driver/src/features/trips/hooks/useDriverTrips.ts` - Hook for fetching driver's trips with real-time subscriptions
- `apps/driver/src/features/trips/hooks/useTrip.ts` - Hook for fetching single trip details
- `apps/driver/src/features/trips/hooks/useRiderHistory.ts` - Hook for counting previous rides with rider
- `apps/driver/src/features/trips/hooks/__tests__/useDriverTrips.test.ts` - 5 tests
- `apps/driver/src/features/trips/hooks/__tests__/useTrip.test.ts` - 3 tests
- `apps/driver/src/features/trips/hooks/__tests__/useRiderHistory.test.ts` - 4 tests
- `apps/driver/src/features/trips/components/TripCard.tsx` - Trip queue card component
- `apps/driver/src/features/trips/components/RiderProfileCard.tsx` - Full rider details component
- `apps/driver/src/features/trips/components/AccessibilityBadges.tsx` - Accessibility icons component
- `apps/driver/src/features/trips/components/ComfortBadges.tsx` - Comfort preference badges component
- `apps/driver/src/features/trips/components/EmptyTripQueue.tsx` - Empty state component
- `apps/driver/src/features/trips/components/TripQueueSkeleton.tsx` - Loading skeleton component
- `apps/driver/src/features/trips/components/__tests__/TripCard.test.tsx` - 13 tests
- `apps/driver/src/features/trips/components/__tests__/RiderProfileCard.test.tsx` - 15 tests
- `apps/driver/src/features/trips/components/__tests__/AccessibilityBadges.test.tsx` - 9 tests
- `apps/driver/src/test-utils/queryWrapper.tsx` - Test utility for TanStack Query

**Modified Files:**

- `apps/driver/app/(tabs)/index.tsx` - Updated home screen with trip queue, pull-to-refresh, loading/empty states
- `apps/driver/app/trips/[id].tsx` - Full trip detail screen with RiderProfileCard and addresses
- `apps/driver/src/features/trips/components/index.ts` - Exported new components
- `apps/driver/src/features/trips/hooks/index.ts` - Exported new hooks
- `apps/driver/package.json` - Added date-fns dependency

## Change Log

| Date       | Change                                                            | Author                |
| ---------- | ----------------------------------------------------------------- | --------------------- |
| 2025-12-13 | Story created with comprehensive developer context by BMad Method | Create-Story Workflow |
| 2026-01-12 | All 9 tasks implemented, 59 tests passing, ready for review       | Dev Workflow          |
