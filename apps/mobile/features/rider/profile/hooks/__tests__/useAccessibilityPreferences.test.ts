/**
 * useAccessibilityPreferences Hook Tests
 *
 * Tests for fetching rider accessibility preferences.
 * Story 2.13: Implement Accessibility Preferences (FR72)
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';

import { accessibilityKeys, useAccessibilityPreferences } from '../useAccessibilityPreferences';

// Mock Clerk
const mockUser = { id: 'clerk-user-123' };
jest.mock('@clerk/clerk-expo', () => ({
  useUser: () => ({ user: mockUser }),
}));

// Mock Supabase with chainable methods
const mockFrom = jest.fn();
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();

jest.mock('../../../lib/supabase', () => ({
  useSupabase: () => ({
    from: mockFrom,
  }),
}));

// Helper to setup mock chain for a specific table
const setupMockChain = () => {
  mockFrom.mockImplementation((table: string) => ({
    select: () => ({
      eq: (column: string, value: string) => {
        mockEq(column, value);
        return {
          single: mockSingle,
        };
      },
    }),
  }));
};

// Wrapper component for QueryClientProvider
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

beforeEach(() => {
  jest.clearAllMocks();
  setupMockChain();
});

describe('useAccessibilityPreferences', () => {
  describe('query key factory', () => {
    it('creates correct query keys', () => {
      expect(accessibilityKeys.all).toEqual(['accessibility-preferences']);
      expect(accessibilityKeys.detail('user-123')).toEqual([
        'accessibility-preferences',
        'user-123',
      ]);
    });
  });

  describe('query behavior', () => {
    it('fetches accessibility preferences successfully', async () => {
      // First call: get user ID from users table
      // Second call: get preferences from rider_preferences table
      let callCount = 0;
      mockSingle.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // First call - users table
          return Promise.resolve({
            data: { id: 'uuid-123' },
            error: null,
          });
        } else {
          // Second call - rider_preferences table
          return Promise.resolve({
            data: {
              mobility_aid: 'walker',
              needs_door_assistance: true,
              needs_package_assistance: false,
              extra_vehicle_space: true,
              special_equipment_notes: 'Folding walker, needs trunk space',
            },
            error: null,
          });
        }
      });

      const { result } = renderHook(() => useAccessibilityPreferences(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual({
        mobilityAid: 'walker',
        needsDoorAssistance: true,
        needsPackageAssistance: false,
        extraVehicleSpace: true,
        specialEquipmentNotes: 'Folding walker, needs trunk space',
      });
    });

    it('returns default values when no preferences exist (PGRST116)', async () => {
      let callCount = 0;
      mockSingle.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({
            data: { id: 'uuid-123' },
            error: null,
          });
        } else {
          // No preferences record exists
          return Promise.resolve({
            data: null,
            error: { code: 'PGRST116', message: 'Not found' },
          });
        }
      });

      const { result } = renderHook(() => useAccessibilityPreferences(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual({
        mobilityAid: null,
        needsDoorAssistance: false,
        needsPackageAssistance: false,
        extraVehicleSpace: false,
        specialEquipmentNotes: null,
      });
    });

    it('handles user not found in database', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      });

      const { result } = renderHook(() => useAccessibilityPreferences(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        'User not found in database, preferences unavailable'
      );

      consoleSpy.mockRestore();
    });

    it('throws error for database errors', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'INTERNAL', message: 'Database error' },
      });

      const { result } = renderHook(() => useAccessibilityPreferences(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      expect(result.current.error?.message).toContain('Database error');
    });

    it('returns null values for unset preferences', async () => {
      let callCount = 0;
      mockSingle.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({
            data: { id: 'uuid-123' },
            error: null,
          });
        } else {
          return Promise.resolve({
            data: {
              mobility_aid: null,
              needs_door_assistance: null,
              needs_package_assistance: null,
              extra_vehicle_space: null,
              special_equipment_notes: null,
            },
            error: null,
          });
        }
      });

      const { result } = renderHook(() => useAccessibilityPreferences(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data?.mobilityAid).toBeNull();
      expect(result.current.data?.needsDoorAssistance).toBe(false);
      expect(result.current.data?.needsPackageAssistance).toBe(false);
      expect(result.current.data?.extraVehicleSpace).toBe(false);
      expect(result.current.data?.specialEquipmentNotes).toBeNull();
    });

    it('handles all mobility aid types', async () => {
      const mobilityTypes = ['none', 'cane', 'walker', 'manual_wheelchair', 'power_wheelchair'];

      for (const mobilityAid of mobilityTypes) {
        jest.clearAllMocks();
        setupMockChain();

        let callCount = 0;
        mockSingle.mockImplementation(() => {
          callCount++;
          if (callCount === 1) {
            return Promise.resolve({
              data: { id: 'uuid-123' },
              error: null,
            });
          } else {
            return Promise.resolve({
              data: {
                mobility_aid: mobilityAid,
                needs_door_assistance: false,
                needs_package_assistance: false,
                extra_vehicle_space: false,
                special_equipment_notes: null,
              },
              error: null,
            });
          }
        });

        const { result } = renderHook(() => useAccessibilityPreferences(), {
          wrapper: createWrapper(),
        });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.data?.mobilityAid).toBe(mobilityAid);
      }
    });
  });
});
