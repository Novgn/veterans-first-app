/**
 * Comprehensive mock for expo-modules-core
 * Required for jest-expo compatibility with Expo SDK 54+
 */
module.exports = {
  NativeModulesProxy: {},
  requireNativeModule: jest.fn(() => ({})),
  requireOptionalNativeModule: jest.fn(() => null),
  EventEmitter: jest.fn(() => ({
    addListener: jest.fn(),
    removeListeners: jest.fn(),
    removeAllListeners: jest.fn(),
    emit: jest.fn(),
  })),
  Platform: {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios ?? obj.default),
  },
  CodedError: class CodedError extends Error {
    constructor(code, message) {
      super(message);
      this.code = code;
    }
  },
  UnavailabilityError: class UnavailabilityError extends Error {
    constructor(moduleName, propertyName) {
      super(`${moduleName}.${propertyName} is not available`);
    }
  },
  // Refs module exports
  createRef: () => ({ current: null }),
  useRef: () => ({ current: null }),
};
