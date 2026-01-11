# Story 2.14: Implement Comfort Preferences

Status: done

## Story

As a rider,
I want to specify my comfort preferences,
So that every ride feels personalized and comfortable.

## Acceptance Criteria

1. **Given** a rider navigates to Comfort Preferences from Profile tab, **When** the screen loads, **Then** they can configure:
   - Temperature preference: Cool, Normal, Warm
   - Conversation preference: Quiet ride, Some conversation, Chatty
   - Music preference: No music, Soft background, Any music
   - Other notes (free text, optional)

2. **Given** a rider saves comfort preferences, **When** the preferences are stored, **Then**:
   - Preferences are saved to `rider_preferences` table (existing columns from 2.13 migration)
   - Success feedback is shown to the rider
   - Profile screen reflects the updated preferences
   - Data syncs across all devices via Supabase

3. **Given** a rider has saved comfort preferences, **When** a driver views the rider's profile, **Then**:
   - Drivers see comfort preferences in RiderProfileCard (future Epic 3)
   - Supports the PRD's "relationship-first" model: "Dave knows Margaret likes it cool and quiet"
   - Preferences are visible before pickup

4. **And** accessibility requirements for the screen itself:
   - All form fields have proper accessibilityLabel and accessibilityHint
   - All touch targets minimum 48dp (min-h-[48px])
   - Clear visual feedback on selection changes
   - Screen reader navigation flows logically

## Tasks / Subtasks

