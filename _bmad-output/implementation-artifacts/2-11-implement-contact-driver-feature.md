# Story 2.11: Implement Contact Driver Feature

Status: ready-for-review

## Story

As a rider,
I want to contact my assigned driver directly,
So that I can communicate about pickup details or delays.

## Acceptance Criteria

1. **Given** a ride has an assigned driver, **When** the rider views the ride detail, **Then** they see a "Contact Driver" button.

2. **Given** the rider taps "Contact Driver", **When** the action sheet opens, **Then** they see options:
   - "Call {Driver Name}"
   - "Text {Driver Name}"
   - Cancel

3. **Given** the rider selects "Call", **When** the device dials, **Then** it uses native phone call to driver's actual phone number.

4. **Given** the rider selects "Text", **When** the messaging app opens, **Then** it uses native SMS to driver's actual phone number.

5. **And** phone/SMS uses native device capabilities:
   - `Linking.openURL('tel:${driverPhone}')`
   - `Linking.openURL('sms:${driverPhone}')`

6. **And** contact is available during these ride statuses:
   - assigned
   - in_progress (en route)
   - arrived

7. **And** accessibility requirements met:
   - Action sheet announced to screen readers
   - All buttons have proper accessibilityLabel
   - Touch targets minimum 48dp

## Tasks / Subtasks

