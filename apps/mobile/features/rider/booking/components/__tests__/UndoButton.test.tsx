/**
 * UndoButton Component Tests
 *
 * Tests for the 60-second undo button component.
 */

import { render, screen, fireEvent, act, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

import { UndoButton } from '../UndoButton';

// Mock Supabase
const mockUpdate = jest.fn().mockReturnValue({
  eq: jest.fn().mockResolvedValue({ error: null }),
});
const mockSupabase = {
  from: jest.fn().mockReturnValue({
    update: mockUpdate,
  }),
};
jest.mock('../../../lib/supabase', () => ({
  useSupabase: () => mockSupabase,
}));

// Spy on Alert
jest.spyOn(Alert, 'alert');

describe('UndoButton', () => {
  const mockOnUndoComplete = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
    mockOnUndoComplete.mockClear();
    mockSupabase.from.mockClear();
    mockUpdate.mockClear();
    (Alert.alert as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders with initial 60 second countdown', () => {
    render(<UndoButton rideId="test-123" onUndoComplete={mockOnUndoComplete} />);

    expect(screen.getByText('Undo (60s)')).toBeTruthy();
  });

  it('counts down every second', () => {
    render(<UndoButton rideId="test-123" onUndoComplete={mockOnUndoComplete} />);

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByText('Undo (59s)')).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(screen.getByText('Undo (54s)')).toBeTruthy();
  });

  it('disappears when countdown reaches 0', () => {
    render(<UndoButton rideId="test-123" onUndoComplete={mockOnUndoComplete} />);

    act(() => {
      jest.advanceTimersByTime(60000);
    });

    expect(screen.queryByText(/Undo/)).toBeNull();
  });

  it('cancels ride in database when pressed', async () => {
    render(<UndoButton rideId="test-123" onUndoComplete={mockOnUndoComplete} />);

    const button = screen.getByRole('button');
    fireEvent.press(button);

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('rides');
      expect(mockUpdate).toHaveBeenCalledWith({ status: 'cancelled' });
    });
  });

  it('calls onUndoComplete after successful cancellation', async () => {
    render(<UndoButton rideId="test-123" onUndoComplete={mockOnUndoComplete} />);

    const button = screen.getByRole('button');
    fireEvent.press(button);

    await waitFor(() => {
      expect(mockOnUndoComplete).toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith(
        'Booking Cancelled',
        'Your ride has been cancelled successfully.'
      );
    });
  });

  it('has correct accessibility label with countdown', () => {
    render(<UndoButton rideId="test-123" onUndoComplete={mockOnUndoComplete} />);

    expect(screen.getByLabelText('Undo booking. 60 seconds remaining')).toBeTruthy();
  });

  it('applies custom className', () => {
    render(<UndoButton rideId="test-123" onUndoComplete={mockOnUndoComplete} className="mt-6" />);

    expect(screen.getByText('Undo (60s)')).toBeTruthy();
  });
});
