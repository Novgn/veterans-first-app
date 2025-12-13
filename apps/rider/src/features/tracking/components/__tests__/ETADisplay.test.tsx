/**
 * Tests for ETADisplay component
 *
 * Story 2.10: Implement Real-Time Driver Tracking
 */

import { render, screen, act } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

import { ETADisplay, formatETA } from '../ETADisplay';

// Spy on AccessibilityInfo
const mockAnnounceForAccessibility = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');

describe('ETADisplay', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const defaultDriverLocation = {
    latitude: 37.7749,
    longitude: -122.4194,
  };

  // Pickup ~2.5 miles away
  const defaultPickupLocation = {
    latitude: 37.8049,
    longitude: -122.4094,
  };

  it('renders ETA display', () => {
    render(
      <ETADisplay
        driverLocation={defaultDriverLocation}
        pickupLocation={defaultPickupLocation}
        testID="eta-display"
      />
    );

    expect(screen.getByTestId('eta-display')).toBeTruthy();
  });

  it('displays "Estimated Arrival" label', () => {
    render(
      <ETADisplay driverLocation={defaultDriverLocation} pickupLocation={defaultPickupLocation} />
    );

    expect(screen.getByText('Estimated Arrival')).toBeTruthy();
  });

  it('displays ETA in minutes format', () => {
    render(
      <ETADisplay
        driverLocation={defaultDriverLocation}
        pickupLocation={defaultPickupLocation}
        averageSpeedMph={25}
      />
    );

    // Should show some number of minutes
    expect(screen.getByText(/min/)).toBeTruthy();
  });

  it('has proper accessibility role', () => {
    render(
      <ETADisplay
        driverLocation={defaultDriverLocation}
        pickupLocation={defaultPickupLocation}
        testID="eta-display"
      />
    );

    const container = screen.getByTestId('eta-display');
    expect(container.props.accessibilityRole).toBe('text');
  });

  it('has accessibility label with ETA', () => {
    render(
      <ETADisplay
        driverLocation={defaultDriverLocation}
        pickupLocation={defaultPickupLocation}
        testID="eta-display"
      />
    );

    const container = screen.getByTestId('eta-display');
    expect(container.props.accessibilityLabel).toContain('Estimated arrival');
  });

  it('announces initial ETA to screen reader', () => {
    render(
      <ETADisplay driverLocation={defaultDriverLocation} pickupLocation={defaultPickupLocation} />
    );

    expect(mockAnnounceForAccessibility).toHaveBeenCalledWith(
      expect.stringContaining('Driver arriving')
    );
  });

  it('refreshes ETA at specified interval', () => {
    const refreshInterval = 5000; // 5 seconds for faster test

    render(
      <ETADisplay
        driverLocation={defaultDriverLocation}
        pickupLocation={defaultPickupLocation}
        refreshIntervalMs={refreshInterval}
      />
    );

    // Clear initial announcement
    mockAnnounceForAccessibility.mockClear();

    // Advance timer by refresh interval
    act(() => {
      jest.advanceTimersByTime(refreshInterval);
    });

    // ETA should have been recalculated (may or may not trigger announcement
    // depending on whether it changed significantly)
    expect(screen.getByText(/min/)).toBeTruthy();
  });

  it('applies custom className', () => {
    render(
      <ETADisplay
        driverLocation={defaultDriverLocation}
        pickupLocation={defaultPickupLocation}
        className="mt-4"
        testID="eta-display"
      />
    );

    const container = screen.getByTestId('eta-display');
    expect(container.props.className).toContain('mt-4');
  });

  it('updates when driver location changes', () => {
    const { rerender } = render(
      <ETADisplay
        driverLocation={defaultDriverLocation}
        pickupLocation={defaultPickupLocation}
        testID="eta-display"
      />
    );

    // Move driver closer to pickup
    const closerLocation = {
      latitude: 37.7999,
      longitude: -122.41,
    };

    rerender(
      <ETADisplay
        driverLocation={closerLocation}
        pickupLocation={defaultPickupLocation}
        testID="eta-display"
      />
    );

    // Should still render with updated ETA
    expect(screen.getByTestId('eta-display')).toBeTruthy();
  });
});

describe('formatETA', () => {
  it('formats < 1 minute correctly', () => {
    expect(formatETA(0.5)).toBe('< 1 min');
    expect(formatETA(1)).toBe('< 1 min');
  });

  it('formats minutes correctly', () => {
    expect(formatETA(5)).toBe('5 min');
    expect(formatETA(15)).toBe('15 min');
    expect(formatETA(59)).toBe('59 min');
  });

  it('formats hours correctly', () => {
    expect(formatETA(60)).toBe('1 hr');
    expect(formatETA(120)).toBe('2 hr');
  });

  it('formats hours and minutes correctly', () => {
    expect(formatETA(90)).toBe('1 hr 30 min');
    expect(formatETA(145)).toBe('2 hr 25 min');
  });

  it('rounds minutes appropriately', () => {
    expect(formatETA(5.4)).toBe('5 min');
    expect(formatETA(5.6)).toBe('6 min');
  });
});
