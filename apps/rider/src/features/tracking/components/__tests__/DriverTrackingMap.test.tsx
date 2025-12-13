/**
 * Tests for DriverTrackingMap component
 *
 * Story 2.10: Implement Real-Time Driver Tracking
 */

import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { View } from 'react-native';

import { DriverTrackingMap, calculateDistance } from '../DriverTrackingMap';

// Mock react-native-maps
jest.mock('react-native-maps', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View: MockView } = require('react-native');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactLib = require('react');

  const MockMapView = ReactLib.forwardRef(
    (props: { children?: React.ReactNode; testID?: string }, ref: React.Ref<View>) => {
      // Set up ref with mock methods
      ReactLib.useImperativeHandle(ref, () => ({
        fitToCoordinates: jest.fn(),
        animateToRegion: jest.fn(),
      }));
      return ReactLib.createElement(
        MockView,
        { testID: props.testID || 'map-view' },
        props.children
      );
    }
  );
  MockMapView.displayName = 'MockMapView';

  const MockMarker = (props: { children?: React.ReactNode; title?: string }) => {
    return ReactLib.createElement(MockView, { testID: `marker-${props.title}` }, props.children);
  };

  const MockPolyline = () => {
    return ReactLib.createElement(MockView, { testID: 'polyline' });
  };

  return {
    __esModule: true,
    default: MockMapView,
    Marker: MockMarker,
    Polyline: MockPolyline,
    PROVIDER_GOOGLE: 'google',
  };
});

describe('DriverTrackingMap', () => {
  const defaultDriverLocation = {
    latitude: 37.7749,
    longitude: -122.4194,
    heading: 90,
  };

  const defaultPickupLocation = {
    latitude: 37.7849,
    longitude: -122.4094,
    address: '123 Main St, San Francisco, CA',
  };

  it('renders map view', () => {
    render(
      <DriverTrackingMap
        driverLocation={defaultDriverLocation}
        pickupLocation={defaultPickupLocation}
        testID="tracking-map"
      />
    );

    expect(screen.getByTestId('tracking-map')).toBeTruthy();
  });

  it('renders driver marker', () => {
    render(
      <DriverTrackingMap
        driverLocation={defaultDriverLocation}
        pickupLocation={defaultPickupLocation}
      />
    );

    expect(screen.getByTestId('marker-Your Driver')).toBeTruthy();
  });

  it('renders pickup marker', () => {
    render(
      <DriverTrackingMap
        driverLocation={defaultDriverLocation}
        pickupLocation={defaultPickupLocation}
      />
    );

    expect(screen.getByTestId('marker-Pickup')).toBeTruthy();
  });

  it('renders route polyline', () => {
    render(
      <DriverTrackingMap
        driverLocation={defaultDriverLocation}
        pickupLocation={defaultPickupLocation}
      />
    );

    expect(screen.getByTestId('polyline')).toBeTruthy();
  });

  it('has proper accessibility label with distance', () => {
    render(
      <DriverTrackingMap
        driverLocation={defaultDriverLocation}
        pickupLocation={defaultPickupLocation}
        testID="tracking-map"
      />
    );

    const mapContainer = screen.getByTestId('tracking-map');
    expect(mapContainer.props.accessibilityLabel).toContain('miles away');
    expect(mapContainer.props.accessibilityLabel).toContain('123 Main St, San Francisco, CA');
  });

  it('has image accessibility role', () => {
    render(
      <DriverTrackingMap
        driverLocation={defaultDriverLocation}
        pickupLocation={defaultPickupLocation}
        testID="tracking-map"
      />
    );

    const mapContainer = screen.getByTestId('tracking-map');
    expect(mapContainer.props.accessibilityRole).toBe('image');
  });

  it('applies custom className', () => {
    render(
      <DriverTrackingMap
        driverLocation={defaultDriverLocation}
        pickupLocation={defaultPickupLocation}
        className="mt-4"
        testID="tracking-map"
      />
    );

    const mapContainer = screen.getByTestId('tracking-map');
    expect(mapContainer.props.className).toContain('mt-4');
  });

  it('handles null heading for driver', () => {
    const driverWithNullHeading = {
      ...defaultDriverLocation,
      heading: null,
    };

    render(
      <DriverTrackingMap
        driverLocation={driverWithNullHeading}
        pickupLocation={defaultPickupLocation}
      />
    );

    // Should render without error
    expect(screen.getByTestId('marker-Your Driver')).toBeTruthy();
  });
});

describe('calculateDistance', () => {
  it('calculates distance between two points correctly', () => {
    const point1 = { latitude: 37.7749, longitude: -122.4194 }; // San Francisco
    const point2 = { latitude: 37.7849, longitude: -122.4094 }; // ~0.9 miles away

    const distance = calculateDistance(point1, point2);

    // Should be approximately 0.9 miles
    expect(distance).toBeGreaterThan(0.5);
    expect(distance).toBeLessThan(1.5);
  });

  it('returns 0 for same point', () => {
    const point = { latitude: 37.7749, longitude: -122.4194 };

    const distance = calculateDistance(point, point);

    expect(distance).toBe(0);
  });

  it('calculates longer distance correctly', () => {
    const sanFrancisco = { latitude: 37.7749, longitude: -122.4194 };
    const losAngeles = { latitude: 34.0522, longitude: -118.2437 };

    const distance = calculateDistance(sanFrancisco, losAngeles);

    // SF to LA is approximately 347 miles
    expect(distance).toBeGreaterThan(300);
    expect(distance).toBeLessThan(400);
  });
});
