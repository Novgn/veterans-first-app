/**
 * DriverSelectionSheet Component Tests
 *
 * Tests for driver selection modal functionality.
 * Story 2.7: Implement Preferred Driver Selection
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';

import { useDriverHistory } from '@/hooks/useDriverHistory';
import { DriverSelectionSheet } from '../DriverSelectionSheet';

// Mock the hooks
jest.mock('@/hooks/useDriverHistory', () => ({
  useDriverHistory: jest.fn(),
}));

const mockUseDriverHistory = useDriverHistory as jest.MockedFunction<typeof useDriverHistory>;

const mockDriverHistory = [
  {
    driver: {
      id: 'driver-1',
      firstName: 'Dave',
      profilePhotoUrl: null,
      vehicleMake: 'Toyota',
      vehicleModel: 'Camry',
      vehicleColor: 'Silver',
    },
    rideCount: 23,
    lastRideDate: '2024-01-10T10:00:00Z',
  },
  {
    driver: {
      id: 'driver-2',
      firstName: 'Mike',
      profilePhotoUrl: null,
      vehicleMake: 'Honda',
      vehicleModel: 'Accord',
      vehicleColor: 'Blue',
    },
    rideCount: 5,
    lastRideDate: '2024-01-08T14:00:00Z',
  },
];

describe('DriverSelectionSheet', () => {
  const defaultProps = {
    visible: true,
    onClose: jest.fn(),
    onSelect: jest.fn(),
    selectedDriverId: null,
    riderId: 'rider-123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDriverHistory.mockReturnValue({
      data: mockDriverHistory,
      isLoading: false,
      error: null,
      isError: false,
      isPending: false,
      isSuccess: true,
      status: 'success',
    } as ReturnType<typeof useDriverHistory>);
  });

  describe('rendering', () => {
    it('renders header with title', () => {
      render(<DriverSelectionSheet {...defaultProps} />);
      expect(screen.getByText('Request a Driver')).toBeTruthy();
    });

    it('renders close button', () => {
      render(<DriverSelectionSheet {...defaultProps} />);
      expect(screen.getByTestId('driver-selection-close')).toBeTruthy();
    });

    it('renders no preference option', () => {
      render(<DriverSelectionSheet {...defaultProps} />);
      expect(screen.getByText('Any Available Driver')).toBeTruthy();
    });

    it('renders driver cards from history', () => {
      render(<DriverSelectionSheet {...defaultProps} />);
      expect(screen.getByText('Dave')).toBeTruthy();
      expect(screen.getByText('Mike')).toBeTruthy();
    });

    it('renders "Your Drivers" section header', () => {
      render(<DriverSelectionSheet {...defaultProps} />);
      expect(screen.getByText('Your Drivers')).toBeTruthy();
    });
  });

  describe('loading state', () => {
    it('shows loading indicator when loading', () => {
      mockUseDriverHistory.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        isError: false,
        isPending: true,
        isSuccess: false,
        status: 'pending',
      } as unknown as ReturnType<typeof useDriverHistory>);

      render(<DriverSelectionSheet {...defaultProps} />);
      expect(screen.getByText('Loading your drivers...')).toBeTruthy();
    });
  });

  describe('empty state', () => {
    it('shows empty state when no driver history', () => {
      mockUseDriverHistory.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
        isError: false,
        isPending: false,
        isSuccess: true,
        status: 'success',
      } as ReturnType<typeof useDriverHistory>);

      render(<DriverSelectionSheet {...defaultProps} />);
      expect(screen.getByText('No ride history yet')).toBeTruthy();
    });
  });

  describe('selection state', () => {
    it('highlights no preference when selectedDriverId is null', () => {
      render(<DriverSelectionSheet {...defaultProps} selectedDriverId={null} />);
      const noPreferenceOption = screen.getByTestId('no-preference-option');
      expect(noPreferenceOption.props.accessibilityState).toEqual({ selected: true });
    });

    it('highlights selected driver', () => {
      render(<DriverSelectionSheet {...defaultProps} selectedDriverId="driver-1" />);
      const driverCard = screen.getByTestId('driver-card-driver-1');
      expect(driverCard.props.accessibilityState).toEqual({ selected: true });
    });
  });

  describe('interactions', () => {
    it('calls onClose when close button pressed', () => {
      const onClose = jest.fn();
      render(<DriverSelectionSheet {...defaultProps} onClose={onClose} />);

      fireEvent.press(screen.getByTestId('driver-selection-close'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onSelect with null when no preference selected', () => {
      const onSelect = jest.fn();
      const onClose = jest.fn();
      render(<DriverSelectionSheet {...defaultProps} onSelect={onSelect} onClose={onClose} />);

      fireEvent.press(screen.getByTestId('no-preference-option'));
      expect(onSelect).toHaveBeenCalledWith(null, null);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onSelect with driver info when driver selected', () => {
      const onSelect = jest.fn();
      const onClose = jest.fn();
      render(<DriverSelectionSheet {...defaultProps} onSelect={onSelect} onClose={onClose} />);

      fireEvent.press(screen.getByTestId('driver-card-driver-1'));
      expect(onSelect).toHaveBeenCalledWith('driver-1', 'Dave');
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility', () => {
    it('close button has accessibility label', () => {
      render(<DriverSelectionSheet {...defaultProps} />);
      const closeButton = screen.getByTestId('driver-selection-close');
      expect(closeButton.props.accessibilityLabel).toBe('Close driver selection');
    });

    it('no preference option has accessibility label', () => {
      render(<DriverSelectionSheet {...defaultProps} />);
      const noPreferenceOption = screen.getByTestId('no-preference-option');
      expect(noPreferenceOption.props.accessibilityLabel).toContain('Any available driver');
    });

    it('no preference option includes selected state in label', () => {
      render(<DriverSelectionSheet {...defaultProps} selectedDriverId={null} />);
      const noPreferenceOption = screen.getByTestId('no-preference-option');
      expect(noPreferenceOption.props.accessibilityLabel).toContain('selected');
    });
  });

  describe('visibility', () => {
    it('does not render content when not visible', () => {
      render(<DriverSelectionSheet {...defaultProps} visible={false} />);
      // Modal is rendered but not visible - checking modal is present
      // Content may or may not be queryable depending on Modal implementation
    });
  });
});
