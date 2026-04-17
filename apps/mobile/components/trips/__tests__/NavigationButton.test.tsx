/**
 * Tests for NavigationButton (Story 3.5)
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Linking } from 'react-native';

import { NavigationButton } from '../NavigationButton';

describe('NavigationButton', () => {
  beforeEach(() => {
    jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the provided label and address as accessibility hint', () => {
    render(<NavigationButton label="Navigate to Pickup" address="500 Broadway" testID="nav-btn" />);
    expect(screen.getByText('Navigate to Pickup')).toBeTruthy();
    expect(screen.getByTestId('nav-btn').props.accessibilityLabel).toBe(
      'Navigate to Pickup: 500 Broadway'
    );
  });

  it('invokes Linking.openURL with the native deep link when supported', async () => {
    render(<NavigationButton label="Navigate to Pickup" address="500 Broadway" testID="nav-btn" />);
    fireEvent.press(screen.getByTestId('nav-btn'));

    await waitFor(() => {
      expect(Linking.openURL).toHaveBeenCalled();
    });
  });

  it('falls back to the https url when the native link cannot be opened', async () => {
    (Linking.canOpenURL as jest.Mock).mockResolvedValue(false);

    render(<NavigationButton label="Navigate to Dropoff" address="9 Elm" testID="nav-btn" />);
    fireEvent.press(screen.getByTestId('nav-btn'));

    await waitFor(() => {
      const lastCall = (Linking.openURL as jest.Mock).mock.calls.at(-1);
      expect(lastCall?.[0]).toMatch(/^https:\/\/www\.google\.com\/maps/);
    });
  });
});
