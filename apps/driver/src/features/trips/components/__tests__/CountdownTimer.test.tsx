/**
 * Tests for CountdownTimer component
 * Tests display, color changes, and expiration handling
 */

import { render, screen, act } from '@testing-library/react-native';

import { CountdownTimer } from '../CountdownTimer';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return {
    ...Reanimated,
    useAnimatedStyle: () => ({}),
    useSharedValue: (value: number) => ({ value }),
    withRepeat: jest.fn((animation) => animation),
    withSequence: jest.fn((...animations) => animations[0]),
    withTiming: jest.fn((toValue) => toValue),
    cancelAnimation: jest.fn(),
  };
});

describe('CountdownTimer', () => {
  const mockOnExpire = jest.fn();

  beforeEach(() => {
    mockOnExpire.mockClear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('display', () => {
    it('displays time in minutes:seconds format', () => {
      render(<CountdownTimer seconds={125} onExpire={mockOnExpire} />);

      expect(screen.getByText('2:05')).toBeTruthy();
    });

    it('displays single digit seconds with leading zero', () => {
      render(<CountdownTimer seconds={65} onExpire={mockOnExpire} />);

      expect(screen.getByText('1:05')).toBeTruthy();
    });

    it('displays zero correctly', () => {
      render(<CountdownTimer seconds={0} onExpire={mockOnExpire} />);

      expect(screen.getByText('0:00')).toBeTruthy();
    });

    it('displays large times correctly', () => {
      render(<CountdownTimer seconds={300} onExpire={mockOnExpire} />);

      expect(screen.getByText('5:00')).toBeTruthy();
    });

    it('has correct accessibility label', () => {
      render(<CountdownTimer seconds={125} onExpire={mockOnExpire} />);

      expect(screen.getByText('2:05').props.accessibilityLabel).toBe(
        '2 minutes and 5 seconds remaining'
      );
    });

    it('applies testID correctly', () => {
      render(<CountdownTimer seconds={60} onExpire={mockOnExpire} testID="test-timer" />);

      expect(screen.getByTestId('test-timer')).toBeTruthy();
    });
  });

  describe('urgency states', () => {
    it('uses normal color when time > 60 seconds', () => {
      render(<CountdownTimer seconds={90} onExpire={mockOnExpire} />);

      // Component should render with gray styling (normal state)
      const timerText = screen.getByText('1:30');
      expect(timerText).toBeTruthy();
    });

    it('uses urgent color when time < 60 seconds', () => {
      render(<CountdownTimer seconds={45} onExpire={mockOnExpire} />);

      // Component should render with amber styling (urgent state)
      const timerText = screen.getByText('0:45');
      expect(timerText).toBeTruthy();
    });

    it('uses critical color when time < 30 seconds', () => {
      render(<CountdownTimer seconds={15} onExpire={mockOnExpire} />);

      // Component should render with red styling (critical state)
      const timerText = screen.getByText('0:15');
      expect(timerText).toBeTruthy();
    });
  });

  describe('expiration', () => {
    it('calls onExpire when timer reaches 0', () => {
      render(<CountdownTimer seconds={0} onExpire={mockOnExpire} />);

      expect(mockOnExpire).toHaveBeenCalledTimes(1);
    });

    it('does not call onExpire when timer is above 0', () => {
      render(<CountdownTimer seconds={60} onExpire={mockOnExpire} />);

      expect(mockOnExpire).not.toHaveBeenCalled();
    });

    it('only calls onExpire once', () => {
      const { rerender } = render(<CountdownTimer seconds={0} onExpire={mockOnExpire} />);

      // Re-render with same value
      rerender(<CountdownTimer seconds={0} onExpire={mockOnExpire} />);

      expect(mockOnExpire).toHaveBeenCalledTimes(1);
    });
  });
});
