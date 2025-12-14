/**
 * StatusTimeline Component Tests
 *
 * Tests the visual progression component that shows ride status:
 * Booked → Confirmed → Assigned → En Route → Arrived
 *
 * Story 2.8: Implement My Rides Screen with Upcoming Rides
 */

import { render, screen } from '@testing-library/react-native';
import React from 'react';

import { StatusTimeline } from '../StatusTimeline';

describe('StatusTimeline', () => {
  describe('rendering', () => {
    it('renders all 5 status steps', () => {
      render(<StatusTimeline currentStatus="pending" />);

      expect(screen.getByText('Booked')).toBeTruthy();
      expect(screen.getByText('Confirmed')).toBeTruthy();
      expect(screen.getByText('Assigned')).toBeTruthy();
      expect(screen.getByText('En Route')).toBeTruthy();
      expect(screen.getByText('Arrived')).toBeTruthy();
    });

    it('returns null for completed status', () => {
      const { toJSON } = render(<StatusTimeline currentStatus="completed" />);
      expect(toJSON()).toBeNull();
    });

    it('returns null for cancelled status', () => {
      const { toJSON } = render(<StatusTimeline currentStatus="cancelled" />);
      expect(toJSON()).toBeNull();
    });
  });

  describe('step highlighting', () => {
    it('highlights Booked step when status is pending', () => {
      render(<StatusTimeline currentStatus="pending" />);

      // The current step should have semibold styling (font-semibold)
      const bookedText = screen.getByText('Booked');
      expect(bookedText.props.className).toContain('font-semibold');
    });

    it('highlights Confirmed step when status is confirmed', () => {
      render(<StatusTimeline currentStatus="confirmed" />);

      const confirmedText = screen.getByText('Confirmed');
      expect(confirmedText.props.className).toContain('font-semibold');
    });

    it('highlights Assigned step when status is assigned', () => {
      render(<StatusTimeline currentStatus="assigned" />);

      const assignedText = screen.getByText('Assigned');
      expect(assignedText.props.className).toContain('font-semibold');
    });

    it('highlights En Route step when status is in_progress', () => {
      render(<StatusTimeline currentStatus="in_progress" />);

      const enRouteText = screen.getByText('En Route');
      expect(enRouteText.props.className).toContain('font-semibold');
    });

    it('highlights Arrived step when status is arrived', () => {
      render(<StatusTimeline currentStatus="arrived" />);

      const arrivedText = screen.getByText('Arrived');
      expect(arrivedText.props.className).toContain('font-semibold');
    });
  });

  describe('accessibility', () => {
    it('has progressbar accessibility role', () => {
      render(<StatusTimeline currentStatus="pending" />);

      // Find the container by accessibility label (progressbar role is set on View)
      const timeline = screen.getByLabelText('Ride progress: Booked');
      expect(timeline.props.accessibilityRole).toBe('progressbar');
    });

    it('has accessibility label with current status', () => {
      render(<StatusTimeline currentStatus="assigned" />);

      const timeline = screen.getByLabelText('Ride progress: Assigned');
      expect(timeline).toBeTruthy();
    });
  });

  describe('className prop', () => {
    it('applies additional className', () => {
      render(<StatusTimeline currentStatus="pending" className="mt-4" />);

      const timeline = screen.getByLabelText('Ride progress: Booked');
      expect(timeline.props.className).toContain('mt-4');
    });
  });
});
