/**
 * PriceLockBadge Component Tests
 *
 * Tests for the trust-building price lock badge.
 */

import { render, screen } from '@testing-library/react-native';

import { PriceLockBadge } from '../PriceLockBadge';

describe('PriceLockBadge', () => {
  it('renders price correctly from cents', () => {
    render(<PriceLockBadge priceCents={4500} />);

    expect(screen.getByText('$45')).toBeTruthy();
  });

  it('displays "locked" text', () => {
    render(<PriceLockBadge priceCents={4500} />);

    expect(screen.getByText('locked')).toBeTruthy();
  });

  it('displays "No surge. Ever." tagline', () => {
    render(<PriceLockBadge priceCents={4500} />);

    expect(screen.getByText('No surge. Ever.')).toBeTruthy();
  });

  it('has correct accessibility label', () => {
    render(<PriceLockBadge priceCents={4500} />);

    expect(screen.getByLabelText('Price locked at $45. No surge pricing, ever')).toBeTruthy();
  });

  it('formats different price values correctly', () => {
    const { rerender } = render(<PriceLockBadge priceCents={2500} />);
    expect(screen.getByText('$25')).toBeTruthy();

    rerender(<PriceLockBadge priceCents={10000} />);
    expect(screen.getByText('$100')).toBeTruthy();
  });

  it('shows cents when price has fractional amount', () => {
    const { rerender } = render(<PriceLockBadge priceCents={4550} />);
    expect(screen.getByText('$45.50')).toBeTruthy();

    rerender(<PriceLockBadge priceCents={2599} />);
    expect(screen.getByText('$25.99')).toBeTruthy();
  });

  it('applies custom className', () => {
    render(<PriceLockBadge priceCents={4500} className="mt-4" />);

    // Component renders without error with custom class
    expect(screen.getByText('$45')).toBeTruthy();
  });
});
