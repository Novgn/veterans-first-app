/**
 * useComfortPreferences Hook Tests
 *
 * Tests for fetching rider comfort preferences.
 * Story 2.14: Implement Comfort Preferences (FR73)
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';

import { comfortKeys, useComfortPreferences } from '../useComfortPreferences';

// Mock Clerk
const mockUser = { id: 'clerk-user-123' };
jest.mock('@clerk/clerk-expo', () => ({
  useUser: () => ({ user: mockUser }),
}));

// Mock Supabase with chainable methods
const mockFrom = jest.fn();
const mockSingle = jest.fn();

jest.mock('../../../lib/supabase', () => ({
  useSupabase: () => ({
    from: mockFrom,
  }),
}));

// Helper to setup mock chain for a specific table
const setupMockChain = () => {
  mockFrom.mockImplementation(() => ({
    select: () => ({
      eq: () => ({
        single: mockSingle,
      }),
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

describe('useComfortPreferences', () => {
  describe('query key factory', () => {
    it('creates correct query keys', () => {
      expect(comfortKeys.all).toEqual(['comfort-preferences']);
      expect(comfortKeys.detail('user-123')).toEqual(['comfort-preferences', 'user-123']);
    });
  });

  describe('query behavior', () => {
    it('fetches comfort preferences successfully', async () => {
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
              comfort_temperature: 'cool',
              conversation_preference: 'quiet',
              music_preference: 'soft',
              other_notes: 'I prefer windows up',
            },
            error: null,
          });
        }
      });

      const { result } = renderHook(() => useComfortPreferences(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual({
        comfortTemperature: 'cool',
        conversationPreference: 'quiet',
        musicPreference: 'soft',
        otherNotes: 'I prefer windows up',
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

      const { result } = renderHook(() => useComfortPreferences(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual({
        comfortTemperature: null,
        conversationPreference: null,
        musicPreference: null,
        otherNotes: null,
      });
    });

    it('handles user not found in database', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      });

      const { result } = renderHook(() => useComfortPreferences(), {
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

      const { result } = renderHook(() => useComfortPreferences(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      expect(result.current.error?.message).toContain('Database error');
    });

    it('handles all temperature preference values', async () => {
      const temperatures = ['cool', 'normal', 'warm'];

      for (const temp of temperatures) {
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
                comfort_temperature: temp,
                conversation_preference: null,
                music_preference: null,
                other_notes: null,
              },
              error: null,
            });
          }
        });

        const { result } = renderHook(() => useComfortPreferences(), {
          wrapper: createWrapper(),
        });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.data?.comfortTemperature).toBe(temp);
      }
    });

    it('handles all conversation preference values', async () => {
      const conversations = ['quiet', 'some', 'chatty'];

      for (const conv of conversations) {
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
                comfort_temperature: null,
                conversation_preference: conv,
                music_preference: null,
                other_notes: null,
              },
              error: null,
            });
          }
        });

        const { result } = renderHook(() => useComfortPreferences(), {
          wrapper: createWrapper(),
        });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.data?.conversationPreference).toBe(conv);
      }
    });

    it('handles all music preference values', async () => {
      const musicPrefs = ['none', 'soft', 'any'];

      for (const music of musicPrefs) {
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
                comfort_temperature: null,
                conversation_preference: null,
                music_preference: music,
                other_notes: null,
              },
              error: null,
            });
          }
        });

        const { result } = renderHook(() => useComfortPreferences(), {
          wrapper: createWrapper(),
        });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.data?.musicPreference).toBe(music);
      }
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
              comfort_temperature: null,
              conversation_preference: null,
              music_preference: null,
              other_notes: null,
            },
            error: null,
          });
        }
      });

      const { result } = renderHook(() => useComfortPreferences(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data?.comfortTemperature).toBeNull();
      expect(result.current.data?.conversationPreference).toBeNull();
      expect(result.current.data?.musicPreference).toBeNull();
      expect(result.current.data?.otherNotes).toBeNull();
    });
  });
});
