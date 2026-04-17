/**
 * Tests for TripCard component
 */

import { render, screen } from '@testing-library/react-native';

import type { DriverTrip } from '../../hooks/useDriverTrips';
import { TripCard } from '../TripCard';

// Mock expo-router
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  Link: ({
    children,
    href,
    asChild,
  }: {
    children: React.ReactNode;
    href: string;
    asChild?: boolean;
  }) => {
    // Render children directly for testing, wrap in pressable behavior simulation
    return children;
  },
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockTrip: DriverTrip = {
  id: 'trip-1',
  status: 'assigned',
  pickupAddress: '123 Main Street, Springfield, IL 62701',
  dropoffAddress: '456 Oak Avenue, Springfield, IL 62702',
  scheduledPickupTime: new Date().toISOString(),
  rider: {
    id: 'rider-1',
    firstName: 'Margaret',
    lastName: 'Johnson',
    phone: '+1234567890',
    profilePhotoUrl: null,
  },
  riderPreferences: {
    mobilityAid: 'walker',
    needsDoorAssistance: true,
    needsPackageAssistance: false,
    extraVehicleSpace: false,
    specialEquipmentNotes: 'Please allow extra time for boarding',
    comfortTemperature: 'warm',
    conversationPreference: 'some',
    musicPreference: 'soft',
    otherNotes: null,
  },
};

describe('TripCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders pickup time correctly', () => {
    render(<TripCard trip={mockTrip} testID="trip-card" />);

    // Today's date should show "Today" prefix
    expect(screen.getByText(/Today/)).toBeTruthy();
  });

  it('displays rider name', () => {
    render(<TripCard trip={mockTrip} testID="trip-card" />);

    expect(screen.getByText('Margaret Johnson')).toBeTruthy();
  });

  it('displays rider initials when no photo', () => {
    render(<TripCard trip={mockTrip} testID="trip-card" />);

    expect(screen.getByText('MJ')).toBeTruthy();
  });

  it('displays pickup and dropoff addresses', () => {
    render(<TripCard trip={mockTrip} testID="trip-card" />);

    expect(screen.getByText(/123 Main Street/)).toBeTruthy();
    expect(screen.getByText(/456 Oak Avenue/)).toBeTruthy();
  });

  it('displays accessibility badges when preferences exist', () => {
    render(<TripCard trip={mockTrip} testID="trip-card" />);

    expect(screen.getByLabelText('Needs walker')).toBeTruthy();
    expect(screen.getByLabelText('Needs door assistance')).toBeTruthy();
  });

  it('displays special instructions preview', () => {
    render(<TripCard trip={mockTrip} testID="trip-card" />);

    expect(screen.getByText(/Please allow extra time/)).toBeTruthy();
  });

  it('truncates long special instructions', () => {
    const longNotes = 'A'.repeat(100);
    const tripWithLongNotes: DriverTrip = {
      ...mockTrip,
      riderPreferences: {
        ...mockTrip.riderPreferences!,
        specialEquipmentNotes: longNotes,
      },
    };

    render(<TripCard trip={tripWithLongNotes} testID="trip-card" />);

    // Should show first 50 chars + ellipsis
    expect(screen.getByText(/A{50}\.\.\./)).toBeTruthy();
  });

  it('renders status badge', () => {
    render(<TripCard trip={mockTrip} testID="trip-card" />);

    expect(screen.getByText('ASSIGNED')).toBeTruthy();
  });

  it('has correct accessibility label', () => {
    render(<TripCard trip={mockTrip} testID="trip-card" />);

    expect(screen.getByLabelText(/Trip with Margaret Johnson/)).toBeTruthy();
  });

  it('handles trip without preferences gracefully', () => {
    const tripWithoutPrefs: DriverTrip = {
      ...mockTrip,
      riderPreferences: null,
    };

    render(<TripCard trip={tripWithoutPrefs} testID="trip-card" />);

    expect(screen.getByText('Margaret Johnson')).toBeTruthy();
    // No accessibility badges should be shown
    expect(screen.queryByLabelText(/Needs/)).toBeNull();
  });

  it('formats tomorrow date correctly', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tomorrowTrip: DriverTrip = {
      ...mockTrip,
      scheduledPickupTime: tomorrow.toISOString(),
    };

    render(<TripCard trip={tomorrowTrip} testID="trip-card" />);

    expect(screen.getByText(/Tomorrow/)).toBeTruthy();
  });

  it('formats future date with weekday', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    const futureTrip: DriverTrip = {
      ...mockTrip,
      scheduledPickupTime: futureDate.toISOString(),
    };

    render(<TripCard trip={futureTrip} testID="trip-card" />);

    // Should show weekday abbreviation
    expect(screen.getByText(/(Mon|Tue|Wed|Thu|Fri|Sat|Sun)/)).toBeTruthy();
  });

  it('displays rider photo when available', () => {
    const tripWithPhoto: DriverTrip = {
      ...mockTrip,
      rider: {
        ...mockTrip.rider,
        profilePhotoUrl: 'https://example.com/photo.jpg',
      },
    };

    render(<TripCard trip={tripWithPhoto} testID="trip-card" />);

    // Should have image with accessibility label
    expect(screen.getByLabelText('Photo of Margaret Johnson')).toBeTruthy();
  });
});
