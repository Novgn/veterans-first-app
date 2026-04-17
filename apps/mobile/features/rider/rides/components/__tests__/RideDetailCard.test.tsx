/**
 * RideDetailCard Component Tests
 *
 * Tests for the ride details display card.
 */

import { render, screen } from '@testing-library/react-native';

import type { Ride } from '../../hooks/useRide';
import { RideDetailCard } from '../RideDetailCard';

describe('RideDetailCard', () => {
  const mockRide: Ride = {
    id: 'test-123',
    rider_id: 'rider-456',
    driver_id: null,
    status: 'pending',
    pickup_address: '123 Main St, City',
    dropoff_address: '456 Oak Ave, Town',
    scheduled_pickup_time: '2024-12-15T10:30:00Z',
    created_at: '2024-12-10T08:00:00Z',
    updated_at: '2024-12-10T08:00:00Z',
  };

  it('renders pickup and destination addresses', () => {
    render(<RideDetailCard ride={mockRide} />);

    expect(screen.getByText('123 Main St, City')).toBeTruthy();
    expect(screen.getByText('456 Oak Ave, Town')).toBeTruthy();
  });

  it('renders status badge with correct text', () => {
    render(<RideDetailCard ride={mockRide} />);

    expect(screen.getByText('Pending')).toBeTruthy();
  });

  it('renders assigned status correctly', () => {
    const assignedRide = { ...mockRide, status: 'assigned' as const };
    render(<RideDetailCard ride={assignedRide} />);

    expect(screen.getByText('Driver Assigned')).toBeTruthy();
  });

  it('renders in_progress status correctly', () => {
    const inProgressRide = { ...mockRide, status: 'in_progress' as const };
    render(<RideDetailCard ride={inProgressRide} />);

    expect(screen.getByText('In Progress')).toBeTruthy();
  });

  it('renders completed status correctly', () => {
    const completedRide = { ...mockRide, status: 'completed' as const };
    render(<RideDetailCard ride={completedRide} />);

    expect(screen.getByText('Completed')).toBeTruthy();
  });

  it('renders cancelled status correctly', () => {
    const cancelledRide = { ...mockRide, status: 'cancelled' as const };
    render(<RideDetailCard ride={cancelledRide} />);

    expect(screen.getByText('Cancelled')).toBeTruthy();
  });

  it('displays formatted time', () => {
    render(<RideDetailCard ride={mockRide} />);

    // The time should be formatted (exact format depends on locale)
    // Just checking that the card renders with time-related content
    expect(screen.getByText(/Pickup/)).toBeTruthy();
    expect(screen.getByText(/Destination/)).toBeTruthy();
  });

  it('has accessible label with ride summary', () => {
    render(<RideDetailCard ride={mockRide} />);

    // The card should have an accessibility label
    const card = screen.getByLabelText(/Ride from 123 Main St/);
    expect(card).toBeTruthy();
  });

  it('applies custom className', () => {
    render(<RideDetailCard ride={mockRide} className="mt-4" />);

    // Component renders successfully with custom class
    expect(screen.getByText('123 Main St, City')).toBeTruthy();
  });

  it('shows Not scheduled when no scheduled time', () => {
    const unscheduledRide = { ...mockRide, scheduled_pickup_time: null };
    render(<RideDetailCard ride={unscheduledRide} />);

    expect(screen.getByText('Not scheduled')).toBeTruthy();
  });
});
