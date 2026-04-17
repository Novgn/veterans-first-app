/**
 * Tests for family link hooks (Story 4.1).
 */

import { renderHook, waitFor } from '@testing-library/react-native';

import { createTestWrapper } from '@/test-utils/queryWrapper';

import {
  normalizePhone,
  useInviteFamilyMember,
  useRespondToFamilyInvite,
  useRevokeFamilyLink,
} from '../useFamilyLinks';

const mockFrom = jest.fn();

jest.mock('@/lib/supabase', () => ({
  useSupabase: () => ({ from: mockFrom }),
}));

jest.mock('@clerk/clerk-expo', () => ({
  useUser: () => ({
    user: { id: 'clerk-rider-1' },
  }),
}));

function usersLookupResult(result: unknown) {
  return {
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: { id: 'rider-uuid' }, error: null }),
        maybeSingle: jest.fn().mockResolvedValue(result),
      }),
    }),
  };
}

describe('normalizePhone', () => {
  it('passes through E.164 numbers', () => {
    expect(normalizePhone('+15551234567')).toBe('+15551234567');
  });
  it('adds US country code to 10-digit numbers', () => {
    expect(normalizePhone('(555) 123-4567')).toBe('+15551234567');
  });
  it('handles 11-digit US numbers', () => {
    expect(normalizePhone('15551234567')).toBe('+15551234567');
  });
  it('returns empty for blank input', () => {
    expect(normalizePhone('   ')).toBe('');
  });
});

describe('useInviteFamilyMember', () => {
  beforeEach(() => jest.clearAllMocks());

  it('inserts a pending link pointing at an existing user when phone matches', async () => {
    const insert = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest
          .fn()
          .mockResolvedValue({ data: { id: 'link-1', status: 'pending' }, error: null }),
      }),
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') return usersLookupResult({ data: { id: 'family-uuid' }, error: null });
      if (table === 'family_links') return { insert };
      return {};
    });

    const { result } = renderHook(() => useInviteFamilyMember(), {
      wrapper: createTestWrapper(),
    });

    await result.current.mutateAsync({ phone: '5551234567', relationship: 'Daughter' });

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        rider_id: 'rider-uuid',
        family_member_id: 'family-uuid',
        invited_phone: null,
        relationship: 'Daughter',
        status: 'pending',
      })
    );
  });

  it('stores invited_phone when no user exists for the phone', async () => {
    const insert = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest
          .fn()
          .mockResolvedValue({ data: { id: 'link-2', status: 'pending' }, error: null }),
      }),
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') return usersLookupResult({ data: null, error: null });
      if (table === 'family_links') return { insert };
      return {};
    });

    const { result } = renderHook(() => useInviteFamilyMember(), {
      wrapper: createTestWrapper(),
    });

    await result.current.mutateAsync({ phone: '(555) 987-6543', relationship: null });

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        family_member_id: null,
        invited_phone: '+15559876543',
      })
    );
  });

  it('rejects blank phone numbers', async () => {
    const { result } = renderHook(() => useInviteFamilyMember(), {
      wrapper: createTestWrapper(),
    });

    await expect(result.current.mutateAsync({ phone: '', relationship: null })).rejects.toThrow(
      /valid phone/
    );
  });
});

describe('useRespondToFamilyInvite', () => {
  beforeEach(() => jest.clearAllMocks());

  it('approve flips the link status to approved', async () => {
    const eq = jest.fn().mockResolvedValue({ error: null });
    const update = jest.fn().mockReturnValue({ eq });
    mockFrom.mockReturnValue({ update });

    const { result } = renderHook(() => useRespondToFamilyInvite(), {
      wrapper: createTestWrapper(),
    });

    await result.current.mutateAsync({ linkId: 'link-1', action: 'approve' });

    expect(update).toHaveBeenCalledWith(expect.objectContaining({ status: 'approved' }));
    expect(eq).toHaveBeenCalledWith('id', 'link-1');
  });

  it('decline hard-deletes the link', async () => {
    const eq = jest.fn().mockResolvedValue({ error: null });
    const del = jest.fn().mockReturnValue({ eq });
    mockFrom.mockReturnValue({ delete: del });

    const { result } = renderHook(() => useRespondToFamilyInvite(), {
      wrapper: createTestWrapper(),
    });

    await result.current.mutateAsync({ linkId: 'link-2', action: 'decline' });

    expect(del).toHaveBeenCalled();
    expect(eq).toHaveBeenCalledWith('id', 'link-2');
  });
});

describe('useRevokeFamilyLink', () => {
  beforeEach(() => jest.clearAllMocks());

  it('sets status to revoked', async () => {
    const eq = jest.fn().mockResolvedValue({ error: null });
    const update = jest.fn().mockReturnValue({ eq });
    mockFrom.mockReturnValue({ update });

    const { result } = renderHook(() => useRevokeFamilyLink(), {
      wrapper: createTestWrapper(),
    });

    await result.current.mutateAsync({ linkId: 'link-99' });

    expect(update).toHaveBeenCalledWith(expect.objectContaining({ status: 'revoked' }));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
