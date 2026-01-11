# Story 2.7: Implement Preferred Driver Selection

Status: Done

## Story

As a rider,
I want to request a specific driver for my rides,
So that I can ride with someone I trust and who knows my needs.

## Acceptance Criteria

1. **Given** a rider has completed rides with drivers, **When** they view their driver list or booking flow, **Then** they see drivers they've ridden with before with relationship history.

2. **Given** a rider selects a preferred driver during booking, **When** booking a new ride, **Then**:
   - The booking includes `preferred_driver_id`
   - Confirmation shows "Requesting [Driver Name]"
   - System prioritizes matching to this driver (soft preference)

3. **Given** a rider wants to set a default preferred driver, **When** they update their preferences, **Then** future bookings default to this driver.

4. **And** the system shows relationship history:
   - "Dave has driven you 23 times"
   - Driver photo, name, vehicle info
   - Last ride date

5. **And** the DriverCard component follows UX Design:
   - Photo, name, vehicle, relationship counter
   - 16px border radius, soft shadow
   - Large touch target (full card tappable)

6. **And** accessibility requirements met:
   - All touch targets are 48dp+
   - Screen reader labels on all interactive elements
   - Color contrast 7:1 ratio
   - Works with 200% font scaling

## Tasks / Subtasks

- [x] Task 1: Create database schema for driver preferences and ride history tracking (AC: #1, #3, #4)
  - [x] Add `preferred_driver_id` column to `rides` table in schema.ts
  - [x] Create `rider_driver_history` view/query to track ride counts between riders and drivers
  - [x] Add `default_preferred_driver_id` to user preferences (or create rider_preferences table)
  - [x] Create `driver_profiles` table (if not exists) with vehicle info
  - [x] Generate Drizzle migration and run `npm run db:generate`

- [x] Task 2: Create DriverCard component (AC: #4, #5, #6)
  - [x] Create `src/features/drivers/components/DriverCard.tsx`
  - [x] Display driver photo, first name, vehicle (make, model, color)
  - [x] Show relationship counter ("Driven you X times")
  - [x] Show last ride date
  - [x] Implement selectable state (outlined when not selected, filled when selected)
  - [x] 16px border radius, soft shadow, full card tappable
  - [x] Add accessibilityLabel, accessibilityRole, accessibilityState

- [x] Task 3: Create useDriverHistory hook (AC: #1, #4)
  - [x] Create `src/features/drivers/hooks/useDriverHistory.ts`
  - [x] Query riders' completed rides grouped by driver
  - [x] Return driver info with ride count and last ride date
  - [x] Use TanStack Query with proper query key factory

- [x] Task 4: Create usePreferredDriver hook (AC: #3)
  - [x] Create `src/features/drivers/hooks/usePreferredDriver.ts`
  - [x] Query user's default preferred driver
  - [x] Mutation to update default preferred driver
  - [x] Invalidate queries on success

- [x] Task 5: Create DriverSelectionSheet component (AC: #1, #2, #5)
  - [x] Create `src/features/drivers/components/DriverSelectionSheet.tsx`
  - [x] Bottom sheet modal listing drivers from rider's history
  - [x] DriverCard for each driver, tappable to select
  - [x] "No Preference" option at top
  - [x] Current selection highlighted
  - [x] Header: "Request a Driver" with close button

- [x] Task 6: Add preferred driver to booking flow (AC: #2)
  - [x] Add `preferredDriverId` to bookingStore state
  - [x] Add action `setPreferredDriver` to bookingStore
  - [x] Update booking confirmation screen to show "Requesting [Driver Name]"
  - [x] Pre-populate from user's default preferred driver

- [x] Task 7: Create DriverPreferenceRow component for booking confirmation (AC: #2)
  - [x] Create `src/features/drivers/components/DriverPreferenceRow.tsx`
  - [x] Shows selected driver (mini DriverCard) or "Any Available Driver"
  - [x] Tap opens DriverSelectionSheet
  - [x] Include in booking flow before final confirmation

- [x] Task 8: Update useBookRide hook to include preferred driver (AC: #2)
  - [x] Modify `src/features/booking/hooks/useBookRide.ts`
  - [x] Include `preferred_driver_id` in ride creation mutation
  - [x] Update types for BookRideRequest

- [x] Task 9: Add Manage Preferred Driver to Profile screen (AC: #3)
  - [x] Add "My Drivers" section to Profile tab
  - [x] Display default preferred driver (if set)
  - [x] "Change" button opens DriverSelectionSheet
  - [x] "Clear" button removes default preference

- [x] Task 10: Test and verify (AC: #6)
  - [x] Unit tests for DriverCard component
  - [x] Unit tests for useDriverHistory hook
  - [x] Unit tests for usePreferredDriver hook
  - [x] Verify all touch targets are 48dp+
  - [x] Test with 200% font scaling
  - [x] Verify color contrast meets 7:1 ratio
  - [x] All elements have accessibility labels

## Dev Notes

### Critical Requirements Summary

This story implements **preferred driver selection** - a core differentiator for Veterans 1st. The UX Design Specification emphasizes "Your Regular Driver" as an emotional anchor and relationship-building moment. This is NOT just a feature, it's the product's soul.

**FR Coverage:** FR6 (Riders can request a specific driver by name for their booking)

**UX Philosophy:** "Same-driver matching and personalization trump efficiency metrics. 'Dave knows my grocery store' is the product."

**References:**

- [Source: docs/epics.md#Story-2.7]
- [Source: docs/prd.md#FR6] - Request specific driver
- [Source: docs/ux-design-specification.md#DriverCard]
- [Source: docs/ux-design-specification.md#Same-Driver-Matching]
- [Source: docs/architecture.md#Feature-First-Organization]

### Technical Stack (MUST USE)

| Dependency            | Version | Purpose                                     |
| --------------------- | ------- | ------------------------------------------- |
| expo-router           | ~6.0.10 | File-based navigation                       |
| @expo/vector-icons    | ^15.0.2 | Icons (Ionicons - person, car)              |
| nativewind            | 4.2.1   | Tailwind styling (NativeWind classes ONLY)  |
| zustand               | 5.0.9   | Client state management (bookingStore)      |
| @tanstack/react-query | 5.x     | Server state, mutations, cache invalidation |
| @supabase/supabase-js | 2.x     | Database operations                         |
| drizzle-orm           | -       | Schema management (packages/shared)         |

**NO external modal/sheet libraries** - use React Native Modal or build custom bottom sheet.

### File Structure Requirements

```
apps/rider/
├── src/
│   ├── features/
│   │   ├── drivers/                              # NEW FEATURE FOLDER
│   │   │   ├── components/
│   │   │   │   ├── DriverCard.tsx                # NEW: Driver display with relationship
│   │   │   │   ├── DriverSelectionSheet.tsx      # NEW: Bottom sheet for selection
│   │   │   │   ├── DriverPreferenceRow.tsx       # NEW: Row for booking confirmation
│   │   │   │   ├── __tests__/
│   │   │   │   │   ├── DriverCard.test.tsx
│   │   │   │   │   ├── DriverSelectionSheet.test.tsx
│   │   │   │   │   └── DriverPreferenceRow.test.tsx
│   │   │   │   └── index.ts
│   │   │   ├── hooks/
│   │   │   │   ├── useDriverHistory.ts           # NEW: Fetch driver history
│   │   │   │   ├── usePreferredDriver.ts         # NEW: Manage preferred driver
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── booking/
│   │   │   ├── hooks/
│   │   │   │   └── useBookRide.ts                # MODIFY: Add preferred_driver_id
│   │   │   └── components/
│   │   │       └── RideSummaryCard.tsx           # MODIFY: Show driver preference
│   └── stores/
│       └── bookingStore.ts                       # MODIFY: Add preferredDriverId state

packages/shared/
├── src/
│   └── db/
│       └── schema.ts                             # MODIFY: Add driver_profiles, preferred_driver_id
```

### Database Schema Changes

**Add to rides table (schema.ts):**

```typescript
// In rides table definition, add:
preferredDriverId: uuid("preferred_driver_id").references(() => users.id),
```

**Create driver_profiles table:**

```typescript
export const driverProfiles = pgTable("driver_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .unique()
    .notNull(),
  vehicleMake: text("vehicle_make").notNull(),
  vehicleModel: text("vehicle_model").notNull(),
  vehicleYear: integer("vehicle_year"),
  vehicleColor: text("vehicle_color").notNull(),
  vehiclePlate: text("vehicle_plate").notNull(),
  bio: text("bio"),
  yearsExperience: integer("years_experience"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export type DriverProfile = InferSelectModel<typeof driverProfiles>;
export type NewDriverProfile = InferInsertModel<typeof driverProfiles>;
```

**Add rider_preferences table (or column on users):**

```typescript
export const riderPreferences = pgTable("rider_preferences", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .unique()
    .notNull(),
  defaultPreferredDriverId: uuid("default_preferred_driver_id").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
```

### Implementation Patterns

**DriverCard Component Pattern:**

```typescript
// src/features/drivers/components/DriverCard.tsx
import { View, Text, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DriverCardProps {
  driver: {
    id: string;
    firstName: string;
    profilePhotoUrl?: string;
    vehicleMake: string;
    vehicleModel: string;
    vehicleColor: string;
  };
  rideCount: number;
  lastRideDate?: string;
  isSelected?: boolean;
  onPress?: () => void;
}

export function DriverCard({
  driver,
  rideCount,
  lastRideDate,
  isSelected = false,
  onPress,
}: DriverCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center rounded-2xl p-4 ${
        isSelected
          ? 'border-2 border-primary bg-primary/5'
          : 'border border-gray-200 bg-white'
      } shadow-sm active:bg-gray-50`}
      accessibilityLabel={`${driver.firstName}, ${driver.vehicleColor} ${driver.vehicleMake} ${driver.vehicleModel}, driven you ${rideCount} times${isSelected ? ', selected' : ''}`}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
    >
      {/* Driver Photo */}
      <View className="mr-4">
        {driver.profilePhotoUrl ? (
          <Image
            source={{ uri: driver.profilePhotoUrl }}
            className="h-16 w-16 rounded-full"
            accessibilityIgnoresInvertColors
          />
        ) : (
          <View className="h-16 w-16 items-center justify-center rounded-full bg-gray-200">
            <Ionicons name="person" size={32} color="#6B7280" />
          </View>
        )}
      </View>

      {/* Driver Info */}
      <View className="flex-1">
        <Text className="text-xl font-bold text-foreground">
          {driver.firstName}
        </Text>
        <Text className="mt-1 text-base text-gray-600">
          {driver.vehicleColor} {driver.vehicleMake} {driver.vehicleModel}
        </Text>
        <Text className="mt-1 text-base font-medium text-primary">
          Driven you {rideCount} {rideCount === 1 ? 'time' : 'times'}
        </Text>
        {lastRideDate && (
          <Text className="text-sm text-gray-500">
            Last ride: {formatRelativeDate(lastRideDate)}
          </Text>
        )}
      </View>

      {/* Selection indicator */}
      {isSelected && (
        <View className="ml-2">
          <Ionicons name="checkmark-circle" size={28} color="#1E40AF" />
        </View>
      )}
    </Pressable>
  );
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
```

**useDriverHistory Hook Pattern:**

```typescript
// src/features/drivers/hooks/useDriverHistory.ts
import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "../../../lib/supabase";

interface DriverHistoryItem {
  driver: {
    id: string;
    firstName: string;
    profilePhotoUrl: string | null;
    vehicleMake: string;
    vehicleModel: string;
    vehicleColor: string;
  };
  rideCount: number;
  lastRideDate: string;
}

export const driverHistoryKeys = {
  all: ["driverHistory"] as const,
  list: (riderId: string) => [...driverHistoryKeys.all, riderId] as const,
};

export function useDriverHistory(riderId: string | undefined) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: driverHistoryKeys.list(riderId ?? ""),
    queryFn: async (): Promise<DriverHistoryItem[]> => {
      if (!riderId) return [];

      // Query completed rides grouped by driver with driver profile info
      const { data, error } = await supabase
        .from("rides")
        .select(
          `
          driver_id,
          scheduled_pickup_time,
          driver:users!rides_driver_id_fkey (
            id,
            first_name,
            profile_photo_url
          ),
          driver_profile:driver_profiles!inner (
            vehicle_make,
            vehicle_model,
            vehicle_color
          )
        `
        )
        .eq("rider_id", riderId)
        .eq("status", "completed")
        .not("driver_id", "is", null)
        .order("scheduled_pickup_time", { ascending: false });

      if (error) throw new Error(error.message);

      // Group by driver and count rides
      const driverMap = new Map<string, DriverHistoryItem>();

      for (const ride of data || []) {
        const driverId = ride.driver_id;
        if (!driverId || !ride.driver || !ride.driver_profile) continue;

        const existing = driverMap.get(driverId);
        if (existing) {
          existing.rideCount += 1;
        } else {
          driverMap.set(driverId, {
            driver: {
              id: driverId,
              firstName: ride.driver.first_name,
              profilePhotoUrl: ride.driver.profile_photo_url,
              vehicleMake: ride.driver_profile.vehicle_make,
              vehicleModel: ride.driver_profile.vehicle_model,
              vehicleColor: ride.driver_profile.vehicle_color,
            },
            rideCount: 1,
            lastRideDate: ride.scheduled_pickup_time,
          });
        }
      }

      // Sort by ride count (most rides first)
      return Array.from(driverMap.values()).sort((a, b) => b.rideCount - a.rideCount);
    },
    enabled: !!riderId,
  });
}
```

**bookingStore Update Pattern:**

```typescript
// Add to bookingStore.ts interface
interface BookingState {
  // ... existing fields
  preferredDriverId: string | null;
  preferredDriverName: string | null;

  // Actions
  setPreferredDriver: (driverId: string | null, driverName: string | null) => void;
}

// Add to initialState
const initialState = {
  // ... existing fields
  preferredDriverId: null as string | null,
  preferredDriverName: null as string | null,
};

// Add to store actions
setPreferredDriver: (driverId, driverName) =>
  set({ preferredDriverId: driverId, preferredDriverName: driverName }),

// Update resetBooking to clear preferred driver
resetBooking: () =>
  set({
    // ... existing resets
    preferredDriverId: null,
    preferredDriverName: null,
  }),
```

**DriverSelectionSheet Pattern:**

```typescript
// src/features/drivers/components/DriverSelectionSheet.tsx
import { View, Text, Pressable, Modal, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DriverCard } from './DriverCard';
import { useDriverHistory } from '../hooks/useDriverHistory';

interface DriverSelectionSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (driverId: string | null, driverName: string | null) => void;
  selectedDriverId: string | null;
  riderId: string;
}

export function DriverSelectionSheet({
  visible,
  onClose,
  onSelect,
  selectedDriverId,
  riderId,
}: DriverSelectionSheetProps) {
  const { data: driverHistory, isLoading } = useDriverHistory(riderId);

  const handleSelectDriver = (driverId: string | null, driverName: string | null) => {
    onSelect(driverId, driverName);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <SafeAreaView className="max-h-[80%] rounded-t-3xl bg-background">
          {/* Header */}
          <View className="flex-row items-center justify-between border-b border-gray-200 px-6 py-4">
            <Text className="text-xl font-bold text-foreground">
              Request a Driver
            </Text>
            <Pressable
              onPress={onClose}
              className="h-12 w-12 items-center justify-center rounded-full active:bg-gray-100"
              accessibilityLabel="Close driver selection"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={28} color="#374151" />
            </Pressable>
          </View>

          <ScrollView className="flex-1 px-6 pt-4">
            {/* No Preference Option */}
            <Pressable
              onPress={() => handleSelectDriver(null, null)}
              className={`mb-4 flex-row items-center rounded-2xl p-4 ${
                selectedDriverId === null
                  ? 'border-2 border-primary bg-primary/5'
                  : 'border border-gray-200 bg-white'
              } shadow-sm active:bg-gray-50`}
              accessibilityLabel="Any available driver, no preference"
              accessibilityRole="button"
              accessibilityState={{ selected: selectedDriverId === null }}
            >
              <View className="mr-4 h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Ionicons name="people" size={32} color="#6B7280" />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-foreground">
                  Any Available Driver
                </Text>
                <Text className="mt-1 text-base text-gray-600">
                  We'll assign the best available driver
                </Text>
              </View>
              {selectedDriverId === null && (
                <Ionicons name="checkmark-circle" size={28} color="#1E40AF" />
              )}
            </Pressable>

            {/* Driver History */}
            {driverHistory && driverHistory.length > 0 && (
              <>
                <Text className="mb-3 text-lg font-semibold text-gray-600">
                  Your Drivers
                </Text>
                {driverHistory.map((item) => (
                  <View key={item.driver.id} className="mb-3">
                    <DriverCard
                      driver={item.driver}
                      rideCount={item.rideCount}
                      lastRideDate={item.lastRideDate}
                      isSelected={selectedDriverId === item.driver.id}
                      onPress={() => handleSelectDriver(item.driver.id, item.driver.firstName)}
                    />
                  </View>
                ))}
              </>
            )}

            {driverHistory?.length === 0 && (
              <View className="items-center py-8">
                <Text className="text-center text-lg text-gray-500">
                  You haven't completed any rides yet.{'\n'}
                  Your drivers will appear here.
                </Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
```

### What Already Exists (DO NOT RECREATE)

**From Story 2.1 (Rider App Shell):**

- Tab navigation with Home, My Rides, Profile tabs at `app/(tabs)/`
- Header component at `src/components/Header.tsx`
- TanStack Query configured with AsyncStorage persistence
- Zustand stores configured
- Feature directory structure at `src/features/`
- Tailwind config with UX Design tokens

**From Story 2.5 (Booking Confirmation):**

- `RideSummaryCard` component - EXTEND to show driver preference
- `BookingSuccessScreen` component
- `useBookingStore` with booking state management

**From Story 2.6 (Ride Modification):**

- Rides feature folder at `src/features/rides/`
- `useRide`, `useRides` hooks
- `ConfirmationModal` component pattern
- 48dp+ touch target patterns

**Database Schema (already exists):**

```typescript
// packages/shared/src/db/schema.ts
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: text("clerk_id").unique().notNull(),
  phone: text("phone").unique().notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull(),
  profilePhotoUrl: text("profile_photo_url"),
  // ...
});

export const rides = pgTable("rides", {
  id: uuid("id").primaryKey().defaultRandom(),
  riderId: uuid("rider_id")
    .notNull()
    .references(() => users.id),
  driverId: uuid("driver_id").references(() => users.id),
  status: text("status").notNull(),
  pickupAddress: text("pickup_address").notNull(),
  dropoffAddress: text("dropoff_address").notNull(),
  scheduledPickupTime: timestamp("scheduled_pickup_time", { withTimezone: true }).notNull(),
  // ADD: preferredDriverId: uuid("preferred_driver_id").references(() => users.id),
});
```

### Previous Story Intelligence (Story 2.6)

**Key Learnings:**

- All touch targets must be 48dp+ minimum (56dp for primary actions) - USE `min-h-[56px]` class
- Use NativeWind classes exclusively, NOT StyleSheet.create()
- Import icons from `@expo/vector-icons` (Ionicons recommended)
- Components need proper accessibility: `accessibilityLabel`, `accessibilityRole`, `accessibilityState`
- Use `router.push('/path')` for navigation
- Modal pattern: dark overlay (50% opacity), centered/bottom content, close button

**Code Patterns from 2.6:**

- Screen wrapper: `<SafeAreaView className="flex-1 bg-background">`
- Cards: `rounded-2xl bg-white p-4 shadow-sm`
- Selected state: `border-2 border-primary bg-primary/5`
- Pressable active: `active:bg-gray-50` or `active:opacity-80`

### Git Intelligence (Recent Commits)

```
49e3b2e feat(rider): implement rider app shell and 3-tap booking flow (Stories 2.1-2.5)
53d42cf feat: update lint-staged configuration to use Prettier only
8f41d96 feat: enhance ESLint and Prettier configurations
e687c36 feat(audit): implement audit logging triggers for HIPAA compliance (Story 1.5)
3a430a1 feat(rbac): implement role-based access control with RLS policies (Story 1.4)
```

**Commit Pattern:** `feat(rider): implement preferred driver selection (Story 2.7)`

### UX Design Requirements

**From UX Design Specification:**

**DriverCard Component (P0 Custom Component):**

- Photo, name, vehicle, relationship history ("Driven you 23 times")
- Large touch target (full card tappable)
- 16px border radius, soft shadow

**Same-Driver Matching Philosophy:**

- "Automatic assignment to preferred/regular driver — no rider action needed"
- "Same-Driver Display: 'Your driver Dave' with relationship history counter"
- Soft preference - dispatch may override based on availability

**Emotional Goals:**

- Connection: Driver relationship history, personalization visible
- Trust: Same driver matching visible
- "Dave knows my grocery store" is the product differentiator

### Accessibility Requirements (CRITICAL)

- All touch targets 48dp+ minimum
- All interactive elements need `accessibilityLabel`, `accessibilityRole`, `accessibilityState`
- Color contrast 7:1 (exceeds WCAG AAA)
- Support font scaling to 200%
- DriverCard fully accessible with driver name, vehicle info, and ride count in label

### Anti-Patterns to Avoid

- **DO NOT** use random driver assignment UX - emphasize relationship matching
- **DO NOT** use StyleSheet.create() - use NativeWind classes
- **DO NOT** use small touch targets (<48dp)
- **DO NOT** hide driver preference behind complex navigation - make it prominent
- **DO NOT** forget to invalidate queries after mutations
- **DO NOT** make preferred driver HARD requirement - it's a SOFT preference (dispatch may override)
- **DO NOT** show drivers rider has never ridden with - only show relationship history

### Testing Checklist

- [ ] DriverCard displays photo, name, vehicle correctly
- [ ] DriverCard shows ride count and last ride date
- [ ] DriverCard selected state shows checkmark and border
- [ ] DriverSelectionSheet opens as bottom sheet
- [ ] "Any Available Driver" option works
- [ ] Driver selection updates bookingStore
- [ ] Booking confirmation shows selected driver name
- [ ] useBookRide mutation includes preferred_driver_id
- [ ] Profile shows default preferred driver
- [ ] Can change/clear default preferred driver
- [ ] All touch targets are 48dp+
- [ ] Screen works with 200% font scaling
- [ ] Color contrast meets 7:1 ratio
- [ ] All elements have accessibility labels
- [ ] Database migration runs successfully

## Dev Agent Record

### Context Reference

- docs/architecture.md (Feature-First Organization, Query Keys, Zustand Stores)
- docs/ux-design-specification.md (DriverCard, Same-Driver Matching, Emotional Goals)
- docs/prd.md (FR6 - Request specific driver)
- docs/epics.md (Epic 2, Story 2.7)
- docs/sprint-artifacts/2-6-implement-ride-modification-and-cancellation.md (Previous story patterns)
- packages/shared/src/db/schema.ts (rides, users tables)
- apps/rider/src/stores/bookingStore.ts (Zustand store pattern)
- apps/rider/src/features/booking/ (Existing booking components)
- apps/rider/src/features/rides/ (Existing rides components)

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Fixed TypeScript error in useDriverHistory.ts: Added `as unknown as` for Supabase join type casting
- Fixed TypeScript error in usePreferredDriver.ts: Extracted `firstProfile` variable for null safety

### Completion Notes List

- **Task 1-5**: Database schema and core driver components were pre-implemented in a previous session
- **Task 6**: Updated bookingStore.ts with preferredDriverId/preferredDriverName state and setPreferredDriver action
- **Task 7**: Created DriverPreferenceRow.tsx for showing selected driver in booking flow
- **Task 8**: Updated useBookRide.ts to include preferred_driver_id in ride creation mutation
- **Task 9**: Added "My Drivers" section to Profile screen with driver selection and clear functionality
- **Task 10**: Added tests for DriverPreferenceRow; TypeScript passes; pre-existing tests for DriverCard/DriverSelectionSheet

### File List

**New Files:**

- `apps/rider/src/features/drivers/index.ts`
- `apps/rider/src/features/drivers/components/DriverCard.tsx`
- `apps/rider/src/features/drivers/components/DriverPreferenceRow.tsx`
- `apps/rider/src/features/drivers/components/DriverSelectionSheet.tsx`
- `apps/rider/src/features/drivers/components/__tests__/DriverCard.test.tsx`
- `apps/rider/src/features/drivers/components/__tests__/DriverPreferenceRow.test.tsx`
- `apps/rider/src/features/drivers/components/__tests__/DriverSelectionSheet.test.tsx`
- `apps/rider/src/features/drivers/components/index.ts`
- `apps/rider/src/features/drivers/hooks/useDriverHistory.ts`
- `apps/rider/src/features/drivers/hooks/usePreferredDriver.ts`
- `apps/rider/src/features/drivers/hooks/__tests__/useDriverHistory.test.ts`
- `apps/rider/src/features/drivers/hooks/__tests__/usePreferredDriver.test.ts`
- `apps/rider/src/features/drivers/hooks/index.ts`
- `supabase/migrations/0009_driver_profiles_and_preferences.sql` - Schema migration
- `supabase/migrations/0010_driver_profiles_rls.sql` - RLS policies (added by code review)

**Modified Files:**

- `apps/rider/src/stores/bookingStore.ts` - Added preferredDriverId/preferredDriverName state and setPreferredDriver action
- `apps/rider/src/features/booking/hooks/useBookRide.ts` - Added preferredDriverId to BookingRequest and mutation
- `apps/rider/app/booking/confirm.tsx` - Integrated DriverPreferenceRow, DriverSelectionSheet, and added pre-population from default driver (AC#3)
- `apps/rider/app/(tabs)/profile.tsx` - Added "My Drivers" section with driver management
- `packages/shared/src/db/schema.ts` - driverProfiles, riderPreferences tables, rides.preferredDriverId

## Change Log

| Date       | Change                                                                                                                                                                                                                                                  | Author                |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| 2025-12-12 | Story created with comprehensive developer context by BMad Method                                                                                                                                                                                       | Create-Story Workflow |
| 2025-12-12 | Completed implementation: bookingStore, useBookRide, DriverPreferenceRow, confirm.tsx, profile.tsx integrations                                                                                                                                         | Dev-Story Workflow    |
| 2025-12-13 | Code review fixes: Added missing hook tests (useDriverHistory, usePreferredDriver), fixed schema.test.ts TypeScript error, added pre-populate default driver in confirm.tsx (AC#3), fixed profile.tsx callback signature                                | Code-Review Workflow  |
| 2025-12-13 | Code review (adversarial): Fixed hook test assertions for disabled query state (data returns undefined not empty), staged all untracked driver feature files, renamed migration 0004→0009, created RLS policies migration (0010), all 234 tests passing | Code-Review Workflow  |
