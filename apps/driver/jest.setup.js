/**
 * Jest setup file for Driver app React Native testing.
 *
 * This file runs before each test file and sets up:
 * - React Native Testing Library matchers
 * - Mock implementations for native modules
 * - Global test utilities
 */

// Note: @testing-library/react-native v12+ includes jest-native matchers automatically

// Mock expo-modules-core (required for jest-expo compatibility with Expo SDK 54+)
jest.mock('expo-modules-core', () => ({
  NativeModulesProxy: {},
  requireNativeModule: jest.fn(() => ({})),
  requireOptionalNativeModule: jest.fn(() => null),
  EventEmitter: jest.fn(() => ({
    addListener: jest.fn(),
    removeListeners: jest.fn(),
  })),
  Platform: {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios ?? obj.default),
  },
}));

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
  MaterialIcons: 'MaterialIcons',
  FontAwesome: 'FontAwesome',
  Feather: 'Feather',
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(() => ({})),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  })),
  router: {
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  },
  Link: 'Link',
  Stack: {
    Screen: 'Stack.Screen',
  },
  Tabs: {
    Screen: 'Tabs.Screen',
  },
  Redirect: 'Redirect',
}));

// Mock @clerk/clerk-expo
jest.mock('@clerk/clerk-expo', () => ({
  useAuth: jest.fn(() => ({
    isSignedIn: true,
    isLoaded: true,
    signOut: jest.fn(),
  })),
  useUser: jest.fn(() => ({
    user: {
      id: 'test-driver-id',
      firstName: 'Test',
      lastName: 'Driver',
      publicMetadata: {
        role: 'driver',
      },
    },
  })),
  useSession: jest.fn(() => ({
    session: {
      getToken: jest.fn(() => Promise.resolve('test-token')),
    },
  })),
  ClerkProvider: ({ children }) => children,
  ClerkLoaded: ({ children }) => children,
}));

// Silence console warnings in tests
const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    args[0]?.includes?.('componentWillReceiveProps') ||
    args[0]?.includes?.('componentWillMount')
  ) {
    return;
  }
  originalWarn.apply(console, args);
};
