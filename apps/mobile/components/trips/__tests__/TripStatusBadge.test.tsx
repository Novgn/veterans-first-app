/**
 * Tests for TripStatusBadge (Story 3.4)
 */

import { render, screen } from '@testing-library/react-native';

import { TripStatusBadge } from '../TripStatusBadge';

describe('TripStatusBadge', () => {
  it('renders the correct label for each status', () => {
    const statuses = [
      { status: 'assigned', label: 'Assigned' },
      { status: 'en_route', label: 'En Route' },
      { status: 'arrived', label: 'Arrived' },
      { status: 'in_progress', label: 'In Progress' },
      { status: 'completed', label: 'Completed' },
      { status: 'cancelled', label: 'Cancelled' },
    ] as const;

    for (const { status, label } of statuses) {
      const { unmount } = render(<TripStatusBadge status={status} testID={`badge-${status}`} />);
      expect(screen.getByText(label)).toBeTruthy();
      unmount();
    }
  });

  it('exposes an accessible status label', () => {
    render(<TripStatusBadge status="en_route" testID="badge-en-route" />);
    expect(screen.getByTestId('badge-en-route').props.accessibilityLabel).toBe('Status: En Route');
  });

  it('supports different sizes', () => {
    render(<TripStatusBadge status="arrived" size="lg" testID="badge-large" />);
    expect(screen.getByTestId('badge-large')).toBeTruthy();
  });
});
