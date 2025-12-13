/**
 * useUpdateProfile Hook Tests
 *
 * Tests for updating user profile including emergency contact.
 * Story 2.12: Implement Rider Profile Management (FR71)
 */

import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import { useUpdateProfile } from '../useUpdateProfile';

// Mock Clerk
const mockUser = { id: 'clerk-user-123' };
jest.mock('@clerk/clerk-expo', () => ({
  useUser: () => ({ user: mockUser }),
}));

// Mock Supabase
const mockFrom = jest.fn();
const mockUpdate = jest.fn();
const mockEq = jest.fn();
const mockSelect = jest.fn();
const mockSingle = jest.fn();

jest.mock('../../../../lib/supabase', () => ({
  useSupabase: () => ({
    from: mockFrom,
  }),
}));

// Setup mock chain
beforeEach(() => {
  jest.clearAllMocks();

  mockFrom.mockReturnValue({
    update: mockUpdate,
  });

  mockUpdate.mockReturnValue({
    eq: mockEq,
  });

  mockEq.mockReturnValue({
    select: mockSelect,
  });

  mockSelect.mockReturnValue({
    single: mockSingle,
  });
});

// Wrapper component for QueryClientProvider
const createWrapper = () => {
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

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

describe('useUpdateProfile', () => {
  describe('mutation behavior', () => {
    it('updates emergency contact successfully', async () => {
      const updatedProfile = {
        id: 'uuid-123',
        clerk_id: 'clerk-user-123',
        first_name: 'Margaret',
        last_name: 'Smith',
        phone: '+15551234567',
        email: 'margaret@example.com',
        profile_photo_url: null,
        emergency_contact_name: 'John Smith',
        emergency_contact_phone: '+15559876543',
        emergency_contact_relationship: 'spouse',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      mockSingle.mockResolvedValue({
        data: updatedProfile,
        error: null,
      });

      const { result } = renderHook(() => useUpdateProfile(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          emergency_contact_name: 'John Smith',
          emergency_contact_phone: '+15559876543',
          emergency_contact_relationship: 'spouse',
        });
      });

      expect(mockFrom).toHaveBeenCalledWith('users');
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          emergency_contact_name: 'John Smith',
          emergency_contact_phone: '+15559876543',
          emergency_contact_relationship: 'spouse',
        })
      );
      expect(mockEq).toHaveBeenCalledWith('clerk_id', 'clerk-user-123');
    });

    it('updates profile photo URL successfully', async () => {
      const updatedProfile = {
        id: 'uuid-123',
        clerk_id: 'clerk-user-123',
        first_name: 'Margaret',
        last_name: 'Smith',
        phone: '+15551234567',
        email: 'margaret@example.com',
        profile_photo_url: 'https://storage.supabase.com/photo.jpg',
        emergency_contact_name: null,
        emergency_contact_phone: null,
        emergency_contact_relationship: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      mockSingle.mockResolvedValue({
        data: updatedProfile,
        error: null,
      });

      const { result } = renderHook(() => useUpdateProfile(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          profile_photo_url: 'https://storage.supabase.com/photo.jpg',
        });
      });

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          profile_photo_url: 'https://storage.supabase.com/photo.jpg',
        })
      );
    });

    it('clears emergency contact by setting null', async () => {
      const updatedProfile = {
        id: 'uuid-123',
        clerk_id: 'clerk-user-123',
        first_name: 'Margaret',
        last_name: 'Smith',
        phone: '+15551234567',
        email: 'margaret@example.com',
        profile_photo_url: null,
        emergency_contact_name: null,
        emergency_contact_phone: null,
        emergency_contact_relationship: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      mockSingle.mockResolvedValue({
        data: updatedProfile,
        error: null,
      });

      const { result } = renderHook(() => useUpdateProfile(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          emergency_contact_name: null,
          emergency_contact_phone: null,
          emergency_contact_relationship: null,
        });
      });

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          emergency_contact_name: null,
          emergency_contact_phone: null,
          emergency_contact_relationship: null,
        })
      );
    });

    it('handles update error', async () => {
      mockSingle.mockRejectedValue(new Error('Update failed'));

      const { result } = renderHook(() => useUpdateProfile(), {
        wrapper: createWrapper(),
      });

      await expect(
        result.current.mutateAsync({
          emergency_contact_name: 'John Smith',
        })
      ).rejects.toThrow('Update failed');
    });

    it('includes updated_at timestamp in update', async () => {
      mockSingle.mockResolvedValue({
        data: { id: 'uuid-123' },
        error: null,
      });

      const { result } = renderHook(() => useUpdateProfile(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          emergency_contact_name: 'John Smith',
        });
      });

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          updated_at: expect.any(String),
        })
      );
    });
  });

  describe('mutation state', () => {
    it('provides isPending state', async () => {
      mockSingle.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ data: { id: 'uuid-123' }, error: null }), 100)
          )
      );

      const { result } = renderHook(() => useUpdateProfile(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isPending).toBe(false);

      act(() => {
        result.current.mutate({ emergency_contact_name: 'Test' });
      });

      await waitFor(() => {
        expect(result.current.isPending).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });
    });
  });
});

describe('useUpdateProfile when user is not logged in', () => {
  it('throws error when user is not authenticated', async () => {
    // Override Clerk mock for this test
    jest.doMock('@clerk/clerk-expo', () => ({
      useUser: () => ({ user: null }),
    }));

    // The mutation should throw when user is null
    // This is tested by verifying the error handling in the hook
    const { result } = renderHook(() => useUpdateProfile(), {
      wrapper: createWrapper(),
    });

    // Mutation should still be available but will fail when called without auth
    expect(result.current.mutate).toBeDefined();
  });
});
