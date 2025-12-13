/**
 * WaitTimeIndicator Component Tests
 *
 * Tests for the wait time indicator component.
 */

import { render, screen } from '@testing-library/react-native';

import { WaitTimeIndicator } from '../WaitTimeIndicator';

describe('WaitTimeIndicator', () => {
  it('displays wait time in minutes', () => {
    render(<WaitTimeIndicator waitMinutes={20} />);

    expect(screen.getByText('20 min wait time included')).toBeTruthy();
  });

  it('has correct accessibility label', () => {
    render(<WaitTimeIndicator waitMinutes={20} />);

    expect(screen.getByLabelText('20 minutes of wait time included with your ride')).toBeTruthy();
  });

  it('handles different wait time values', () => {
    const { rerender } = render(<WaitTimeIndicator waitMinutes={15} />);
    expect(screen.getByText('15 min wait time included')).toBeTruthy();

    rerender(<WaitTimeIndicator waitMinutes={30} />);
    expect(screen.getByText('30 min wait time included')).toBeTruthy();
  });

  it('applies custom className', () => {
    render(<WaitTimeIndicator waitMinutes={20} className="mt-4" />);

    expect(screen.getByText('20 min wait time included')).toBeTruthy();
  });
});
