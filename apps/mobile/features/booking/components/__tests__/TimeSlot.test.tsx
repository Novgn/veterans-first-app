/**
 * TimeSlot Component Tests
 */

import { render, screen, fireEvent } from '@testing-library/react-native';

import { TimeSlot } from '../TimeSlot';

describe('TimeSlot', () => {
  const defaultProps = {
    time: '9:00 AM',
    isSelected: false,
    onPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the time text correctly', () => {
    render(<TimeSlot {...defaultProps} />);
    expect(screen.getByText('9:00 AM')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    render(<TimeSlot {...defaultProps} onPress={onPress} />);

    fireEvent.press(screen.getByText('9:00 AM'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    render(<TimeSlot {...defaultProps} onPress={onPress} isDisabled />);

    fireEvent.press(screen.getByText('9:00 AM'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('has correct accessibility label', () => {
    render(<TimeSlot {...defaultProps} />);

    const button = screen.getByRole('button');
    expect(button.props.accessibilityLabel).toBe('Select 9:00 AM for pickup');
  });

  it('has correct accessibility state when selected', () => {
    render(<TimeSlot {...defaultProps} isSelected />);

    const button = screen.getByRole('button');
    expect(button.props.accessibilityState).toEqual({
      selected: true,
      disabled: false,
    });
  });

  it('has correct accessibility state when disabled', () => {
    render(<TimeSlot {...defaultProps} isDisabled />);

    const button = screen.getByRole('button');
    expect(button.props.accessibilityState).toEqual({
      selected: false,
      disabled: true,
    });
  });

  it('renders different times correctly', () => {
    const { rerender } = render(<TimeSlot {...defaultProps} time="10:30 AM" />);
    expect(screen.getByText('10:30 AM')).toBeTruthy();

    rerender(<TimeSlot {...defaultProps} time="2:00 PM" />);
    expect(screen.getByText('2:00 PM')).toBeTruthy();
  });
});
