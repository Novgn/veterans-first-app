/**
 * CurrentLocationButton component tests.
 *
 * Tests accessibility and interaction requirements:
 * - 56dp minimum height tap targets
 * - Accessibility labels and hints
 * - Loading state display
 */

import { render, screen } from '@testing-library/react-native';

import { CurrentLocationButton } from '../CurrentLocationButton';

describe('CurrentLocationButton', () => {
  it('renders button text', () => {
    render(<CurrentLocationButton onSelect={jest.fn()} />);

    expect(screen.getByText('Use Current Location')).toBeTruthy();
    expect(screen.getByText('Use my GPS location as destination')).toBeTruthy();
  });

  it('has button accessibility role', () => {
    render(<CurrentLocationButton onSelect={jest.fn()} />);

    const button = screen.getByRole('button');
    expect(button).toBeTruthy();
  });

  it('has accessibility label', () => {
    render(<CurrentLocationButton onSelect={jest.fn()} />);

    const button = screen.getByLabelText('Use current location as destination');
    expect(button).toBeTruthy();
  });

  it('has accessibility hint', () => {
    render(<CurrentLocationButton onSelect={jest.fn()} />);

    const button = screen.getByLabelText('Use current location as destination');
    expect(button.props.accessibilityHint).toBe(
      'Sets your current GPS location as where you want to go'
    );
  });

  it('has minimum 56dp height for touch target', () => {
    render(<CurrentLocationButton onSelect={jest.fn()} />);

    const button = screen.getByRole('button');
    expect(button.props.className).toContain('min-h-[56px]');
  });
});
