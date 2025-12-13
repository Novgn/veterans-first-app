/**
 * RecurringRideToggle, FrequencySelector, DaySelector Component Tests
 */

import { render, screen, fireEvent } from '@testing-library/react-native';

import { DaySelector } from '../DaySelector';
import { FrequencySelector } from '../FrequencySelector';
import { RecurringRideToggle } from '../RecurringRideToggle';

describe('FrequencySelector', () => {
  const defaultProps = {
    selectedFrequency: null as 'daily' | 'weekly' | 'custom' | null,
    onSelect: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all frequency options', () => {
    render(<FrequencySelector {...defaultProps} />);

    expect(screen.getByText('Daily')).toBeTruthy();
    expect(screen.getByText('Weekly')).toBeTruthy();
    expect(screen.getByText('Custom')).toBeTruthy();
  });

  it('renders the title', () => {
    render(<FrequencySelector {...defaultProps} />);
    expect(screen.getByText('How often?')).toBeTruthy();
  });

  it('calls onSelect when an option is pressed', () => {
    const onSelect = jest.fn();
    render(<FrequencySelector {...defaultProps} onSelect={onSelect} />);

    fireEvent.press(screen.getByText('Daily'));
    expect(onSelect).toHaveBeenCalledWith('daily');
  });

  it('shows selected state correctly', () => {
    render(<FrequencySelector {...defaultProps} selectedFrequency="weekly" />);

    const weeklyButton = screen.getByLabelText('Weekly: Once a week');
    expect(weeklyButton.props.accessibilityState).toEqual({ selected: true });
  });
});

describe('DaySelector', () => {
  const defaultProps = {
    selectedDays: [] as string[],
    onSelect: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all days', () => {
    render(<DaySelector {...defaultProps} />);

    expect(screen.getByText('Mon')).toBeTruthy();
    expect(screen.getByText('Tue')).toBeTruthy();
    expect(screen.getByText('Wed')).toBeTruthy();
    expect(screen.getByText('Thu')).toBeTruthy();
    expect(screen.getByText('Fri')).toBeTruthy();
    expect(screen.getByText('Sat')).toBeTruthy();
    expect(screen.getByText('Sun')).toBeTruthy();
  });

  it('renders the title', () => {
    render(<DaySelector {...defaultProps} />);
    expect(screen.getByText('Which days?')).toBeTruthy();
  });

  it('calls onSelect to add a day when pressed', () => {
    const onSelect = jest.fn();
    render(<DaySelector {...defaultProps} onSelect={onSelect} />);

    fireEvent.press(screen.getByText('Mon'));
    expect(onSelect).toHaveBeenCalledWith(['mon']);
  });

  it('calls onSelect to remove a day when already selected', () => {
    const onSelect = jest.fn();
    render(<DaySelector {...defaultProps} selectedDays={['mon', 'wed']} onSelect={onSelect} />);

    fireEvent.press(screen.getByText('Mon'));
    expect(onSelect).toHaveBeenCalledWith(['wed']);
  });

  it('shows selected state correctly', () => {
    render(<DaySelector {...defaultProps} selectedDays={['mon', 'fri']} />);

    // Role queries should use the checkbox role
    const monButton = screen.getByLabelText('Monday, selected');
    const friButton = screen.getByLabelText('Friday, selected');

    expect(monButton.props.accessibilityState).toEqual({ checked: true });
    expect(friButton.props.accessibilityState).toEqual({ checked: true });
  });
});

describe('RecurringRideToggle', () => {
  const defaultProps = {
    isRecurring: false,
    recurringFrequency: null as 'daily' | 'weekly' | 'custom' | null,
    recurringDays: [] as string[],
    recurringEndDate: null as string | null,
    onToggle: jest.fn(),
    onFrequencyChange: jest.fn(),
    onDaysChange: jest.fn(),
    onEndDateChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the toggle label', () => {
    render(<RecurringRideToggle {...defaultProps} />);
    expect(screen.getByText('Make this a recurring ride')).toBeTruthy();
  });

  it('renders the switch', () => {
    render(<RecurringRideToggle {...defaultProps} />);
    expect(screen.getByLabelText('Toggle recurring ride')).toBeTruthy();
  });

  it('does not show frequency options when disabled', () => {
    render(<RecurringRideToggle {...defaultProps} isRecurring={false} />);
    expect(screen.queryByText('How often?')).toBeNull();
  });

  it('shows frequency options when enabled', () => {
    render(<RecurringRideToggle {...defaultProps} isRecurring />);
    expect(screen.getByText('How often?')).toBeTruthy();
  });

  it('shows day selector when custom frequency is selected', () => {
    render(<RecurringRideToggle {...defaultProps} isRecurring recurringFrequency="custom" />);
    expect(screen.getByText('Which days?')).toBeTruthy();
  });

  it('does not show day selector for non-custom frequencies', () => {
    render(<RecurringRideToggle {...defaultProps} isRecurring recurringFrequency="daily" />);
    expect(screen.queryByText('Which days?')).toBeNull();
  });

  it('calls onToggle when switch is toggled', () => {
    const onToggle = jest.fn();
    render(<RecurringRideToggle {...defaultProps} onToggle={onToggle} />);

    const switchEl = screen.getByLabelText('Toggle recurring ride');
    fireEvent(switchEl, 'valueChange', true);
    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it('shows end date selector when recurring is enabled', () => {
    render(<RecurringRideToggle {...defaultProps} isRecurring />);
    expect(screen.getByText('Until when?')).toBeTruthy();
  });

  it('shows Ongoing option in end date selector', () => {
    render(<RecurringRideToggle {...defaultProps} isRecurring />);
    expect(screen.getByText('Ongoing')).toBeTruthy();
  });
});
