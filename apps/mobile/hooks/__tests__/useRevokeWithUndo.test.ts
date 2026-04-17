/**
 * Tests for useRevokeWithUndo (Story 4.2).
 */

import { act, renderHook, waitFor } from '@testing-library/react-native';

import { createTestWrapper } from '@/test-utils/queryWrapper';

import { useFamilyRevocationQueue } from '@/stores/familyRevocationQueue';
import { UNDO_WINDOW_MS, useRevokeWithUndo } from '../useRevokeWithUndo';

const mockFrom = jest.fn();

jest.mock('@/lib/supabase', () => ({
  useSupabase: () => ({ from: mockFrom }),
}));

jest.mock('@clerk/clerk-expo', () => ({
  useUser: () => ({ user: { id: 'clerk-rider' } }),
}));

function setupDeleteMock() {
  const eq = jest.fn().mockResolvedValue({ error: null });
  const del = jest.fn().mockReturnValue({ eq });
  mockFrom.mockReturnValue({ delete: del });
  return { eq, del };
}

describe('useRevokeWithUndo', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    // Reset the Zustand store between tests.
    useFamilyRevocationQueue.setState({ pending: {} });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('queues a deletion and does not hit the server until the window expires', async () => {
    const { del } = setupDeleteMock();

    const { result } = renderHook(() => useRevokeWithUndo(), {
      wrapper: createTestWrapper(),
    });

    act(() => {
      result.current.queueRevocation({ linkId: 'link-1', memberName: 'Alice' });
    });

    expect(result.current.isPending('link-1')).toBe(true);
    expect(del).not.toHaveBeenCalled();

    // Advance past the window.
    await act(async () => {
      jest.advanceTimersByTime(UNDO_WINDOW_MS);
    });

    await waitFor(() => expect(del).toHaveBeenCalled());
  });

  it('undo cancels the queued delete and never hits the server', async () => {
    const { del } = setupDeleteMock();

    const { result } = renderHook(() => useRevokeWithUndo(), {
      wrapper: createTestWrapper(),
    });

    act(() => {
      result.current.queueRevocation({ linkId: 'link-2', memberName: 'Bob' });
    });

    act(() => {
      result.current.undo('link-2');
    });

    expect(result.current.isPending('link-2')).toBe(false);

    await act(async () => {
      jest.advanceTimersByTime(UNDO_WINDOW_MS * 2);
    });

    expect(del).not.toHaveBeenCalled();
  });

  it('flush runs the delete immediately', async () => {
    const { del } = setupDeleteMock();

    const { result } = renderHook(() => useRevokeWithUndo(), {
      wrapper: createTestWrapper(),
    });

    await act(async () => {
      await result.current.flush('link-3');
    });

    expect(del).toHaveBeenCalled();
  });
});
