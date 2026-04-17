# Story 4.2: Implement Family Access Revocation

**Status:** done

## Story

As a rider, I want to revoke family member access at any time, so I keep control over my privacy.

## Acceptance Criteria

1. **Given** the rider views their linked family members, **When** they tap "Remove", **Then** a confirmation modal appears.
2. **Given** the rider confirms, **Then** the link is hidden from the UI immediately, a 60-second undo toast appears, and the actual delete is deferred until the window expires.
3. **Given** the rider taps "Undo" within the window, **Then** the delete is cancelled and the link reappears with its original status.
4. **Given** the rider navigates away from the screen before the timer expires, **Then** the queued revocations are flushed (server delete fires).

## Implementation

- New Zustand store `useFamilyRevocationQueue` (`apps/mobile/stores/familyRevocationQueue.ts`) — in-memory map of `linkId → { memberName, timer, expiresAt }`. Intentionally not persisted; a page reload commits any in-flight revocations.
- New hook `useRevokeWithUndo` (`apps/mobile/hooks/useRevokeWithUndo.ts`) — exposes `queueRevocation`, `undo`, `flush`, and `isPending`. Wraps the existing `useRevokeFamilyLink` (Story 4.1 hard-delete) but defers the call 60 seconds via `setTimeout`.
- New component `UndoToast` (`apps/mobile/components/family/UndoToast.tsx`) — ticks down from 60s, shows "Undo" button, calls consumer on tap.
- Family Access screen now filters pending linkIds out of the list client-side, renders a `<UndoToast>` per pending revocation, and flushes on screen blur via `useFocusEffect`.

## Tests

- `useRevokeWithUndo.test.ts` — 3 cases: timer fires server delete, undo cancels, flush runs immediately.

## Change Log

| Date       | Change                       | Author |
| ---------- | ---------------------------- | ------ |
| 2026-04-17 | Story authored + implemented | Claude |
