/**
 * Pending-revocation queue for family access (Story 4.2).
 *
 * When a rider taps "Remove" on a family link we delete after a 60-second
 * undo window rather than immediately. The link is hidden from the UI as
 * soon as the revoke is queued so UX feels instant, but the server call
 * is deferred — if the rider taps "Undo" before the timer fires, we
 * cancel the pending delete and re-show the link.
 *
 * Intentionally not persisted: a reload counts as "committed" (the timer
 * would otherwise outlive the session and leak a background delete).
 */

import { create } from 'zustand';

export interface PendingRevocation {
  linkId: string;
  memberName: string;
  /** ms since epoch when the actual delete will fire. */
  expiresAt: number;
  timer: ReturnType<typeof setTimeout>;
}

interface QueueState {
  pending: Record<string, PendingRevocation>;
  enqueue: (entry: Omit<PendingRevocation, 'expiresAt'> & { windowMs: number }) => void;
  cancel: (linkId: string) => PendingRevocation | null;
  commit: (linkId: string) => void;
  isPending: (linkId: string) => boolean;
}

export const useFamilyRevocationQueue = create<QueueState>((set, get) => ({
  pending: {},
  enqueue: ({ linkId, memberName, timer, windowMs }) => {
    set((state) => ({
      pending: {
        ...state.pending,
        [linkId]: { linkId, memberName, timer, expiresAt: Date.now() + windowMs },
      },
    }));
  },
  cancel: (linkId) => {
    const entry = get().pending[linkId];
    if (!entry) return null;
    clearTimeout(entry.timer);
    set((state) => {
      const next = { ...state.pending };
      delete next[linkId];
      return { pending: next };
    });
    return entry;
  },
  commit: (linkId) => {
    set((state) => {
      const next = { ...state.pending };
      delete next[linkId];
      return { pending: next };
    });
  },
  isPending: (linkId) => Boolean(get().pending[linkId]),
}));
