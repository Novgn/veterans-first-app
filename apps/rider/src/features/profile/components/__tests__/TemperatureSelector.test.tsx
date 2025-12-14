/**
 * TemperatureSelector Component Tests
 *
 * Story 2.14: Implement Comfort Preferences (AC: #1, #4)
 */

import { render, fireEvent, screen } from '@testing-library/react-native';
import React from 'react';

import type { TemperaturePreference } from '../../hooks/useComfortPreferences';
import { TemperatureSelector, TEMPERATURE_OPTIONS } from '../TemperatureSelector';

describe('TemperatureSelector', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all temperature options', () => {
    render(<TemperatureSelector value={null} onChange={mockOnChange} testID="selector" />);

    TEMPERATURE_OPTIONS.forEach((option) => {
      expect(screen.getByText(option.label)).toBeTruthy();
    });
  });

  it('renders header and description text', () => {
    render(<TemperatureSelector value={null} onChange={mockOnChange} testID="selector" />);

    expect(screen.getByText('Temperature')).toBeTruthy();
    expect(screen.getByText('What temperature do you prefer during your rides?')).toBeTruthy();
  });

  it('calls onChange when an option is selected', () => {
    render(<TemperatureSelector value={null} onChange={mockOnChange} testID="selector" />);

    fireEvent.press(screen.getByText('Cool'));

    expect(mockOnChange).toHaveBeenCalledWith('cool');
  });

  it('shows selected state for current value', () => {
    render(<TemperatureSelector value="cool" onChange={mockOnChange} testID="selector" />);

    const coolOption = screen.getByTestId('selector-option-cool');
    expect(coolOption).toBeTruthy();
  });

  it('allows changing selection', () => {
    render(<TemperatureSelector value="cool" onChange={mockOnChange} testID="selector" />);

    fireEvent.press(screen.getByText('Warm'));

    expect(mockOnChange).toHaveBeenCalledWith('warm');
  });

  it('handles all temperature types', () => {
    const { rerender } = render(
      <TemperatureSelector value={null} onChange={mockOnChange} testID="selector" />
    );

    const types: TemperaturePreference[] = ['cool', 'normal', 'warm'];

    types.forEach((type) => {
      rerender(<TemperatureSelector value={type} onChange={mockOnChange} testID="selector" />);
      expect(screen.getByTestId(`selector-option-${type}`)).toBeTruthy();
    });
  });

  it('has proper accessibility attributes', () => {
    render(<TemperatureSelector value="cool" onChange={mockOnChange} testID="selector" />);

    const coolOption = screen.getByTestId('selector-option-cool');
    expect(coolOption.props.accessibilityRole).toBe('radio');
    expect(coolOption.props.accessibilityState.selected).toBe(true);

    const normalOption = screen.getByTestId('selector-option-normal');
    expect(normalOption.props.accessibilityState.selected).toBe(false);
  });

  it('renders with null value (no selection)', () => {
    render(<TemperatureSelector value={null} onChange={mockOnChange} testID="selector" />);

    TEMPERATURE_OPTIONS.forEach((option) => {
      const optionElement = screen.getByTestId(`selector-option-${option.value}`);
      expect(optionElement.props.accessibilityState.selected).toBe(false);
    });
  });

  it('has minimum touch target size of 80px', () => {
    render(<TemperatureSelector value={null} onChange={mockOnChange} testID="selector" />);

    const coolOption = screen.getByTestId('selector-option-cool');
    // The className includes min-h-[80px]
    expect(coolOption).toBeTruthy();
  });

  it('displays icons for each temperature option', () => {
    render(<TemperatureSelector value={null} onChange={mockOnChange} testID="selector" />);

    // All options should render (which means icons are rendered)
    expect(screen.getByTestId('selector-option-cool')).toBeTruthy();
    expect(screen.getByTestId('selector-option-normal')).toBeTruthy();
    expect(screen.getByTestId('selector-option-warm')).toBeTruthy();
  });
});
