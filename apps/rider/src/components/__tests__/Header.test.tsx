/**
 * Header component tests.
 *
 * Tests accessibility requirements:
 * - Header role for screen readers
 * - App title accessibility
 * - PhoneButton integration
 * - Back button functionality
 */

import { fireEvent, render, screen } from '@testing-library/react-native';

import { Header } from '../Header';

describe('Header', () => {
  it('renders correctly with app title', () => {
    render(<Header />);

    expect(screen.getByText('Veterans 1st')).toBeTruthy();
  });

  it('has accessibility header role', () => {
    render(<Header />);

    // The header container should have header role
    const headerText = screen.getByText('Veterans 1st');
    expect(headerText.props.accessibilityRole).toBe('header');
  });

  it('includes PhoneButton component', () => {
    render(<Header />);

    // PhoneButton should be rendered with its accessibility label
    const phoneButton = screen.getByLabelText('Call support');
    expect(phoneButton).toBeTruthy();
  });

  it('has correct accessibility label for title', () => {
    render(<Header />);

    const title = screen.getByText('Veterans 1st');
    expect(title.props.accessibilityLabel).toBe('Veterans 1st - App Header');
  });

  it('renders back button when showBackButton is true', () => {
    const onBack = jest.fn();
    render(<Header showBackButton onBack={onBack} />);

    const backButton = screen.getByLabelText('Go back');
    expect(backButton).toBeTruthy();
  });

  it('does not render back button by default', () => {
    render(<Header />);

    expect(screen.queryByLabelText('Go back')).toBeNull();
  });

  it('calls onBack when back button is pressed', () => {
    const onBack = jest.fn();
    render(<Header showBackButton onBack={onBack} />);

    const backButton = screen.getByLabelText('Go back');
    fireEvent.press(backButton);

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('renders custom title when provided', () => {
    render(<Header title="Book a Ride" />);

    expect(screen.getByText('Book a Ride')).toBeTruthy();
  });

  it('has correct accessibility label with custom title', () => {
    render(<Header title="Book a Ride" />);

    const title = screen.getByText('Book a Ride');
    expect(title.props.accessibilityLabel).toBe('Book a Ride - Veterans 1st');
  });
});
