/**
 * Tests for ContactRiderSheet (Story 3.6)
 */

import { fireEvent, render, screen } from '@testing-library/react-native';
import { Linking, Platform } from 'react-native';

import { ContactRiderSheet } from '../ContactRiderSheet';

describe('ContactRiderSheet (Android layout)', () => {
  beforeAll(() => {
    Object.defineProperty(Platform, 'OS', { get: () => 'android' });
  });

  beforeEach(() => {
    jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders call and text options with rider name', () => {
    render(
      <ContactRiderSheet visible riderName="Dave" riderPhone="+12025551234" onClose={() => {}} />
    );

    expect(screen.getByText('Contact Dave')).toBeTruthy();
    expect(screen.getByText('Call Dave')).toBeTruthy();
    expect(screen.getByText('Text Dave')).toBeTruthy();
  });

  it('opens a tel: link when Call is pressed', async () => {
    render(
      <ContactRiderSheet visible riderName="Dave" riderPhone="+12025551234" onClose={() => {}} />
    );

    fireEvent.press(screen.getByTestId('contact-rider-call'));
    await Promise.resolve();
    await Promise.resolve();

    expect(Linking.openURL).toHaveBeenCalledWith('tel:+12025551234');
  });

  it('opens an sms: link when Text is pressed', async () => {
    render(
      <ContactRiderSheet visible riderName="Dave" riderPhone="+12025551234" onClose={() => {}} />
    );

    fireEvent.press(screen.getByTestId('contact-rider-text'));
    await Promise.resolve();
    await Promise.resolve();

    expect(Linking.openURL).toHaveBeenCalledWith('sms:+12025551234');
  });
});
