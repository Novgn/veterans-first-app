# Story 2.5: Implement 3-Tap Booking Flow - Confirmation (Tap 3)

Status: ready-for-dev

## Story

As a rider,
I want to see a clear summary and confirm my booking with one tap,
So that I know exactly what I'm booking and feel confident.

## Acceptance Criteria

1. **Given** a rider has selected destination and time, **When** they reach Step 3, **Then** they see a confirmation screen with:
   - Route summary (pickup → destination)
   - Date and time of ride
   - Price with PriceLockBadge ("$45 locked. No surge. Ever.")
   - Wait time included ("20 min wait time included")
   - Preferred driver (if any previously set)
   - Large "Book This Ride" button (56dp height)

2. **Given** the price is calculated, **Then** the system uses the `calculate-price` Edge Function with:
   - Base rate from system config
   - Distance calculation via Google Distance Matrix API
   - Time of day adjustments (if any)
   - NO surge pricing ever

3. **Given** a rider taps "Book This Ride", **When** the booking is submitted, **Then** the `book-ride` Edge Function:
   - Creates ride record in database
   - Sets status to 'booked'
   - Creates recurring ride records if applicable
   - Returns confirmation

4. **And** the rider sees:
   - Success screen with celebration feedback
   - Ride confirmation number
   - 60-second undo button
   - "Add to Calendar" option

5. **And** accessibility requirements met:
   - All touch targets are 48dp+
   - Screen reader labels on all interactive elements
   - Color contrast 7:1 ratio
   - Works with 200% font scaling

## Tasks / Subtasks

