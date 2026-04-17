# Story 4.5: Implement Notification Preferences

**Status:** done

## Story

As a user, I want to configure how I receive notifications so I get updates in my preferred way.

## Acceptance Criteria

1. **Given** any signed-in user opens Profile → Notifications, **Then** they see toggles for push + SMS channels and per-type toggles (ride reminders, driver updates, arrival photos).
2. **Given** the user toggles a preference, **When** they save, **Then** the value is persisted to `notification_preferences` keyed on user id. Defaults are applied when no row exists.
3. **Given** no row exists for the user, **Then** the screen renders the default profile (push on, SMS on, reminders on, driver updates on, arrival photos on, marketing off).
4. **Given** the database enforces a one-row-per-user unique constraint, **Then** concurrent upserts can't create duplicates.

## Implementation

- Migration `0027_create_notification_preferences.sql`:
  - New `notification_preferences` table with `user_id` unique FK, boolean columns, timestamps.
  - RLS: user can SELECT/INSERT/UPDATE their own row (Clerk JWT via users table lookup).
- Drizzle schema: mirrors the new table + type exports.
- Hook `useNotificationPreferences` — reads the row (falls back to default on PGRST116).
- Hook `useUpdateNotificationPreferences` — upserts on user_id.
- Screen `apps/mobile/app/(rider)/profile/notifications.tsx` — switches for each pref, saves on change (optimistic), uses `@/components/family/PrefSwitch` (small reusable labeled switch).

## Tests

- `useNotificationPreferences.test.ts` — 3 cases: returns default when row missing, reads existing row, mutation upserts with correct payload.

## Change Log

| Date       | Change                       | Author |
| ---------- | ---------------------------- | ------ |
| 2026-04-17 | Story authored + implemented | Claude |
