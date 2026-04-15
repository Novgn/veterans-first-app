# Story 3.4: Implement Trip Status Transitions

Status: ready-for-dev

## Story

As a driver,
I want to mark trip status as I progress through each ride,
So that riders and dispatchers know the ride status in real-time.

## Acceptance Criteria

1. **Given** a driver has an assigned trip, **When** they start working on the trip, **Then** they can mark status transitions:
   - **Start Route** → Status: 'en_route' (heading to pickup)
   - **Arrived** → Status: 'arrived' (at pickup location)
   - **Start Trip** → Status: 'in_progress' (rider in vehicle)
   - **Complete Trip** → Status: 'completed' (rider dropped off)

2. **Given** each status transition, **When** the driver confirms, **Then**:
   - Ride status updates in database immediately
   - Rider receives push notification (placeholder)
   - Timestamp is recorded in ride_events table
   - Driver's current GPS location is recorded
   - Audit log entry created automatically via triggers

3. **Given** the ride_events table tracks all transitions with structure:

   ```sql
   ride_events (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     ride_id UUID REFERENCES rides(id) NOT NULL,
     event_type TEXT NOT NULL,
     driver_id UUID REFERENCES users(id),
     lat DECIMAL(10, 8),
     lng DECIMAL(11, 8),
     notes TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW()
   )
   ```

4. **Given** the active trip screen, **When** a driver views an assigned/in-progress trip, **Then** they see:
   - Current status prominently displayed with visual indicator
   - Next action button (primary) based on current status
   - Rider contact options (call/text)
   - Route visualization (addresses with connecting line)
   - Map placeholder for Story 3.5

5. **And** all status transitions follow the valid progression:
   - `assigned` → `en_route` (Start Route)
   - `en_route` → `arrived` (Arrived at Pickup)
   - `arrived` → `in_progress` (Start Trip - rider in vehicle)
   - `in_progress` → `completed` (Complete Trip)

6. **And** all UI elements meet accessibility requirements:
   - All touch targets minimum 48dp
   - Clear visual distinction between status states
   - Screen reader announces status changes
   - High contrast colors for action buttons

## Tasks / Subtasks

