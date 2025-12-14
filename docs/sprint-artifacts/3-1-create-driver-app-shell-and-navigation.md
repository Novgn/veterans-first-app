# Story 3.1: Create Driver App Shell and Navigation

Status: ready-for-dev

## Story

As a driver,
I want a simple app focused on my assigned rides and earnings,
So that I can focus on serving riders without distractions.

## Acceptance Criteria

1. **Given** the driver app is launched, **When** user is authenticated with role 'driver', **Then** they see a home screen with:
   - Today's scheduled rides prominently displayed (placeholder for now)
   - Current status indicator (Available, On Trip, Offline)
   - Quick access to navigation for next ride (placeholder)
   - Bottom tab navigation: Home, Schedule, Earnings, Profile

2. **Given** an unauthenticated user opens the app, **When** they attempt to access any tab, **Then** they are redirected to sign-in screen

3. **Given** a user with role other than 'driver', **When** they sign in, **Then** they see an error message indicating the app is for drivers only

4. **Given** the app follows Architecture patterns, **Then** the file structure matches:

   ```
   apps/driver/
   ├── app/
   │   ├── _layout.tsx
   │   ├── index.tsx
   │   ├── (auth)/
   │   │   ├── _layout.tsx
   │   │   ├── sign-in.tsx
   │   │   └── verify.tsx
   │   ├── (tabs)/
   │   │   ├── _layout.tsx
   │   │   ├── index.tsx (Home/Queue)
   │   │   ├── schedule.tsx
   │   │   ├── earnings.tsx
   │   │   └── profile.tsx
   │   └── trips/
   │       └── [id].tsx (Active trip - placeholder)
   ├── src/
   │   ├── features/
   │   │   ├── trips/
   │   │   ├── schedule/
   │   │   ├── earnings/
   │   │   └── profile/
   ```

5. **And** driver-specific components include:
   - StatusToggle component (Available/On Trip/Offline)
   - All touch targets minimum 48dp
   - Accessible labels on all navigation elements

## Tasks / Subtasks

