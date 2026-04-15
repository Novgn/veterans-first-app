/**
 * Tests for AccessibilityBadges component
 */

import { render, screen } from '@testing-library/react-native';

import { AccessibilityBadges } from '../AccessibilityBadges';

describe('AccessibilityBadges', () => {
  it('renders nothing when no accessibility needs', () => {
    const preferences = {
      mobilityAid: 'none',
      needsDoorAssistance: false,
      needsPackageAssistance: false,
      extraVehicleSpace: false,
    };

    render(<AccessibilityBadges preferences={preferences} testID="badges" />);

    expect(screen.queryByTestId('badges')).toBeNull();
  });

  it('renders nothing when mobilityAid is null', () => {
    const preferences = {
      mobilityAid: null,
      needsDoorAssistance: false,
      needsPackageAssistance: false,
      extraVehicleSpace: false,
    };

    render(<AccessibilityBadges preferences={preferences} testID="badges" />);

    expect(screen.queryByTestId('badges')).toBeNull();
  });

  it('renders wheelchair badge', () => {
    const preferences = {
      mobilityAid: 'manual_wheelchair',
      needsDoorAssistance: false,
      needsPackageAssistance: false,
      extraVehicleSpace: false,
    };

    render(<AccessibilityBadges preferences={preferences} testID="badges" />);

    expect(screen.getByTestId('badges')).toBeTruthy();
    expect(screen.getByLabelText('Needs manual wheelchair')).toBeTruthy();
  });

  it('renders walker badge', () => {
    const preferences = {
      mobilityAid: 'walker',
      needsDoorAssistance: false,
      needsPackageAssistance: false,
      extraVehicleSpace: false,
    };

    render(<AccessibilityBadges preferences={preferences} testID="badges" />);

    expect(screen.getByLabelText('Needs walker')).toBeTruthy();
  });

  it('renders door assistance badge', () => {
    const preferences = {
      mobilityAid: null,
      needsDoorAssistance: true,
      needsPackageAssistance: false,
      extraVehicleSpace: false,
    };

    render(<AccessibilityBadges preferences={preferences} testID="badges" />);

    expect(screen.getByLabelText('Needs door assistance')).toBeTruthy();
  });

  it('renders package assistance badge', () => {
    const preferences = {
      mobilityAid: null,
      needsDoorAssistance: false,
      needsPackageAssistance: true,
      extraVehicleSpace: false,
    };

    render(<AccessibilityBadges preferences={preferences} testID="badges" />);

    expect(screen.getByLabelText('Needs package help')).toBeTruthy();
  });

  it('renders extra space badge', () => {
    const preferences = {
      mobilityAid: null,
      needsDoorAssistance: false,
      needsPackageAssistance: false,
      extraVehicleSpace: true,
    };

    render(<AccessibilityBadges preferences={preferences} testID="badges" />);

    expect(screen.getByLabelText('Needs extra space')).toBeTruthy();
  });

  it('renders multiple badges when multiple needs', () => {
    const preferences = {
      mobilityAid: 'cane',
      needsDoorAssistance: true,
      needsPackageAssistance: true,
      extraVehicleSpace: false,
    };

    render(<AccessibilityBadges preferences={preferences} testID="badges" />);

    expect(screen.getByLabelText('Needs cane')).toBeTruthy();
    expect(screen.getByLabelText('Needs door assistance')).toBeTruthy();
    expect(screen.getByLabelText('Needs package help')).toBeTruthy();
  });

  it('uses small size when specified', () => {
    const preferences = {
      mobilityAid: 'walker',
      needsDoorAssistance: false,
      needsPackageAssistance: false,
      extraVehicleSpace: false,
    };

    render(<AccessibilityBadges preferences={preferences} size="sm" testID="badges" />);

    // The component renders, size affects styling
    expect(screen.getByTestId('badges')).toBeTruthy();
  });
});