- [x] Task 1: Verify database schema supports comfort preferences (AC: #2)
  - [x] Confirm rider_preferences table has: comfort_temperature, conversation_preference, music_preference, other_notes columns
  - [x] Verify constraints exist for enum values
  - [x] Created migration 0015_rider_comfort_preferences.sql (columns were NOT in 2.13 as documented)

- [x] Task 2: Create comfort preferences hooks (AC: #2, #3)
  - [x] Create `src/features/profile/hooks/useComfortPreferences.ts` for fetching
  - [x] Create `src/features/profile/hooks/useUpdateComfortPreferences.ts` for mutations
  - [x] Add TanStack Query integration with optimistic updates
  - [x] Export from `src/features/profile/hooks/index.ts`
  - [x] Add unit tests

- [x] Task 3: Create ComfortPreferencesScreen (AC: #1, #4)
  - [x] Create `app/profile/comfort-preferences.tsx` screen
  - [x] Implement TemperatureSelector component (radio buttons with icons)
  - [x] Implement ConversationSelector component (radio buttons)
  - [x] Implement MusicSelector component (radio buttons)
  - [x] Implement OtherNotesInput component (TextInput)
  - [x] Add Save button with loading state
  - [x] Add all accessibility labels and hints
  - [x] Add unit tests

- [x] Task 4: Update Profile screen to link to Comfort Preferences (AC: #3)
  - [x] Update `app/(tabs)/profile.tsx` - Change "Coming Soon" to Link
  - [x] Add summary display of current comfort preferences
  - [x] Show checkmark icon when preferences are set

- [x] Task 5: Test and verify (AC: #4)
  - [x] All new components have unit tests (48 tests pass)
  - [x] Preferences save and retrieve correctly
  - [x] Accessibility labels properly configured
  - [x] All touch targets are 48dp+ (min-h-[56px] and min-h-[80px])
  - [x] TypeScript compiles without errors
  - [x] Run `npm run lint` and `npm run typecheck`

## Dev Notes

### Critical Requirements Summary

This story implements **Rider Comfort Preferences** enabling riders to specify temperature, conversation, and music preferences. This is a quality-of-life feature supporting the "relationship-first" philosophy where drivers know and remember rider preferences.

**FR Coverage:**

- FR73: Riders can specify comfort preferences (temperature, conversation level, music)

**UX Philosophy:** "Know your rider. Dave arrives knowing Margaret likes it cool and quiet - every ride feels personalized."

### Technical Stack (MUST USE)

| Dependency            | Version  | Purpose                             |
| --------------------- | -------- | ----------------------------------- |
| @tanstack/react-query | ^5.x     | Server state management             |
| expo-router           | ~4.0.x   | Navigation to preferences screen    |
| NativeWind            | ^4.x     | Styling (Tailwind for React Native) |
| @clerk/clerk-expo     | existing | User authentication context         |
| @supabase/supabase-js | existing | Database operations                 |

**DO NOT USE:** react-hook-form (not installed in project) - use React state with custom validation pattern from Story 2.12/2.13

### File Structure Requirements

```
apps/rider/
├── app/
│   ├── (tabs)/
│   │   └── profile.tsx                             # MODIFY: Link to comfort prefs, show summary
│   └── profile/
│       ├── saved-places.tsx                        # EXISTS - no changes
│       ├── accessibility-preferences.tsx           # EXISTS - no changes
│       └── comfort-preferences.tsx                 # NEW: Comfort preferences screen
├── src/
│   ├── features/
│   │   ├── profile/
│   │   │   ├── components/
│   │   │   │   ├── TemperatureSelector.tsx         # NEW: Temperature preference picker
│   │   │   │   ├── ConversationSelector.tsx        # NEW: Conversation preference picker
│   │   │   │   ├── MusicSelector.tsx               # NEW: Music preference picker
│   │   │   │   ├── __tests__/
│   │   │   │   │   ├── TemperatureSelector.test.tsx  # NEW
│   │   │   │   │   ├── ConversationSelector.test.tsx # NEW
│   │   │   │   │   └── MusicSelector.test.tsx        # NEW
│   │   │   │   └── index.ts                        # MODIFY: Export new components
│   │   │   ├── hooks/
│   │   │   │   ├── useComfortPreferences.ts        # NEW: Fetch preferences hook
│   │   │   │   ├── useUpdateComfortPreferences.ts  # NEW: Mutation hook
│   │   │   │   ├── __tests__/
│   │   │   │   │   ├── useComfortPreferences.test.ts      # NEW
│   │   │   │   │   └── useUpdateComfortPreferences.test.ts # NEW
│   │   │   │   └── index.ts                        # MODIFY: Export new hooks
│   │   │   └── index.ts                            # MODIFY: Export
```

### Database Schema (ALREADY EXISTS)

The comfort preference columns were added to `rider_preferences` table in Story 2.13 migration (0014_rider_accessibility_preferences.sql):

```sql
-- These columns ALREADY EXIST in rider_preferences table:
comfort_temperature TEXT CHECK (comfort_temperature IN ('cool', 'normal', 'warm')),
conversation_preference TEXT CHECK (conversation_preference IN ('quiet', 'some', 'chatty')),
music_preference TEXT CHECK (music_preference IN ('none', 'soft', 'any')),
other_notes TEXT
```

**Drizzle Schema (already defined in packages/shared/src/db/schema.ts):**

```typescript
// These fields ALREADY EXIST in riderPreferences:
comfortTemperature: text("comfort_temperature"), // 'cool', 'normal', 'warm'
conversationPreference: text("conversation_preference"), // 'quiet', 'some', 'chatty'
musicPreference: text("music_preference"), // 'none', 'soft', 'any'
otherNotes: text("other_notes"),
```

**NO DATABASE MIGRATION NEEDED** - just use the existing columns.

### Architecture Patterns

**useComfortPreferences Hook Pattern:**

```typescript
// src/features/profile/hooks/useComfortPreferences.ts
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-expo";
import { supabase } from "../../../lib/supabase";

export type TemperaturePreference = "cool" | "normal" | "warm" | null;
export type ConversationPreference = "quiet" | "some" | "chatty" | null;
export type MusicPreference = "none" | "soft" | "any" | null;

export interface ComfortPreferences {
  comfortTemperature: TemperaturePreference;
  conversationPreference: ConversationPreference;
  musicPreference: MusicPreference;
  otherNotes: string | null;
}

export const comfortKeys = {
  all: ["comfort-preferences"] as const,
  detail: (userId: string) => [...comfortKeys.all, userId] as const,
};

export function useComfortPreferences() {
  const { userId } = useAuth();

  return useQuery({
    queryKey: comfortKeys.detail(userId ?? ""),
    queryFn: async (): Promise<ComfortPreferences | null> => {
      if (!userId) return null;

      // First get the user's internal ID from clerk_id
      const { data: user } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", userId)
        .single();

      if (!user) return null;

      const { data, error } = await supabase
        .from("rider_preferences")
        .select(
          `
          comfort_temperature,
          conversation_preference,
          music_preference,
          other_notes
        `
        )
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows returned

      return {
        comfortTemperature: data?.comfort_temperature ?? null,
        conversationPreference: data?.conversation_preference ?? null,
        musicPreference: data?.music_preference ?? null,
        otherNotes: data?.other_notes ?? null,
      };
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

**useUpdateComfortPreferences Hook Pattern:**

```typescript
// src/features/profile/hooks/useUpdateComfortPreferences.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-expo";
import { supabase } from "../../../lib/supabase";
import { comfortKeys, type ComfortPreferences } from "./useComfortPreferences";

export function useUpdateComfortPreferences() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ComfortPreferences) => {
      if (!userId) throw new Error("Not authenticated");

      // Get the user's internal ID from clerk_id
      const { data: user } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", userId)
        .single();

      if (!user) throw new Error("User not found");

      // Upsert the rider_preferences record
      const { error } = await supabase.from("rider_preferences").upsert(
        {
          user_id: user.id,
          comfort_temperature: input.comfortTemperature,
          conversation_preference: input.conversationPreference,
          music_preference: input.musicPreference,
          other_notes: input.otherNotes,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      );

      if (error) throw error;
    },
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: comfortKeys.detail(userId ?? "") });
      const previousPrefs = queryClient.getQueryData<ComfortPreferences>(
        comfortKeys.detail(userId ?? "")
      );

      queryClient.setQueryData(comfortKeys.detail(userId ?? ""), newData);

      return { previousPrefs };
    },
    onError: (_err, _newData, context) => {
      if (context?.previousPrefs) {
        queryClient.setQueryData(comfortKeys.detail(userId ?? ""), context.previousPrefs);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: comfortKeys.detail(userId ?? "") });
    },
  });
}
```

**TemperatureSelector Component Pattern:**

```typescript
// src/features/profile/components/TemperatureSelector.tsx
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { TemperaturePreference } from '../hooks/useComfortPreferences';

