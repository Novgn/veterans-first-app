# Story 3.17: Implement Ride Confirmation Calls

**Status:** done

## Story

Dispatcher follows up with riders ahead of their scheduled pickup.

## Acceptance Criteria

1. Lists rides scheduled in the next 24 hours with status `pending | confirmed`.
2. Each row exposes a "Mark Confirmed" button (disabled if already confirmed).
3. Clicking the button flips `status` to `confirmed` and logs the update.

## Implementation

`apps/web/app/dispatch/confirmations/page.tsx` — server action to update status; `revalidatePath('/dispatch/confirmations')` + `/dispatch/assignments`.

## Change Log

| Date       | Change                       | Author |
| ---------- | ---------------------------- | ------ |
| 2026-04-17 | Story authored + implemented | Claude |
