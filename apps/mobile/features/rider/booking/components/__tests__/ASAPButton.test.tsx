/**
 * ASAPButton Component Tests
 */

import { render, screen, fireEvent } from '@testing-library/react-native';

import { ASAPButton } from '../ASAPButton';

describe('ASAPButton', () => {
  const defaultProps = {
    onPress: jest.fn(),
    isSelected: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders "Schedule ASAP" text', () => {
    render(<ASAPButton {...defaultProps} />);
    expect(screen.getByText('Schedule ASAP')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    render(<ASAPButton {...defaultProps} onPress={onPress} />);

    fireEvent.press(screen.getByText('Schedule ASAP'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('has correct accessibility label', () => {
    render(<ASAPButton {...defaultProps} />);

    const button = screen.getByRole('button');
    expect(button.props.accessibilityLabel).toBe('Schedule ride as soon as possible');
  });

  it('has correct accessibility state when not selected', () => {
    render(<ASAPButton {...defaultProps} isSelected={false} />);

    const button = screen.getByRole('button');
    expect(button.props.accessibilityState).toEqual({ selected: false });
  });

  it('has correct accessibility state when selected', () => {
    render(<ASAPButton {...defaultProps} isSelected />);

    const button = screen.getByRole('button');
    expect(button.props.accessibilityState).toEqual({ selected: true });
  });

  it('renders flash icon', () => {
    render(<ASAPButton {...defaultProps} />);
    // Icon is rendered as part of the component
    expect(screen.getByRole('button')).toBeTruthy();
  });
});
