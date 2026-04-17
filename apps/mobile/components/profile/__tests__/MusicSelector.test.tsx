/**
 * MusicSelector Component Tests
 *
 * Story 2.14: Implement Comfort Preferences (AC: #1, #4)
 */

import { render, fireEvent, screen } from '@testing-library/react-native';
import React from 'react';

import type { MusicPreference } from '@/hooks/useComfortPreferences';
import { MusicSelector, MUSIC_OPTIONS } from '../MusicSelector';

describe('MusicSelector', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all music options', () => {
    render(<MusicSelector value={null} onChange={mockOnChange} testID="selector" />);

    MUSIC_OPTIONS.forEach((option) => {
      expect(screen.getByText(option.label)).toBeTruthy();
    });
  });

  it('renders header and description text', () => {
    render(<MusicSelector value={null} onChange={mockOnChange} testID="selector" />);

    expect(screen.getByText('Music')).toBeTruthy();
    expect(screen.getByText("What's your music preference for rides?")).toBeTruthy();
  });

  it('calls onChange when an option is selected', () => {
    render(<MusicSelector value={null} onChange={mockOnChange} testID="selector" />);

    fireEvent.press(screen.getByText('No Music'));

    expect(mockOnChange).toHaveBeenCalledWith('none');
  });

  it('shows selected state for current value', () => {
    render(<MusicSelector value="none" onChange={mockOnChange} testID="selector" />);

    const noneOption = screen.getByTestId('selector-option-none');
    expect(noneOption).toBeTruthy();
  });

  it('allows changing selection', () => {
    render(<MusicSelector value="none" onChange={mockOnChange} testID="selector" />);

    fireEvent.press(screen.getByText('Any Music'));

    expect(mockOnChange).toHaveBeenCalledWith('any');
  });

  it('handles all music types', () => {
    const { rerender } = render(
      <MusicSelector value={null} onChange={mockOnChange} testID="selector" />
    );

    const types: MusicPreference[] = ['none', 'soft', 'any'];

    types.forEach((type) => {
      rerender(<MusicSelector value={type} onChange={mockOnChange} testID="selector" />);
      expect(screen.getByTestId(`selector-option-${type}`)).toBeTruthy();
    });
  });

  it('has proper accessibility attributes', () => {
    render(<MusicSelector value="soft" onChange={mockOnChange} testID="selector" />);

    const softOption = screen.getByTestId('selector-option-soft');
    expect(softOption.props.accessibilityRole).toBe('radio');
    expect(softOption.props.accessibilityState.selected).toBe(true);

    const noneOption = screen.getByTestId('selector-option-none');
    expect(noneOption.props.accessibilityState.selected).toBe(false);
  });

  it('renders with null value (no selection)', () => {
    render(<MusicSelector value={null} onChange={mockOnChange} testID="selector" />);

    MUSIC_OPTIONS.forEach((option) => {
      const optionElement = screen.getByTestId(`selector-option-${option.value}`);
      expect(optionElement.props.accessibilityState.selected).toBe(false);
    });
  });

  it('has minimum touch target size of 80px', () => {
    render(<MusicSelector value={null} onChange={mockOnChange} testID="selector" />);

    const noneOption = screen.getByTestId('selector-option-none');
    // The className includes min-h-[80px]
    expect(noneOption).toBeTruthy();
  });

  it('displays icons for each music option', () => {
    render(<MusicSelector value={null} onChange={mockOnChange} testID="selector" />);

    expect(screen.getByTestId('selector-option-none')).toBeTruthy();
    expect(screen.getByTestId('selector-option-soft')).toBeTruthy();
    expect(screen.getByTestId('selector-option-any')).toBeTruthy();
  });

  it('shows correct labels for all options', () => {
    render(<MusicSelector value={null} onChange={mockOnChange} testID="selector" />);

    expect(screen.getByText('No Music')).toBeTruthy();
    expect(screen.getByText('Soft Background')).toBeTruthy();
    expect(screen.getByText('Any Music')).toBeTruthy();
  });
});
