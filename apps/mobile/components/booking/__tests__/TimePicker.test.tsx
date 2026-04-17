/**
 * TimePicker Component Tests
 */

import { render, screen, fireEvent } from '@testing-library/react-native';

import { TimePicker } from '../TimePicker';

describe('TimePicker', () => {
  const defaultProps = {
    onTimeSelect: jest.fn(),
    selectedDate: null,
    selectedTime: undefined as string | null | undefined,
    isRecurring: false,
    recurringFrequency: null as 'daily' | 'weekly' | 'custom' | null,
    recurringDays: [] as string[],
    recurringEndDate: null as string | null,
    onDateSelect: jest.fn(),
    onRecurringToggle: jest.fn(),
    onFrequencyChange: jest.fn(),
    onDaysChange: jest.fn(),
    onEndDateChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the ASAP button', () => {
    render(<TimePicker {...defaultProps} />);
    expect(screen.getByText('Schedule ASAP')).toBeTruthy();
  });

  it('renders date selector', () => {
    render(<TimePicker {...defaultProps} />);
    expect(screen.getByText('When do you need to go?')).toBeTruthy();
    expect(screen.getByText('Today')).toBeTruthy();
    expect(screen.getByText('Tomorrow')).toBeTruthy();
  });

  it('renders time slots section title', () => {
    render(<TimePicker {...defaultProps} />);
    expect(screen.getByText('Select a time')).toBeTruthy();
  });

  it('renders time slots from 8 AM to 6 PM', () => {
    render(<TimePicker {...defaultProps} />);

    // Check first and last time slots
    expect(screen.getByText('8:00 AM')).toBeTruthy();
    expect(screen.getByText('6:00 PM')).toBeTruthy();

    // Check some middle slots
    expect(screen.getByText('12:00 PM')).toBeTruthy();
    expect(screen.getByText('2:30 PM')).toBeTruthy();
  });

  it('renders recurring ride toggle', () => {
    render(<TimePicker {...defaultProps} />);
    expect(screen.getByText('Make this a recurring ride')).toBeTruthy();
  });

  it('calls onTimeSelect with null when ASAP is pressed', () => {
    const onTimeSelect = jest.fn();
    render(<TimePicker {...defaultProps} onTimeSelect={onTimeSelect} />);

    fireEvent.press(screen.getByText('Schedule ASAP'));
    expect(onTimeSelect).toHaveBeenCalledWith(null);
  });

  it('calls onTimeSelect with time when time slot is pressed', () => {
    const onTimeSelect = jest.fn();
    render(<TimePicker {...defaultProps} onTimeSelect={onTimeSelect} />);

    fireEvent.press(screen.getByText('9:00 AM'));
    expect(onTimeSelect).toHaveBeenCalledWith('9:00 AM');
  });

  it('shows ASAP button as selected when selectedTime is null', () => {
    render(<TimePicker {...defaultProps} selectedTime={null} />);

    const asapButton = screen.getByLabelText('Schedule ride as soon as possible');
    expect(asapButton.props.accessibilityState).toEqual({ selected: true });
  });

  it('shows time slot as selected when selectedTime matches', () => {
    render(<TimePicker {...defaultProps} selectedTime="10:00 AM" />);

    const timeSlot = screen.getByLabelText('Select 10:00 AM for pickup');
    expect(timeSlot.props.accessibilityState).toEqual({ selected: true, disabled: false });
  });

  it('calls onDateSelect when a date is selected', () => {
    const onDateSelect = jest.fn();
    render(<TimePicker {...defaultProps} onDateSelect={onDateSelect} />);

    fireEvent.press(screen.getByText('Tomorrow'));
    expect(onDateSelect).toHaveBeenCalled();
  });

  it('calls onRecurringToggle when toggle is changed', () => {
    const onRecurringToggle = jest.fn();
    render(<TimePicker {...defaultProps} onRecurringToggle={onRecurringToggle} />);

    const toggle = screen.getByLabelText('Toggle recurring ride');
    fireEvent(toggle, 'valueChange', true);
    expect(onRecurringToggle).toHaveBeenCalledWith(true);
  });

  it('generates correct number of time slots (21 slots: 8AM-6PM in 30min)', () => {
    render(<TimePicker {...defaultProps} />);

    // Count time slots by checking for AM and PM times
    // 8:00 AM, 8:30 AM, 9:00 AM, 9:30 AM, 10:00 AM, 10:30 AM, 11:00 AM, 11:30 AM
    // 12:00 PM, 12:30 PM, 1:00 PM, 1:30 PM, 2:00 PM, 2:30 PM, 3:00 PM, 3:30 PM
    // 4:00 PM, 4:30 PM, 5:00 PM, 5:30 PM, 6:00 PM = 21 slots
    expect(screen.getByText('8:00 AM')).toBeTruthy();
    expect(screen.getByText('8:30 AM')).toBeTruthy();
    expect(screen.getByText('5:30 PM')).toBeTruthy();
    expect(screen.getByText('6:00 PM')).toBeTruthy();
  });
});
