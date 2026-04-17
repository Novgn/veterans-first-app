/**
 * Tests for RideOfferModal component
 * Tests offer display, accept/decline actions
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

import { RideOfferModal } from '../RideOfferModal';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
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

// Mock the hooks
const mockOffer = {
  id: 'offer-1',
  rideId: 'ride-1',
  offeredAt: '2026-01-13T09:55:00Z',
  expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  status: 'pending' as const,
  ride: {
    id: 'ride-1',
    pickupAddress: '123 Main Street, Springfield',
    dropoffAddress: '456 Oak Avenue, Springfield',
    scheduledPickupTime: '2026-01-13T10:00:00Z',
    rider: {
      id: 'rider-1',
      firstName: 'Margaret',
      lastName: 'Smith',
      phone: '+1234567890',
      profilePhotoUrl: null,
    },
    riderPreferences: {
      mobilityAid: 'walker',
      needsDoorAssistance: true,
      needsPackageAssistance: false,
      extraVehicleSpace: false,
      specialEquipmentNotes: null,
    },
  },
};

const mockAcceptMutate = jest.fn();
const mockDeclineMutate = jest.fn();

jest.mock('@/hooks', () => ({
  useRideOffer: jest.fn(() => ({
    data: mockOffer,
    timeRemaining: 300,
  })),
  useAcceptRide: () => ({
    mutateAsync: mockAcceptMutate,
    isPending: false,
  }),
  useDeclineRide: () => ({
    mutateAsync: mockDeclineMutate,
    isPending: false,
  }),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('RideOfferModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('display', () => {
    it('renders modal with offer details', () => {
      render(<RideOfferModal />);

      expect(screen.getByText('New Ride Offer')).toBeTruthy();
      expect(screen.getByText('Margaret Smith')).toBeTruthy();
    });

    it('displays pickup time', () => {
      render(<RideOfferModal />);

      // The time format may vary based on timezone
      expect(screen.getByText('Pickup Time')).toBeTruthy();
    });

    it('displays addresses', () => {
      render(<RideOfferModal />);

      expect(screen.getByText('123 Main Street, Springfield')).toBeTruthy();
      expect(screen.getByText('456 Oak Avenue, Springfield')).toBeTruthy();
    });

    it('displays rider initials when no photo', () => {
      render(<RideOfferModal />);

      expect(screen.getByText('MS')).toBeTruthy();
    });

    it('renders Accept and Decline buttons', () => {
      render(<RideOfferModal />);

      expect(screen.getByTestId('accept-button')).toBeTruthy();
      expect(screen.getByTestId('decline-button')).toBeTruthy();
    });

    it('renders countdown timer', () => {
      render(<RideOfferModal />);

      expect(screen.getByTestId('offer-countdown')).toBeTruthy();
    });
  });

  describe('accept action', () => {
    it('calls acceptRide mutation when Accept is pressed', async () => {
      mockAcceptMutate.mockResolvedValueOnce(undefined);

      render(<RideOfferModal />);

      fireEvent.press(screen.getByTestId('accept-button'));

      await waitFor(() => {
        expect(mockAcceptMutate).toHaveBeenCalledWith({
          offerId: 'offer-1',
          rideId: 'ride-1',
        });
      });
    });

    it('shows success alert on accept', async () => {
      mockAcceptMutate.mockResolvedValueOnce(undefined);

      render(<RideOfferModal />);

      fireEvent.press(screen.getByTestId('accept-button'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Accepted', 'Ride added to your queue');
      });
    });

    it('shows error alert on accept failure', async () => {
      mockAcceptMutate.mockRejectedValueOnce(new Error('Failed'));

      render(<RideOfferModal />);

      fireEvent.press(screen.getByTestId('accept-button'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Could not accept ride. Please try again.'
        );
      });
    });
  });

  describe('decline action', () => {
    it('shows decline reason sheet when Decline is pressed', () => {
      render(<RideOfferModal />);

      fireEvent.press(screen.getByTestId('decline-button'));

      expect(screen.getByText('Why are you declining?')).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('has correct accessibility labels for buttons', () => {
      render(<RideOfferModal />);

      expect(screen.getByTestId('accept-button').props.accessibilityLabel).toBe('Accept ride');
      expect(screen.getByTestId('decline-button').props.accessibilityLabel).toBe('Decline ride');
    });

    it('has correct accessibility roles', () => {
      render(<RideOfferModal />);

      expect(screen.getByTestId('accept-button').props.accessibilityRole).toBe('button');
      expect(screen.getByTestId('decline-button').props.accessibilityRole).toBe('button');
    });
  });
});

describe('RideOfferModal - no offer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Override the mock to return no offer
    const useRideOfferMock = require('@/hooks').useRideOffer;
    useRideOfferMock.mockReturnValue({
      data: null,
      timeRemaining: null,
    });
  });

  it('renders nothing when no offer exists', () => {
    render(<RideOfferModal testID="test-modal" />);

    expect(screen.queryByTestId('test-modal')).toBeNull();
    expect(screen.queryByText('New Ride Offer')).toBeNull();
  });
});
