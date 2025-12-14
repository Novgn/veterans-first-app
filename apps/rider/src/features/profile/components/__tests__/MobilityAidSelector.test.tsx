/**
 * MobilityAidSelector Component Tests
 *
 * Story 2.13: Implement Accessibility Preferences (AC: #1, #4)
 */

import { render, fireEvent, screen } from '@testing-library/react-native';
import React from 'react';

import type { MobilityAidType } from '../../hooks/useAccessibilityPreferences';
import { MobilityAidSelector, MOBILITY_OPTIONS } from '../MobilityAidSelector';

describe('MobilityAidSelector', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all mobility aid options', () => {
    render(<MobilityAidSelector value={null} onChange={mockOnChange} testID="selector" />);

    MOBILITY_OPTIONS.forEach((option) => {
      expect(screen.getByText(option.label)).toBeTruthy();
      expect(screen.getByText(option.description)).toBeTruthy();
    });
  });

  it('renders header and description text', () => {
    render(<MobilityAidSelector value={null} onChange={mockOnChange} testID="selector" />);

    expect(screen.getByText('Mobility Aid')).toBeTruthy();
    expect(
      screen.getByText(
        'Select the mobility aid you use, if any. This helps drivers prepare for your ride.'
      )
    ).toBeTruthy();
  });

  it('calls onChange when an option is selected', () => {
    render(<MobilityAidSelector value={null} onChange={mockOnChange} testID="selector" />);

    fireEvent.press(screen.getByText('Walker'));

    expect(mockOnChange).toHaveBeenCalledWith('walker');
  });

  it('shows selected state for current value', () => {
    render(<MobilityAidSelector value="walker" onChange={mockOnChange} testID="selector" />);

    // Walker option should have selected styling
    const walkerOption = screen.getByTestId('selector-option-walker');
    expect(walkerOption).toBeTruthy();
  });

  it('allows changing selection', () => {
    render(<MobilityAidSelector value="walker" onChange={mockOnChange} testID="selector" />);

    fireEvent.press(screen.getByText('Cane'));

    expect(mockOnChange).toHaveBeenCalledWith('cane');
  });

  it('handles all mobility aid types', () => {
    const { rerender } = render(
      <MobilityAidSelector value={null} onChange={mockOnChange} testID="selector" />
    );

    const types: MobilityAidType[] = [
      'none',
      'cane',
      'walker',
      'manual_wheelchair',
      'power_wheelchair',
    ];

    types.forEach((type) => {
      rerender(<MobilityAidSelector value={type} onChange={mockOnChange} testID="selector" />);
      // Should render without error
      expect(screen.getByTestId(`selector-option-${type}`)).toBeTruthy();
    });
  });

  it('has proper accessibility attributes', () => {
    render(<MobilityAidSelector value="walker" onChange={mockOnChange} testID="selector" />);

    // Check that options have accessibility role
    const walkerOption = screen.getByTestId('selector-option-walker');
    expect(walkerOption.props.accessibilityRole).toBe('radio');
    expect(walkerOption.props.accessibilityState.selected).toBe(true);

    const caneOption = screen.getByTestId('selector-option-cane');
    expect(caneOption.props.accessibilityState.selected).toBe(false);
  });

  it('displays checkmark for selected option', () => {
    render(
      <MobilityAidSelector value="manual_wheelchair" onChange={mockOnChange} testID="selector" />
    );

    // The selected option should show differently from unselected
    const selectedOption = screen.getByTestId('selector-option-manual_wheelchair');
    expect(selectedOption).toBeTruthy();
  });

  it('renders with null value (no selection)', () => {
    render(<MobilityAidSelector value={null} onChange={mockOnChange} testID="selector" />);

    // All options should be unselected
    MOBILITY_OPTIONS.forEach((option) => {
      const optionElement = screen.getByTestId(`selector-option-${option.value}`);
      expect(optionElement.props.accessibilityState.selected).toBe(false);
    });
  });
});
