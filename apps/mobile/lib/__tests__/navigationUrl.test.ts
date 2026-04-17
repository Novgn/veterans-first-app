/**
 * Tests for buildNavigationUrl (Story 3.5)
 */

import { buildNavigationUrl } from '../navigationUrl';

jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

describe('buildNavigationUrl', () => {
  it('encodes addresses for the Apple Maps deep link on iOS', () => {
    const { primary, fallback } = buildNavigationUrl({ address: '123 Main St, Anytown' });
    expect(primary).toBe('maps://?daddr=123%20Main%20St%2C%20Anytown');
    expect(fallback).toBe(
      'https://www.google.com/maps/dir/?api=1&destination=123%20Main%20St%2C%20Anytown'
    );
  });

  it('prefers coordinates when lat/lng are provided', () => {
    const { primary } = buildNavigationUrl({
      address: 'unused',
      lat: 40.7128,
      lng: -74.006,
    });
    expect(primary).toBe('maps://?daddr=40.7128%2C-74.006');
  });

  it('falls back to address when only lat is present', () => {
    const { primary } = buildNavigationUrl({
      address: '200 E Main',
      lat: 40.7128,
      lng: null,
    });
    expect(primary).toContain('200%20E%20Main');
  });
});

describe('buildNavigationUrl — Android preference', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.doMock('react-native', () => ({
      Platform: { OS: 'android' },
    }));
  });

  afterAll(() => {
    jest.dontMock('react-native');
  });

  it('returns Google Maps deep link on Android', () => {
    const { buildNavigationUrl: androidBuild } = jest.requireActual('../navigationUrl');
    const { primary } = androidBuild({ address: '10 Broadway' });
    expect(primary).toMatch(/^comgooglemaps:\/\/\?daddr=10%20Broadway&directionsmode=driving$/);
  });

  it('returns a usable fallback regardless of platform', () => {
    const { buildNavigationUrl: androidBuild } = jest.requireActual('../navigationUrl');
    const { fallback } = androidBuild({ address: '10 Broadway' });
    expect(fallback).toContain('https://www.google.com/maps/dir/?api=1&destination=');
  });
});
