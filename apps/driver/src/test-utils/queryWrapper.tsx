/**
 * Test utilities for TanStack Query testing
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

/**
 * Creates a QueryClient configured for testing
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
}

// Alias for backwards compatibility
export const createTestQueryClient = createQueryClient;

/**
 * Creates a test wrapper with a QueryClient for testing
 * Optionally accepts an existing QueryClient for spy testing
 */
export function createTestWrapper(queryClient?: QueryClient) {
  const client = queryClient ?? createQueryClient();

  return function TestWrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}
