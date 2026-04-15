import '../global.css';

import { ClerkProvider, ClerkLoaded, useAuth } from '@clerk/clerk-expo';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Stack } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

import { ErrorBoundary } from '../src/components';
import { RideOfferModal } from '../src/features/trips/components';
import { asyncStoragePersister, queryClient } from '../src/lib/queryClient';

const tokenCache = {
  async getToken(key: string) {
    return SecureStore.getItemAsync(key);
  },
  async saveToken(key: string, value: string) {
    return SecureStore.setItemAsync(key, value);
  },
  async clearToken(key: string) {
    return SecureStore.deleteItemAsync(key);
  },
};

/**
 * Inner layout that has access to auth context
 * Renders the RideOfferModal only when user is authenticated
 */
function AuthenticatedLayout() {
  const { isSignedIn } = useAuth();

  return (
    <>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="trips/[id]" options={{ headerShown: false }} />
      </Stack>
      {/* RideOfferModal shows automatically when there's a pending offer */}
      {isSignedIn && <RideOfferModal testID="ride-offer-modal" />}
    </>
  );
}

export default function RootLayout() {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    throw new Error(
      'Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Please set it in your environment variables.'
    );
  }

  return (
    <ErrorBoundary>
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <ClerkLoaded>
          <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{ persister: asyncStoragePersister }}>
            <AuthenticatedLayout />
          </PersistQueryClientProvider>
        </ClerkLoaded>
      </ClerkProvider>
    </ErrorBoundary>
  );
}
