/**
 * DriverCard Component Tests
 *
 * Tests for driver display, selection state, and accessibility.
 * Story 2.7: Implement Preferred Driver Selection
 */

import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import { DriverCard, DriverCardDriver } from '../DriverCard';

const mockDriver: DriverCardDriver = {
  id: 'driver-123',
  firstName: 'Dave',
  profilePhotoUrl: null,
  vehicleMake: 'Toyota',
  vehicleModel: 'Camry',
  vehicleColor: 'Silver',
};

const mockDriverWithPhoto: DriverCardDriver = {
  ...mockDriver,
  profilePhotoUrl: 'https://example.com/photo.jpg',
};

describe('DriverCard', () => {
  describe('rendering', () => {
    it('displays driver name', () => {
      render(<DriverCard driver={mockDriver} rideCount={5} />);
      expect(screen.getByText('Dave')).toBeTruthy();
    });

    it('displays vehicle information', () => {
      render(<DriverCard driver={mockDriver} rideCount={5} />);
      expect(screen.getByText('Silver Toyota Camry')).toBeTruthy();
    });

    it('displays ride count singular', () => {
      render(<DriverCard driver={mockDriver} rideCount={1} />);
      expect(screen.getByText('Driven you 1 time')).toBeTruthy();
    });

    it('displays ride count plural', () => {
      render(<DriverCard driver={mockDriver} rideCount={23} />);
      expect(screen.getByText('Driven you 23 times')).toBeTruthy();
    });

    it('displays last ride date when provided', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      render(
        <DriverCard driver={mockDriver} rideCount={5} lastRideDate={yesterday.toISOString()} />
      );
      expect(screen.getByText('Last ride: Yesterday')).toBeTruthy();
    });

    it('does not show last ride when not provided', () => {
      render(<DriverCard driver={mockDriver} rideCount={5} />);
      expect(screen.queryByText(/Last ride/)).toBeNull();
    });

    it('shows default avatar when no photo URL', () => {
      render(<DriverCard driver={mockDriver} rideCount={5} testID="driver-card" />);
      // Card should render without crashing even without photo
      expect(screen.getByTestId('driver-card')).toBeTruthy();
    });
  });

  describe('selection state', () => {
    it('shows checkmark when selected', () => {
      render(
        <DriverCard driver={mockDriver} rideCount={5} isSelected={true} testID="driver-card" />
      );
      const card = screen.getByTestId('driver-card');
      expect(card.props.accessibilityState).toEqual({ selected: true });
    });

    it('does not show checkmark when not selected', () => {
      render(
        <DriverCard driver={mockDriver} rideCount={5} isSelected={false} testID="driver-card" />
      );
      const card = screen.getByTestId('driver-card');
      expect(card.props.accessibilityState).toEqual({ selected: false });
    });
  });

  describe('interactions', () => {
    it('calls onPress when tapped', () => {
      const onPress = jest.fn();
      render(
        <DriverCard driver={mockDriver} rideCount={5} onPress={onPress} testID="driver-card" />
      );

      fireEvent.press(screen.getByTestId('driver-card'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('does not crash when onPress is not provided', () => {
      render(<DriverCard driver={mockDriver} rideCount={5} testID="driver-card" />);
      // Should not throw
      fireEvent.press(screen.getByTestId('driver-card'));
    });
  });

  describe('accessibility', () => {
    it('has correct accessibility label', () => {
      render(<DriverCard driver={mockDriver} rideCount={23} testID="driver-card" />);
      const card = screen.getByTestId('driver-card');
      expect(card.props.accessibilityLabel).toBe('Dave, Silver Toyota Camry, driven you 23 times');
    });

    it('includes selected state in accessibility label', () => {
      render(
        <DriverCard driver={mockDriver} rideCount={23} isSelected={true} testID="driver-card" />
      );
      const card = screen.getByTestId('driver-card');
      expect(card.props.accessibilityLabel).toBe(
        'Dave, Silver Toyota Camry, driven you 23 times, selected'
      );
    });

    it('has button accessibility role', () => {
      render(<DriverCard driver={mockDriver} rideCount={5} testID="driver-card" />);
      const card = screen.getByTestId('driver-card');
      expect(card.props.accessibilityRole).toBe('button');
    });
  });

  describe('relative date formatting', () => {
    it('shows "Today" for today', () => {
      const today = new Date().toISOString();
      render(<DriverCard driver={mockDriver} rideCount={5} lastRideDate={today} />);
      expect(screen.getByText('Last ride: Today')).toBeTruthy();
    });

    it('shows "Yesterday" for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      render(
        <DriverCard driver={mockDriver} rideCount={5} lastRideDate={yesterday.toISOString()} />
      );
      expect(screen.getByText('Last ride: Yesterday')).toBeTruthy();
    });

    it('shows "X days ago" for recent dates', () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      render(
        <DriverCard driver={mockDriver} rideCount={5} lastRideDate={threeDaysAgo.toISOString()} />
      );
      expect(screen.getByText('Last ride: 3 days ago')).toBeTruthy();
    });

    it('shows "X weeks ago" for older dates', () => {
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      render(
        <DriverCard driver={mockDriver} rideCount={5} lastRideDate={twoWeeksAgo.toISOString()} />
      );
      expect(screen.getByText('Last ride: 2 weeks ago')).toBeTruthy();
    });
  });
});
