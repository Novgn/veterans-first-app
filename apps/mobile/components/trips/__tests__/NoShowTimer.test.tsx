/**
 * Tests for NoShowTimer (Story 3.10)
 */

import { fireEvent, render, screen } from '@testing-library/react-native';

import { NoShowTimer, formatMs } from '../NoShowTimer';

describe('formatMs', () => {
  it.each([
    [0, '0:00'],
    [59_000, '0:59'],
    [60_000, '1:00'],
    [125_000, '2:05'],
    [-5_000, '0:00'], // negative clamps to zero
  ])('formats %s ms as %s', (ms, expected) => {
    expect(formatMs(ms)).toBe(expected);
  });
});

describe('NoShowTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-04-17T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns null when there is no arrivedAt', () => {
    const { toJSON } = render(<NoShowTimer arrivedAt={null} onMarkNoShow={jest.fn()} />);
    expect(toJSON()).toBeNull();
  });

  it('disables the button before the wait window elapses', () => {
    // Arrived 1 minute ago, threshold 5 minutes → must wait 4 more minutes
    render(
      <NoShowTimer
        arrivedAt="2026-04-17T11:59:00Z"
        minWaitSeconds={300}
        onMarkNoShow={jest.fn()}
        testID="timer"
      />
    );
    const btn = screen.getByTestId('timer-button');
    expect(btn.props.accessibilityState).toMatchObject({ disabled: true });
    expect(screen.getByText(/Wait \d:\d{2} before marking no-show/)).toBeTruthy();
  });

  it('enables the button and fires onMarkNoShow after the wait elapses', () => {
    const onMark = jest.fn();
    render(
      <NoShowTimer
        arrivedAt="2026-04-17T11:50:00Z" // 10 minutes ago
        minWaitSeconds={300}
        onMarkNoShow={onMark}
        testID="timer"
      />
    );
    const btn = screen.getByTestId('timer-button');
    expect(btn.props.accessibilityState).toMatchObject({ disabled: false });

    fireEvent.press(btn);
    expect(onMark).toHaveBeenCalledTimes(1);
  });
});
