/**
 * AssistanceToggles Component Tests
 *
 * Story 2.13: Implement Accessibility Preferences (AC: #1, #4)
 */

import { render, fireEvent, screen } from '@testing-library/react-native';
import React from 'react';

import { AssistanceToggles } from '../AssistanceToggles';

describe('AssistanceToggles', () => {
  const mockOnDoorAssistanceChange = jest.fn();
  const mockOnPackageAssistanceChange = jest.fn();
  const mockOnExtraSpaceChange = jest.fn();

  const defaultProps = {
    needsDoorAssistance: false,
    needsPackageAssistance: false,
    extraVehicleSpace: false,
    onDoorAssistanceChange: mockOnDoorAssistanceChange,
    onPackageAssistanceChange: mockOnPackageAssistanceChange,
    onExtraSpaceChange: mockOnExtraSpaceChange,
    testID: 'toggles',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all three toggles', () => {
    render(<AssistanceToggles {...defaultProps} />);

    expect(screen.getByText('Help to Door')).toBeTruthy();
    expect(screen.getByText('Help with Packages')).toBeTruthy();
    expect(screen.getByText('Extra Vehicle Space')).toBeTruthy();
  });

  it('renders header and description text', () => {
    render(<AssistanceToggles {...defaultProps} />);

    expect(screen.getByText('Assistance Needed')).toBeTruthy();
    expect(
      screen.getByText('Let drivers know what assistance you may need during your ride.')
    ).toBeTruthy();
  });

  it('renders toggle descriptions', () => {
    render(<AssistanceToggles {...defaultProps} />);

    expect(screen.getByText('Driver assists to/from building entrance')).toBeTruthy();
    expect(screen.getByText('Driver helps carry bags or belongings')).toBeTruthy();
    expect(screen.getByText('Need room for wheelchair or equipment')).toBeTruthy();
  });

  it('calls onDoorAssistanceChange when door toggle is pressed', () => {
    render(<AssistanceToggles {...defaultProps} />);

    const doorSwitch = screen.getByTestId('toggles-door');
    fireEvent(doorSwitch, 'valueChange', true);

    expect(mockOnDoorAssistanceChange).toHaveBeenCalledWith(true);
  });

  it('calls onPackageAssistanceChange when package toggle is pressed', () => {
    render(<AssistanceToggles {...defaultProps} />);

    const packageSwitch = screen.getByTestId('toggles-packages');
    fireEvent(packageSwitch, 'valueChange', true);

    expect(mockOnPackageAssistanceChange).toHaveBeenCalledWith(true);
  });

  it('calls onExtraSpaceChange when extra space toggle is pressed', () => {
    render(<AssistanceToggles {...defaultProps} />);

    const extraSpaceSwitch = screen.getByTestId('toggles-extra-space');
    fireEvent(extraSpaceSwitch, 'valueChange', true);

    expect(mockOnExtraSpaceChange).toHaveBeenCalledWith(true);
  });

  it('shows correct toggle state when enabled', () => {
    render(
      <AssistanceToggles
        {...defaultProps}
        needsDoorAssistance={true}
        needsPackageAssistance={true}
        extraVehicleSpace={true}
      />
    );

    const doorSwitch = screen.getByTestId('toggles-door');
    const packageSwitch = screen.getByTestId('toggles-packages');
    const extraSpaceSwitch = screen.getByTestId('toggles-extra-space');

    expect(doorSwitch.props.value).toBe(true);
    expect(packageSwitch.props.value).toBe(true);
    expect(extraSpaceSwitch.props.value).toBe(true);
  });

  it('shows correct toggle state when disabled', () => {
    render(<AssistanceToggles {...defaultProps} />);

    const doorSwitch = screen.getByTestId('toggles-door');
    const packageSwitch = screen.getByTestId('toggles-packages');
    const extraSpaceSwitch = screen.getByTestId('toggles-extra-space');

    expect(doorSwitch.props.value).toBe(false);
    expect(packageSwitch.props.value).toBe(false);
    expect(extraSpaceSwitch.props.value).toBe(false);
  });

  it('has proper accessibility labels', () => {
    render(<AssistanceToggles {...defaultProps} />);

    const doorSwitch = screen.getByTestId('toggles-door');
    const packageSwitch = screen.getByTestId('toggles-packages');
    const extraSpaceSwitch = screen.getByTestId('toggles-extra-space');

    expect(doorSwitch.props.accessibilityLabel).toBe('Help to door');
    expect(packageSwitch.props.accessibilityLabel).toBe('Help with packages');
    expect(extraSpaceSwitch.props.accessibilityLabel).toBe('Extra vehicle space');
  });

  it('has proper accessibility hints', () => {
    render(<AssistanceToggles {...defaultProps} />);

    const doorSwitch = screen.getByTestId('toggles-door');
    const packageSwitch = screen.getByTestId('toggles-packages');
    const extraSpaceSwitch = screen.getByTestId('toggles-extra-space');

    expect(doorSwitch.props.accessibilityHint).toBe(
      'Toggle if you need assistance getting to and from the door'
    );
    expect(packageSwitch.props.accessibilityHint).toBe(
      'Toggle if you need help with packages or belongings'
    );
    expect(extraSpaceSwitch.props.accessibilityHint).toBe(
      'Toggle if you need extra space for mobility equipment'
    );
  });

  it('can toggle individual switches independently', () => {
    render(<AssistanceToggles {...defaultProps} needsDoorAssistance={true} />);

    const doorSwitch = screen.getByTestId('toggles-door');
    const packageSwitch = screen.getByTestId('toggles-packages');

    expect(doorSwitch.props.value).toBe(true);
    expect(packageSwitch.props.value).toBe(false);

    // Toggle package off should work independently
    fireEvent(packageSwitch, 'valueChange', true);
    expect(mockOnPackageAssistanceChange).toHaveBeenCalledWith(true);

    // Door should remain unchanged
    expect(mockOnDoorAssistanceChange).not.toHaveBeenCalled();
  });
});
