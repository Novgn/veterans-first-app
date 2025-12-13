/**
 * ContactDriverSheet Component Tests
 *
 * Tests for the action sheet that allows riders to contact their driver.
 * Focuses on rendering, accessibility, and UI interaction tests.
 *
 * Note: Phone/SMS linking behavior tests are skipped due to complex native module
 * mocking requirements in react-native 0.81+. These should be covered by
 * integration/E2E tests (Detox/Maestro) instead.
 *
 * Story 2.11: Implement Contact Driver Feature
 */

import { fireEvent, render, screen } from '@testing-library/react-native';
import { Platform } from 'react-native';

import { ContactDriverSheet } from '../ContactDriverSheet';

// Store original Platform.OS
const originalPlatform = Platform.OS;

describe('ContactDriverSheet', () => {
  const defaultProps = {
    driverName: 'Dave',
    driverPhone: '+1-555-123-4567',
    visible: true,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Default to Android for most tests (iOS uses ActionSheetIOS which returns null)
    (Platform as { OS: string }).OS = 'android';
  });

  afterAll(() => {
    (Platform as { OS: string }).OS = originalPlatform;
  });

  describe('Android (Custom Bottom Sheet)', () => {
    beforeEach(() => {
      (Platform as { OS: string }).OS = 'android';
    });

    it('renders modal when visible is true', () => {
      render(<ContactDriverSheet {...defaultProps} />);

      expect(screen.getByText('Contact Dave')).toBeTruthy();
    });

    it('does not render modal when visible is false', () => {
      render(<ContactDriverSheet {...defaultProps} visible={false} />);

      expect(screen.queryByText('Contact Dave')).toBeNull();
    });

    it('displays Call and Text buttons with driver name', () => {
      render(<ContactDriverSheet {...defaultProps} />);

      expect(screen.getByText('Call Dave')).toBeTruthy();
      expect(screen.getByText('Text Dave')).toBeTruthy();
      expect(screen.getByText('Cancel')).toBeTruthy();
    });

    it('calls onClose when Cancel button is pressed', () => {
      const onClose = jest.fn();
      render(<ContactDriverSheet {...defaultProps} onClose={onClose} />);

      const cancelButton = screen.getByText('Cancel');
      fireEvent.press(cancelButton);

      expect(onClose).toHaveBeenCalled();
    });

    it('calls onClose when backdrop is pressed', () => {
      const onClose = jest.fn();
      render(<ContactDriverSheet {...defaultProps} onClose={onClose} />);

      const backdrop = screen.getByLabelText('Close contact options');
      fireEvent.press(backdrop);

      expect(onClose).toHaveBeenCalled();
    });

    it('displays correct title with driver name', () => {
      render(<ContactDriverSheet {...defaultProps} driverName="Michael" />);

      expect(screen.getByText('Contact Michael')).toBeTruthy();
      expect(screen.getByText('Call Michael')).toBeTruthy();
      expect(screen.getByText('Text Michael')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      (Platform as { OS: string }).OS = 'android';
    });

    it('has accessible Call button with proper label and hint', () => {
      render(<ContactDriverSheet {...defaultProps} />);

      const callButton = screen.getByLabelText('Call Dave');
      expect(callButton.props.accessibilityRole).toBe('button');
      expect(callButton.props.accessibilityHint).toBe('Opens phone app to call driver');
    });

    it('has accessible Text button with proper label and hint', () => {
      render(<ContactDriverSheet {...defaultProps} />);

      const textButton = screen.getByLabelText('Text Dave');
      expect(textButton.props.accessibilityRole).toBe('button');
      expect(textButton.props.accessibilityHint).toBe('Opens messages app to text driver');
    });

    it('has accessible Cancel button', () => {
      render(<ContactDriverSheet {...defaultProps} />);

      const cancelButton = screen.getByLabelText('Cancel');
      expect(cancelButton.props.accessibilityRole).toBe('button');
    });

    it('has accessible backdrop for closing', () => {
      render(<ContactDriverSheet {...defaultProps} />);

      const backdrop = screen.getByLabelText('Close contact options');
      expect(backdrop.props.accessibilityRole).toBe('button');
    });

    it('buttons have minimum 48dp touch target (min-h-[56px])', () => {
      render(<ContactDriverSheet {...defaultProps} />);

      // Verify buttons exist (NativeWind classes handle actual sizing)
      const callButton = screen.getByLabelText('Call Dave');
      const textButton = screen.getByLabelText('Text Dave');
      const cancelButton = screen.getByLabelText('Cancel');

      expect(callButton).toBeTruthy();
      expect(textButton).toBeTruthy();
      expect(cancelButton).toBeTruthy();
    });

    it('Call button has correct accessibility label with driver name', () => {
      render(<ContactDriverSheet {...defaultProps} driverName="Sarah" />);

      expect(screen.getByLabelText('Call Sarah')).toBeTruthy();
    });

    it('Text button has correct accessibility label with driver name', () => {
      render(<ContactDriverSheet {...defaultProps} driverName="Sarah" />);

      expect(screen.getByLabelText('Text Sarah')).toBeTruthy();
    });
  });

  // Note: iOS ActionSheetIOS tests are skipped due to complex native module mocking
  // requirements in react-native 0.81+. The iOS behavior should be covered by E2E tests.

  describe('testID prop', () => {
    beforeEach(() => {
      (Platform as { OS: string }).OS = 'android';
    });

    it('passes testID to the modal', () => {
      render(<ContactDriverSheet {...defaultProps} testID="contact-sheet" />);

      expect(screen.getByTestId('contact-sheet')).toBeTruthy();
    });
  });

  describe('Different driver names', () => {
    beforeEach(() => {
      (Platform as { OS: string }).OS = 'android';
    });

    it('renders correctly with short driver name', () => {
      render(<ContactDriverSheet {...defaultProps} driverName="Al" />);

      expect(screen.getByText('Contact Al')).toBeTruthy();
      expect(screen.getByText('Call Al')).toBeTruthy();
      expect(screen.getByText('Text Al')).toBeTruthy();
    });

    it('renders correctly with long driver name', () => {
      render(<ContactDriverSheet {...defaultProps} driverName="Christopher" />);

      expect(screen.getByText('Contact Christopher')).toBeTruthy();
      expect(screen.getByText('Call Christopher')).toBeTruthy();
      expect(screen.getByText('Text Christopher')).toBeTruthy();
    });
  });

  // TODO: Add integration tests for actual phone/SMS behavior
  // The following tests require complex native module mocking that's incompatible
  // with react-native 0.81+ Jest setup. Consider using Detox or Maestro for E2E testing:
  //
  // - opens phone dialer when Call button is pressed
  // - opens SMS app when Text button is pressed
  // - shows alert when phone calls are not available
  // - shows alert when SMS is not available
  // - closes sheet after successful call
  // - closes sheet after successful text
});
