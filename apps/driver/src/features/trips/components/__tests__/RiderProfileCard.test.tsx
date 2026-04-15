/**
 * Tests for RiderProfileCard component
 */

import { render, screen, fireEvent } from '@testing-library/react-native';
import { Linking } from 'react-native';

import { RiderProfileCard } from '../RiderProfileCard';

// Mock Linking
jest.spyOn(Linking, 'openURL').mockImplementation(() => Promise.resolve(true));

const mockRider = {
  firstName: 'Margaret',
  lastName: 'Johnson',
  phone: '+1234567890',
  profilePhotoUrl: null,
};

const mockPreferences = {
  mobilityAid: 'walker',
  needsDoorAssistance: true,
  needsPackageAssistance: false,
  extraVehicleSpace: false,
  specialEquipmentNotes: 'Uses walker, needs extra time',
  comfortTemperature: 'warm',
  conversationPreference: 'some',
  musicPreference: 'soft',
  otherNotes: 'Prefers window seat',
};

describe('RiderProfileCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays rider name', () => {
    render(
      <RiderProfileCard
        rider={mockRider}
        preferences={mockPreferences}
        relationshipCount={0}
        testID="rider-profile"
      />
    );

    expect(screen.getByText('Margaret Johnson')).toBeTruthy();
  });

  it('displays rider initials when no photo', () => {
    render(
      <RiderProfileCard
        rider={mockRider}
        preferences={mockPreferences}
        relationshipCount={0}
        testID="rider-profile"
      />
    );

    expect(screen.getByText('MJ')).toBeTruthy();
  });

  it('displays rider photo when available', () => {
    const riderWithPhoto = {
      ...mockRider,
      profilePhotoUrl: 'https://example.com/photo.jpg',
    };

    render(
      <RiderProfileCard
        rider={riderWithPhoto}
        preferences={mockPreferences}
        relationshipCount={0}
        testID="rider-profile"
      />
    );

    expect(screen.getByLabelText('Photo of Margaret Johnson')).toBeTruthy();
  });

  it('displays relationship count', () => {
    render(
      <RiderProfileCard
        rider={mockRider}
        preferences={mockPreferences}
        relationshipCount={5}
        testID="rider-profile"
      />
    );

    expect(screen.getByText(/You.*ve driven Margaret 5 times/)).toBeTruthy();
  });

  it('displays singular for 1 ride', () => {
    render(
      <RiderProfileCard
        rider={mockRider}
        preferences={mockPreferences}
        relationshipCount={1}
        testID="rider-profile"
      />
    );

    expect(screen.getByText(/You.*ve driven Margaret 1 time$/)).toBeTruthy();
  });

  it('hides relationship count when 0', () => {
    render(
      <RiderProfileCard
        rider={mockRider}
        preferences={mockPreferences}
        relationshipCount={0}
        testID="rider-profile"
      />
    );

    expect(screen.queryByText(/You.*ve driven/)).toBeNull();
  });

  it('renders call button with correct accessibility', () => {
    render(
      <RiderProfileCard
        rider={mockRider}
        preferences={mockPreferences}
        relationshipCount={0}
        testID="rider-profile"
      />
    );

    const callButton = screen.getByLabelText('Call Margaret Johnson');
    expect(callButton).toBeTruthy();
  });

  it('renders text button with correct accessibility', () => {
    render(
      <RiderProfileCard
        rider={mockRider}
        preferences={mockPreferences}
        relationshipCount={0}
        testID="rider-profile"
      />
    );

    const textButton = screen.getByLabelText('Text Margaret Johnson');
    expect(textButton).toBeTruthy();
  });

  it('opens phone app when call button pressed', () => {
    render(
      <RiderProfileCard
        rider={mockRider}
        preferences={mockPreferences}
        relationshipCount={0}
        testID="rider-profile"
      />
    );

    const callButton = screen.getByLabelText('Call Margaret Johnson');
    fireEvent.press(callButton);

    expect(Linking.openURL).toHaveBeenCalledWith('tel:+1234567890');
  });

  it('opens SMS app when text button pressed', () => {
    render(
      <RiderProfileCard
        rider={mockRider}
        preferences={mockPreferences}
        relationshipCount={0}
        testID="rider-profile"
      />
    );

    const textButton = screen.getByLabelText('Text Margaret Johnson');
    fireEvent.press(textButton);

    expect(Linking.openURL).toHaveBeenCalledWith('sms:+1234567890');
  });

  it('displays accessibility preferences', () => {
    render(
      <RiderProfileCard
        rider={mockRider}
        preferences={mockPreferences}
        relationshipCount={0}
        testID="rider-profile"
      />
    );

    expect(screen.getByText('Accessibility Needs')).toBeTruthy();
    expect(screen.getByLabelText('Needs walker')).toBeTruthy();
    expect(screen.getByLabelText('Needs door assistance')).toBeTruthy();
  });

  it('displays comfort preferences', () => {
    render(
      <RiderProfileCard
        rider={mockRider}
        preferences={mockPreferences}
        relationshipCount={0}
        testID="rider-profile"
      />
    );

    expect(screen.getByText('Comfort Preferences')).toBeTruthy();
    expect(screen.getByLabelText('Warm')).toBeTruthy();
    expect(screen.getByLabelText('Some chat')).toBeTruthy();
    expect(screen.getByLabelText('Soft music')).toBeTruthy();
  });

  it('displays special notes', () => {
    render(
      <RiderProfileCard
        rider={mockRider}
        preferences={mockPreferences}
        relationshipCount={0}
        testID="rider-profile"
      />
    );

    expect(screen.getByText('Special Notes')).toBeTruthy();
    expect(screen.getByText('Uses walker, needs extra time')).toBeTruthy();
    expect(screen.getByText('Prefers window seat')).toBeTruthy();
  });

  it('handles null preferences gracefully', () => {
    render(
      <RiderProfileCard
        rider={mockRider}
        preferences={null}
        relationshipCount={0}
        testID="rider-profile"
      />
    );

    expect(screen.getByText('Margaret Johnson')).toBeTruthy();
    // Should not crash and still render contact buttons
    expect(screen.getByLabelText('Call Margaret Johnson')).toBeTruthy();
  });

  it('shows no accessibility needs message when none', () => {
    const noAccessibilityPrefs = {
      ...mockPreferences,
      mobilityAid: null,
      needsDoorAssistance: false,
      needsPackageAssistance: false,
      extraVehicleSpace: false,
    };

    render(
      <RiderProfileCard
        rider={mockRider}
        preferences={noAccessibilityPrefs}
        relationshipCount={0}
        testID="rider-profile"
      />
    );

    expect(screen.getByText('No special accessibility needs')).toBeTruthy();
  });
});
