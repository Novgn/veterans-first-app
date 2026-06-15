import type { ExpoConfig } from 'expo/config';

const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

const config: ExpoConfig = {
  name: 'Veterans First',
  slug: 'veterans-first',
  version: '1.0.0',
  scheme: 'veterans-first',
  owner: 'novagen',
  platforms: ['ios', 'android'],
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-web-browser',
    [
      'react-native-maps',
      {
        androidGoogleMapsApiKey: googleMapsApiKey,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    tsconfigPaths: true,
    reactCompiler: true,
  },
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#FAFAF9',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.novagen.veteransfirst',
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSLocationWhenInUseUsageDescription:
        'Veterans First uses your location to find drivers near you, calculate pickup times, and share your ride with your emergency contact for safety.',
      NSCameraUsageDescription:
        'Veterans First uses the camera so you can upload your DD-214 or profile photo.',
      NSPhotoLibraryUsageDescription:
        'Veterans First uses your photo library to select a DD-214 document or profile photo.',
      NSContactsUsageDescription:
        'Veterans First lets you pick your emergency contact from your contacts so we know who to call during a ride.',
    },
  },
  android: {
    package: 'com.novagen.veteransfirst',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#FAFAF9',
    },
    permissions: [
      'ACCESS_COARSE_LOCATION',
      'ACCESS_FINE_LOCATION',
      'CAMERA',
      'READ_EXTERNAL_STORAGE',
      'READ_MEDIA_IMAGES',
    ],
  },
  extra: {
    router: {},
    eas: {
      projectId: '1f99cb8d-c279-41b8-836b-2198a3e58e87',
    },
  },
};

export default config;
