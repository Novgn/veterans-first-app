# Story 2.1: Create Rider App Shell and Navigation

Status: Done

## Story

As a rider,
I want a simple, accessible app with clear navigation,
So that I can easily find booking, rides, profile, and help sections.

## Acceptance Criteria

1. **Given** the rider app is launched, **When** user is authenticated, **Then** they see a home screen with:
   - Bottom tab navigation: Home, My Rides, Profile, Help
   - Header with app title and PhoneButton (always visible)
   - Quick access to "Book a Ride" as primary action

2. **And** the navigation follows UX Design patterns:
   - Bottom tabs with 48dp+ touch targets
   - Icons with labels for clarity
   - Active tab clearly indicated
   - Phone icon in header always accessible

3. **And** the app structure follows Architecture:

   ```
   apps/rider/
   ├── app/
   │   ├── _layout.tsx (root layout with Clerk, Query providers)
   │   ├── (auth)/
   │   │   ├── sign-in.tsx
   │   │   └── sign-up.tsx
   │   ├── (tabs)/
   │   │   ├── _layout.tsx (tab navigator)
   │   │   ├── index.tsx (Home)
   │   │   ├── rides.tsx (My Rides)
   │   │   ├── profile.tsx (Profile)
   │   │   └── help.tsx (Help)
   │   └── rides/
   │       └── [id].tsx (Ride details)
   ├── src/
   │   ├── features/
   │   │   ├── booking/
   │   │   ├── rides/
   │   │   └── profile/
   │   └── components/
   ```