- [ ] Task 1: Add 'en_route' to ride status CHECK constraint (AC: #1, #5)
  - [ ] Create migration `0018_add_en_route_status.sql`
  - [ ] Update rides table CHECK constraint to include 'en_route'
  - [ ] Update Drizzle schema rideStatusCheck
  - [ ] Run `npm run db:generate` to sync types

- [ ] Task 2: Create ride_events table for tracking transitions (AC: #2, #3)
  - [ ] Create migration `0019_create_ride_events_table.sql`
  - [ ] Fields: id, ride_id, event_type, driver_id, lat, lng, notes, created_at
  - [ ] Event types: 'en_route', 'arrived', 'trip_started', 'trip_completed'
  - [ ] Add to Drizzle schema with type exports
  - [ ] Create RLS policies for driver and dispatcher access
  - [ ] Create index on ride_id for efficient lookups

- [ ] Task 3: Create useTripStatus mutation hook (AC: #2)
  - [ ] Create `src/features/trips/hooks/useTripStatus.ts`
  - [ ] Accept parameters: rideId, newStatus, location (optional)
  - [ ] Update ride status in rides table
  - [ ] Insert event into ride_events table
  - [ ] Use optimistic updates with TanStack Query
  - [ ] Invalidate trip queries on success
  - [ ] Export from hooks/index.ts
  - [ ] Add unit tests

- [ ] Task 4: Create StatusActionButton component (AC: #4)
  - [ ] Create `src/features/trips/components/StatusActionButton.tsx`
  - [ ] Display appropriate button text based on current status:
    - assigned → "Start Route" (blue/primary)
    - en_route → "Arrived at Pickup" (green)
    - arrived → "Start Trip" (green)
    - in_progress → "Complete Trip" (green)
  - [ ] Show loading state during transition
  - [ ] Disable when transition is invalid
  - [ ] Add haptic feedback on press
  - [ ] Add accessibility labels
  - [ ] Add unit tests

- [ ] Task 5: Create TripStatusBadge component (AC: #4, #6)
  - [ ] Create `src/features/trips/components/TripStatusBadge.tsx`
  - [ ] Display status with appropriate color coding:
    - assigned: blue (waiting)
    - en_route: amber (moving)
    - arrived: green (at location)
    - in_progress: purple (active ride)
    - completed: gray (done)
  - [ ] Include icon for each status
  - [ ] Screen reader friendly labels
  - [ ] Add unit tests

- [ ] Task 6: Create ActiveTripScreen component (AC: #4)
  - [ ] Create `src/features/trips/components/ActiveTripScreen.tsx` OR
  - [ ] Update existing `app/trips/[id].tsx` with active trip functionality
  - [ ] Show prominent status badge at top
  - [ ] Display rider info with RiderProfileCard
  - [ ] Show pickup/dropoff addresses with route line
  - [ ] Include StatusActionButton at bottom (sticky)
  - [ ] Add "Contact Rider" button (call/text)
  - [ ] Map placeholder for Story 3.5
  - [ ] Add accessibility labels

- [ ] Task 7: Create useLocationCapture hook (AC: #2)
  - [ ] Create `src/features/trips/hooks/useLocationCapture.ts`
  - [ ] Request location permission using expo-location
  - [ ] Capture current GPS coordinates
  - [ ] Return location or null with error handling
  - [ ] Export from hooks/index.ts
  - [ ] Add unit tests

- [ ] Task 8: Integrate status transitions in trip detail screen (AC: #1-6)
  - [ ] Import and use StatusActionButton in trip detail
  - [ ] Handle status transitions with location capture
  - [ ] Show confirmation before completing trip
  - [ ] Update status badge on successful transition
  - [ ] Add pull-to-refresh for latest status

- [ ] Task 9: Test and verify (AC: #6)
  - [ ] All components have unit tests
  - [ ] Full status progression flow works: assigned → en_route → arrived → in_progress → completed
  - [ ] Ride status updates in database correctly
  - [ ] ride_events table records all transitions
  - [ ] Location captured with each transition
  - [ ] All touch targets are 48dp+
  - [ ] TypeScript compiles without errors
  - [ ] Run `npm run lint` and `npm run typecheck`

## Dev Notes

### Critical Requirements Summary

This story implements **Trip Status Transitions** - enabling drivers to mark ride progress in real-time. This is a CRITICAL PATH story - many subsequent stories depend on status transitions being functional (3.5, 3.8, 3.9, 3.10, 3.19, 4.7, 5.4).

**FR Coverage:**

- FR22: Trip status transitions (assigned → en_route → arrived → in_progress → completed)
- FR47: Record pickup time (via ride_events)
- FR48: Record dropoff time (via ride_events)

**UX Philosophy:** "Dave's workflow is simple and clear. One big button tells him what to do next. He doesn't have to think - just tap when he arrives, when rider is in the car, and when he drops them off."

### Technical Stack (MUST USE)

| Dependency            | Version  | Purpose                       |
| --------------------- | -------- | ----------------------------- |
| @tanstack/react-query | ^5.x     | Server state management       |
| @supabase/supabase-js | existing | Database + Realtime           |
| expo-router           | ~4.0.x   | Navigation                    |
| expo-location         | ~18.0.x  | GPS capture for status events |
| NativeWind            | ^4.x     | Styling                       |
| date-fns              | ^4.x     | Date formatting               |

### File Structure Requirements

```
apps/driver/
├── app/
│   └── trips/
│       └── [id].tsx                              # MODIFY: Add status transitions
├── src/
│   ├── features/
│   │   ├── trips/
│   │   │   ├── components/
│   │   │   │   ├── StatusActionButton.tsx        # NEW: Status transition button
│   │   │   │   ├── TripStatusBadge.tsx           # NEW: Status display badge
│   │   │   │   ├── __tests__/
│   │   │   │   │   ├── StatusActionButton.test.tsx
│   │   │   │   │   └── TripStatusBadge.test.tsx
│   │   │   │   └── index.ts                      # MODIFY: Export new
│   │   │   ├── hooks/
│   │   │   │   ├── useTripStatus.ts              # NEW: Status mutation hook
│   │   │   │   ├── useLocationCapture.ts         # NEW: GPS capture hook
│   │   │   │   ├── __tests__/
│   │   │   │   │   ├── useTripStatus.test.ts
│   │   │   │   │   └── useLocationCapture.test.ts
│   │   │   │   └── index.ts                      # MODIFY: Export new

supabase/
├── migrations/
│   ├── 0018_add_en_route_status.sql              # NEW
│   └── 0019_create_ride_events_table.sql         # NEW

packages/shared/src/db/
└── schema.ts                                     # MODIFY: Add rideEvents table
```

### Database Schema

**Update rides status CHECK constraint:**

```sql
-- Migration: 0018_add_en_route_status.sql
-- Add 'en_route' status for driver heading to pickup
ALTER TABLE rides DROP CONSTRAINT IF EXISTS ride_status_check;
ALTER TABLE rides ADD CONSTRAINT ride_status_check
  CHECK (status IN ('pending', 'confirmed', 'pending_acceptance', 'assigned', 'en_route', 'in_progress', 'arrived', 'completed', 'cancelled'));
```

**New ride_events table:**

```sql
-- Migration: 0019_create_ride_events_table.sql
-- Track all status transitions with location data
CREATE TABLE ride_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID REFERENCES rides(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL
    CHECK (event_type IN ('en_route', 'arrived', 'trip_started', 'trip_completed', 'no_show', 'cancelled')),
  driver_id UUID REFERENCES users(id),
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient ride event lookup
CREATE INDEX idx_ride_events_ride_id ON ride_events(ride_id);

-- RLS policies
ALTER TABLE ride_events ENABLE ROW LEVEL SECURITY;

-- Drivers can view events for their assigned rides
CREATE POLICY "Drivers can view own ride events" ON ride_events
  FOR SELECT USING (
    ride_id IN (
      SELECT id FROM rides
      WHERE driver_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
    )
  );

-- Drivers can insert events for their assigned rides
CREATE POLICY "Drivers can insert events for assigned rides" ON ride_events
  FOR INSERT WITH CHECK (
    ride_id IN (
      SELECT id FROM rides
      WHERE driver_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
    )
  );

-- Dispatchers can view all events
CREATE POLICY "Dispatchers can view all ride events" ON ride_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE clerk_id = auth.jwt()->>'sub'
      AND role IN ('dispatcher', 'admin')
    )
  );

-- Trigger for audit logging
CREATE OR REPLACE FUNCTION log_ride_event() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (user_id, action, resource_type, resource_id, new_values)
  VALUES (
    NEW.driver_id,
    'CREATE',
    'ride_event',
    NEW.id,
    jsonb_build_object('event_type', NEW.event_type, 'ride_id', NEW.ride_id)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER ride_event_audit_trigger
  AFTER INSERT ON ride_events
  FOR EACH ROW EXECUTE FUNCTION log_ride_event();
```

**Drizzle Schema Addition:**

```typescript
// packages/shared/src/db/schema.ts

// Event type check constraint
const rideEventTypeCheck = check(
  "ride_event_type_check",
  sql`event_type IN ('en_route', 'arrived', 'trip_started', 'trip_completed', 'no_show', 'cancelled')`
);

/**
 * Ride Events table - FR22, FR47, FR48: Track trip status transitions
 * Records all status changes with timestamp and GPS location
 */
export const rideEvents = pgTable(
  "ride_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    rideId: uuid("ride_id")
      .references(() => rides.id, { onDelete: "cascade" })
      .notNull(),
    eventType: text("event_type").notNull(),
    driverId: uuid("driver_id").references(() => users.id),
    lat: decimal("lat", { precision: 10, scale: 8 }),
    lng: decimal("lng", { precision: 11, scale: 8 }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (_table) => [rideEventTypeCheck]
);

export type RideEvent = InferSelectModel<typeof rideEvents>;
export type NewRideEvent = InferInsertModel<typeof rideEvents>;
```

### Architecture Patterns

**useTripStatus Hook Pattern:**

```typescript
// src/features/trips/hooks/useTripStatus.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-expo";
import { supabase } from "../../../lib/supabase";
import { tripKeys } from "./useDriverTrips";

type RideStatus = "assigned" | "en_route" | "arrived" | "in_progress" | "completed";
type EventType = "en_route" | "arrived" | "trip_started" | "trip_completed";

interface TripStatusInput {
  rideId: string;
  newStatus: RideStatus;
  location?: { lat: number; lng: number } | null;
  notes?: string;
}

// Map status transitions to event types
const STATUS_TO_EVENT: Record<RideStatus, EventType | null> = {
  assigned: null, // No event for assigned (it's the starting point)
  en_route: "en_route",
  arrived: "arrived",
  in_progress: "trip_started",
  completed: "trip_completed",
};

// Valid status transitions
const VALID_TRANSITIONS: Record<RideStatus, RideStatus | null> = {
  assigned: "en_route",
  en_route: "arrived",
  arrived: "in_progress",
  in_progress: "completed",
  completed: null, // Terminal state
};

export function useTripStatus() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ rideId, newStatus, location, notes }: TripStatusInput) => {
      if (!userId) throw new Error("Not authenticated");

      // Get driver's internal ID
      const { data: driverUser } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", userId)
        .single();

      if (!driverUser) throw new Error("Driver not found");

      // Update ride status
      const { error: rideError } = await supabase
        .from("rides")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", rideId);

      if (rideError) throw rideError;

      // Create ride event if this status has an associated event type
      const eventType = STATUS_TO_EVENT[newStatus];
      if (eventType) {
        const { error: eventError } = await supabase.from("ride_events").insert({
          ride_id: rideId,
          event_type: eventType,
          driver_id: driverUser.id,
          lat: location?.lat ?? null,
          lng: location?.lng ?? null,
          notes: notes ?? null,
        });

        if (eventError) throw eventError;
      }

      // TODO: Trigger push notification to rider via Edge Function
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tripKeys.all });
    },
  });
}

export { VALID_TRANSITIONS };
```

**useLocationCapture Hook Pattern:**

```typescript
// src/features/trips/hooks/useLocationCapture.ts
import { useState, useCallback } from "react";
import * as Location from "expo-location";

interface LocationResult {
  lat: number;
  lng: number;
}

export function useLocationCapture() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const captureLocation = useCallback(async (): Promise<LocationResult | null> => {
    setIsCapturing(true);
    setError(null);

    try {
      // Check permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Location permission denied");
        return null;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };
    } catch (err) {
      setError("Failed to get location");
      console.error("Location capture error:", err);
      return null;
    } finally {
      setIsCapturing(false);
    }
  }, []);

  return {
    captureLocation,
    isCapturing,
    error,
  };
}
```

**StatusActionButton Component Pattern:**

```typescript
// src/features/trips/components/StatusActionButton.tsx
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

type RideStatus = 'assigned' | 'en_route' | 'arrived' | 'in_progress' | 'completed';

interface StatusActionButtonProps {
  currentStatus: RideStatus;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  testID?: string;
}

const STATUS_CONFIG: Record<RideStatus, {
  label: string;
  icon: string;
  bgColor: string;
  nextStatus: RideStatus | null;
} | null> = {
  assigned: {
    label: 'Start Route',
    icon: 'navigate',
    bgColor: 'bg-primary',
    nextStatus: 'en_route',
  },
  en_route: {
    label: 'Arrived at Pickup',
    icon: 'location',
    bgColor: 'bg-green-500',
    nextStatus: 'arrived',
  },
  arrived: {
    label: 'Start Trip',
    icon: 'car',
    bgColor: 'bg-green-500',
    nextStatus: 'in_progress',
  },
  in_progress: {
    label: 'Complete Trip',
    icon: 'checkmark-circle',
    bgColor: 'bg-green-500',
    nextStatus: 'completed',
  },
  completed: null, // No action for completed trips
};

export function StatusActionButton({
  currentStatus,
  onPress,
  isLoading = false,
  disabled = false,
  testID,
}: StatusActionButtonProps) {
  const config = STATUS_CONFIG[currentStatus];

  // No button for completed trips
  if (!config) return null;

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const isDisabled = disabled || isLoading;

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      className={`min-h-[56px] flex-row items-center justify-center rounded-xl ${config.bgColor} ${isDisabled ? 'opacity-50' : ''}`}
      accessibilityLabel={config.label}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      testID={testID}
    >
      {isLoading ? (
        <ActivityIndicator color="white" />
      ) : (
        <>
          <Ionicons name={config.icon as any} size={24} color="white" />
          <Text className="ml-2 text-lg font-bold text-white">{config.label}</Text>
        </>
      )}
    </Pressable>
  );
}
```

**TripStatusBadge Component Pattern:**

```typescript
// src/features/trips/components/TripStatusBadge.tsx
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type RideStatus = 'pending' | 'confirmed' | 'pending_acceptance' | 'assigned' | 'en_route' | 'arrived' | 'in_progress' | 'completed' | 'cancelled';

interface TripStatusBadgeProps {
  status: RideStatus;
  size?: 'sm' | 'md' | 'lg';
  testID?: string;
}

const STATUS_STYLES: Record<RideStatus, {
  label: string;
  icon: string;
  bgColor: string;
  textColor: string;
  iconColor: string;
}> = {
  pending: {
    label: 'Pending',
    icon: 'time-outline',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    iconColor: '#6B7280',
  },
  confirmed: {
    label: 'Confirmed',
    icon: 'checkmark',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    iconColor: '#1D4ED8',
  },
  pending_acceptance: {
    label: 'Awaiting Response',
    icon: 'hourglass-outline',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    iconColor: '#D97706',
  },
  assigned: {
    label: 'Assigned',
    icon: 'person-outline',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    iconColor: '#1D4ED8',
  },
  en_route: {
    label: 'En Route',
    icon: 'navigate',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    iconColor: '#D97706',
  },
  arrived: {
    label: 'Arrived',
    icon: 'location',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    iconColor: '#059669',
  },
  in_progress: {
    label: 'In Progress',
    icon: 'car',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    iconColor: '#7C3AED',
  },
  completed: {
    label: 'Completed',
    icon: 'checkmark-circle',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    iconColor: '#6B7280',
  },
  cancelled: {
    label: 'Cancelled',
    icon: 'close-circle',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    iconColor: '#DC2626',
  },
};

const SIZE_STYLES = {
  sm: { container: 'px-2 py-1', text: 'text-xs', icon: 14 },
  md: { container: 'px-3 py-1', text: 'text-sm', icon: 16 },
  lg: { container: 'px-4 py-2', text: 'text-base', icon: 20 },
};

export function TripStatusBadge({ status, size = 'md', testID }: TripStatusBadgeProps) {
  const styles = STATUS_STYLES[status];
  const sizeStyles = SIZE_STYLES[size];

  return (
    <View
      className={`flex-row items-center rounded-full ${styles.bgColor} ${sizeStyles.container}`}
      accessibilityLabel={`Status: ${styles.label}`}
      accessibilityRole="text"
      testID={testID}
    >
      <Ionicons name={styles.icon as any} size={sizeStyles.icon} color={styles.iconColor} />
      <Text className={`ml-1 font-semibold ${styles.textColor} ${sizeStyles.text}`}>
        {styles.label}
      </Text>
    </View>
  );
}
```

### Status Flow Diagram

```
[assigned] ──────► [en_route] ──────► [arrived] ──────► [in_progress] ──────► [completed]
    │                  │                  │                   │
    │ Start Route      │ Arrived at       │ Start Trip        │ Complete Trip
    │                  │ Pickup           │                   │
    └──────────────────┴──────────────────┴───────────────────┘
                         ride_events created at each transition
```

### What Already Exists

**From Story 3.3 (Accept/Decline Rides):**

- RideOfferModal component
- CountdownTimer component
- DeclineReasonSheet component
- useRideOffer, useAcceptRide, useDeclineRide hooks
- ride_offers table
- 'pending_acceptance' status added

**From Story 3.2 (Trip Queue):**

- TripCard component
- AccessibilityBadges component
- ComfortBadges component
- RiderProfileCard component
- TripQueueSkeleton component
- useDriverTrips, useTrip, useRiderHistory hooks
- Trip detail screen (`app/trips/[id].tsx`)

**Database (Current Status Values):**

- 'pending', 'confirmed', 'pending_acceptance', 'assigned', 'in_progress', 'arrived', 'completed', 'cancelled'
- Note: 'en_route' needs to be added

### Previous Story Intelligence (Story 3.3)

**Key Learnings:**

- Use NativeWind classes exclusively (never inline styles except opacity)
- All touch targets 48dp+ minimum
- Supabase Realtime for live updates
- TanStack Query with optimistic updates
- Test utilities in `apps/driver/src/test-utils/`

**Code Patterns Established:**

- Modal wrapper: `<Modal visible={true} transparent animationType="slide">`
- Buttons: `min-h-[56px] flex-row items-center justify-center rounded-xl`
- Status badges: `rounded-full px-3 py-1 bg-{color}-100`
- Hook tests mock Supabase and Clerk
- Component tests use `createTestWrapper` from test-utils

**Files Created/Modified in 3.3:**

- `apps/driver/app/_layout.tsx` - Added RideOfferModal
- `packages/shared/src/db/schema.ts` - Added rideOffers table
- New components in `src/features/trips/components/`
- New hooks in `src/features/trips/hooks/`

### Git Intelligence

**Recent Commit Pattern:** `feat(driver): implement trip status transitions (Story 3.4)`

**Recent Files Modified (from Story 3.3):**

- `apps/driver/app/_layout.tsx`
- `apps/driver/src/features/trips/components/index.ts`
- `apps/driver/src/features/trips/hooks/index.ts`
- `packages/shared/src/db/schema.ts`

### Anti-Patterns to Avoid

- **DO NOT** implement navigation - that's Story 3.5
- **DO NOT** implement photo arrival confirmation - that's Story 3.9
- **DO NOT** implement no-show handling - that's Story 3.10
- **DO NOT** skip location capture on status transitions
- **DO NOT** use inline styles - use NativeWind classes
- **DO NOT** forget accessibility labels
- **DO NOT** make touch targets smaller than 48dp
- **DO NOT** allow invalid status transitions (validate in hook)
- **DO NOT** forget to record ride_events for audit compliance

### Testing Checklist

- [ ] useTripStatus successfully transitions: assigned → en_route
- [ ] useTripStatus successfully transitions: en_route → arrived
- [ ] useTripStatus successfully transitions: arrived → in_progress
- [ ] useTripStatus successfully transitions: in_progress → completed
- [ ] useTripStatus rejects invalid transitions
- [ ] useLocationCapture returns location on success
- [ ] useLocationCapture handles permission denial gracefully
- [ ] StatusActionButton shows correct label for each status
- [ ] StatusActionButton is disabled when loading
- [ ] StatusActionButton is null for completed status
- [ ] TripStatusBadge displays correct style for each status
- [ ] Trip detail screen shows StatusActionButton
- [ ] Status transitions update database correctly
- [ ] ride_events table records all transitions
- [ ] All touch targets are 48dp+
- [ ] TypeScript compiles without errors

### Dependencies

May need to add:

```bash
npx expo install expo-location  # For GPS capture (if not present)
npx expo install expo-haptics   # For button feedback (if not present)
```

### References

- [Source: docs/epics.md#Story-3.4]
- [Source: docs/epics.md#FR22]
- [Source: docs/epics.md#FR47]
- [Source: docs/epics.md#FR48]
- [Source: docs/architecture.md#Data-Architecture]
- [Source: docs/sprint-artifacts/3-3-implement-accept-decline-rides.md]
- [Source: packages/shared/src/db/schema.ts]
- [Source: apps/driver/app/trips/[id].tsx]

## Dev Agent Record

### Context Reference

- docs/architecture.md (TanStack Query, Supabase patterns)
- docs/epics.md (Epic 3, Story 3.4, FR22, FR47, FR48)
- docs/ux-design-specification.md (Driver journey, status timeline)
- docs/sprint-artifacts/3-3-implement-accept-decline-rides.md
- packages/shared/src/db/schema.ts (rides, rideOffers tables)
- apps/driver/src/features/trips/ (existing structure)
- apps/driver/app/trips/[id].tsx (trip detail screen)

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

**New Files (Expected):**

- `supabase/migrations/0018_add_en_route_status.sql`
- `supabase/migrations/0019_create_ride_events_table.sql`
- `apps/driver/src/features/trips/hooks/useTripStatus.ts`
- `apps/driver/src/features/trips/hooks/useLocationCapture.ts`
- `apps/driver/src/features/trips/hooks/__tests__/useTripStatus.test.ts`
- `apps/driver/src/features/trips/hooks/__tests__/useLocationCapture.test.ts`
- `apps/driver/src/features/trips/components/StatusActionButton.tsx`
- `apps/driver/src/features/trips/components/TripStatusBadge.tsx`
- `apps/driver/src/features/trips/components/__tests__/StatusActionButton.test.tsx`
- `apps/driver/src/features/trips/components/__tests__/TripStatusBadge.test.tsx`

**Modified Files (Expected):**

- `packages/shared/src/db/schema.ts` - Add rideEvents table, update status check
- `apps/driver/app/trips/[id].tsx` - Add status transition functionality
- `apps/driver/src/features/trips/components/index.ts` - Export new components
- `apps/driver/src/features/trips/hooks/index.ts` - Export new hooks

## Change Log

| Date       | Change                                                            | Author                |
| ---------- | ----------------------------------------------------------------- | --------------------- |
| 2026-01-15 | Story created with comprehensive developer context by BMad Method | Create-Story Workflow |
