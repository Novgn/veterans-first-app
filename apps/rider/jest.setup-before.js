/**
 * Jest setup that runs BEFORE jest-expo preset setup.
 * Sets up globalThis.expo which jest-expo expects.
 */

// Mock EventEmitter class
class MockEventEmitter {
  constructor() {
    this.listeners = {};
  }
  addListener(eventName, callback) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(callback);
    return { remove: () => this.removeListener(eventName, callback) };
  }
  removeListener(eventName, callback) {
    if (this.listeners[eventName]) {
      this.listeners[eventName] = this.listeners[eventName].filter((cb) => cb !== callback);
    }
  }
  removeAllListeners(eventName) {
    if (eventName) {
      delete this.listeners[eventName];
    } else {
      this.listeners = {};
    }
  }
  emit(eventName, ...args) {
    if (this.listeners[eventName]) {
      this.listeners[eventName].forEach((cb) => cb(...args));
    }
  }
}

// Set up globalThis.expo before jest-expo setup runs
globalThis.expo = {
  EventEmitter: MockEventEmitter,
  modules: {
    ExponentConstants: {
      executionEnvironment: 'storeClient',
    },
  },
};

// Mock process.env for Expo
process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY = 'test-api-key';