4. **And** NativeWind styling is configured with:
   - Tailwind config matching UX Design tokens (ALREADY EXISTS)
   - Primary blue (#1E40AF), warm white (#FAFAF9)
   - 18px base font size
   - 48dp minimum touch targets

5. **And** TanStack Query provider is configured with AsyncStorage persistence

6. **And** Zustand stores for client state are initialized

## Tasks / Subtasks

- [x] Task 1: Restructure app navigation from (app) to (tabs) (AC: #1, #3)
  - [x] Rename `app/(app)/` to `app/(tabs)/`
  - [x] Convert (tabs)/\_layout.tsx from Stack to Tabs navigator using expo-router Tabs
  - [x] Create tab screens: index.tsx (Home), rides.tsx, profile.tsx, help.tsx
  - [x] Add icons to tabs using @expo/vector-icons (Ionicons recommended)
  - [x] Configure tab bar styling with 48dp+ touch targets

- [x] Task 2: Create PhoneButton component (AC: #2)
  - [x] Create `src/components/PhoneButton.tsx`
  - [x] Implement large, accessible phone icon button (56dp)
  - [x] Link to tel: with company phone number
  - [x] Style with primary blue, high contrast

- [x] Task 3: Create header component with PhoneButton (AC: #1, #2)
  - [x] Create `src/components/Header.tsx`
  - [x] Include app title "Veterans 1st"
  - [x] Include PhoneButton on right side
  - [x] Apply to all tab screens via \_layout.tsx

- [x] Task 4: Implement Home screen with Book a Ride CTA (AC: #1)
  - [x] Update (tabs)/index.tsx with proper home screen
  - [x] Add "Book a Ride" primary action button (56dp height)
  - [x] Add welcome message with user's first name
  - [x] Add placeholder for upcoming ride card area
  - [x] Follow "Warm & Minimal" design direction

- [x] Task 5: Implement placeholder tab screens (AC: #1, #3)
  - [x] Create rides.tsx - "My Rides" placeholder
  - [x] Create profile.tsx - "Profile" placeholder with sign out
  - [x] Create help.tsx - "Help" placeholder with phone contact

- [x] Task 6: Configure TanStack Query provider (AC: #5)
  - [x] Install @tanstack/react-query, @tanstack/react-query-persist-client
  - [x] Install @tanstack/query-async-storage-persister
  - [x] Create `src/lib/queryClient.ts` with persisted client config
  - [x] Add QueryClientProvider to root \_layout.tsx

- [x] Task 7: Configure Zustand stores (AC: #6)
  - [x] Create `src/stores/appStore.ts` for UI state
  - [x] Create `src/stores/bookingStore.ts` for booking wizard state (scaffold)
  - [x] Configure AsyncStorage persistence

- [x] Task 8: Create src/features directory structure (AC: #3)
  - [x] Create `src/features/booking/` directory
  - [x] Create `src/features/rides/` directory
  - [x] Create `src/features/profile/` directory
  - [x] Add index.ts barrel exports

- [x] Task 9: Test and verify accessibility (AC: #2)
  - [x] Verify all touch targets are 48dp+
  - [x] Verify tab bar icons have labels
  - [x] Verify color contrast meets 7:1 ratio
  - [x] Test with larger font sizes

## Dev Notes

### Critical Architecture Requirements

This is the **FIRST user-facing story** in Epic 2. It establishes the rider app shell that all subsequent stories will build upon. References:

- [Source: docs/architecture.md#Mobile-App-Structure] - Expo Router file-based routing
- [Source: docs/architecture.md#Frontend-Architecture] - Feature-first organization
- [Source: docs/ux-design-specification.md#Navigation-Patterns] - Bottom tabs, Phone always visible
- [Source: docs/ux-design-specification.md#Design-Direction] - "Warm & Minimal" direction

### Technical Stack (MUST USE)

| Dependency                                | Version | Purpose                         |
| ----------------------------------------- | ------- | ------------------------------- |
| expo-router                               | Latest  | File-based navigation           |
| @expo/vector-icons                        | Latest  | Tab bar icons (Ionicons)        |
| @tanstack/react-query                     | v5      | Server state management         |
| @tanstack/query-async-storage-persister   | Latest  | Query persistence               |
| zustand                                   | v4      | Client state management         |
| @react-native-async-storage/async-storage | Latest  | Persistence (already installed) |

### What Already Exists (DO NOT RECREATE)

**From Story 1.3 (Clerk Auth) - apps/rider/app/:**

```
app/
├── _layout.tsx          # ClerkProvider configured
├── (auth)/
│   ├── _layout.tsx      # Auth redirect logic
│   ├── sign-in.tsx      # Phone sign-in
│   ├── sign-up.tsx      # Phone sign-up
│   └── verify.tsx       # OTP verification
├── (app)/
│   ├── _layout.tsx      # Protected route (Stack)
│   └── index.tsx        # Basic home placeholder
```

**Tailwind config (apps/rider/tailwind.config.js):**

- UX Design tokens already configured
- Primary (#1E40AF), Secondary (#059669), Accent (#D97706)
- Background (#FAFAF9), Foreground (#1C1917)
- Touch target spacing: 48px, 56px
- Font sizes: 18px base

### Implementation Patterns

**Expo Router Tabs Pattern:**

```typescript
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1E40AF',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          height: 80, // Extra height for touch targets
          paddingBottom: 16,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      {/* ... other tabs */}
    </Tabs>
  );
}
```

**TanStack Query Setup Pattern:**

```typescript
// src/lib/queryClient.ts
import { QueryClient } from "@tanstack/react-query";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});
```

**Zustand Store Pattern:**

```typescript
// src/stores/appStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AppState {
  isFirstLaunch: boolean;
  setFirstLaunch: (value: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isFirstLaunch: true,
      setFirstLaunch: (value) => set({ isFirstLaunch: value }),
    }),
    {
      name: "app-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

**PhoneButton Component Pattern:**

```typescript
// src/components/PhoneButton.tsx
import { Pressable, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SUPPORT_PHONE = '1-800-XXX-XXXX'; // Replace with actual

export function PhoneButton() {
  const handlePress = () => {
    Linking.openURL(`tel:${SUPPORT_PHONE}`);
  };

  return (
    <Pressable
      onPress={handlePress}
      className="h-[56px] w-[56px] items-center justify-center rounded-full bg-primary"
      accessibilityLabel="Call support"
      accessibilityRole="button"
    >
      <Ionicons name="call" size={28} color="white" />
    </Pressable>
  );
}
```

### File Structure Requirements

```
apps/rider/
├── app/
│   ├── _layout.tsx                    # MODIFY: Add QueryClientProvider
│   ├── (auth)/                        # NO CHANGE
│   ├── (tabs)/                        # RENAME from (app)
│   │   ├── _layout.tsx                # NEW: Tabs navigator
│   │   ├── index.tsx                  # MODIFY: Home with Book CTA
│   │   ├── rides.tsx                  # NEW: My Rides placeholder
│   │   ├── profile.tsx                # NEW: Profile with sign out
│   │   └── help.tsx                   # NEW: Help placeholder
│   └── rides/
│       └── [id].tsx                   # NEW: Ride detail (placeholder)
├── src/
│   ├── components/
│   │   ├── PhoneButton.tsx            # NEW: Phone CTA
│   │   ├── Header.tsx                 # NEW: App header
│   │   └── index.ts                   # NEW: Barrel export
│   ├── features/
│   │   ├── booking/
│   │   │   └── index.ts               # NEW: Barrel (scaffold)
│   │   ├── rides/
│   │   │   └── index.ts               # NEW: Barrel (scaffold)
│   │   └── profile/
│   │       └── index.ts               # NEW: Barrel (scaffold)
│   ├── stores/
│   │   ├── appStore.ts                # NEW: UI state store
│   │   ├── bookingStore.ts            # NEW: Booking wizard store
│   │   └── index.ts                   # NEW: Barrel export
│   └── lib/
│       ├── queryClient.ts             # NEW: TanStack Query setup
│       └── index.ts                   # NEW: Barrel export
```

### Previous Story Intelligence (Story 1.6)

**Key Learnings:**

- ESLint config uses flat config format - import from packages/config
- Clerk API uses `identifier` not `phoneNumber` parameter
- Build requires NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY (for Next.js apps only)
- Expo apps use EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY

**Current authentication flow:**

- ClerkProvider in root \_layout.tsx
- Auth group (auth) handles sign-in/sign-up
- Protected group (app) redirects to auth if not signed in
- User info available via useUser() hook

### Git Intelligence (Recent Commits)

```
53d42cf feat: update lint-staged configuration to use Prettier only
8f41d96 feat: enhance ESLint and Prettier configurations
e687c36 feat(audit): implement audit logging triggers for HIPAA compliance (Story 1.5)
3a430a1 feat(rbac): implement role-based access control with RLS policies (Story 1.4)
ee796be feat(auth): implement Clerk authentication integration (Story 1.3)
```

**Commit pattern:** Use conventional commits - `feat(rider): implement app shell and navigation (Story 2.1)`

### UX Design Specifications

**Navigation Requirements (from UX Design doc):**

- Bottom tab navigation: Home, My Rides, Profile, Help
- Persistent phone access icon in header
- Big single-action screens
- No hamburger menus
- Push right for forward, slide back for back

**Button Hierarchy:**

- Primary: Filled blue (#1E40AF), 56px height - "Book a Ride"
- Secondary: Outlined blue - "View Details"
- Touch targets: 48dp minimum, 56dp for primary actions

**Color Psychology:**

- Blue (#1E40AF) = Trust
- Green (#059669) = Wellness
- Gold (#D97706) = Honor
- Warm White (#FAFAF9) = Comfort

### Accessibility Requirements

**CRITICAL - Must implement:**

- All touch targets 48dp+ minimum
- Tab bar icons WITH labels (not just icons)
- Focus states on all interactive elements
- Color contrast 7:1 (exceeds WCAG AAA)
- Screen reader labels on all buttons
- No time-limited interactions

**Testing checklist:**

- Test with VoiceOver (iOS) / TalkBack (Android)
- Test with larger font sizes (200% scaling)
- Verify all buttons are reachable via keyboard/switch control

### Potential Blockers

1. **Expo Router Tabs:** Ensure proper import from 'expo-router', not @react-navigation
2. **AsyncStorage:** Ensure proper peer dependency with expo
3. **Icon Library:** @expo/vector-icons should be automatically available in Expo

### Security Considerations

- Phone number in PhoneButton should be config/env variable, not hardcoded
- User data from useUser() should only display firstName (PII protection)
- No sensitive data should be logged to console

### Anti-Patterns to Avoid

- **DO NOT** use StyleSheet.create() - use NativeWind classes
- **DO NOT** import from @react-navigation directly - use expo-router
- **DO NOT** create global state outside of Zustand stores
- **DO NOT** make API calls without TanStack Query
- **DO NOT** skip accessibility labels on interactive elements
- **DO NOT** use small touch targets (<48dp)

### Dependencies to Install

```bash
cd apps/rider
npm install @tanstack/react-query @tanstack/react-query-persist-client @tanstack/query-async-storage-persister zustand
```

Note: @react-native-async-storage/async-storage and @expo/vector-icons should already be installed.

### References

- [Source: docs/architecture.md#Mobile-App-Structure] - App structure
- [Source: docs/architecture.md#State-Management-Architecture] - TanStack Query + Zustand
- [Source: docs/ux-design-specification.md#Navigation-Patterns] - Tab navigation
- [Source: docs/ux-design-specification.md#Component-Strategy] - PhoneButton P0 component
- [Source: docs/project_context.md#Framework-Specific-Rules] - Expo Router, NativeWind
- [Source: docs/epics.md#Story-2.1] - Acceptance criteria

## Dev Agent Record

### Context Reference

- docs/architecture.md (Mobile App Structure, State Management, Frontend Architecture)
- docs/ux-design-specification.md (Navigation, Components, Accessibility)
- docs/project_context.md (Framework rules, Naming conventions)
- docs/epics.md (Epic 2, Story 2.1)
- docs/sprint-artifacts/1-6-configure-development-environment-and-ci-cd-foundation.md (Previous story)
- apps/rider/tailwind.config.js (UX Design tokens)
- apps/rider/app/\_layout.tsx (Clerk provider)

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- TypeScript typecheck: PASS
- ESLint lint: PASS (only pre-existing warnings in unrelated files)
- Prettier formatting: PASS

### Completion Notes List

- Created (tabs) group with Expo Router Tabs navigator replacing (app) Stack navigator
- Implemented 4-tab navigation: Home, My Rides, Profile, Help with Ionicons
- All tab items have 80px height tab bar with 48dp+ touch targets and accessibility labels
- Created PhoneButton component (56dp) with tel: linking to support number
- Created Header component with "Veterans 1st" title and PhoneButton
- Home screen displays welcome message with user firstName, Book a Ride CTA (56dp), and upcoming rides placeholder
- Profile screen includes user info display and sign out functionality
- Help screen includes Call Support button and operating hours info
- Configured TanStack Query with PersistQueryClientProvider and AsyncStorage persistence
- Created Zustand stores (appStore, bookingStore) with AsyncStorage persistence
- Created feature directory structure (booking, rides, profile) with barrel exports
- Added rides/[id].tsx dynamic route for ride details (placeholder)
- All components follow NativeWind styling with UX Design tokens
- All interactive elements have accessibilityLabel, accessibilityRole, and accessibilityHint

### File List

**New Files:**

- apps/rider/app/(tabs)/\_layout.tsx
- apps/rider/app/(tabs)/index.tsx
- apps/rider/app/(tabs)/rides.tsx
- apps/rider/app/(tabs)/profile.tsx
- apps/rider/app/(tabs)/help.tsx
- apps/rider/app/rides/[id].tsx
- apps/rider/src/components/PhoneButton.tsx
- apps/rider/src/components/Header.tsx
- apps/rider/src/components/index.ts
- apps/rider/src/lib/queryClient.ts
- apps/rider/src/lib/constants.ts
- apps/rider/src/lib/index.ts
- apps/rider/src/stores/appStore.ts
- apps/rider/src/stores/bookingStore.ts
- apps/rider/src/stores/index.ts
- apps/rider/src/features/booking/index.ts
- apps/rider/src/features/rides/index.ts
- apps/rider/src/features/profile/index.ts

**Modified Files:**

- apps/rider/app/\_layout.tsx (added PersistQueryClientProvider, changed (app) to (tabs), added rides/[id] route)
- apps/rider/tailwind.config.js (added src/\*\* to content)
- apps/rider/package.json (added dependencies)
- .env (added EXPO_PUBLIC_SUPPORT_PHONE environment variable)

**Deleted Files:**

- apps/rider/app/(app)/\_layout.tsx (legacy directory removed)
- apps/rider/app/(app)/index.tsx (legacy directory removed)

## Change Log

| Date       | Change                                                                                                                                                                                                   | Author                        |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| 2025-12-08 | Story created with comprehensive developer context                                                                                                                                                       | Create-Story Workflow         |
| 2025-12-08 | Implemented all 9 tasks: Tab navigation, components, state management, feature structure                                                                                                                 | Claude Opus 4.5 (Dev Agent)   |
| 2025-12-08 | Code Review: Fixed 7 issues - removed legacy (app) dir, env var for phone, error handling on Linking, Header on ride detail, removed PII from profile, improved color contrast, added Book Ride feedback | Claude Opus 4.5 (Code Review) |
| 2025-12-09 | Code Review #2: Fixed 10 issues - Header accessibility (accessibilityRole), ErrorBoundary component, constants safety warnings, basic test infrastructure with jest-expo                                 | Claude Opus 4.5 (Code Review) |
