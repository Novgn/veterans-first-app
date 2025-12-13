/**
 * EndDateSelector Component Tests
 */

import { render, screen, fireEvent } from '@testing-library/react-native';

import { EndDateSelector } from '../EndDateSelector';

describe('EndDateSelector', () => {
  const defaultProps = {
    endDate: null,
    onEndDateChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the title', () => {
    render(<EndDateSelector {...defaultProps} />);
    expect(screen.getByText('Until when?')).toBeTruthy();
  });

  it('renders Ongoing and End Date buttons', () => {
    render(<EndDateSelector {...defaultProps} />);
    expect(screen.getByText('Ongoing')).toBeTruthy();
    expect(screen.getByText('End Date')).toBeTruthy();
  });

  it('shows Ongoing as selected when endDate is null', () => {
    render(<EndDateSelector {...defaultProps} endDate={null} />);

    const ongoingButton = screen.getByLabelText('Set recurring ride as ongoing with no end date');
    expect(ongoingButton.props.accessibilityState).toEqual({ selected: true });
  });

  it('calls onEndDateChange with null when Ongoing is pressed', () => {
    const onEndDateChange = jest.fn();
    render(<EndDateSelector {...defaultProps} onEndDateChange={onEndDateChange} />);

    fireEvent.press(screen.getByText('Ongoing'));
    expect(onEndDateChange).toHaveBeenCalledWith(null);
  });

  it('opens date picker modal when End Date button is pressed', () => {
    render(<EndDateSelector {...defaultProps} />);

    fireEvent.press(screen.getByText('End Date'));
    expect(screen.getByText('Select End Date')).toBeTruthy();
  });

  it('shows End Date button as selected when endDate is set', () => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    render(<EndDateSelector {...defaultProps} endDate={tomorrow} />);

    // The button text should show the formatted date instead of "End Date"
    const endDateButton = screen.getByLabelText(/End date:/);
    expect(endDateButton.props.accessibilityState).toEqual({ selected: true });
  });

  it('closes date picker modal when close button is pressed', () => {
    render(<EndDateSelector {...defaultProps} />);

    // Open modal
    fireEvent.press(screen.getByText('End Date'));
    expect(screen.getByText('Select End Date')).toBeTruthy();

    // Close modal
    fireEvent.press(screen.getByLabelText('Close end date picker'));
    expect(screen.queryByText('Select End Date')).toBeNull();
  });

  it('has correct accessibility labels', () => {
    render(<EndDateSelector {...defaultProps} />);

    expect(screen.getByLabelText('Set recurring ride as ongoing with no end date')).toBeTruthy();
    expect(screen.getByLabelText('Select an end date for recurring ride')).toBeTruthy();
  });
});
