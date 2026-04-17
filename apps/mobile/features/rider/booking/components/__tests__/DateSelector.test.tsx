/**
 * DateSelector Component Tests
 */

import { render, screen, fireEvent } from '@testing-library/react-native';

import { DateSelector } from '../DateSelector';

describe('DateSelector', () => {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const defaultProps = {
    selectedDate: null,
    onDateSelect: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the title', () => {
    render(<DateSelector {...defaultProps} />);
    expect(screen.getByText('When do you need to go?')).toBeTruthy();
  });

  it('renders Today and Tomorrow buttons', () => {
    render(<DateSelector {...defaultProps} />);
    expect(screen.getByText('Today')).toBeTruthy();
    expect(screen.getByText('Tomorrow')).toBeTruthy();
  });

  it('defaults to today when selectedDate is null', () => {
    render(<DateSelector {...defaultProps} />);

    const todayButton = screen.getByLabelText('Select today');
    expect(todayButton.props.accessibilityState).toEqual({ selected: true });
  });

  it('calls onDateSelect with today when Today button is pressed', () => {
    const onDateSelect = jest.fn();
    render(<DateSelector {...defaultProps} onDateSelect={onDateSelect} />);

    fireEvent.press(screen.getByText('Today'));
    expect(onDateSelect).toHaveBeenCalledWith(today);
  });

  it('calls onDateSelect with tomorrow when Tomorrow button is pressed', () => {
    const onDateSelect = jest.fn();
    render(<DateSelector {...defaultProps} onDateSelect={onDateSelect} />);

    fireEvent.press(screen.getByText('Tomorrow'));
    expect(onDateSelect).toHaveBeenCalledWith(tomorrow);
  });

  it('shows Tomorrow as selected when selectedDate is tomorrow', () => {
    render(<DateSelector {...defaultProps} selectedDate={tomorrow} />);

    const tomorrowButton = screen.getByLabelText('Select tomorrow');
    expect(tomorrowButton.props.accessibilityState).toEqual({ selected: true });
  });

  it('has correct accessibility labels', () => {
    render(<DateSelector {...defaultProps} />);

    expect(screen.getByLabelText('Select today')).toBeTruthy();
    expect(screen.getByLabelText('Select tomorrow')).toBeTruthy();
    expect(screen.getByLabelText('Select a different date')).toBeTruthy();
  });

  it('opens date picker modal when calendar button is pressed', () => {
    render(<DateSelector {...defaultProps} />);

    fireEvent.press(screen.getByLabelText('Select a different date'));
    expect(screen.getByText('Select Date')).toBeTruthy();
  });

  it('shows selected date label when a future date is selected', () => {
    // Select a date 3 days from now
    const futureDate = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];
    render(<DateSelector {...defaultProps} selectedDate={futureDate} />);

    // Should show "Selected: ..." text
    expect(screen.getByText(/Selected:/)).toBeTruthy();
  });

  it('closes date picker modal when close button is pressed', () => {
    render(<DateSelector {...defaultProps} />);

    // Open modal
    fireEvent.press(screen.getByLabelText('Select a different date'));
    expect(screen.getByText('Select Date')).toBeTruthy();

    // Close modal
    fireEvent.press(screen.getByLabelText('Close date picker'));

    // Modal should be closed (Select Date header should not be visible)
    expect(screen.queryByText('Select Date')).toBeNull();
  });
});
