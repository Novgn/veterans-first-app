/**
 * Tests for notification preference hooks (Story 4.5).
 */

import { renderHook, waitFor } from '@testing-library/react-native';

import { createTestWrapper } from '@/test-utils/queryWrapper';

import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from '../useNotificationPreferences';

const mockFrom = jest.fn();

jest.mock('@/lib/supabase', () => ({
  useSupabase: () => ({ from: mockFrom }),
}));

jest.mock('@clerk/clerk-expo', () => ({
  useUser: () => ({ user: { id: 'clerk-rider-1' } }),
}));

describe('useNotificationPreferences', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns defaults when no row exists', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              maybeSingle: jest.fn().mockResolvedValue({ data: { id: 'u1' }, error: null }),
            }),
          }),
        };
      }
      if (table === 'notification_preferences') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        };
      }
      return {};
    });

    const { result } = renderHook(() => useNotificationPreferences(), {
      wrapper: createTestWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(DEFAULT_NOTIFICATION_PREFERENCES);
  });

  it('returns existing row values', async () => {
    const stored = {
      push_enabled: false,
      sms_enabled: true,
      reminders_enabled: true,
      driver_updates_enabled: false,
      arrival_photos_enabled: true,
      marketing_enabled: false,
      push_token: 'ExpoToken[abc]',
    };

    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              maybeSingle: jest.fn().mockResolvedValue({ data: { id: 'u1' }, error: null }),
            }),
          }),
        };
      }
      if (table === 'notification_preferences') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              maybeSingle: jest.fn().mockResolvedValue({ data: stored, error: null }),
            }),
          }),
        };
      }
      return {};
    });

    const { result } = renderHook(() => useNotificationPreferences(), {
      wrapper: createTestWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(stored);
  });
});

describe('useUpdateNotificationPreferences', () => {
  beforeEach(() => jest.clearAllMocks());

  it('upserts on user_id with merged defaults', async () => {
    const upsertSingle = jest.fn().mockResolvedValue({
      data: { ...DEFAULT_NOTIFICATION_PREFERENCES, push_enabled: false },
      error: null,
    });
    const upsert = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({ single: upsertSingle }),
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: { id: 'u1' }, error: null }),
            }),
          }),
        };
      }
      if (table === 'notification_preferences') return { upsert };
      return {};
    });

    const { result } = renderHook(() => useUpdateNotificationPreferences(), {
      wrapper: createTestWrapper(),
    });

    await result.current.mutateAsync({ push_enabled: false });

    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'u1', push_enabled: false, sms_enabled: true }),
      expect.objectContaining({ onConflict: 'user_id' })
    );
  });
});