- [ ] Task 1: Set up driver app base structure (AC: #4)
  - [ ] Verify `apps/driver/` exists in monorepo with Expo + NativeWind config
  - [ ] Set up `global.css` with Tailwind styles (copy from rider app)
  - [ ] Configure `tailwind.config.js` for NativeWind
  - [ ] Set up `app.json` with driver-specific config (bundleId, name)
  - [ ] Create `src/lib/` directory with supabase and queryClient setup

- [ ] Task 2: Implement root layout with providers (AC: #2)
  - [ ] Create `app/_layout.tsx` with ClerkProvider, QueryClientProvider
  - [ ] Set up SecureStore token cache (same pattern as rider)
  - [ ] Create ErrorBoundary component
  - [ ] Configure Stack navigator for auth and tabs

- [ ] Task 3: Implement auth screens (AC: #2, #3)
  - [ ] Create `app/(auth)/_layout.tsx`
  - [ ] Create `app/(auth)/sign-in.tsx` with phone number input
  - [ ] Create `app/(auth)/verify.tsx` with OTP verification
  - [ ] Add role check - verify user is 'driver' role after sign-in
  - [ ] Show error and sign-out if role is not 'driver'

- [ ] Task 4: Implement tab navigation (AC: #1, #5)
  - [ ] Create `app/(tabs)/_layout.tsx` with 4 tabs: Home, Schedule, Earnings, Profile
  - [ ] Configure tab bar styling (48dp+ touch targets, accessible labels)
  - [ ] Add auth guard redirect to sign-in if not authenticated

- [ ] Task 5: Create placeholder tab screens (AC: #1)
  - [ ] Create `app/(tabs)/index.tsx` (Home/Trip Queue) with placeholder content
  - [ ] Create `app/(tabs)/schedule.tsx` with placeholder content
  - [ ] Create `app/(tabs)/earnings.tsx` with placeholder content
  - [ ] Create `app/(tabs)/profile.tsx` with placeholder content
  - [ ] Each screen shows: Title, icon, "Coming Soon" message

- [ ] Task 6: Implement StatusToggle component (AC: #1, #5)
  - [ ] Create `src/features/trips/components/StatusToggle.tsx`
  - [ ] Implement 3-state toggle: Available, On Trip, Offline
  - [ ] Show current status prominently on Home screen header
  - [ ] Add visual indicators (color-coded: green=available, blue=on trip, gray=offline)
  - [ ] Add unit tests for StatusToggle

- [ ] Task 7: Set up feature folder structure (AC: #4)
  - [ ] Create `src/features/trips/` with components/, hooks/, index.ts
  - [ ] Create `src/features/schedule/` with components/, hooks/, index.ts
  - [ ] Create `src/features/earnings/` with components/, hooks/, index.ts
  - [ ] Create `src/features/profile/` with components/, hooks/, index.ts
  - [ ] Create `src/components/` for shared components
  - [ ] Create `src/stores/` for Zustand stores

- [ ] Task 8: Create trip placeholder screen (AC: #4)
  - [ ] Create `app/trips/[id].tsx` as placeholder for active trip view
  - [ ] Show "Trip Details Coming Soon" with back navigation

- [ ] Task 9: Test and verify (AC: #5)
  - [ ] All tab navigation works correctly
  - [ ] Auth flow works (sign-in, verify, redirect)
  - [ ] StatusToggle component has unit tests
  - [ ] All touch targets are 48dp+
  - [ ] TypeScript compiles without errors
  - [ ] Run `npm run lint` and `npm run typecheck`

## Dev Notes

### Critical Requirements Summary

This story creates the **Driver App Shell** - the foundational structure for the driver mobile application. This enables all subsequent driver features (trip queue, status transitions, earnings, etc.).

**FR Coverage:**

- Enables FR19-FR53, FR74 (all driver-related functionality)
- This story sets up the infrastructure; actual FRs implemented in subsequent stories

**UX Philosophy:** "Simple, focused, driver-centric. Dave opens the app and immediately sees what he needs - his next ride."

### Technical Stack (MUST USE)

| Dependency            | Version  | Purpose                             |
| --------------------- | -------- | ----------------------------------- |
| expo                  | ~54.x    | React Native framework              |
| expo-router           | ~4.0.x   | File-based navigation               |
| @tanstack/react-query | ^5.x     | Server state management             |
| NativeWind            | ^4.x     | Styling (Tailwind for React Native) |
| @clerk/clerk-expo     | existing | User authentication                 |
| @supabase/supabase-js | existing | Database operations                 |
| zustand               | ^4.x     | Client state management             |

### File Structure Requirements

```
apps/driver/
├── app.json
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── global.css
├── babel.config.js
├── metro.config.js
│
├── app/
│   ├── _layout.tsx                    # Root layout with providers
│   ├── index.tsx                      # Entry point redirect
│   ├── +not-found.tsx                 # 404 page
│   ├── (auth)/
│   │   ├── _layout.tsx               # Auth stack layout
│   │   ├── sign-in.tsx               # Phone sign-in
│   │   └── verify.tsx                # OTP verification
│   ├── (tabs)/
│   │   ├── _layout.tsx               # Tab bar layout
│   │   ├── index.tsx                 # Home/Trip Queue
│   │   ├── schedule.tsx              # Schedule view
│   │   ├── earnings.tsx              # Earnings dashboard
│   │   └── profile.tsx               # Driver profile
│   └── trips/
│       └── [id].tsx                  # Active trip view (placeholder)
│
├── src/
│   ├── components/
│   │   ├── ErrorBoundary.tsx         # Error boundary wrapper
│   │   ├── PhoneButton.tsx           # Reusable phone button
│   │   └── index.ts                  # Barrel export
│   ├── features/
│   │   ├── trips/
│   │   │   ├── components/
│   │   │   │   ├── StatusToggle.tsx      # Available/On Trip/Offline toggle
│   │   │   │   ├── __tests__/
│   │   │   │   │   └── StatusToggle.test.tsx
│   │   │   │   └── index.ts
│   │   │   ├── hooks/
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── schedule/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── index.ts
│   │   ├── earnings/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── index.ts
│   │   └── profile/
│   │       ├── components/
│   │       ├── hooks/
│   │       └── index.ts
│   ├── lib/
│   │   ├── supabase.ts               # Supabase client
│   │   └── queryClient.ts            # TanStack Query client
│   ├── stores/
│   │   └── tripStore.ts              # Zustand store for trip state
│   └── utils/
│       └── index.ts
│
└── assets/
    ├── icon.png
    ├── splash.png
    ├── adaptive-icon.png
    └── favicon.png
```

### Architecture Patterns

**Root Layout Pattern (copy from rider, modify as needed):**

```typescript
// app/_layout.tsx
import '../global.css';

import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Stack } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

import { ErrorBoundary } from '../src/components';
import { asyncStoragePersister, queryClient } from '../src/lib/queryClient';

const tokenCache = {
  async getToken(key: string) {
    return SecureStore.getItemAsync(key);
  },
  async saveToken(key: string, value: string) {
    return SecureStore.setItemAsync(key, value);
  },
  async clearToken(key: string) {
    return SecureStore.deleteItemAsync(key);
  },
};

export default function RootLayout() {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    throw new Error(
      'Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Please set it in your environment variables.'
    );
  }

  return (
    <ErrorBoundary>
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <ClerkLoaded>
          <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{ persister: asyncStoragePersister }}>
            <Stack>
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="trips/[id]" options={{ headerShown: false }} />
            </Stack>
          </PersistQueryClientProvider>
        </ClerkLoaded>
      </ClerkProvider>
    </ErrorBoundary>
  );
}
```

**Tab Layout Pattern (driver-specific tabs):**

```typescript
// app/(tabs)/_layout.tsx
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { View, Text, ActivityIndicator } from 'react-native';

export default function TabLayout() {
  const { isSignedIn, isLoaded, signOut } = useAuth();
  const { user } = useUser();

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#1E40AF" />
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  // Check if user has driver role
  const userRole = user?.publicMetadata?.role as string | undefined;
  if (userRole !== 'driver') {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Ionicons name="warning" size={64} color="#EF4444" />
        <Text className="mt-4 text-center text-xl font-bold text-foreground">
          Driver Access Only
        </Text>
        <Text className="mt-2 text-center text-gray-600">
          This app is for verified drivers only. Please use the Rider app to book rides.
        </Text>
        <Pressable
          onPress={() => signOut()}
          className="mt-6 min-h-[48px] rounded-xl bg-red-500 px-8 py-3"
          accessibilityLabel="Sign out"
          accessibilityRole="button"
        >
          <Text className="text-lg font-semibold text-white">Sign Out</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1E40AF',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          height: 80,
          paddingBottom: 16,
          paddingTop: 8,
          backgroundColor: '#FAFAF9',
          borderTopColor: '#E5E5E5',
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: '600',
        },
        tabBarItemStyle: {
          minHeight: 48,
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
          tabBarAccessibilityLabel: 'Home tab - View your trip queue',
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} />,
          tabBarAccessibilityLabel: 'Schedule tab - View your upcoming rides',
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: 'Earnings',
          tabBarIcon: ({ color, size }) => <Ionicons name="wallet" size={size} color={color} />,
          tabBarAccessibilityLabel: 'Earnings tab - Track your earnings',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
          tabBarAccessibilityLabel: 'Profile tab - Manage your profile',
        }}
      />
    </Tabs>
  );
}
```

**StatusToggle Component Pattern:**

```typescript
// src/features/trips/components/StatusToggle.tsx
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type DriverStatus = 'available' | 'on_trip' | 'offline';

interface StatusOption {
  value: DriverStatus;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
}

const STATUS_OPTIONS: StatusOption[] = [
  { value: 'available', label: 'Available', icon: 'checkmark-circle', color: '#059669', bgColor: 'bg-green-100' },
  { value: 'on_trip', label: 'On Trip', icon: 'car', color: '#1E40AF', bgColor: 'bg-blue-100' },
  { value: 'offline', label: 'Offline', icon: 'moon', color: '#6B7280', bgColor: 'bg-gray-100' },
];

interface StatusToggleProps {
  value: DriverStatus;
  onChange: (status: DriverStatus) => void;
  disabled?: boolean;
  testID?: string;
}

export function StatusToggle({ value, onChange, disabled = false, testID }: StatusToggleProps) {
  const currentStatus = STATUS_OPTIONS.find(s => s.value === value) ?? STATUS_OPTIONS[2];

  return (
    <View testID={testID} className="rounded-xl bg-white p-4 shadow-sm">
      <Text className="mb-3 text-sm font-medium text-gray-500">Your Status</Text>

      <View className="flex-row gap-2">
        {STATUS_OPTIONS.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => !disabled && onChange(option.value)}
            disabled={disabled}
            className={`min-h-[56px] flex-1 flex-row items-center justify-center rounded-xl px-3 py-2 ${
              value === option.value
                ? `border-2 border-[${option.color}] ${option.bgColor}`
                : 'border border-gray-200 bg-white'
            } ${disabled ? 'opacity-50' : ''}`}
            accessibilityLabel={option.label}
            accessibilityRole="radio"
            accessibilityState={{ selected: value === option.value, disabled }}
            accessibilityHint={`Set your status to ${option.label}`}
            testID={`status-option-${option.value}`}
          >
            <Ionicons
              name={option.icon}
              size={20}
              color={value === option.value ? option.color : '#9CA3AF'}
            />
            <Text className={`ml-2 text-sm font-semibold ${
              value === option.value ? `text-[${option.color}]` : 'text-gray-500'
            }`}>
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
```

**Home Screen Pattern (placeholder with StatusToggle):**

```typescript
// app/(tabs)/index.tsx
import { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusToggle, type DriverStatus } from '../../src/features/trips/components';

export default function HomeScreen() {
  const [status, setStatus] = useState<DriverStatus>('offline');

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-6 pt-4">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-foreground">Good morning, Driver</Text>
          <Text className="text-gray-600">Ready to start driving?</Text>
        </View>

        {/* Status Toggle */}
        <View className="mb-6">
          <StatusToggle
            value={status}
            onChange={setStatus}
            testID="driver-status-toggle"
          />
        </View>

        {/* Trip Queue Placeholder */}
        <View className="mb-6 items-center justify-center rounded-xl bg-white p-8 shadow-sm">
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <Ionicons name="car" size={32} color="#1E40AF" />
          </View>
          <Text className="text-lg font-semibold text-foreground">Trip Queue</Text>
          <Text className="mt-2 text-center text-gray-600">
            Your assigned trips will appear here. Coming in Story 3.2.
          </Text>
        </View>

        {/* Quick Stats Placeholder */}
        <View className="mb-6 flex-row gap-4">
          <View className="flex-1 items-center rounded-xl bg-white p-4 shadow-sm">
            <Text className="text-2xl font-bold text-primary">0</Text>
            <Text className="text-sm text-gray-600">Today's Trips</Text>
          </View>
          <View className="flex-1 items-center rounded-xl bg-white p-4 shadow-sm">
            <Text className="text-2xl font-bold text-green-600">$0</Text>
            <Text className="text-sm text-gray-600">Today's Earnings</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
```

**Placeholder Screen Pattern (reuse for schedule, earnings, profile):**

```typescript
// app/(tabs)/schedule.tsx
import { View, Text, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ScheduleScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-6">
        <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-blue-100">
          <Ionicons name="calendar" size={40} color="#1E40AF" />
        </View>
        <Text className="text-xl font-bold text-foreground">Schedule</Text>
        <Text className="mt-2 text-center text-gray-600">
          View your upcoming scheduled rides here.
        </Text>
        <Text className="mt-4 text-sm text-gray-400">Coming in Story 3.7</Text>
      </View>
    </SafeAreaView>
  );
}
```

### What Already Exists (Reference from Rider App)

**Copy from `apps/rider/` as starting point:**

- `global.css` - Tailwind/NativeWind styles
- `tailwind.config.js` - NativeWind configuration
- `babel.config.js` - Babel config with NativeWind
- `metro.config.js` - Metro bundler config
- `src/lib/supabase.ts` - Supabase client setup
- `src/lib/queryClient.ts` - TanStack Query client
- `src/components/ErrorBoundary.tsx` - Error boundary wrapper
- `app/(auth)/` - Auth screens (modify for driver role check)

**Shared from `packages/shared/`:**

- Types (Ride, User, etc.)
- API client utilities
- Query keys

### Previous Story Intelligence (Epic 1 & 2)

**Key Learnings from Rider App:**

- Use NativeWind classes exclusively (no inline styles)
- All touch targets 48dp+ minimum (min-h-[48px] or min-h-[56px])
- SafeAreaView wrapper for all screens
- Tab bar height 80px with proper padding
- Use @expo/vector-icons Ionicons consistently
- Clerk role check via `user.publicMetadata.role`
- TanStack Query with AsyncStorage persistence

**Code Patterns:**

- Screen wrapper: `<SafeAreaView className="flex-1 bg-background">`
- Cards: `rounded-xl bg-white p-4 shadow-sm`
- Primary buttons: `min-h-[56px] flex-row items-center justify-center rounded-xl bg-primary`
- Status indicators: color-coded with icon + text

### Git Intelligence (Recent Commits)

```
66e563a feat(rider): implement ride management, driver selection, tracking, and profile features (Stories 2.6-2.12)
49e3b2e feat(rider): implement rider app shell and 3-tap booking flow (Stories 2.1-2.5)
```

**Commit Pattern:** `feat(driver): create driver app shell and navigation (Story 3.1)`

### Anti-Patterns to Avoid

- **DO NOT** copy rider app verbatim - driver has different tabs and purpose
- **DO NOT** forget role check for 'driver' role
- **DO NOT** use inline styles - use NativeWind classes
- **DO NOT** skip accessibility labels on navigation elements
- **DO NOT** make touch targets smaller than 48dp
- **DO NOT** implement trip queue yet - that's Story 3.2
- **DO NOT** implement status persistence yet - just local state for now

### Testing Checklist

- [ ] App launches without errors
- [ ] Sign-in flow works with phone/OTP
- [ ] Non-driver role shows error message and sign-out option
- [ ] Driver role can access all tabs
- [ ] All 4 tabs navigate correctly
- [ ] StatusToggle renders with 3 options
- [ ] StatusToggle selection works
- [ ] Tab bar has accessible labels
- [ ] All touch targets are 48dp+
- [ ] TypeScript compiles without errors
- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes

### Dependencies to Install (if not already)

Most dependencies should already be installed in the monorepo. Verify these are in `apps/driver/package.json`:

```json
{
  "dependencies": {
    "@clerk/clerk-expo": "^2.x",
    "@expo/vector-icons": "^14.x",
    "@tanstack/react-query": "^5.x",
    "@tanstack/react-query-persist-client": "^5.x",
    "@supabase/supabase-js": "^2.x",
    "expo": "~54.x",
    "expo-router": "~4.x",
    "expo-secure-store": "~14.x",
    "nativewind": "^4.x",
    "react": "18.x",
    "react-native": "0.76.x",
    "zustand": "^4.x"
  }
}
```

### Environment Variables Required

Create `apps/driver/.env.local`:

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
```

### References

- [Source: docs/epics.md#Story-3.1]
- [Source: docs/epics.md#Epic-3]
- [Source: docs/architecture.md#Mobile-App-Structure]
- [Source: apps/rider/app/_layout.tsx]
- [Source: apps/rider/app/(tabs)/_layout.tsx]

## Dev Agent Record

### Context Reference

- docs/architecture.md (Mobile App Structure, Authentication patterns)
- docs/epics.md (Epic 3, Story 3.1)
- apps/rider/app/ (Reference implementation patterns)
- apps/rider/src/ (Feature structure patterns)
- packages/shared/ (Shared types and utilities)

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

**New Files:**

- `apps/driver/global.css` - Tailwind styles
- `apps/driver/app/_layout.tsx` - Root layout with providers
- `apps/driver/app/index.tsx` - Entry redirect
- `apps/driver/app/+not-found.tsx` - 404 page
- `apps/driver/app/(auth)/_layout.tsx` - Auth stack layout
- `apps/driver/app/(auth)/sign-in.tsx` - Phone sign-in
- `apps/driver/app/(auth)/verify.tsx` - OTP verification
- `apps/driver/app/(tabs)/_layout.tsx` - Tab bar with role check
- `apps/driver/app/(tabs)/index.tsx` - Home screen with StatusToggle
- `apps/driver/app/(tabs)/schedule.tsx` - Schedule placeholder
- `apps/driver/app/(tabs)/earnings.tsx` - Earnings placeholder
- `apps/driver/app/(tabs)/profile.tsx` - Profile placeholder
- `apps/driver/app/trips/[id].tsx` - Trip detail placeholder
- `apps/driver/src/components/ErrorBoundary.tsx` - Error boundary
- `apps/driver/src/components/index.ts` - Barrel export
- `apps/driver/src/features/trips/components/StatusToggle.tsx` - Status toggle
- `apps/driver/src/features/trips/components/__tests__/StatusToggle.test.tsx`
- `apps/driver/src/features/trips/components/index.ts`
- `apps/driver/src/features/trips/hooks/index.ts`
- `apps/driver/src/features/trips/index.ts`
- `apps/driver/src/features/schedule/` (directory structure)
- `apps/driver/src/features/earnings/` (directory structure)
- `apps/driver/src/features/profile/` (directory structure)
- `apps/driver/src/lib/supabase.ts` - Supabase client
- `apps/driver/src/lib/queryClient.ts` - Query client setup
- `apps/driver/src/stores/tripStore.ts` - Zustand store placeholder

**Modified Files:**

- `apps/driver/app.json` - App configuration (if needed)
- `apps/driver/package.json` - Dependencies (if needed)

## Change Log

| Date       | Change                                                            | Author                |
| ---------- | ----------------------------------------------------------------- | --------------------- |
| 2025-12-13 | Story created with comprehensive developer context by BMad Method | Create-Story Workflow |
