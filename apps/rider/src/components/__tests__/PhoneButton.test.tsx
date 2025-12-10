/**
 * PhoneButton component tests.
 *
 * Tests accessibility requirements and core functionality:
 * - Touch target size (56dp)
 * - Accessibility labels and roles
 *
 * Note: Phone linking behavior tests are skipped due to complex native module
 * mocking requirements in react-native 0.81+. These should be covered by
 * integration/E2E tests instead.
 */

import { render, screen } from '@testing-library/react-native';

import { PhoneButton } from '../PhoneButton';

describe('PhoneButton', () => {
  it('renders correctly with accessibility attributes', () => {
    render(<PhoneButton />);

    const button = screen.getByRole('button');
    expect(button).toBeTruthy();
    expect(button.props.accessibilityLabel).toBe('Call support');
  });

  it('has 56dp touch target size', () => {
    render(<PhoneButton />);

    const button = screen.getByRole('button');
    // Check that the button has the correct height class (56px = 56dp)
    expect(button.props.className).toContain('h-[56px]');
    expect(button.props.className).toContain('w-[56px]');
  });

  it('has correct accessibility hint', () => {
    render(<PhoneButton />);

    const button = screen.getByRole('button');
    expect(button.props.accessibilityHint).toBe('Opens your phone to call Veterans 1st support');
  });

  // TODO: Add integration tests for Linking behavior
  // The following tests require complex native module mocking that's incompatible
  // with react-native 0.81+ Jest setup. Consider using Detox or Maestro for E2E testing.
  //
  // - opens phone dialer when pressed and linking is available
  // - shows alert when phone linking is not available
});
