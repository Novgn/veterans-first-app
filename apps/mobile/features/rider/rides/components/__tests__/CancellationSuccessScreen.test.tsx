/**
 * CancellationSuccessScreen Component Tests
 *
 * Tests for the cancellation success screen with undo functionality.
 */

import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { Alert } from 'react-native';

import { CancellationSuccessScreen } from '../CancellationSuccessScreen';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
}));

// Mock Supabase
const mockMutateAsync = jest.fn().mockResolvedValue({});
jest.mock('../../hooks/useUndoCancellation', () => ({
  useUndoCancellation: () => ({
    mutateAsync: mockMutateAsync,
  }),
}));

// Mock useSupabase (required by component)
jest.mock('../../../lib/supabase', () => ({
  useSupabase: () => ({}),
}));

// Spy on Alert
jest.spyOn(Alert, 'alert');

describe('CancellationSuccessScreen', () => {
  const defaultProps = {
    rideId: 'test-123',
    destinationName: 'VA Hospital',
    previousStatus: 'pending',
  };

  beforeEach(() => {
    jest.useFakeTimers();
    mockMutateAsync.mockClear();
    (Alert.alert as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders cancelled confirmation message', () => {
    render(<CancellationSuccessScreen {...defaultProps} />);

    expect(screen.getByText('Ride Cancelled')).toBeTruthy();
    expect(screen.getByText(/Your ride to VA Hospital has been cancelled/)).toBeTruthy();
  });

  it('shows undo button with 60 second countdown', () => {
    render(<CancellationSuccessScreen {...defaultProps} />);

    expect(screen.getByText('Undo (60s)')).toBeTruthy();
  });

  it('counts down undo timer', () => {
    render(<CancellationSuccessScreen {...defaultProps} />);

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(screen.getByText('Undo (55s)')).toBeTruthy();
  });

  it('hides undo button after 60 seconds', () => {
    render(<CancellationSuccessScreen {...defaultProps} />);

    act(() => {
      jest.advanceTimersByTime(60000);
    });

    expect(screen.queryByText(/Undo/)).toBeNull();
    expect(screen.getByText(/undo window has expired/)).toBeTruthy();
  });

  it('shows Done button', () => {
    render(<CancellationSuccessScreen {...defaultProps} />);

    expect(screen.getByText('Done')).toBeTruthy();
  });

  it('has accessible Done button', () => {
    render(<CancellationSuccessScreen {...defaultProps} />);

    expect(screen.getByLabelText('Done, return to My Rides')).toBeTruthy();
  });

  it('has accessible undo button with countdown', () => {
    render(<CancellationSuccessScreen {...defaultProps} />);

    expect(screen.getByLabelText(/Undo cancellation. 60 seconds remaining/)).toBeTruthy();
  });

  it('renders title as header', () => {
    render(<CancellationSuccessScreen {...defaultProps} />);

    expect(screen.getByRole('header')).toBeTruthy();
  });
});
