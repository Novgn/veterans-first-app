/**
 * Deferred-revoke orchestrator (Story 4.2).
 *
 * Combines the `useFamilyRevocationQueue` Zustand store with the
 * underlying `useRevokeFamilyLink` mutation. Riders see the link
 * disappear instantly (UI filters on `isPending`), and the actual
 * Supabase delete only fires when the undo window expires or the
 * caller calls `commit()` manually (e.g. on screen unmount).
 */

import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { familyLinkKeys, useRevokeFamilyLink } from '@/hooks/useFamilyLinks';
import { useFamilyRevocationQueue } from '@/stores/familyRevocationQueue';

export const UNDO_WINDOW_MS = 60_000;

export interface QueueRevocationInput {
  linkId: string;
  memberName: string;
}

export function useRevokeWithUndo() {
  const revoke = useRevokeFamilyLink();
  const queryClient = useQueryClient();
  const { enqueue, cancel, commit, isPending, pending } = useFamilyRevocationQueue();

  const fireDelete = useCallback(
    async (linkId: string) => {
      try {
        await revoke.mutateAsync({ linkId });
      } finally {
        commit(linkId);
        queryClient.invalidateQueries({ queryKey: familyLinkKeys.all });
      }
    },
    [revoke, commit, queryClient]
  );

  const queueRevocation = useCallback(
    ({ linkId, memberName }: QueueRevocationInput) => {
      // If a pending one exists (shouldn't, but guard), cancel first.
      if (isPending(linkId)) cancel(linkId);

      const timer = setTimeout(() => {
        void fireDelete(linkId);
      }, UNDO_WINDOW_MS);

      enqueue({ linkId, memberName, timer, windowMs: UNDO_WINDOW_MS });
      // Hide it from the current UI immediately.
      queryClient.invalidateQueries({ queryKey: familyLinkKeys.all });
    },
    [enqueue, cancel, isPending, fireDelete, queryClient]
  );

  const undo = useCallback(
    (linkId: string) => {
      const entry = cancel(linkId);
      if (!entry) return;
      queryClient.invalidateQueries({ queryKey: familyLinkKeys.all });
    },
    [cancel, queryClient]
  );

  return {
    queueRevocation,
    undo,
    /** Fire-delete-now (used when leaving the screen before the timer runs out). */
    flush: fireDelete,
    pending,
    isPending,
  };
}
