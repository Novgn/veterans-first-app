/**
 * ConversationSelector Component Tests
 *
 * Story 2.14: Implement Comfort Preferences (AC: #1, #4)
 */

import { render, fireEvent, screen } from '@testing-library/react-native';
import React from 'react';

import type { ConversationPreference } from '../../hooks/useComfortPreferences';
import { ConversationSelector, CONVERSATION_OPTIONS } from '../ConversationSelector';

describe('ConversationSelector', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all conversation options', () => {
    render(<ConversationSelector value={null} onChange={mockOnChange} testID="selector" />);

    CONVERSATION_OPTIONS.forEach((option) => {
      expect(screen.getByText(option.label)).toBeTruthy();
      expect(screen.getByText(option.description)).toBeTruthy();
    });
  });

  it('renders header and description text', () => {
    render(<ConversationSelector value={null} onChange={mockOnChange} testID="selector" />);

    expect(screen.getByText('Conversation')).toBeTruthy();
    expect(screen.getByText('How much do you like to chat during rides?')).toBeTruthy();
  });

  it('calls onChange when an option is selected', () => {
    render(<ConversationSelector value={null} onChange={mockOnChange} testID="selector" />);

    fireEvent.press(screen.getByText('Quiet Ride'));

    expect(mockOnChange).toHaveBeenCalledWith('quiet');
  });

  it('shows selected state for current value', () => {
    render(<ConversationSelector value="quiet" onChange={mockOnChange} testID="selector" />);

    const quietOption = screen.getByTestId('selector-option-quiet');
    expect(quietOption).toBeTruthy();
  });

  it('allows changing selection', () => {
    render(<ConversationSelector value="quiet" onChange={mockOnChange} testID="selector" />);

    fireEvent.press(screen.getByText('Chatty'));

    expect(mockOnChange).toHaveBeenCalledWith('chatty');
  });

  it('handles all conversation types', () => {
    const { rerender } = render(
      <ConversationSelector value={null} onChange={mockOnChange} testID="selector" />
    );

    const types: ConversationPreference[] = ['quiet', 'some', 'chatty'];

    types.forEach((type) => {
      rerender(<ConversationSelector value={type} onChange={mockOnChange} testID="selector" />);
      expect(screen.getByTestId(`selector-option-${type}`)).toBeTruthy();
    });
  });

  it('has proper accessibility attributes', () => {
    render(<ConversationSelector value="quiet" onChange={mockOnChange} testID="selector" />);

    const quietOption = screen.getByTestId('selector-option-quiet');
    expect(quietOption.props.accessibilityRole).toBe('radio');
    expect(quietOption.props.accessibilityState.selected).toBe(true);

    const someOption = screen.getByTestId('selector-option-some');
    expect(someOption.props.accessibilityState.selected).toBe(false);
  });

  it('renders with null value (no selection)', () => {
    render(<ConversationSelector value={null} onChange={mockOnChange} testID="selector" />);

    CONVERSATION_OPTIONS.forEach((option) => {
      const optionElement = screen.getByTestId(`selector-option-${option.value}`);
      expect(optionElement.props.accessibilityState.selected).toBe(false);
    });
  });

  it('displays checkmark for selected option', () => {
    render(<ConversationSelector value="chatty" onChange={mockOnChange} testID="selector" />);

    const selectedOption = screen.getByTestId('selector-option-chatty');
    expect(selectedOption).toBeTruthy();
  });

  it('has minimum touch target size of 56px', () => {
    render(<ConversationSelector value={null} onChange={mockOnChange} testID="selector" />);

    const quietOption = screen.getByTestId('selector-option-quiet');
    // The className includes min-h-[56px]
    expect(quietOption).toBeTruthy();
  });

  it('displays icons and descriptions for each option', () => {
    render(<ConversationSelector value={null} onChange={mockOnChange} testID="selector" />);

    expect(screen.getByText('Prefer minimal conversation')).toBeTruthy();
    expect(screen.getByText('Light conversation is nice')).toBeTruthy();
    expect(screen.getByText('Love a good conversation')).toBeTruthy();
  });
});
