/**
 * RideSummaryCard Component Tests
 *
 * Tests for the ride summary card component.
 */

import { render, screen } from '@testing-library/react-native';

import { RideSummaryCard } from '../RideSummaryCard';

const mockDropoff = {
  id: '1',
  name: 'VA Hospital',
  address: '123 Healthcare Dr, San Diego, CA',
};

const mockPickup = {
  id: '2',
  name: 'Home',
  address: '456 Main St, San Diego, CA',
};

describe('RideSummaryCard', () => {
  beforeEach(() => {
    // Mock the current date for consistent testing
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15T10:00:00'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('displays pickup and destination locations', () => {
    render(
      <RideSummaryCard
        pickup={mockPickup}
        dropoff={mockDropoff}
        date="2024-01-15"
        time="10:00 AM"
      />
    );

    expect(screen.getByText('From')).toBeTruthy();
    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.getByText('To')).toBeTruthy();
    expect(screen.getByText('VA Hospital')).toBeTruthy();
  });

  it('shows "Home" when pickup is null', () => {
    render(
      <RideSummaryCard pickup={null} dropoff={mockDropoff} date="2024-01-15" time="10:00 AM" />
    );

    expect(screen.getByText('Home')).toBeTruthy();
  });

  it('displays "Today" for current date', () => {
    render(
      <RideSummaryCard pickup={null} dropoff={mockDropoff} date="2024-01-15" time="10:00 AM" />
    );

    expect(screen.getByText('Today')).toBeTruthy();
  });

  it('displays "Tomorrow" for next day', () => {
    render(
      <RideSummaryCard pickup={null} dropoff={mockDropoff} date="2024-01-16" time="10:00 AM" />
    );

    expect(screen.getByText('Tomorrow')).toBeTruthy();
  });

  it('displays selected time', () => {
    render(
      <RideSummaryCard pickup={null} dropoff={mockDropoff} date="2024-01-15" time="10:30 AM" />
    );

    expect(screen.getByText('10:30 AM')).toBeTruthy();
  });

  it('displays "ASAP" when time is null', () => {
    render(<RideSummaryCard pickup={null} dropoff={mockDropoff} date="2024-01-15" time={null} />);

    expect(screen.getByText('ASAP')).toBeTruthy();
  });

  it('shows recurring indicator when isRecurring is true', () => {
    render(
      <RideSummaryCard
        pickup={null}
        dropoff={mockDropoff}
        date="2024-01-15"
        time="10:00 AM"
        isRecurring
        recurringDescription="Every weekday"
      />
    );

    expect(screen.getByText('Every weekday')).toBeTruthy();
  });

  it('hides recurring indicator when isRecurring is false', () => {
    render(
      <RideSummaryCard
        pickup={null}
        dropoff={mockDropoff}
        date="2024-01-15"
        time="10:00 AM"
        isRecurring={false}
      />
    );

    expect(screen.queryByText('Recurring ride')).toBeNull();
  });

  it('shows default recurring text when no description provided', () => {
    render(
      <RideSummaryCard
        pickup={null}
        dropoff={mockDropoff}
        date="2024-01-15"
        time="10:00 AM"
        isRecurring
      />
    );

    expect(screen.getByText('Recurring ride')).toBeTruthy();
  });

  it('has correct accessibility label', () => {
    render(
      <RideSummaryCard pickup={null} dropoff={mockDropoff} date="2024-01-15" time="10:00 AM" />
    );

    expect(
      screen.getByLabelText(/Ride summary: From Home to VA Hospital on Today at 10:00 AM/)
    ).toBeTruthy();
  });
});
