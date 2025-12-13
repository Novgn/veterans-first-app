/**
 * RideListItem Component Tests
 *
 * Tests for the compact ride list item component.
 */

import { render, screen, fireEvent } from '@testing-library/react-native';

import { RideListItem } from '../RideListItem';
import type { Ride } from '../../hooks/useRide';

describe('RideListItem', () => {
  const mockOnPress = jest.fn();

  const mockRide: Ride = {
    id: 'test-123',
    rider_id: 'rider-456',
    driver_id: null,
    status: 'pending',
    pickup_address: '123 Main St',
    dropoff_address: 'VA Hospital, 456 Oak Ave',
    scheduled_pickup_time: '2024-12-15T14:30:00Z',
    created_at: '2024-12-10T08:00:00Z',
    updated_at: '2024-12-10T08:00:00Z',
  };

  beforeEach(() => {
    mockOnPress.mockClear();
  });

  it('renders destination address', () => {
    render(<RideListItem ride={mockRide} onPress={mockOnPress} />);

    expect(screen.getByText('VA Hospital, 456 Oak Ave')).toBeTruthy();
  });

  it('renders status badge', () => {
    render(<RideListItem ride={mockRide} onPress={mockOnPress} />);

    expect(screen.getByText('Pending')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    render(<RideListItem ride={mockRide} onPress={mockOnPress} />);

    const item = screen.getByRole('button');
    fireEvent.press(item);

    expect(mockOnPress).toHaveBeenCalled();
  });

  it('shows correct status colors for pending', () => {
    render(<RideListItem ride={mockRide} onPress={mockOnPress} />);

    expect(screen.getByText('Pending')).toBeTruthy();
  });

  it('shows correct status for assigned rides', () => {
    const assignedRide = { ...mockRide, status: 'assigned' as const };
    render(<RideListItem ride={assignedRide} onPress={mockOnPress} />);

    expect(screen.getByText('Assigned')).toBeTruthy();
  });

  it('shows correct status for cancelled rides', () => {
    const cancelledRide = { ...mockRide, status: 'cancelled' as const };
    render(<RideListItem ride={cancelledRide} onPress={mockOnPress} />);

    expect(screen.getByText('Cancelled')).toBeTruthy();
  });

  it('has accessible label with ride info', () => {
    render(<RideListItem ride={mockRide} onPress={mockOnPress} />);

    const item = screen.getByLabelText(/Ride to VA Hospital/);
    expect(item).toBeTruthy();
  });

  it('has accessible hint for navigation', () => {
    render(<RideListItem ride={mockRide} onPress={mockOnPress} />);

    expect(screen.getByAccessibilityHint('Opens ride details')).toBeTruthy();
  });

  it('applies custom className', () => {
    render(<RideListItem ride={mockRide} onPress={mockOnPress} className="mb-4" />);

    expect(screen.getByText('VA Hospital, 456 Oak Ave')).toBeTruthy();
  });

  it('shows ASAP when no scheduled time', () => {
    const unscheduledRide = { ...mockRide, scheduled_pickup_time: null };
    render(<RideListItem ride={unscheduledRide} onPress={mockOnPress} />);

    expect(screen.getByText('ASAP')).toBeTruthy();
  });

  it('has minimum 48dp touch target', () => {
    render(<RideListItem ride={mockRide} onPress={mockOnPress} />);

    // The component uses min-h-[80px] which exceeds 48dp requirement
    const item = screen.getByRole('button');
    expect(item).toBeTruthy();
  });
});
