/**
 * Tests for useDriverAvailability hooks (Story 3.7)
 */

import { renderHook, waitFor } from '@testing-library/react-native';

import { createTestWrapper } from '@/test-utils/queryWrapper';

import {
  useCreateAvailability,
  useDeleteAvailability,
  useDriverAvailability,
  useUpdateAvailability,
} from '../useDriverAvailability';

const mockFrom = jest.fn();

jest.mock('@/lib/supabase', () => ({
  useSupabase: () => ({ from: mockFrom }),
}));

jest.mock('@clerk/clerk-expo', () => ({
  useAuth: () => ({ userId: 'clerk-driver', isSignedIn: true }),
}));

function mockUserLookup() {
  return {
    select: () => ({
      eq: () => ({
        single: jest.fn().mockResolvedValue({ data: { id: 'driver-uuid' }, error: null }),
      }),
    }),
  };
}

describe('useDriverAvailability', () => {
  beforeEach(() => jest.clearAllMocks());

  it('lists availability windows in day + start order', async () => {
    const orderMock2 = jest.fn().mockResolvedValue({
      data: [
        {
          id: 'w-1',
          driver_id: 'driver-uuid',
          day_of_week: 1,
          start_time: '08:00:00',
          end_time: '17:00:00',
          is_active: true,
        },
      ],
      error: null,
    });
    const orderMock1 = jest.fn().mockReturnValue({ order: orderMock2 });
    const eqMock = jest.fn().mockReturnValue({ order: orderMock1 });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') return mockUserLookup();
      if (table === 'driver_availability') {
        return { select: jest.fn().mockReturnValue({ eq: eqMock }) };
      }
      return {};
    });

    const { result } = renderHook(() => useDriverAvailability(), { wrapper: createTestWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([
      {
        id: 'w-1',
        driverId: 'driver-uuid',
        dayOfWeek: 1,
        startTime: '08:00:00',
        endTime: '17:00:00',
        isActive: true,
      },
    ]);
  });
});

describe('useCreateAvailability', () => {
  beforeEach(() => jest.clearAllMocks());

  it('inserts with driver id resolved from clerk', async () => {
    const insert = jest.fn().mockResolvedValue({ error: null });
    mockFrom.mockImplementation((table: string) => {
      if (table === 'users') return mockUserLookup();
      if (table === 'driver_availability') return { insert };
      return {};
    });

    const { result } = renderHook(() => useCreateAvailability(), { wrapper: createTestWrapper() });
    await result.current.mutateAsync({
      dayOfWeek: 3,
      startTime: '09:00:00',
      endTime: '12:00:00',
    });

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        driver_id: 'driver-uuid',
        day_of_week: 3,
        start_time: '09:00:00',
        end_time: '12:00:00',
        is_active: true,
      })
    );
  });
});

describe('useUpdateAvailability', () => {
  beforeEach(() => jest.clearAllMocks());

  it('sends patch with snake_case keys', async () => {
    const eq = jest.fn().mockResolvedValue({ error: null });
    const update = jest.fn().mockReturnValue({ eq });
    mockFrom.mockImplementation(() => ({ update }));

    const { result } = renderHook(() => useUpdateAvailability(), { wrapper: createTestWrapper() });
    await result.current.mutateAsync({ id: 'w-1', isActive: false });

    expect(update).toHaveBeenCalledWith(expect.objectContaining({ is_active: false }));
    expect(eq).toHaveBeenCalledWith('id', 'w-1');
  });
});

describe('useDeleteAvailability', () => {
  beforeEach(() => jest.clearAllMocks());

  it('deletes by id', async () => {
    const eq = jest.fn().mockResolvedValue({ error: null });
    const del = jest.fn().mockReturnValue({ eq });
    mockFrom.mockImplementation(() => ({ delete: del }));

    const { result } = renderHook(() => useDeleteAvailability(), { wrapper: createTestWrapper() });
    await result.current.mutateAsync('w-1');

    expect(del).toHaveBeenCalled();
    expect(eq).toHaveBeenCalledWith('id', 'w-1');
  });
});
