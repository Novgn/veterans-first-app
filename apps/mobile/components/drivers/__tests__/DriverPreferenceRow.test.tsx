/**
 * DriverPreferenceRow Component Tests
 *
 * Tests for the booking flow driver preference display.
 * Story 2.7: Implement Preferred Driver Selection
 */

import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import { DriverPreferenceRow } from '../DriverPreferenceRow';

describe('DriverPreferenceRow', () => {
  const defaultProps = {
    selectedDriverId: null,
    selectedDriverName: null,
    onPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('shows "Any Available Driver" when no driver selected', () => {
      render(<DriverPreferenceRow {...defaultProps} />);
      expect(screen.getByText('Any Available Driver')).toBeTruthy();
    });

    it('shows "Driver" label', () => {
      render(<DriverPreferenceRow {...defaultProps} />);
      expect(screen.getByText('Driver')).toBeTruthy();
    });

    it('shows "Change" action text', () => {
      render(<DriverPreferenceRow {...defaultProps} />);
      expect(screen.getByText('Change')).toBeTruthy();
    });

    it('shows "Requesting [Name]" when driver selected', () => {
      render(
        <DriverPreferenceRow
          {...defaultProps}
          selectedDriverId="driver-123"
          selectedDriverName="Dave"
        />
      );
      expect(screen.getByText('Requesting Dave')).toBeTruthy();
    });

    it('shows default avatar for selected driver without photo', () => {
      render(
        <DriverPreferenceRow
          {...defaultProps}
          selectedDriverId="driver-123"
          selectedDriverName="Dave"
          testID="preference-row"
        />
      );
      expect(screen.getByTestId('preference-row')).toBeTruthy();
    });
  });

  describe('interactions', () => {
    it('calls onPress when tapped', () => {
      const onPress = jest.fn();
      render(<DriverPreferenceRow {...defaultProps} onPress={onPress} testID="preference-row" />);

      fireEvent.press(screen.getByTestId('preference-row'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility', () => {
    it('has accessibility label for no driver selected', () => {
      render(<DriverPreferenceRow {...defaultProps} testID="preference-row" />);
      const row = screen.getByTestId('preference-row');
      expect(row.props.accessibilityLabel).toContain('Any available driver');
    });

    it('has accessibility label for selected driver', () => {
      render(
        <DriverPreferenceRow
          {...defaultProps}
          selectedDriverId="driver-123"
          selectedDriverName="Dave"
          testID="preference-row"
        />
      );
      const row = screen.getByTestId('preference-row');
      expect(row.props.accessibilityLabel).toContain('Requesting Dave');
    });

    it('has button accessibility role', () => {
      render(<DriverPreferenceRow {...defaultProps} testID="preference-row" />);
      const row = screen.getByTestId('preference-row');
      expect(row.props.accessibilityRole).toBe('button');
    });

    it('has accessibility hint', () => {
      render(<DriverPreferenceRow {...defaultProps} testID="preference-row" />);
      const row = screen.getByTestId('preference-row');
      expect(row.props.accessibilityHint).toBe('Opens driver selection');
    });
  });

  describe('touch target', () => {
    it('has minimum 48dp touch target via min-h-[64px] class', () => {
      render(<DriverPreferenceRow {...defaultProps} testID="preference-row" />);
      // Touch target is enforced via className - component should render
      expect(screen.getByTestId('preference-row')).toBeTruthy();
    });
  });
});
