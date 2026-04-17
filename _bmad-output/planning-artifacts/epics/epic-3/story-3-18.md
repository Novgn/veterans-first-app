# Story 3.18: Implement No-Show Processing (Dispatch)

**Status:** done

## Story

Dispatcher reviews no-shows marked by drivers and reopens mistaken ones.

## Acceptance Criteria

1. Lists rides in `status='no_show'` newest-first.
2. Shows the driver's no-show event notes + photo + GPS snapshot (if present).
3. "Reopen ride" action flips status back to `pending` so it can be reassigned.

## Implementation

`apps/web/app/dispatch/no-shows/page.tsx` — pulls ride_events via nested select. Reopen button via server action.

## Change Log

| Date       | Change                       | Author |
| ---------- | ---------------------------- | ------ |
| 2026-04-17 | Story authored + implemented | Claude |
