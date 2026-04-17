/**
 * useUpdateComfortPreferences Hook Tests
 *
 * Tests for updating rider comfort preferences.
 * Story 2.14: Implement Comfort Preferences (FR73)
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor, act } from '@testing-library/react-native';
import React from 'react';

import { comfortKeys, type ComfortPreferences } from '../useComfortPreferences';
import { useUpdateComfortPreferences } from '../useUpdateComfortPreferences';

// Mock Clerk
const mockUser = { id: 'clerk-user-123' };
jest.mock('@clerk/clerk-expo', () => ({
  useUser: () => ({ user: mockUser }),
}));

// Mock Supabase
const mockFrom = jest.fn();
const mockSingle = jest.fn();
const mockUpsert = jest.fn();

jest.mock('@/lib/supabase', () => ({
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
const createWrapper = (initialData?: ComfortPreferences) => {
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
    queryClient.setQueryData(comfortKeys.detail(mockUser.id), initialData);
  }

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

beforeEach(() => {
  jest.clearAllMocks();
  setupMockChain();
});

describe('useUpdateComfortPreferences', () => {
  it('updates comfort preferences successfully', async () => {
    mockSingle.mockResolvedValue({
      data: { id: 'uuid-123' },
      error: null,
    });

    mockUpsert.mockResolvedValue({
      error: null,
    });

    const initialData: ComfortPreferences = {
      comfortTemperature: null,
      conversationPreference: null,
      musicPreference: null,
      otherNotes: null,
    };

    const { result } = renderHook(() => useUpdateComfortPreferences(), {
      wrapper: createWrapper(initialData),
    });

    const newPreferences: ComfortPreferences = {
      comfortTemperature: 'cool',
      conversationPreference: 'quiet',
      musicPreference: 'soft',
      otherNotes: 'I prefer windows up',
    };

    await act(async () => {
      await result.current.mutateAsync(newPreferences);
    });

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'uuid-123',
        comfort_temperature: 'cool',
        conversation_preference: 'quiet',
        music_preference: 'soft',
        other_notes: 'I prefer windows up',
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

    const { result } = renderHook(() => useUpdateComfortPreferences(), {
      wrapper: createWrapper(),
    });

    const newPreferences: ComfortPreferences = {
      comfortTemperature: 'warm',
      conversationPreference: 'chatty',
      musicPreference: 'any',
      otherNotes: null,
    };

    await act(async () => {
      await result.current.mutateAsync(newPreferences);
    });

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'uuid-123',
        comfort_temperature: 'warm',
        conversation_preference: 'chatty',
        music_preference: 'any',
        other_notes: null,
      }),
      { onConflict: 'user_id' }
    );
  });

  it('sets error state when user not found', async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { code: 'PGRST116', message: 'User not found' },
    });

    const { result } = renderHook(() => useUpdateComfortPreferences(), {
      wrapper: createWrapper(),
    });

    const newPreferences: ComfortPreferences = {
      comfortTemperature: 'cool',
      conversationPreference: 'quiet',
      musicPreference: 'none',
      otherNotes: null,
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

    const { result } = renderHook(() => useUpdateComfortPreferences(), {
      wrapper: createWrapper(),
    });

    const newPreferences: ComfortPreferences = {
      comfortTemperature: 'normal',
      conversationPreference: 'some',
      musicPreference: 'soft',
      otherNotes: null,
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

  it('clears preferences when set to null', async () => {
    mockSingle.mockResolvedValue({
      data: { id: 'uuid-123' },
      error: null,
    });

    mockUpsert.mockResolvedValue({
      error: null,
    });

    const initialData: ComfortPreferences = {
      comfortTemperature: 'cool',
      conversationPreference: 'quiet',
      musicPreference: 'soft',
      otherNotes: 'My preferences',
    };

    const { result } = renderHook(() => useUpdateComfortPreferences(), {
      wrapper: createWrapper(initialData),
    });

    const newPreferences: ComfortPreferences = {
      comfortTemperature: null,
      conversationPreference: null,
      musicPreference: null,
      otherNotes: null,
    };

    await act(async () => {
      await result.current.mutateAsync(newPreferences);
    });

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        comfort_temperature: null,
        conversation_preference: null,
        music_preference: null,
        other_notes: null,
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

    const { result } = renderHook(() => useUpdateComfortPreferences(), {
      wrapper: createWrapper(),
    });

    const newPreferences: ComfortPreferences = {
      comfortTemperature: 'normal',
      conversationPreference: 'some',
      musicPreference: 'any',
      otherNotes: null,
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

  it('handles partial updates', async () => {
    mockSingle.mockResolvedValue({
      data: { id: 'uuid-123' },
      error: null,
    });

    mockUpsert.mockResolvedValue({
      error: null,
    });

    const initialData: ComfortPreferences = {
      comfortTemperature: 'cool',
      conversationPreference: 'quiet',
      musicPreference: 'soft',
      otherNotes: 'Original notes',
    };

    const { result } = renderHook(() => useUpdateComfortPreferences(), {
      wrapper: createWrapper(initialData),
    });

    // Only changing temperature, keeping others
    const newPreferences: ComfortPreferences = {
      comfortTemperature: 'warm',
      conversationPreference: 'quiet',
      musicPreference: 'soft',
      otherNotes: 'Original notes',
    };

    await act(async () => {
      await result.current.mutateAsync(newPreferences);
    });

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        comfort_temperature: 'warm',
        conversation_preference: 'quiet',
        music_preference: 'soft',
        other_notes: 'Original notes',
      }),
      { onConflict: 'user_id' }
    );
  });
});