- [ ] Task 1: Create PriceLockBadge component (AC: #1)
  - [ ] Create `src/features/booking/components/PriceLockBadge.tsx`
  - [ ] Display price with "$XX locked" text
  - [ ] Include "No surge. Ever." tagline
  - [ ] Use accent gold color (#D97706) for badge styling
  - [ ] Add shield/lock icon for visual trust indicator
  - [ ] accessibilityLabel: "Price locked at $XX. No surge pricing, ever"

- [ ] Task 2: Create WaitTimeIndicator component (AC: #1)
  - [ ] Create `src/features/booking/components/WaitTimeIndicator.tsx`
  - [ ] Display "20 min wait time included" with clock icon
  - [ ] Calming green color (#059669) to reinforce patience
  - [ ] Senior-friendly 18px+ text size

- [ ] Task 3: Create RideSummaryCard component (AC: #1)
  - [ ] Create `src/features/booking/components/RideSummaryCard.tsx`
  - [ ] Show pickup location (from bookingStore.pickupDestination or default home)
  - [ ] Show destination (from bookingStore.dropoffDestination)
  - [ ] Show selected date and time (from bookingStore)
  - [ ] Show recurring schedule if applicable
  - [ ] Visual route indicator (origin dot → line → destination dot)
  - [ ] Card with 16px radius, 20px padding per UX spec

- [ ] Task 4: Create confirm.tsx screen (AC: #1, #3, #4)
  - [ ] Create `apps/rider/app/booking/confirm.tsx`
  - [ ] Display StepIndicator with currentStep=3
  - [ ] Show RideSummaryCard with all booking details
  - [ ] Display PriceLockBadge (mock price: $45 for MVP)
  - [ ] Display WaitTimeIndicator (20 min default)
  - [ ] Large "Book This Ride" button at bottom
  - [ ] Handle booking submission via bookRide mutation
  - [ ] Navigate to success screen on completion

- [ ] Task 5: Create BookingSuccessScreen component (AC: #4)
  - [ ] Create `src/features/booking/components/BookingSuccessScreen.tsx`
  - [ ] Green checkmark celebration animation
  - [ ] Display confirmation number (UUID truncated)
  - [ ] "Your ride is booked!" heading
  - [ ] Show ride summary (date, time, destination)
  - [ ] 60-second UndoButton component
  - [ ] "Add to Calendar" button (Expo Calendar integration)
  - [ ] "Done" button returns to Home tab

- [ ] Task 6: Create UndoButton component (AC: #4)
  - [ ] Create `src/features/booking/components/UndoButton.tsx`
  - [ ] 60-second countdown timer display
  - [ ] "Undo" text with countdown (e.g., "Undo (45s)")
  - [ ] On press: calls cancel-ride Edge Function
  - [ ] Auto-hides after 60 seconds
  - [ ] Toast confirmation on successful undo

- [ ] Task 7: Update booking/\_layout.tsx for confirm route (AC: #1)
  - [ ] Add Stack.Screen for "confirm" route
  - [ ] Maintain slide_from_right animation

- [ ] Task 8: Create useBookRide mutation hook (AC: #2, #3)
  - [ ] Create `src/features/booking/hooks/useBookRide.ts`
  - [ ] Calls `book-ride` Edge Function (or direct Supabase insert for MVP)
  - [ ] Accepts BookingRequest: riderId, pickup, dropoff, scheduledTime, isRecurring, recurringPattern
  - [ ] Returns mutation with isLoading, error, data states
  - [ ] Invalidates rides query cache on success
  - [ ] Handles optimistic updates for responsive UI

- [ ] Task 9: Extend bookingStore with booking result (AC: #3, #4)
  - [ ] Add `lastBookingId: string | null` state
  - [ ] Add `lastBookingConfirmation: BookingConfirmation | null`
  - [ ] Add `setLastBookingResult` action
  - [ ] Clear on resetBooking

- [ ] Task 10: Test and verify accessibility (AC: #5)
  - [ ] Verify all touch targets are 48dp+
  - [ ] Add accessibilityLabel to all interactive elements
  - [ ] Test with larger font sizes (200% scaling)
  - [ ] Verify color contrast meets 7:1 ratio
  - [ ] Unit tests for PriceLockBadge, RideSummaryCard, BookingSuccessScreen

## Dev Notes

### Critical Requirements Summary

This story implements the third and final tap of the signature **3-Tap Booking Flow** - the core UX differentiator for Veterans 1st. The confirmation screen must build trust through clarity and transparency - price locked, wait time included, no surprises.

**FR Coverage:** FR1 (book a one-time ride), FR2 (book recurring rides), FR4 (view exact price before confirming)

**References:**

- [Source: docs/epics.md#Story-2.5]
- [Source: docs/prd.md#FR1] - Book a one-time ride
- [Source: docs/prd.md#FR2] - Book recurring rides
- [Source: docs/prd.md#FR4] - View exact price before confirming
- [Source: docs/ux-design-specification.md#3-Tap-Booking-Flow]
- [Source: docs/architecture.md#Frontend-Architecture]

### Technical Stack (MUST USE)

| Dependency              | Version | Purpose                                     |
| ----------------------- | ------- | ------------------------------------------- |
| expo-router             | ~6.0.10 | File-based navigation for booking flow      |
| @expo/vector-icons      | ^15.0.2 | Icons (Ionicons - shield, checkmark, clock) |
| nativewind              | 4.2.1   | Tailwind styling (NativeWind classes ONLY)  |
| zustand                 | 5.0.9   | Booking state management                    |
| @tanstack/react-query   | 5.x     | Server state, mutations, cache invalidation |
| react-native-reanimated | ~4.1.1  | Success celebration animation               |
| expo-calendar           | ~14.x   | Add to calendar integration (optional)      |

**NO external confirmation or pricing libraries needed** - build custom components with senior-friendly UX.

### File Structure Requirements

```
apps/rider/
├── app/
│   └── booking/
│       ├── _layout.tsx           # MODIFY - Add confirm route
│       ├── index.tsx             # EXISTS - Step 1: Destination Selection
│       ├── time.tsx              # EXISTS - Step 2: Time Selection
│       └── confirm.tsx           # NEW - Step 3: Booking Confirmation (this story)
├── src/
│   ├── features/
│   │   └── booking/
│   │       ├── components/
│   │       │   ├── PriceLockBadge.tsx        # NEW: Trust indicator with price
│   │       │   ├── WaitTimeIndicator.tsx     # NEW: Patience messaging
│   │       │   ├── RideSummaryCard.tsx       # NEW: Route/time summary
│   │       │   ├── BookingSuccessScreen.tsx  # NEW: Celebration + undo
│   │       │   ├── UndoButton.tsx            # NEW: 60-second undo
│   │       │   └── index.ts                  # MODIFY: Export new components
│   │       ├── hooks/
│   │       │   ├── useBookRide.ts            # NEW: Booking mutation
│   │       │   └── index.ts                  # MODIFY: Export hooks
│   │       └── index.ts                      # MODIFY: Re-export all
│   └── stores/
│       └── bookingStore.ts       # MODIFY: Add booking result state
```

### Implementation Patterns

**PriceLockBadge Component Pattern:**

```typescript
// src/features/booking/components/PriceLockBadge.tsx
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PriceLockBadgeProps {
  priceCents: number;
  className?: string;
}

export function PriceLockBadge({ priceCents, className }: PriceLockBadgeProps) {
  const priceFormatted = `$${(priceCents / 100).toFixed(0)}`;

  return (
    <View
      className={`flex-row items-center rounded-xl bg-accent/10 px-4 py-3 ${className}`}
      accessibilityLabel={`Price locked at ${priceFormatted}. No surge pricing, ever`}
      accessibilityRole="text"
    >
      <Ionicons name="shield-checkmark" size={24} color="#D97706" />
      <View className="ml-3">
        <Text className="text-xl font-bold text-foreground">
          {priceFormatted} <Text className="text-lg font-semibold text-accent">locked</Text>
        </Text>
        <Text className="text-base text-gray-600">No surge. Ever.</Text>
      </View>
    </View>
  );
}
```

**WaitTimeIndicator Component Pattern:**

```typescript
// src/features/booking/components/WaitTimeIndicator.tsx
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface WaitTimeIndicatorProps {
  waitMinutes: number;
  className?: string;
}

export function WaitTimeIndicator({ waitMinutes, className }: WaitTimeIndicatorProps) {
  return (
    <View
      className={`flex-row items-center ${className}`}
      accessibilityLabel={`${waitMinutes} minutes of wait time included with your ride`}
      accessibilityRole="text"
    >
      <Ionicons name="time-outline" size={20} color="#059669" />
      <Text className="ml-2 text-base text-secondary">
        {waitMinutes} min wait time included
      </Text>
    </View>
  );
}
```

**RideSummaryCard Component Pattern:**

```typescript
// src/features/booking/components/RideSummaryCard.tsx
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Destination } from '../../../stores/bookingStore';

interface RideSummaryCardProps {
  pickup: Destination | null;
  dropoff: Destination;
  date: string;
  time: string | null;
  isRecurring?: boolean;
  recurringDescription?: string;
  className?: string;
}

export function RideSummaryCard({
  pickup,
  dropoff,
  date,
  time,
  isRecurring,
  recurringDescription,
  className,
}: RideSummaryCardProps) {
  const formatDate = (dateStr: string): string => {
    const d = new Date(dateStr);
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    if (dateStr === today) return 'Today';
    if (dateStr === tomorrow) return 'Tomorrow';
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <View
      className={`rounded-2xl bg-white p-5 shadow-sm ${className}`}
      accessibilityLabel={`Ride summary: From ${pickup?.name || 'Home'} to ${dropoff.name} on ${formatDate(date)} at ${time || 'ASAP'}`}
    >
      {/* Route visualization */}
      <View className="flex-row">
        {/* Route line indicator */}
        <View className="mr-4 items-center">
          <View className="h-3 w-3 rounded-full bg-secondary" />
          <View className="h-12 w-0.5 bg-gray-300" />
          <View className="h-3 w-3 rounded-full bg-primary" />
        </View>

        {/* Locations */}
        <View className="flex-1">
          <View className="mb-3">
            <Text className="text-sm font-medium text-gray-500">From</Text>
            <Text className="text-lg font-semibold text-foreground">
              {pickup?.name || 'Home'}
            </Text>
          </View>
          <View>
            <Text className="text-sm font-medium text-gray-500">To</Text>
            <Text className="text-lg font-semibold text-foreground">
              {dropoff.name}
            </Text>
            <Text className="text-base text-gray-600">{dropoff.address}</Text>
          </View>
        </View>
      </View>

      {/* Date and Time */}
      <View className="mt-4 flex-row items-center border-t border-gray-100 pt-4">
        <Ionicons name="calendar-outline" size={20} color="#6B7280" />
        <Text className="ml-2 text-lg font-medium text-foreground">
          {formatDate(date)}
        </Text>
        <View className="mx-3 h-1 w-1 rounded-full bg-gray-400" />
        <Ionicons name="time-outline" size={20} color="#6B7280" />
        <Text className="ml-2 text-lg font-medium text-foreground">
          {time || 'ASAP'}
        </Text>
      </View>

      {/* Recurring indicator */}
      {isRecurring && (
        <View className="mt-3 flex-row items-center">
          <Ionicons name="repeat" size={18} color="#059669" />
          <Text className="ml-2 text-base text-secondary">
            {recurringDescription || 'Recurring ride'}
          </Text>
        </View>
      )}
    </View>
  );
}
```

**Confirm Screen Pattern:**

```typescript
// apps/rider/app/booking/confirm.tsx
import { router } from 'expo-router';
import { useState } from 'react';
import { View, Text, SafeAreaView, Pressable, ScrollView } from 'react-native';

import { Header } from '../../src/components/Header';
import {
  StepIndicator,
  PriceLockBadge,
  WaitTimeIndicator,
  RideSummaryCard,
  BookingSuccessScreen,
} from '../../src/features/booking';
import { useBookRide } from '../../src/features/booking/hooks/useBookRide';
import { useBookingStore } from '../../src/stores/bookingStore';

export default function BookingStep3() {
  const [showSuccess, setShowSuccess] = useState(false);
  const {
    pickupDestination,
    dropoffDestination,
    selectedDate,
    selectedTime,
    isRecurring,
    recurringFrequency,
    recurringDays,
    setCurrentStep,
  } = useBookingStore();

  const bookRideMutation = useBookRide();

  const handleBack = () => {
    setCurrentStep(2);
    router.back();
  };

  const handleBookRide = async () => {
    // For MVP, use mock price - real pricing in future story
    const mockPriceCents = 4500; // $45

    try {
      await bookRideMutation.mutateAsync({
        pickupDestination,
        dropoffDestination: dropoffDestination!,
        scheduledDate: selectedDate || new Date().toISOString().split('T')[0],
        scheduledTime: selectedTime,
        priceCents: mockPriceCents,
        isRecurring,
        recurringFrequency,
        recurringDays,
      });
      setShowSuccess(true);
    } catch (error) {
      // Error handling - show toast or error state
      console.error('Booking failed:', error);
    }
  };

  // Show success screen after booking
  if (showSuccess) {
    return <BookingSuccessScreen />;
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Header showBackButton onBack={handleBack} title="Book a Ride" />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="px-6 pt-4">
          <StepIndicator currentStep={3} totalSteps={3} />

          <Text className="mt-6 text-2xl font-bold text-foreground">
            Confirm your ride
          </Text>
          <Text className="mt-1 text-lg text-gray-700">
            Review and book with one tap
          </Text>

          {/* Ride Summary */}
          <RideSummaryCard
            pickup={pickupDestination}
            dropoff={dropoffDestination!}
            date={selectedDate || today}
            time={selectedTime}
            isRecurring={isRecurring}
            recurringDescription={
              isRecurring
                ? recurringFrequency === 'daily'
                  ? 'Every day'
                  : recurringFrequency === 'weekly'
                    ? 'Every week'
                    : `${recurringDays.join(', ')}`
                : undefined
            }
            className="mt-6"
          />

          {/* Price Lock Badge */}
          <PriceLockBadge priceCents={4500} className="mt-4" />

          {/* Wait Time Indicator */}
          <WaitTimeIndicator waitMinutes={20} className="mt-4" />
        </View>
      </ScrollView>

      {/* Fixed bottom button */}
      <View className="absolute bottom-0 left-0 right-0 bg-background px-6 pb-8 pt-4 shadow-lg">
        <Pressable
          onPress={handleBookRide}
          disabled={bookRideMutation.isPending}
          className={`min-h-[56px] items-center justify-center rounded-xl ${
            bookRideMutation.isPending ? 'bg-gray-300' : 'bg-primary'
          } active:opacity-80`}
          accessibilityLabel="Book this ride"
          accessibilityRole="button"
          accessibilityState={{ disabled: bookRideMutation.isPending }}
        >
          <Text className="text-lg font-bold text-white">
            {bookRideMutation.isPending ? 'Booking...' : 'Book This Ride'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
```

**BookingSuccessScreen Component Pattern:**

```typescript
// src/features/booking/components/BookingSuccessScreen.tsx
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';

import { useBookingStore } from '../../../stores/bookingStore';
import { UndoButton } from './UndoButton';

export function BookingSuccessScreen() {
  const { lastBookingId, dropoffDestination, selectedDate, selectedTime, resetBooking } =
    useBookingStore();
  const [canUndo, setCanUndo] = useState(true);

  // Animation values
  const checkmarkScale = useSharedValue(0);

  useEffect(() => {
    // Celebratory animation
    checkmarkScale.value = withSequence(
      withSpring(1.2, { damping: 8 }),
      withSpring(1, { damping: 12 })
    );

    // Undo window expires after 60 seconds
    const timer = setTimeout(() => setCanUndo(false), 60000);
    return () => clearTimeout(timer);
  }, []);

  const checkmarkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkmarkScale.value }],
  }));

  const handleDone = () => {
    resetBooking();
    router.replace('/(tabs)');
  };

  const confirmationNumber = lastBookingId?.slice(0, 8).toUpperCase() || 'PENDING';

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-6">
        {/* Success checkmark with animation */}
        <Animated.View
          style={checkmarkStyle}
          className="mb-6 h-24 w-24 items-center justify-center rounded-full bg-secondary"
        >
          <Ionicons name="checkmark" size={48} color="#FFFFFF" />
        </Animated.View>

        <Text className="text-2xl font-bold text-foreground">
          Your ride is booked!
        </Text>

        <Text className="mt-2 text-lg text-gray-600">
          Confirmation #{confirmationNumber}
        </Text>

        {/* Ride summary */}
        <View className="mt-6 w-full rounded-xl bg-gray-100 p-4">
          <Text className="text-base text-gray-600">
            {dropoffDestination?.name} on {selectedDate || 'Today'} at {selectedTime || 'ASAP'}
          </Text>
        </View>

        {/* Undo button - only shown for 60 seconds */}
        {canUndo && lastBookingId && (
          <UndoButton
            rideId={lastBookingId}
            onUndoComplete={handleDone}
            className="mt-6"
          />
        )}

        {/* Add to Calendar (future enhancement) */}
        <Pressable
          className="mt-4 flex-row items-center"
          accessibilityLabel="Add ride to calendar"
          accessibilityRole="button"
        >
          <Ionicons name="calendar-outline" size={20} color="#1E40AF" />
          <Text className="ml-2 text-base font-medium text-primary">
            Add to Calendar
          </Text>
        </Pressable>
      </View>

      {/* Done button */}
      <View className="px-6 pb-8">
        <Pressable
          onPress={handleDone}
          className="min-h-[56px] items-center justify-center rounded-xl bg-primary active:opacity-80"
          accessibilityLabel="Done, return to home"
          accessibilityRole="button"
        >
          <Text className="text-lg font-bold text-white">Done</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
```

**UndoButton Component Pattern:**

```typescript
// src/features/booking/components/UndoButton.tsx
import { useEffect, useState } from 'react';
import { Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface UndoButtonProps {
  rideId: string;
  onUndoComplete: () => void;
  className?: string;
}

export function UndoButton({ rideId, onUndoComplete, className }: UndoButtonProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(60);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleUndo = async () => {
    // TODO: Call cancel-ride Edge Function
    // For MVP, just reset state
    onUndoComplete();
  };

  if (secondsRemaining <= 0) return null;

  return (
    <Pressable
      onPress={handleUndo}
      className={`flex-row items-center rounded-xl border border-red-200 bg-red-50 px-4 py-3 active:bg-red-100 ${className}`}
      accessibilityLabel={`Undo booking. ${secondsRemaining} seconds remaining`}
      accessibilityRole="button"
    >
      <Ionicons name="arrow-undo" size={20} color="#DC2626" />
      <Text className="ml-2 text-base font-medium text-red-600">
        Undo ({secondsRemaining}s)
      </Text>
    </Pressable>
  );
}
```

**useBookRide Hook Pattern:**

```typescript
// src/features/booking/hooks/useBookRide.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";
import { useBookingStore, Destination } from "../../../stores/bookingStore";

interface BookingRequest {
  pickupDestination: Destination | null;
  dropoffDestination: Destination;
  scheduledDate: string;
  scheduledTime: string | null;
  priceCents: number;
  isRecurring?: boolean;
  recurringFrequency?: "daily" | "weekly" | "custom" | null;
  recurringDays?: string[];
}

interface BookingResponse {
  id: string;
  status: string;
  confirmationNumber: string;
}

export function useBookRide() {
  const queryClient = useQueryClient();
  const { setLastBookingResult } = useBookingStore();

  return useMutation({
    mutationFn: async (request: BookingRequest): Promise<BookingResponse> => {
      // Construct scheduled timestamp
      const scheduledTime = request.scheduledTime
        ? `${request.scheduledDate}T${convertTo24Hour(request.scheduledTime)}:00`
        : new Date().toISOString();

      // For MVP: Direct Supabase insert
      // Future: Call book-ride Edge Function for complex logic
      const { data, error } = await supabase
        .from("rides")
        .insert({
          // rider_id will be set by RLS using auth.uid()
          pickup_address: request.pickupDestination?.address || "Home",
          dropoff_address: request.dropoffDestination.address,
          scheduled_pickup_time: scheduledTime,
          status: "pending",
          // Additional fields for future:
          // price_cents: request.priceCents,
          // is_recurring: request.isRecurring,
        })
        .select("id, status")
        .single();

      if (error) throw error;

      return {
        id: data.id,
        status: data.status,
        confirmationNumber: data.id.slice(0, 8).toUpperCase(),
      };
    },
    onSuccess: (data) => {
      // Update store with booking result
      setLastBookingResult(data.id, data.confirmationNumber);

      // Invalidate rides cache to refresh upcoming rides
      queryClient.invalidateQueries({ queryKey: ["rides"] });
    },
  });
}

// Helper to convert 12-hour time to 24-hour format
function convertTo24Hour(time12: string): string {
  const [time, period] = time12.split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}
```

**Updated BookingStore Pattern:**

```typescript
// Add to existing bookingStore.ts

interface BookingState {
  // Existing fields...
  currentStep: number;
  pickupDestination: Destination | null;
  dropoffDestination: Destination | null;
  selectedDate: string | null;
  selectedTime: string | null;
  notes: string;
  savedDestinations: Destination[];

  // From Story 2.4: Recurring ride fields
  isRecurring: boolean;
  recurringFrequency: 'daily' | 'weekly' | 'custom' | null;
  recurringDays: string[];
  recurringEndDate: string | null;

  // NEW: Booking result fields
  lastBookingId: string | null;
  lastBookingConfirmation: string | null;

  // Existing actions...

  // NEW: Booking result action
  setLastBookingResult: (id: string, confirmation: string) => void;
}

// Add to initialState:
const initialState = {
  // ...existing
  lastBookingId: null,
  lastBookingConfirmation: null,
};

// Add action in create():
setLastBookingResult: (id, confirmation) => set({
  lastBookingId: id,
  lastBookingConfirmation: confirmation
}),

// Update resetBooking to clear booking result:
resetBooking: () => set({
  // ...existing reset
  lastBookingId: null,
  lastBookingConfirmation: null,
}),
```

### What Already Exists (DO NOT RECREATE)

**From Story 2.1 (Rider App Shell):**

- Tab navigation with Home tab at `app/(tabs)/index.tsx`
- Header component at `src/components/Header.tsx` with `showBackButton` and `title` props
- TanStack Query configured with AsyncStorage persistence
- Zustand bookingStore at `src/stores/bookingStore.ts`
- Feature directory structure at `src/features/`
- Tailwind config with UX Design tokens (primary, secondary, accent colors)
- touch: '48px' and touch-lg: '56px' spacing tokens

**From Story 2.2 (Saved Destinations):**

- `useDestinations()` hook for fetching saved destinations
- Database schema `saved_destinations` table

**From Story 2.3 (Destination Selection - Tap 1):**

- `apps/rider/app/booking/_layout.tsx` - Booking stack navigator
- `apps/rider/app/booking/index.tsx` - Step 1 screen
- `StepIndicator` component showing 3-step progress
- `DestinationPicker`, `SelectableDestinationCard` components
- Navigation flow from Home → BookingWizard → Step 2 → Step 3

**From Story 2.4 (Time Selection - Tap 2):**

- `apps/rider/app/booking/time.tsx` - Step 2 screen (ready-for-dev)
- TimePicker, TimeSlot, ASAPButton, DateSelector components (ready-for-dev)
- RecurringRideToggle, FrequencySelector, DaySelector components (ready-for-dev)
- Extended bookingStore with recurring ride fields (ready-for-dev)

**Existing bookingStore interface (extend, don't replace):**

```typescript
interface BookingState {
  currentStep: number;
  pickupDestination: Destination | null;
  dropoffDestination: Destination | null;
  selectedDate: string | null;
  selectedTime: string | null;
  notes: string;
  savedDestinations: Destination[];
  // Story 2.4 adds: isRecurring, recurringFrequency, recurringDays, recurringEndDate
}
```

### Previous Story Intelligence (Story 2.4)

**Key Learnings:**

- All touch targets must be 48dp+ minimum (56dp for primary actions) - USE `min-h-[56px]` class
- Use NativeWind classes exclusively, NOT StyleSheet.create()
- Import icons from `@expo/vector-icons` (Ionicons recommended)
- Components need proper accessibility: `accessibilityLabel`, `accessibilityRole`, `accessibilityState`
- Use `router.push('/booking/confirm')` for navigation, `router.back()` for back
- Header component accepts `showBackButton`, `onBack`, `title` props

**Code Patterns from 2.3/2.4:**

- Screen wrapper: `<SafeAreaView className="flex-1 bg-background">`
- Content padding: `<View className="flex-1 px-6 pt-4">`
- Title: `<Text className="mt-6 text-2xl font-bold text-foreground">`
- Subtitle: `<Text className="mt-1 text-lg text-gray-700">`
- Pressable active state: `className="... active:opacity-80"` or `active:bg-gray-50`
- Cards: `rounded-2xl bg-white p-5 shadow-sm`

**Commit Pattern:** `feat(rider): implement 3-tap booking - confirmation (Story 2.5)`

### Git Intelligence (Recent Commits)

```
53d42cf feat: update lint-staged configuration to use Prettier only
8f41d96 feat: enhance ESLint and Prettier configurations
e687c36 feat(audit): implement audit logging triggers for HIPAA compliance (Story 1.5)
3a430a1 feat(rbac): implement role-based access control with RLS policies (Story 1.4)
ee796be feat(auth): implement Clerk authentication integration (Story 1.3)
```

**Patterns from Previous Stories:**

- Component files use PascalCase
- Hooks use camelCase with `use` prefix
- Feature-first organization in `src/features/{feature-name}/`
- Use `flex-1` for components that should fill available space
- Test files colocated: `Component.test.tsx` next to `Component.tsx`

### UX Design Requirements

**From UX Design Specification:**

- **3-Tap Booking Flow:** Where → When → Confirm (this story is Tap 3 - "Confirm")
- **Tap 3 (Confirm):** Summary shows route, time, price (locked), wait time (included), and driver (if assigned). Large "Book This Ride" button. One tap completes booking.
- Touch-first mobile design with minimum 48dp touch targets
- Font scaling support up to 200%
- High contrast mode (7:1 ratio) as default

**Component Standards:**

- Primary buttons: 56px height, 12px radius, 18px bold text
- Cards: 16px radius, 20px padding, subtle shadow
- PriceLockBadge: "$XX locked" with "No surge. Ever." tagline

**Trust-Building Elements:**

- PriceLockBadge with shield icon - visual trust indicator
- WaitTimeIndicator with clock icon - patience messaging
- 60-second undo window - mistake forgiveness
- Celebration animation - positive reinforcement

**Anti-Patterns to Avoid (from UX spec):**

- Small touch targets — 48dp minimum with generous spacing
- Countdown timers that create anxiety — except 60s undo which is reassuring
- Complex navigation — Linear flows preferred
- Surge pricing displays — NEVER mention surge, only "No surge. Ever."

### Accessibility Requirements (CRITICAL)

- All touch targets 48dp+ minimum (56dp for primary buttons)
- All interactive elements need `accessibilityLabel`, `accessibilityRole`, `accessibilityState`
- Color contrast 7:1 (exceeds WCAG AAA)
- Support font scaling to 200%
- Buttons have `accessibilityRole="button"`
- Text content has `accessibilityRole="text"` where appropriate
- Screen reader should announce: price, destination, date/time clearly

### Anti-Patterns to Avoid

- **DO NOT** use external confirmation libraries - build custom senior-friendly components
- **DO NOT** use StyleSheet.create() - use NativeWind classes
- **DO NOT** show surge pricing or dynamic pricing indicators
- **DO NOT** use small touch targets (<48dp) or tiny buttons
- **DO NOT** use complex gestures - taps only
- **DO NOT** auto-navigate without showing success feedback first
- **DO NOT** make price less prominent - it must be clearly visible
- **DO NOT** skip the 60-second undo window - it's a trust builder
- **DO NOT** forget to invalidate queries after successful booking

### Testing Checklist

- [ ] Step 3 shows "Confirm your ride" title
- [ ] StepIndicator shows "Step 3 of 3"
- [ ] RideSummaryCard displays pickup, destination, date, time correctly
- [ ] RideSummaryCard shows recurring indicator when applicable
- [ ] PriceLockBadge displays "$45 locked. No surge. Ever."
- [ ] WaitTimeIndicator displays "20 min wait time included"
- [ ] "Book This Ride" button is 56dp height and prominent
- [ ] Tapping "Book This Ride" submits booking
- [ ] Success screen shows checkmark animation
- [ ] Success screen shows confirmation number
- [ ] 60-second undo button counts down and disappears
- [ ] "Done" button returns to Home tab and resets booking state
- [ ] Back navigation returns to Step 2 (time selection)
- [ ] All touch targets are 48dp+ (56dp for primary button)
- [ ] Screen works with 200% font scaling
- [ ] Color contrast meets 7:1 ratio
- [ ] All elements have accessibility labels

## Dev Agent Record

### Context Reference

- docs/architecture.md (Mobile App Structure, State Management, Frontend Architecture)
- docs/ux-design-specification.md (3-Tap Booking, PriceLockBadge, Trust Building, Accessibility)
- docs/prd.md (FR1, FR2, FR4 - Booking and pricing requirements)
- docs/epics.md (Epic 2, Story 2.5)
- docs/sprint-artifacts/2-4-implement-3-tap-booking-flow-time-selection.md (Previous story)
- apps/rider/src/stores/bookingStore.ts (Booking state)
- apps/rider/app/booking/time.tsx (Step 2 screen pattern)
- packages/shared/src/db/schema.ts (Database schema - rides table)

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

| Date       | Change                                             | Author                |
| ---------- | -------------------------------------------------- | --------------------- |
| 2025-12-09 | Story created with comprehensive developer context | Create-Story Workflow |
