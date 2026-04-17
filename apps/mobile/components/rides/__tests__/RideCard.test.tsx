/**
 * RideCard Component Tests
 *
 * Tests the enhanced ride card component that displays:
 * - Date, time, pickup, and destination
 * - StatusTimeline visualization
 * - Driver info when assigned
 * - Full accessibility support
 *
 * Story 2.8: Implement My Rides Screen with Upcoming Rides
 */

import { render, screen, fireEvent } from '@testing-library/react-native';
import React from 'react';

import { RideCard } from '../RideCard';
import type { RideWithDriver } from '../RideCard';

// Mock ride data
const mockRide: RideWithDriver = {
  id: 'ride-123',
  rider_id: 'rider-456',
  driver_id: null,
  status: 'pending',
  pickup_address: '123 Main Street',
  dropoff_address: '456 Oak Avenue',
  scheduled_pickup_time: '2025-12-15T10:30:00Z',
  created_at: '2025-12-13T08:00:00Z',
  updated_at: '2025-12-13T08:00:00Z',
};

const mockRideWithDriver: RideWithDriver = {
  ...mockRide,
  driver_id: 'driver-789',
  status: 'assigned',
  driver: {
    id: 'driver-789',
    firstName: 'Dave',
    profilePhotoUrl: 'https://example.com/dave.jpg',
    vehicleMake: 'Toyota',
    vehicleModel: 'Camry',
    vehicleColor: 'Silver',
  },
  driverRideCount: 23,
};

describe('RideCard', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders pickup and destination addresses', () => {
      render(<RideCard ride={mockRide} onPress={mockOnPress} />);

      expect(screen.getByText('123 Main Street')).toBeTruthy();
      expect(screen.getByText('456 Oak Avenue')).toBeTruthy();
    });

    it('renders date and time', () => {
      render(<RideCard ride={mockRide} onPress={mockOnPress} />);

      // Should show formatted date and time (e.g., "Mon, Dec 15 at 10:30 AM")
      // Use getAllByText since "at" appears in multiple places, then check we have date/time
      const dateTimeElements = screen.getAllByText(/at \d{1,2}:\d{2}/);
      expect(dateTimeElements.length).toBeGreaterThan(0);
    });

    it('renders StatusTimeline for active statuses', () => {
      render(<RideCard ride={mockRide} onPress={mockOnPress} />);

      // StatusTimeline shows status labels
      expect(screen.getByText('Booked')).toBeTruthy();
      expect(screen.getByText('Confirmed')).toBeTruthy();
      expect(screen.getByText('Assigned')).toBeTruthy();
    });

    it('displays ASAP for rides without scheduled time', () => {
      const asapRide = { ...mockRide, scheduled_pickup_time: null };
      render(<RideCard ride={asapRide} onPress={mockOnPress} />);

      expect(screen.getByText(/ASAP/)).toBeTruthy();
    });
  });

  describe('driver info', () => {
    it('does not show driver section when no driver assigned', () => {
      render(<RideCard ride={mockRide} onPress={mockOnPress} />);

      expect(screen.queryByText('Dave')).toBeNull();
    });

    it('shows driver name when driver is assigned', () => {
      render(<RideCard ride={mockRideWithDriver} onPress={mockOnPress} />);

      expect(screen.getByText('Dave')).toBeTruthy();
    });

    it('shows vehicle info when driver is assigned', () => {
      render(<RideCard ride={mockRideWithDriver} onPress={mockOnPress} />);

      expect(screen.getByText('Silver Toyota Camry')).toBeTruthy();
    });

    it('shows ride count when available', () => {
      render(<RideCard ride={mockRideWithDriver} onPress={mockOnPress} />);

      expect(screen.getByText('Driven you 23 times')).toBeTruthy();
    });

    it('shows singular "time" for count of 1', () => {
      const rideWithOneTrip = { ...mockRideWithDriver, driverRideCount: 1 };
      render(<RideCard ride={rideWithOneTrip} onPress={mockOnPress} />);

      expect(screen.getByText('Driven you 1 time')).toBeTruthy();
    });
  });

  describe('interactions', () => {
    it('calls onPress when card is pressed', () => {
      render(<RideCard ride={mockRide} onPress={mockOnPress} />);

      const card = screen.getByLabelText(/Ride to 456 Oak Avenue/);
      fireEvent.press(card);

      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility', () => {
    it('has button accessibility role', () => {
      render(<RideCard ride={mockRide} onPress={mockOnPress} />);

      const card = screen.getByLabelText(/Ride to 456 Oak Avenue/);
      expect(card.props.accessibilityRole).toBe('button');
    });

    it('has accessibility label with destination', () => {
      render(<RideCard ride={mockRide} onPress={mockOnPress} />);

      const card = screen.getByLabelText(/Ride to 456 Oak Avenue/);
      expect(card).toBeTruthy();
    });

    it('includes driver info in accessibility label when assigned', () => {
      render(<RideCard ride={mockRideWithDriver} onPress={mockOnPress} />);

      const card = screen.getByLabelText(/Driver: Dave/);
      expect(card).toBeTruthy();
    });

    it('includes "No driver assigned" in label when not assigned', () => {
      render(<RideCard ride={mockRide} onPress={mockOnPress} />);

      const card = screen.getByLabelText(/No driver assigned yet/);
      expect(card).toBeTruthy();
    });

    it('has accessibility hint', () => {
      render(<RideCard ride={mockRide} onPress={mockOnPress} />);

      const card = screen.getByLabelText(/Ride to 456 Oak Avenue/);
      expect(card.props.accessibilityHint).toBe('Opens ride details');
    });
  });

  describe('className prop', () => {
    it('applies additional className', () => {
      render(<RideCard ride={mockRide} onPress={mockOnPress} className="mb-4" />);

      const card = screen.getByLabelText(/Ride to 456 Oak Avenue/);
      expect(card.props.className).toContain('mb-4');
    });
  });

  describe('status-specific rendering', () => {
    it('does not show StatusTimeline for completed rides', () => {
      const completedRide = { ...mockRide, status: 'completed' as const };
      render(<RideCard ride={completedRide} onPress={mockOnPress} />);

      // StatusTimeline returns null for completed
      expect(screen.queryByText('Booked')).toBeNull();
    });

    it('does not show StatusTimeline for cancelled rides', () => {
      const cancelledRide = { ...mockRide, status: 'cancelled' as const };
      render(<RideCard ride={cancelledRide} onPress={mockOnPress} />);

      // StatusTimeline returns null for cancelled
      expect(screen.queryByText('Booked')).toBeNull();
    });
  });
});