interface TemperatureOption {
  value: TemperaturePreference;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
  color: string;
}

const TEMPERATURE_OPTIONS: TemperatureOption[] = [
  { value: 'cool', label: 'Cool', icon: 'snow', description: 'Prefer cooler temperature', color: '#3B82F6' },
  { value: 'normal', label: 'Normal', icon: 'thermometer', description: 'Regular temperature is fine', color: '#10B981' },
  { value: 'warm', label: 'Warm', icon: 'sunny', description: 'Prefer warmer temperature', color: '#F59E0B' },
];

interface TemperatureSelectorProps {
  value: TemperaturePreference;
  onChange: (value: TemperaturePreference) => void;
  testID?: string;
}

export function TemperatureSelector({ value, onChange, testID }: TemperatureSelectorProps) {
  return (
    <View testID={testID}>
      <Text className="mb-3 text-lg font-semibold text-foreground">Temperature</Text>
      <Text className="mb-4 text-sm text-gray-600">
        What temperature do you prefer during your rides?
      </Text>

      <View className="flex-row gap-3">
        {TEMPERATURE_OPTIONS.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            className={`min-h-[80px] flex-1 items-center justify-center rounded-xl px-2 py-3 ${
              value === option.value
                ? 'border-2 border-primary bg-primary/10'
                : 'border border-gray-200 bg-white'
            }`}
            accessibilityLabel={option.label}
            accessibilityRole="radio"
            accessibilityState={{ selected: value === option.value }}
            accessibilityHint={option.description}
            testID={`temp-option-${option.value}`}
          >
            <Ionicons
              name={option.icon}
              size={28}
              color={value === option.value ? '#1E40AF' : option.color}
            />
            <Text className={`mt-2 text-sm font-medium ${
              value === option.value ? 'text-primary' : 'text-foreground'
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

**ConversationSelector Component Pattern:**

```typescript
// src/features/profile/components/ConversationSelector.tsx
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ConversationPreference } from '../hooks/useComfortPreferences';

interface ConversationOption {
  value: ConversationPreference;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
}

const CONVERSATION_OPTIONS: ConversationOption[] = [
  { value: 'quiet', label: 'Quiet Ride', icon: 'volume-mute', description: 'Prefer minimal conversation' },
  { value: 'some', label: 'Some Chat', icon: 'chatbubble', description: 'Light conversation is nice' },
  { value: 'chatty', label: 'Chatty', icon: 'chatbubbles', description: 'Love a good conversation' },
];

interface ConversationSelectorProps {
  value: ConversationPreference;
  onChange: (value: ConversationPreference) => void;
  testID?: string;
}

export function ConversationSelector({ value, onChange, testID }: ConversationSelectorProps) {
  return (
    <View testID={testID}>
      <Text className="mb-3 text-lg font-semibold text-foreground">Conversation</Text>
      <Text className="mb-4 text-sm text-gray-600">
        How much do you like to chat during rides?
      </Text>

      <View className="gap-2">
        {CONVERSATION_OPTIONS.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            className={`min-h-[56px] flex-row items-center rounded-xl px-4 ${
              value === option.value
                ? 'border-2 border-primary bg-primary/10'
                : 'border border-gray-200 bg-white'
            }`}
            accessibilityLabel={option.label}
            accessibilityRole="radio"
            accessibilityState={{ selected: value === option.value }}
            accessibilityHint={option.description}
            testID={`conversation-option-${option.value}`}
          >
            <View className={`mr-4 h-10 w-10 items-center justify-center rounded-full ${
              value === option.value ? 'bg-primary' : 'bg-gray-100'
            }`}>
              <Ionicons
                name={option.icon}
                size={20}
                color={value === option.value ? '#FFFFFF' : '#6B7280'}
              />
            </View>
            <View className="flex-1">
              <Text className={`text-base font-medium ${
                value === option.value ? 'text-primary' : 'text-foreground'
              }`}>
                {option.label}
              </Text>
              <Text className="text-sm text-gray-500">{option.description}</Text>
            </View>
            {value === option.value && (
              <Ionicons name="checkmark-circle" size={24} color="#1E40AF" />
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}
```

**MusicSelector Component Pattern:**

```typescript
// src/features/profile/components/MusicSelector.tsx
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { MusicPreference } from '../hooks/useComfortPreferences';

interface MusicOption {
  value: MusicPreference;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
}

const MUSIC_OPTIONS: MusicOption[] = [
  { value: 'none', label: 'No Music', icon: 'volume-off', description: 'Prefer silence' },
  { value: 'soft', label: 'Soft Background', icon: 'musical-note', description: 'Quiet, ambient music' },
  { value: 'any', label: 'Any Music', icon: 'musical-notes', description: 'Fine with any music' },
];

interface MusicSelectorProps {
  value: MusicPreference;
  onChange: (value: MusicPreference) => void;
  testID?: string;
}

export function MusicSelector({ value, onChange, testID }: MusicSelectorProps) {
  return (
    <View testID={testID}>
      <Text className="mb-3 text-lg font-semibold text-foreground">Music</Text>
      <Text className="mb-4 text-sm text-gray-600">
        What's your music preference for rides?
      </Text>

      <View className="flex-row gap-3">
        {MUSIC_OPTIONS.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            className={`min-h-[80px] flex-1 items-center justify-center rounded-xl px-2 py-3 ${
              value === option.value
                ? 'border-2 border-primary bg-primary/10'
                : 'border border-gray-200 bg-white'
            }`}
            accessibilityLabel={option.label}
            accessibilityRole="radio"
            accessibilityState={{ selected: value === option.value }}
            accessibilityHint={option.description}
            testID={`music-option-${option.value}`}
          >
            <Ionicons
              name={option.icon}
              size={28}
              color={value === option.value ? '#1E40AF' : '#6B7280'}
            />
            <Text className={`mt-2 text-center text-sm font-medium ${
              value === option.value ? 'text-primary' : 'text-foreground'
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

**ComfortPreferencesScreen Pattern:**

```typescript
// app/profile/comfort-preferences.tsx
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  TemperatureSelector,
  ConversationSelector,
  MusicSelector,
} from '../../src/features/profile/components';
import {
  useComfortPreferences,
  useUpdateComfortPreferences,
  type TemperaturePreference,
  type ConversationPreference,
  type MusicPreference,
} from '../../src/features/profile/hooks';

export default function ComfortPreferencesScreen() {
  const { data: preferences, isLoading } = useComfortPreferences();
  const updatePreferences = useUpdateComfortPreferences();

  // Local state for form
  const [temperature, setTemperature] = useState<TemperaturePreference>(null);
  const [conversation, setConversation] = useState<ConversationPreference>(null);
  const [music, setMusic] = useState<MusicPreference>(null);
  const [otherNotes, setOtherNotes] = useState('');

  // Initialize form with existing preferences
  useEffect(() => {
    if (preferences) {
      setTemperature(preferences.comfortTemperature);
      setConversation(preferences.conversationPreference);
      setMusic(preferences.musicPreference);
      setOtherNotes(preferences.otherNotes ?? '');
    }
  }, [preferences]);

  const handleSave = async () => {
    Keyboard.dismiss();
    try {
      await updatePreferences.mutateAsync({
        comfortTemperature: temperature,
        conversationPreference: conversation,
        musicPreference: music,
        otherNotes: otherNotes || null,
      });
      Alert.alert('Saved', 'Your comfort preferences have been updated.');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Could not save your preferences. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#1E40AF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Stack.Screen
        options={{
          title: 'Comfort Preferences',
          headerBackTitle: 'Profile',
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-6 pt-4"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="mb-6 text-sm text-gray-600">
            Let your driver know your preferences for a more comfortable ride.
          </Text>

          {/* Temperature Section */}
          <View className="mb-6">
            <TemperatureSelector
              value={temperature}
              onChange={setTemperature}
              testID="temperature-selector"
            />
          </View>

          {/* Conversation Section */}
          <View className="mb-6">
            <ConversationSelector
              value={conversation}
              onChange={setConversation}
              testID="conversation-selector"
            />
          </View>

          {/* Music Section */}
          <View className="mb-6">
            <MusicSelector
              value={music}
              onChange={setMusic}
              testID="music-selector"
            />
          </View>

          {/* Other Notes Section */}
          <View className="mb-6">
            <Text className="mb-3 text-lg font-semibold text-foreground">
              Other Notes
            </Text>
            <Text className="mb-3 text-sm text-gray-600">
              Any other preferences you'd like your driver to know about.
            </Text>
            <TextInput
              value={otherNotes}
              onChangeText={setOtherNotes}
              multiline
              numberOfLines={4}
              maxLength={500}
              placeholder="e.g., I prefer windows up, or I like to sit in the back right seat"
              className="min-h-[100px] rounded-xl border border-gray-200 bg-white p-4 text-base text-foreground"
              textAlignVertical="top"
              accessibilityLabel="Other notes"
              accessibilityHint="Enter any additional preferences for your driver"
              testID="other-notes-input"
            />
          </View>

          {/* Save Button */}
          <Pressable
            onPress={handleSave}
            disabled={updatePreferences.isPending}
            className={`mb-8 min-h-[56px] flex-row items-center justify-center rounded-xl ${
              updatePreferences.isPending ? 'bg-primary/50' : 'bg-primary'
            }`}
            accessibilityLabel="Save comfort preferences"
            accessibilityRole="button"
            accessibilityState={{ disabled: updatePreferences.isPending }}
            testID="save-button"
          >
            {updatePreferences.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark" size={24} color="#FFFFFF" />
                <Text className="ml-2 text-lg font-semibold text-white">Save Preferences</Text>
              </>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
```

### What Already Exists (DO NOT RECREATE)

**From Story 2.13 (Accessibility Preferences):**

- `rider_preferences` table with comfort columns already defined
- Drizzle schema with comfortTemperature, conversationPreference, musicPreference, otherNotes
- Accessibility preferences screen and hooks

**From Story 2.12 (Profile Management):**

- Profile screen with edit functionality
- Hook patterns: useProfile, useUpdateProfile
- EditProfileSheet component pattern (state-based, no react-hook-form)

**Existing Profile Screen Elements:**

- Menu items structure with icons
- "Coming Soon" placeholder for Comfort Preferences
- Navigation pattern using expo-router Link

### Previous Story Intelligence (Story 2.13)

**Key Learnings:**

- Use React state with custom validation (react-hook-form not installed)
- All touch targets 48dp+ minimum (min-h-[48px] or min-h-[56px])
- Use NativeWind classes exclusively
- Alert.alert() for success/error feedback
- snake_case for Supabase column names, camelCase in TypeScript
- TanStack Query with optimistic updates pattern
- Component tests live in `__tests__/` subdirectory
- Keyboard.dismiss() before showing Alert

**Code Patterns from 2.13:**

- Screen wrapper: `<SafeAreaView className="flex-1 bg-background">`
- Cards: `rounded-xl bg-white p-4 shadow-sm`
- Buttons: `min-h-[56px] flex-row items-center justify-center rounded-xl bg-primary`
- Form inputs: `min-h-[48px] rounded-lg border border-gray-200 px-4 text-base`
- Radio button row: `min-h-[56px] flex-row items-center`
- maxLength={500} on text inputs

### Git Intelligence (Recent Commits)

```
66e563a feat(rider): implement ride management, driver selection, tracking, and profile features (Stories 2.6-2.12)
```

**Commit Pattern:** `feat(rider): implement comfort preferences (Story 2.14)`

### Anti-Patterns to Avoid

- **DO NOT** create database migration - columns already exist from Story 2.13
- **DO NOT** use react-hook-form - use React state pattern from Story 2.12/2.13
- **DO NOT** use inline styles - use NativeWind classes
- **DO NOT** forget accessibilityLabel and accessibilityHint on interactive elements
- **DO NOT** make touch targets smaller than 48dp
- **DO NOT** skip optimistic updates in mutation hooks
- **DO NOT** forget Keyboard.dismiss() before Alert.alert()
- **DO NOT** skip maxLength on TextInput

### Testing Checklist

- [ ] TemperatureSelector renders all 3 options correctly
- [ ] TemperatureSelector single-select behavior works
- [ ] ConversationSelector renders all 3 options correctly
- [ ] ConversationSelector single-select behavior works
- [ ] MusicSelector renders all 3 options correctly
- [ ] MusicSelector single-select behavior works
- [ ] Save button calls mutation with correct data
- [ ] Loading state shows while saving
- [ ] Success alert shown on save
- [ ] Error alert shown on failure
- [ ] Profile screen link navigates to comfort screen
- [ ] Profile screen shows summary icons when preferences set
- [ ] Screen reader announces all form fields
- [ ] All touch targets are 48dp+ (min-h-[48px] or min-h-[56px])
- [ ] TypeScript compiles without errors

### Expo Dependencies (Already Installed)

No new dependencies required. All needed packages exist:

- `@tanstack/react-query`
- `expo-router`
- `@clerk/clerk-expo`
- `@supabase/supabase-js`

### Profile Screen Update

Update `app/(tabs)/profile.tsx` to change "Coming Soon" to a Link for Comfort Preferences:

```typescript
// Replace Comfort Preferences "Coming Soon" placeholder with:
<Link href="/profile/comfort-preferences" asChild>
  <Pressable
    className="h-[56px] flex-row items-center justify-between border-b border-gray-100 px-4"
    accessibilityLabel="Comfort Preferences"
    accessibilityRole="button"
    accessibilityHint="Navigate to comfort preferences">
    <View className="flex-row items-center">
      <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-orange-100">
        <Ionicons name="happy" size={20} color="#F97316" />
      </View>
      <Text className="text-lg font-medium text-foreground">Comfort Preferences</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
  </Pressable>
</Link>
```

### References

- [Source: docs/epics.md#Story-2.14]
- [Source: docs/prd.md#FR73]
- [Source: docs/architecture.md#Profile-Management]
- [Source: docs/sprint-artifacts/2-13-implement-accessibility-preferences.md]
- [Source: apps/rider/app/(tabs)/profile.tsx]
- [Source: packages/shared/src/db/schema.ts#riderPreferences]

## Dev Agent Record

### Context Reference

- docs/architecture.md (Profile Management, State patterns)
- docs/epics.md (Epic 2, Story 2.14, FR73)
- docs/prd.md (FR73 - Comfort preferences)
- docs/sprint-artifacts/2-13-implement-accessibility-preferences.md (Previous patterns)
- apps/rider/app/(tabs)/profile.tsx (Profile screen)
- apps/rider/src/features/profile/ (Profile feature structure)
- packages/shared/src/db/schema.ts (rider_preferences table)

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

**New Files:**

- `apps/rider/src/features/profile/hooks/useComfortPreferences.ts` - Query hook
- `apps/rider/src/features/profile/hooks/useUpdateComfortPreferences.ts` - Mutation hook
- `apps/rider/src/features/profile/hooks/__tests__/useComfortPreferences.test.ts`
- `apps/rider/src/features/profile/hooks/__tests__/useUpdateComfortPreferences.test.ts`
- `apps/rider/src/features/profile/components/TemperatureSelector.tsx` - Temperature picker
- `apps/rider/src/features/profile/components/ConversationSelector.tsx` - Conversation picker
- `apps/rider/src/features/profile/components/MusicSelector.tsx` - Music picker
- `apps/rider/src/features/profile/components/__tests__/TemperatureSelector.test.tsx`
- `apps/rider/src/features/profile/components/__tests__/ConversationSelector.test.tsx`
- `apps/rider/src/features/profile/components/__tests__/MusicSelector.test.tsx`
- `apps/rider/app/profile/comfort-preferences.tsx` - Screen

**Modified Files:**

- `apps/rider/src/features/profile/hooks/index.ts` - Export new hooks
- `apps/rider/src/features/profile/components/index.ts` - Export new components
- `apps/rider/app/(tabs)/profile.tsx` - Link to comfort screen

## Change Log

| Date       | Change                                                            | Author                |
| ---------- | ----------------------------------------------------------------- | --------------------- |
| 2025-12-13 | Story created with comprehensive developer context by BMad Method | Create-Story Workflow |
