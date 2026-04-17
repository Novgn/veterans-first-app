/**
 * Mock for expo-modules-core/src/Refs
 * Required for jest-expo compatibility with Expo SDK 54+
 */
module.exports = {
  createRef: () => ({ current: null }),
  useRef: () => ({ current: null }),
};
