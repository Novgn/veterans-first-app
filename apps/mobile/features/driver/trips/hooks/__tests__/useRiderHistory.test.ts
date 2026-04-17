/**
 * Tests for useRiderHistory hook
 */

import { renderHook, waitFor } from '@testing-library/react-native';

import { createTestWrapper } from '../../../test-utils/queryWrapper';
import { useRiderHistory } from '../useRiderHistory';

// Mock Supabase client
const mockFrom = jest.fn();

jest.mock('../../../lib/supabase', () => ({
  useSupabase: () => ({
    from: mockFrom,
  }),
}));

// Mock Clerk
const mockUserId = 'test-clerk-id';
jest.mock('@clerk/clerk-expo', () => ({
  useAuth: () => ({
    userId: mockUserId,
    isSignedIn: true,
  }),
}));

describe('useRiderHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns count of completed rides between driver and rider', async () => {
    // Mock user lookup
    const mockUserSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: { id: 'driver-uuid' },
          error: null,
        }),
      }),
    });

    // Mock rides count - returns count in response
    const mockRidesSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            count: 5,
            error: null,
          }),
        }),
      }),
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') {
        return { select: mockUserSelect };
      }
      if (table === 'rides') {
        return { select: mockRidesSelect };
      }
      return { select: jest.fn() };
    });

    const { result } = renderHook(() => useRiderHistory('rider-uuid'), {
      wrapper: createTestWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBe(5);
  });

  it('returns 0 when no rides found', async () => {
    const mockUserSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: { id: 'driver-uuid' },
          error: null,
        }),
      }),
    });

    const mockRidesSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            count: 0,
            error: null,
          }),
        }),
      }),
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') {
        return { select: mockUserSelect };
      }
      if (table === 'rides') {
        return { select: mockRidesSelect };
      }
      return { select: jest.fn() };
    });

    const { result } = renderHook(() => useRiderHistory('rider-uuid'), {
      wrapper: createTestWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBe(0);
  });

  it('returns 0 when driver not found', async () => {
    const mockUserSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }),
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') {
        return { select: mockUserSelect };
      }
      return { select: jest.fn() };
    });

    const { result } = renderHook(() => useRiderHistory('rider-uuid'), {
      wrapper: createTestWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBe(0);
  });

  it('is disabled when riderId is empty', () => {
    const { result } = renderHook(() => useRiderHistory(''), {
      wrapper: createTestWrapper(),
    });

    expect(result.current.isFetching).toBe(false);
  });
});
