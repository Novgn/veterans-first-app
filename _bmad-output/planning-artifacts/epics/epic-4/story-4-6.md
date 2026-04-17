# Story 4.6: Implement Ride Reminder Notifications

**Status:** done

## Story

As a rider, I want to receive reminders before my scheduled rides so I'm prepared and don't miss my transportation.

## Acceptance Criteria

1. **Given** a scheduled ride, **When** the system runs the reminder cron at T-24h, **Then** each eligible rider receives a "Reminder: You have a ride tomorrow at [time]" notification on their opted-in channels.
2. **Given** a scheduled ride, **When** the system runs the reminder cron at T-1h, **Then** each eligible rider receives a "Your ride is in 1 hour" notification with pickup and driver info (when assigned).
3. **Given** every notification dispatch, **Then** a row is written to `notification_logs` with user id, ride id, type, channel, and delivery status.
4. **Given** a rider has the relevant preference disabled (push off, sms off, or reminders off), **Then** that channel/type is skipped for that rider.

## Implementation

- Migration `0028_notification_logs.sql`:
  - New `notification_logs` table (append-only by convention; no UPDATE policy).
  - RLS: users read their own logs; admins read all.
  - Index on `(user_id, created_at desc)` and `(ride_id)`.
- Drizzle schema: mirrors `notification_logs` + type exports.
- New `lib/notifications/dispatch.ts` in the web app: dispatches to push + SMS channels guarded by the user's notification preferences, records a log row per attempt, and returns the aggregate delivery result. Push/SMS transports are stubbed with structured logs (Expo Push + Twilio wiring tracked as deferred).
- New API route `apps/web/app/api/notifications/reminders/route.ts`:
  - POST-only, authenticated via Clerk (dispatch console or service token from cron).
  - Accepts `{ windowMinutes: 60 | 1440 }` payload (default 60).
  - Queries `rides` for rows whose `scheduled_pickup_time` falls inside the window and that haven't already been reminded for that window. Uses `notification_logs` to dedupe.
- Shared helper `buildReminderMessage(windowMinutes, ride)` produces the T-24h or T-1h copy.

## Tests

- `dispatch.test.ts` — 4 cases: respects push/sms/type gates; logs the dispatch; routes to push when preference is on; dedupes when a log row already exists for that ride+type.
- `reminders.test.ts` — builds the correct message for 24h and 1h windows.

## Change Log

| Date       | Change                       | Author |
| ---------- | ---------------------------- | ------ |
| 2026-04-17 | Story authored + implemented | Claude |
