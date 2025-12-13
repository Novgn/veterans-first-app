/**
 * BookingSuccessScreen Component Tests
 *
 * Tests for the booking success celebration screen.
 */

import { render, screen, fireEvent } from '@testing-library/react-native';

import { BookingSuccessScreen } from '../BookingSuccessScreen';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
}));

// Mock the booking store
const mockResetBooking = jest.fn();
jest.mock('../../../../stores/bookingStore', () => ({
  useBookingStore: () => ({
    lastBookingId: 'abc12345-6789-0123-4567-890abcdef123',
    dropoffDestination: {
      id: '1',
      name: 'VA Hospital',
      address: '123 Healthcare Dr',
    },
    selectedDate: '2024-01-15',
    selectedTime: '10:30 AM',
    resetBooking: mockResetBooking,
  }),
}));

// Mock Supabase (used by UndoButton)
jest.mock('../../../../lib/supabase', () => ({
  useSupabase: () => ({
    from: jest.fn().mockReturnValue({
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      }),
    }),
  }),
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

describe('BookingSuccessScreen', () => {
  beforeEach(() => {
    mockResetBooking.mockClear();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15T10:00:00'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('displays "Your ride is booked!" message', () => {
    render(<BookingSuccessScreen />);

    expect(screen.getByText('Your ride is booked!')).toBeTruthy();
  });

  it('displays confirmation number', () => {
    render(<BookingSuccessScreen />);

    expect(screen.getByText('Confirmation #ABC12345')).toBeTruthy();
  });

  it('displays ride summary with destination, date, and time', () => {
    render(<BookingSuccessScreen />);

    expect(screen.getByText('VA Hospital on Today at 10:30 AM')).toBeTruthy();
  });

  it('displays undo button', () => {
    render(<BookingSuccessScreen />);

    expect(screen.getByText(/Undo/)).toBeTruthy();
  });

  it('displays "Add to Calendar" button', () => {
    render(<BookingSuccessScreen />);

    expect(screen.getByText('Add to Calendar')).toBeTruthy();
  });

  it('displays Done button', () => {
    render(<BookingSuccessScreen />);

    expect(screen.getByText('Done')).toBeTruthy();
  });

  it('calls resetBooking and onDone when Done is pressed', () => {
    const mockOnDone = jest.fn();
    render(<BookingSuccessScreen onDone={mockOnDone} />);

    const doneButton = screen.getByText('Done');
    fireEvent.press(doneButton);

    expect(mockResetBooking).toHaveBeenCalled();
    expect(mockOnDone).toHaveBeenCalled();
  });

  it('has correct accessibility labels', () => {
    render(<BookingSuccessScreen />);

    expect(screen.getByLabelText('Success checkmark')).toBeTruthy();
    expect(screen.getByLabelText('Done, return to home')).toBeTruthy();
    expect(screen.getByLabelText('Add ride to calendar')).toBeTruthy();
  });

  it('has header accessibility role for main message', () => {
    render(<BookingSuccessScreen />);

    expect(screen.getByRole('header')).toBeTruthy();
  });
});
