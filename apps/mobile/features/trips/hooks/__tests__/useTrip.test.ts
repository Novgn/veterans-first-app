/**
 * Tests for useTrip hook
 */

import { renderHook, waitFor } from '@testing-library/react-native';

import { createTestWrapper } from '@/test-utils/queryWrapper';
import { useTrip } from '../useTrip';

// Mock Supabase client
const mockFrom = jest.fn();

jest.mock('@/lib/supabase', () => ({
  useSupabase: () => ({
    from: mockFrom,
  }),
}));

describe('useTrip', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches single trip with full details', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'rides') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: {
                  id: 'trip-1',
                  status: 'assigned',
                  pickup_address: '123 Main St',
                  dropoff_address: '456 Oak Ave',
                  scheduled_pickup_time: '2026-01-13T10:00:00Z',
                  rider: {
                    id: 'rider-1',
                    first_name: 'John',
                    last_name: 'Doe',
                    phone: '+1234567890',
                    profile_photo_url: null,
                  },
                  rider_preferences: {
                    mobility_aid: 'walker',
                    needs_door_assistance: true,
                    needs_package_assistance: false,
                    extra_vehicle_space: false,
                    special_equipment_notes: 'Uses walker',
                    comfort_temperature: 'warm',
                    conversation_preference: 'some',
                    music_preference: 'soft',
                    other_notes: null,
                  },
                },
                error: null,
              }),
            }),
          }),
        };
      }
      return { select: jest.fn() };
    });

    const { result } = renderHook(() => useTrip('trip-1'), {
      wrapper: createTestWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toMatchObject({
      id: 'trip-1',
      status: 'assigned',
      pickupAddress: '123 Main St',
      rider: {
        firstName: 'John',
        lastName: 'Doe',
      },
    });
  });

  it('returns null when tripId is empty', async () => {
    const { result } = renderHook(() => useTrip(''), {
      wrapper: createTestWrapper(),
    });

    // Query should be disabled
    expect(result.current.isFetching).toBe(false);
  });

  it('handles error gracefully', async () => {
    mockFrom.mockImplementation(() => ({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Trip not found' },
          }),
        }),
      }),
    }));

    const { result } = renderHook(() => useTrip('nonexistent'), {
      wrapper: createTestWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
