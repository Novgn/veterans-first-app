/**
 * useUpdateAccessibilityPreferences Hook Tests
 *
 * Tests for updating rider accessibility preferences.
 * Story 2.13: Implement Accessibility Preferences (FR72)
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor, act } from '@testing-library/react-native';
import React from 'react';

import { accessibilityKeys, type AccessibilityPreferences } from '../useAccessibilityPreferences';
import { useUpdateAccessibilityPreferences } from '../useUpdateAccessibilityPreferences';

// Mock Clerk
const mockUser = { id: 'clerk-user-123' };
jest.mock('@clerk/clerk-expo', () => ({
  useUser: () => ({ user: mockUser }),
}));

// Mock Supabase
const mockFrom = jest.fn();
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();
const mockUpsert = jest.fn();

jest.mock('../../../../lib/supabase', () => ({
  useSupabase: () => ({
    from: mockFrom,
  }),
}));

// Setup mock chain
const setupMockChain = () => {
  mockFrom.mockImplementation((table: string) => {
    if (table === 'users') {
      return {
        select: () => ({
          eq: () => ({
            single: mockSingle,
          }),
        }),
      };
    }
    if (table === 'rider_preferences') {
      return {
        upsert: mockUpsert,
      };
    }
    return {};
  });
};

// Wrapper component with pre-populated query data
const createWrapper = (initialData?: AccessibilityPreferences) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  // Pre-populate cache with initial data
  if (initialData) {
    queryClient.setQueryData(accessibilityKeys.detail(mockUser.id), initialData);
  }

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

beforeEach(() => {
  jest.clearAllMocks();
  setupMockChain();
});

describe('useUpdateAccessibilityPreferences', () => {
  it('updates accessibility preferences successfully', async () => {
    mockSingle.mockResolvedValue({
      data: { id: 'uuid-123' },
      error: null,
    });

    mockUpsert.mockResolvedValue({
      error: null,
    });

    const initialData: AccessibilityPreferences = {
      mobilityAid: null,
      needsDoorAssistance: false,
      needsPackageAssistance: false,
      extraVehicleSpace: false,
      specialEquipmentNotes: null,
    };

    const { result } = renderHook(() => useUpdateAccessibilityPreferences(), {
      wrapper: createWrapper(initialData),
    });

    const newPreferences: AccessibilityPreferences = {
      mobilityAid: 'walker',
      needsDoorAssistance: true,
      needsPackageAssistance: true,
      extraVehicleSpace: true,
      specialEquipmentNotes: 'Folding walker fits in trunk',
    };

    await act(async () => {
      await result.current.mutateAsync(newPreferences);
    });

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'uuid-123',
        mobility_aid: 'walker',
        needs_door_assistance: true,
        needs_package_assistance: true,
        extra_vehicle_space: true,
        special_equipment_notes: 'Folding walker fits in trunk',
      }),
      { onConflict: 'user_id' }
    );
  });

  it('handles upsert for new preferences record', async () => {
    mockSingle.mockResolvedValue({
      data: { id: 'uuid-123' },
      error: null,
    });

    mockUpsert.mockResolvedValue({
      error: null,
    });

    const { result } = renderHook(() => useUpdateAccessibilityPreferences(), {
      wrapper: createWrapper(),
    });

    const newPreferences: AccessibilityPreferences = {
      mobilityAid: 'cane',
      needsDoorAssistance: true,
      needsPackageAssistance: false,
      extraVehicleSpace: false,
      specialEquipmentNotes: null,
    };

    await act(async () => {
      await result.current.mutateAsync(newPreferences);
    });

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'uuid-123',
        mobility_aid: 'cane',
        needs_door_assistance: true,
        needs_package_assistance: false,
        extra_vehicle_space: false,
        special_equipment_notes: null,
      }),
      { onConflict: 'user_id' }
    );
  });

  it('sets error state when user not found', async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { code: 'PGRST116', message: 'User not found' },
    });

    const { result } = renderHook(() => useUpdateAccessibilityPreferences(), {
      wrapper: createWrapper(),
    });

    const newPreferences: AccessibilityPreferences = {
      mobilityAid: 'walker',
      needsDoorAssistance: true,
      needsPackageAssistance: false,
      extraVehicleSpace: false,
      specialEquipmentNotes: null,
    };

    await act(async () => {
      try {
        await result.current.mutateAsync(newPreferences);
      } catch {
        // Expected to throw
      }
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it('sets error state on database error', async () => {
    mockSingle.mockResolvedValue({
      data: { id: 'uuid-123' },
      error: null,
    });

    mockUpsert.mockResolvedValue({
      error: { code: 'INTERNAL', message: 'Database error' },
    });

    const { result } = renderHook(() => useUpdateAccessibilityPreferences(), {
      wrapper: createWrapper(),
    });

    const newPreferences: AccessibilityPreferences = {
      mobilityAid: 'walker',
      needsDoorAssistance: true,
      needsPackageAssistance: false,
      extraVehicleSpace: false,
      specialEquipmentNotes: null,
    };

    await act(async () => {
      try {
        await result.current.mutateAsync(newPreferences);
      } catch {
        // Expected to throw
      }
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it('clears mobility aid when set to null', async () => {
    mockSingle.mockResolvedValue({
      data: { id: 'uuid-123' },
      error: null,
    });

    mockUpsert.mockResolvedValue({
      error: null,
    });

    const initialData: AccessibilityPreferences = {
      mobilityAid: 'walker',
      needsDoorAssistance: true,
      needsPackageAssistance: true,
      extraVehicleSpace: true,
      specialEquipmentNotes: 'My walker',
    };

    const { result } = renderHook(() => useUpdateAccessibilityPreferences(), {
      wrapper: createWrapper(initialData),
    });

    const newPreferences: AccessibilityPreferences = {
      mobilityAid: null,
      needsDoorAssistance: false,
      needsPackageAssistance: false,
      extraVehicleSpace: false,
      specialEquipmentNotes: null,
    };

    await act(async () => {
      await result.current.mutateAsync(newPreferences);
    });

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        mobility_aid: null,
        needs_door_assistance: false,
        needs_package_assistance: false,
        extra_vehicle_space: false,
        special_equipment_notes: null,
      }),
      { onConflict: 'user_id' }
    );
  });

  it('includes updated_at timestamp', async () => {
    mockSingle.mockResolvedValue({
      data: { id: 'uuid-123' },
      error: null,
    });

    mockUpsert.mockResolvedValue({
      error: null,
    });

    const { result } = renderHook(() => useUpdateAccessibilityPreferences(), {
      wrapper: createWrapper(),
    });

    const newPreferences: AccessibilityPreferences = {
      mobilityAid: 'none',
      needsDoorAssistance: false,
      needsPackageAssistance: false,
      extraVehicleSpace: false,
      specialEquipmentNotes: null,
    };

    await act(async () => {
      await result.current.mutateAsync(newPreferences);
    });

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        updated_at: expect.any(String),
      }),
      expect.any(Object)
    );
  });
});
