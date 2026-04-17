import { render, fireEvent, screen } from '@testing-library/react-native';

import { StatusToggle } from '../StatusToggle';

describe('StatusToggle', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders all three status options', () => {
    render(<StatusToggle value="offline" onChange={mockOnChange} />);

    expect(screen.getByTestId('status-option-available')).toBeTruthy();
    expect(screen.getByTestId('status-option-on_trip')).toBeTruthy();
    expect(screen.getByTestId('status-option-offline')).toBeTruthy();
  });

  it('renders with the correct initial value selected', () => {
    render(<StatusToggle value="available" onChange={mockOnChange} />);

    const availableOption = screen.getByTestId('status-option-available');
    expect(availableOption.props.accessibilityState.selected).toBe(true);
  });

  it('calls onChange when a status option is pressed', () => {
    render(<StatusToggle value="offline" onChange={mockOnChange} />);

    fireEvent.press(screen.getByTestId('status-option-available'));
    expect(mockOnChange).toHaveBeenCalledWith('available');
  });

  it('does not call onChange when disabled', () => {
    render(<StatusToggle value="offline" onChange={mockOnChange} disabled />);

    fireEvent.press(screen.getByTestId('status-option-available'));
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('renders "Your Status" label', () => {
    render(<StatusToggle value="offline" onChange={mockOnChange} />);

    expect(screen.getByText('Your Status')).toBeTruthy();
  });

  it('renders all status labels', () => {
    render(<StatusToggle value="offline" onChange={mockOnChange} />);

    expect(screen.getByText('Available')).toBeTruthy();
    expect(screen.getByText('On Trip')).toBeTruthy();
    expect(screen.getByText('Offline')).toBeTruthy();
  });

  it('has correct accessibility labels', () => {
    render(<StatusToggle value="offline" onChange={mockOnChange} />);

    const availableOption = screen.getByTestId('status-option-available');
    expect(availableOption.props.accessibilityLabel).toBe('Available');
    expect(availableOption.props.accessibilityRole).toBe('radio');
  });

  it('changes selection when different status is pressed', () => {
    const { rerender } = render(<StatusToggle value="offline" onChange={mockOnChange} />);

    // Initially offline is selected
    expect(screen.getByTestId('status-option-offline').props.accessibilityState.selected).toBe(
      true
    );
    expect(screen.getByTestId('status-option-available').props.accessibilityState.selected).toBe(
      false
    );

    // Simulate pressing available
    fireEvent.press(screen.getByTestId('status-option-available'));
    expect(mockOnChange).toHaveBeenCalledWith('available');

    // Simulate parent updating the value
    rerender(<StatusToggle value="available" onChange={mockOnChange} />);

    // Now available should be selected
    expect(screen.getByTestId('status-option-available').props.accessibilityState.selected).toBe(
      true
    );
    expect(screen.getByTestId('status-option-offline').props.accessibilityState.selected).toBe(
      false
    );
  });

  it('applies testID to the container', () => {
    render(<StatusToggle value="offline" onChange={mockOnChange} testID="driver-status-toggle" />);

    expect(screen.getByTestId('driver-status-toggle')).toBeTruthy();
  });

  it('shows disabled state with opacity', () => {
    render(<StatusToggle value="offline" onChange={mockOnChange} disabled />);

    const availableOption = screen.getByTestId('status-option-available');
    expect(availableOption.props.accessibilityState.disabled).toBe(true);
  });
});