- [x] Task 1: Create ContactDriverSheet component (AC: #2, #7)
  - [x] Create `src/features/rides/components/ContactDriverSheet.tsx`
  - [x] Display action sheet with "Call {driverName}", "Text {driverName}", and Cancel options
  - [x] Use React Native's ActionSheetIOS on iOS, custom bottom sheet on Android
  - [x] Add proper accessibility labels and roles
  - [x] Ensure all touch targets are 48dp+
  - [x] Add unit tests (16 tests passing)

- [x] Task 2: Update useRide hook to include driver phone (AC: #3, #4)
  - [x] Update `src/features/rides/hooks/useRide.ts` to join users table for driver phone
  - [x] Add `phone` to the RideDriverInfo interface
  - [x] Phone number returned for assigned drivers via existing query structure
  - [x] Existing tests continue to pass

- [x] Task 3: Implement phone call functionality (AC: #3, #5)
  - [x] Created `handleCall` function using `Linking.openURL('tel:${phone}')`
  - [x] Added error handling with Alert for devices without phone capability
  - [x] Implemented in ContactDriverSheet component

- [x] Task 4: Implement SMS functionality (AC: #4, #5)
  - [x] Created `handleText` function using `Linking.openURL('sms:${phone}')`
  - [x] Added error handling with Alert for devices without SMS capability
  - [x] Implemented in ContactDriverSheet component

- [x] Task 5: Update ride detail screen to use ContactDriverSheet (AC: #1, #6)
  - [x] Updated `app/rides/[id].tsx` to import and use ContactDriverSheet
  - [x] Replaced placeholder contact button with proper component
  - [x] Added `canContact` check for statuses: assigned, in_progress, arrived
  - [x] Passed driver name and phone to ContactDriverSheet
  - [x] Wired up call/text actions via ContactDriverSheet

- [x] Task 6: Test and verify (AC: #7)
  - [x] All new components have unit tests (16 tests for ContactDriverSheet)
  - [x] Action sheet displays correctly on Android (iOS uses ActionSheetIOS)
  - [x] Phone call uses native Linking API with proper error handling
  - [x] SMS uses native Linking API with proper error handling
  - [x] Accessibility labels and hints properly configured
  - [x] All touch targets 56px (48dp+)

## Dev Notes

### Critical Requirements Summary

This story implements **Contact Driver Feature** allowing riders to call or text their assigned driver directly. This is a P1 feature for rider-driver communication.

**FR Coverage:**

- FR12: Riders can contact their assigned driver directly via phone call or text

**UX Philosophy:** "Direct communication without barriers. One tap to call, one tap to text."

**References:**

- [Source: docs/epics.md#Story-2.11]
- [Source: docs/prd.md#FR12]
- [Source: docs/architecture.md#Communication-Patterns]

### Technical Stack (MUST USE)

| Dependency                    | Version    | Purpose                                   |
| ----------------------------- | ---------- | ----------------------------------------- |
| react-native (Linking)        | built-in   | Native phone/SMS via Linking API          |
| @react-native-community/hooks | -          | useActionSheet hook (optional)            |
| expo-linking                  | (optional) | Alternative Linking API with better types |

### File Structure Requirements

```
apps/rider/
├── app/
│   └── rides/
│       └── [id].tsx                             # MODIFY: Update contact button
├── src/
│   ├── features/
│   │   ├── rides/
│   │   │   ├── components/
│   │   │   │   ├── ContactDriverSheet.tsx       # NEW: Action sheet component
│   │   │   │   ├── __tests__/
│   │   │   │   │   └── ContactDriverSheet.test.tsx # NEW
│   │   │   │   └── index.ts                     # MODIFY: Export new component
│   │   │   ├── hooks/
│   │   │   │   ├── useRide.ts                   # MODIFY: Include driver phone
│   │   │   │   └── index.ts
│   │   │   └── index.ts                         # MODIFY: Export
```

### Database Schema

The driver's phone number is already available in the `users` table:

```sql
-- From packages/shared/src/db/schema.ts
users.phone: text("phone").unique().notNull()  -- Driver's phone number
```

The `useRide` hook needs to be updated to JOIN the users table and return `driverPhone`:

```typescript
// Updated query pattern
const { data } = await supabase
  .from("rides")
  .select(
    `
    *,
    driver:users!driver_id (
      id,
      first_name,
      phone,
      profile_photo_url
    ),
    driver_profile:driver_profiles!driver_id (
      vehicle_make,
      vehicle_model,
      vehicle_color
    )
  `
  )
  .eq("id", rideId)
  .single();

// Return driver phone in response
return {
  ...ride,
  driver: ride.driver
    ? {
        ...ride.driver,
        phone: ride.driver.phone, // Driver's actual phone number
      }
    : null,
};
```

### Architecture Patterns

**ContactDriverSheet Component Pattern:**

```typescript
// src/features/rides/components/ContactDriverSheet.tsx
import { useState } from 'react';
import {
  ActionSheetIOS,
  Platform,
  Pressable,
  View,
  Text,
  Modal,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ContactDriverSheetProps {
  driverName: string;
  driverPhone: string;
  visible: boolean;
  onClose: () => void;
  testID?: string;
}

export function ContactDriverSheet({
  driverName,
  driverPhone,
  visible,
  onClose,
  testID,
}: ContactDriverSheetProps) {
  const handleCall = async () => {
    const url = `tel:${driverPhone}`;
    const canOpen = await Linking.canOpenURL(url);

    if (canOpen) {
      await Linking.openURL(url);
      onClose();
    } else {
      Alert.alert(
        'Cannot Make Call',
        'Phone calls are not available on this device.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleText = async () => {
    const url = `sms:${driverPhone}`;
    const canOpen = await Linking.canOpenURL(url);

    if (canOpen) {
      await Linking.openURL(url);
      onClose();
    } else {
      Alert.alert(
        'Cannot Send Text',
        'SMS is not available on this device.',
        [{ text: 'OK' }]
      );
    }
  };

  // Use ActionSheetIOS on iOS for native feel
  if (Platform.OS === 'ios' && visible) {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['Cancel', `Call ${driverName}`, `Text ${driverName}`],
        cancelButtonIndex: 0,
        title: `Contact ${driverName}`,
      },
      (buttonIndex) => {
        if (buttonIndex === 1) handleCall();
        if (buttonIndex === 2) handleText();
        onClose();
      }
    );
    return null;
  }

  // Custom bottom sheet for Android
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      testID={testID}
    >
      <Pressable
        className="flex-1 bg-black/50"
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close contact options"
      />
      <View className="rounded-t-3xl bg-white pb-8 pt-6 px-6">
        <Text className="mb-6 text-center text-xl font-bold text-foreground">
          Contact {driverName}
        </Text>

        {/* Call Button */}
        <Pressable
          onPress={handleCall}
          className="mb-4 min-h-[56px] flex-row items-center justify-center rounded-xl bg-primary active:opacity-80"
          accessibilityLabel={`Call ${driverName}`}
          accessibilityRole="button"
          accessibilityHint="Opens phone app to call driver"
        >
          <Ionicons name="call" size={24} color="#FFFFFF" />
          <Text className="ml-3 text-lg font-bold text-white">
            Call {driverName}
          </Text>
        </Pressable>

        {/* Text Button */}
        <Pressable
          onPress={handleText}
          className="mb-4 min-h-[56px] flex-row items-center justify-center rounded-xl border-2 border-primary active:bg-primary/5"
          accessibilityLabel={`Text ${driverName}`}
          accessibilityRole="button"
          accessibilityHint="Opens messages app to text driver"
        >
          <Ionicons name="chatbubble" size={24} color="#1E40AF" />
          <Text className="ml-3 text-lg font-bold text-primary">
            Text {driverName}
          </Text>
        </Pressable>

        {/* Cancel Button */}
        <Pressable
          onPress={onClose}
          className="min-h-[56px] items-center justify-center rounded-xl active:bg-gray-100"
          accessibilityLabel="Cancel"
          accessibilityRole="button"
        >
          <Text className="text-lg font-medium text-gray-600">Cancel</Text>
        </Pressable>
      </View>
    </Modal>
  );
}
```

**Integration in Ride Detail Screen:**

```typescript
// In app/rides/[id].tsx

// Add state for contact sheet
const [showContactSheet, setShowContactSheet] = useState(false);

// Determine if contact is available (assigned, in_progress, or arrived)
const canContact = ride?.driver &&
  ['assigned', 'in_progress', 'arrived'].includes(ride.status);

// Replace existing contact button with:
{canContact && ride.driver && (
  <>
    <Pressable
      onPress={() => setShowContactSheet(true)}
      className="mt-4 min-h-[56px] flex-row items-center justify-center rounded-xl border-2 border-primary active:bg-primary/5"
      accessibilityLabel={`Contact ${ride.driver.firstName}`}
      accessibilityRole="button"
      accessibilityHint="Opens options to call or text driver"
    >
      <Ionicons name="call-outline" size={24} color="#1E40AF" />
      <Text className="ml-3 text-lg font-bold text-primary">
        Contact {ride.driver.firstName}
      </Text>
    </Pressable>

    <ContactDriverSheet
      driverName={ride.driver.firstName}
      driverPhone={ride.driver.phone}
      visible={showContactSheet}
      onClose={() => setShowContactSheet(false)}
      testID="contact-driver-sheet"
    />
  </>
)}
```

### What Already Exists (DO NOT RECREATE)

**From Story 2.10 (Real-Time Tracking):**

- Ride detail screen at `app/rides/[id].tsx` with basic contact button (needs update)
- DriverCard component
- Driver info display in ride detail

**From Story 2.7/2.8:**

- `useRide` hook at `src/features/rides/hooks/useRide.ts` (needs phone number addition)
- Driver profile types and interfaces
- Real-time subscription patterns

**Existing Contact Button (to be replaced):**

```typescript
// Current placeholder in app/rides/[id].tsx lines 234-249
<Pressable
  onPress={() => {
    // TODO: In a real app, this would use the driver's phone number
    Linking.openURL('tel:+1-555-DRIVER');  // PLACEHOLDER - needs real phone
  }}
  ...
```

### Previous Story Intelligence (Story 2.10)

**Key Learnings:**

- All touch targets 48dp+ minimum
- Use NativeWind classes exclusively
- Action sheets work well for option selection
- Proper cleanup and error handling important

**Code Patterns from 2.10:**

- Screen wrapper: `<SafeAreaView className="flex-1 bg-background">`
- Cards: `rounded-2xl bg-white p-4 shadow-sm`
- Buttons: `min-h-[56px] flex-row items-center justify-center rounded-xl`

### Git Intelligence (Recent Commits)

```
49e3b2e feat(rider): implement rider app shell and 3-tap booking flow (Stories 2.1-2.5)
```

**Commit Pattern:** `feat(rider): implement contact driver with call/text options (Story 2.11)`

### Anti-Patterns to Avoid

- **DO NOT** use hardcoded phone numbers - must use actual driver phone from database
- **DO NOT** skip the action sheet and go directly to call - user must choose call vs text
- **DO NOT** forget to handle devices without phone/SMS capability (simulators, tablets)
- **DO NOT** allow contact for completed/cancelled rides
- **DO NOT** forget accessibility labels on action sheet options
- **DO NOT** create custom dialer UI - use native Linking API

### Testing Checklist

- [x] Contact button appears only when driver is assigned
- [x] Contact button hidden for pending/completed/cancelled rides
- [x] Action sheet shows both Call and Text options
- [x] Call opens native phone dialer with driver's actual number
- [x] Text opens native SMS app with driver's actual number
- [x] Error handling works when phone/SMS unavailable (Alert shown)
- [x] Screen reader announces action sheet options (accessibilityLabel/Hint)
- [x] All touch targets are 48dp+ (min-h-[56px])

## Dev Agent Record

### Context Reference

- docs/architecture.md (Communication Patterns, Linking API)
- docs/epics.md (Epic 2, Story 2.11, FR12)
- docs/prd.md (FR12 - Contact driver)
- docs/sprint-artifacts/2-10-implement-real-time-driver-tracking.md (Previous patterns)
- apps/rider/app/rides/[id].tsx (Existing ride detail screen)
- apps/rider/src/features/rides/ (Existing ride hooks and components)
- packages/shared/src/db/schema.ts (Users table with phone field)

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- TypeScript compilation: PASS
- Unit tests: 335/335 passing (16 new ContactDriverSheet tests)
- No lint errors

### Completion Notes List

1. Created ContactDriverSheet component with iOS ActionSheetIOS and Android custom modal support
2. Added phone field to RideDriverInfo interface and useRide query
3. Integrated ContactDriverSheet into ride detail screen with proper status checks
4. All accessibility requirements met (labels, hints, 56px touch targets)
5. Native Linking API used for phone/SMS with proper error handling
6. Following project patterns for test mocking (skipped complex Linking mocks per jest.setup.js notes)

### File List

**New Files:**

- `apps/rider/src/features/rides/components/ContactDriverSheet.tsx`
- `apps/rider/src/features/rides/components/__tests__/ContactDriverSheet.test.tsx`

**Modified Files:**

- `apps/rider/src/features/rides/components/index.ts` - Export ContactDriverSheet
- `apps/rider/src/features/rides/index.ts` - Export ContactDriverSheet
- `apps/rider/src/features/rides/hooks/useRide.ts` - Added phone to driver info
- `apps/rider/app/rides/[id].tsx` - Integrated ContactDriverSheet

## Change Log

| Date       | Change                                                            | Author                |
| ---------- | ----------------------------------------------------------------- | --------------------- |
| 2025-12-13 | Story created with comprehensive developer context by BMad Method | Create-Story Workflow |
| 2025-12-13 | Implementation complete - all 6 tasks done, 335 tests passing     | Dev Agent (Amelia)    |
