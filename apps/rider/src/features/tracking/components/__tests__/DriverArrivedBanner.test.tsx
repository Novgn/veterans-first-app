/**
 * Tests for DriverArrivedBanner component
 *
 * Story 2.10: Implement Real-Time Driver Tracking
 */

import { render, screen } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import { AccessibilityInfo, Platform } from 'react-native';

import { DriverArrivedBanner } from '../DriverArrivedBanner';

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: {
    Success: 'success',
  },
}));

// Spy on AccessibilityInfo
const mockAnnounceForAccessibility = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');

describe('DriverArrivedBanner', () => {
  const defaultDriver = {
    firstName: 'Dave',
    vehicleColor: 'Blue',
    vehicleMake: 'Toyota',
    vehicleModel: 'Camry',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Default to iOS for haptic tests
    Platform.OS = 'ios';
  });

  it('renders banner', () => {
    render(<DriverArrivedBanner driver={defaultDriver} testID="arrived-banner" />);

    expect(screen.getByTestId('arrived-banner')).toBeTruthy();
  });

  it('displays "Driver Arrived!" header', () => {
    render(<DriverArrivedBanner driver={defaultDriver} />);

    expect(screen.getByText('Driver Arrived!')).toBeTruthy();
  });

  it('displays driver name', () => {
    render(<DriverArrivedBanner driver={defaultDriver} />);

    expect(screen.getByText('Dave is waiting for you')).toBeTruthy();
  });

  it('displays vehicle description', () => {
    render(<DriverArrivedBanner driver={defaultDriver} />);

    expect(screen.getByText('Blue Toyota Camry')).toBeTruthy();
  });

  it('displays "Look for" label', () => {
    render(<DriverArrivedBanner driver={defaultDriver} />);

    expect(screen.getByText('Look for')).toBeTruthy();
  });

  it('has alert accessibility role', () => {
    render(<DriverArrivedBanner driver={defaultDriver} testID="arrived-banner" />);

    const container = screen.getByTestId('arrived-banner');
    expect(container.props.accessibilityRole).toBe('alert');
  });

  it('has accessibility label with driver and vehicle info', () => {
    render(<DriverArrivedBanner driver={defaultDriver} testID="arrived-banner" />);

    const container = screen.getByTestId('arrived-banner');
    expect(container.props.accessibilityLabel).toContain('Driver arrived');
    expect(container.props.accessibilityLabel).toContain('Dave');
    expect(container.props.accessibilityLabel).toContain('Blue Toyota Camry');
  });

  it('announces arrival to screen reader', () => {
    render(<DriverArrivedBanner driver={defaultDriver} />);

    expect(mockAnnounceForAccessibility).toHaveBeenCalledWith(
      expect.stringContaining('Dave has arrived')
    );
  });

  it('announcement includes vehicle description', () => {
    render(<DriverArrivedBanner driver={defaultDriver} />);

    expect(mockAnnounceForAccessibility).toHaveBeenCalledWith(
      expect.stringContaining('Blue Toyota Camry')
    );
  });

  it('triggers haptic feedback on native', () => {
    Platform.OS = 'ios';

    render(<DriverArrivedBanner driver={defaultDriver} />);

    expect(Haptics.notificationAsync).toHaveBeenCalledWith(
      Haptics.NotificationFeedbackType.Success
    );
  });

  it('does not trigger haptic feedback on web', () => {
    Platform.OS = 'web';

    render(<DriverArrivedBanner driver={defaultDriver} />);

    expect(Haptics.notificationAsync).not.toHaveBeenCalled();
  });

  it('only announces once on rerender', () => {
    const { rerender } = render(
      <DriverArrivedBanner driver={defaultDriver} testID="arrived-banner" />
    );

    expect(mockAnnounceForAccessibility).toHaveBeenCalledTimes(1);

    // Rerender with same driver
    rerender(<DriverArrivedBanner driver={defaultDriver} testID="arrived-banner" />);

    // Should still be 1 (not called again)
    expect(mockAnnounceForAccessibility).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    render(<DriverArrivedBanner driver={defaultDriver} className="mt-4" testID="arrived-banner" />);

    const container = screen.getByTestId('arrived-banner');
    expect(container.props.className).toContain('mt-4');
  });
});
