/**
 * SelectableDestinationCard component tests.
 *
 * Tests accessibility and interaction requirements:
 * - 56dp minimum height tap targets
 * - Accessibility labels and hints
 * - Selection callback
 * - Default badge display
 */

import { fireEvent, render, screen } from '@testing-library/react-native';

import { SelectableDestinationCard } from '../SelectableDestinationCard';

const mockDestination = {
  id: '1',
  name: 'Home',
  address: '123 Main St, Austin, TX 78701',
  latitude: 30.2672,
  longitude: -97.7431,
  isDefaultPickup: false,
  isDefaultDropoff: true,
};

const mockDestinationNoDefaults = {
  id: '2',
  name: 'Work',
  address: '456 Office Ave, Austin, TX 78702',
  latitude: 30.27,
  longitude: -97.74,
  isDefaultPickup: false,
  isDefaultDropoff: false,
};

describe('SelectableDestinationCard', () => {
  it('renders destination name and address', () => {
    render(<SelectableDestinationCard destination={mockDestination} onSelect={jest.fn()} />);

    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.getByText('123 Main St, Austin, TX 78701')).toBeTruthy();
  });

  it('shows default badge when isDefaultDropoff is true', () => {
    render(<SelectableDestinationCard destination={mockDestination} onSelect={jest.fn()} />);

    expect(screen.getByText('Default')).toBeTruthy();
  });

  it('does not show default badge when isDefaultDropoff is false', () => {
    render(
      <SelectableDestinationCard destination={mockDestinationNoDefaults} onSelect={jest.fn()} />
    );

    expect(screen.queryByText('Default')).toBeNull();
  });

  it('calls onSelect when pressed', () => {
    const onSelect = jest.fn();
    render(<SelectableDestinationCard destination={mockDestination} onSelect={onSelect} />);

    const card = screen.getByLabelText('Select Home, 123 Main St, Austin, TX 78701');
    fireEvent.press(card);

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('has button accessibility role', () => {
    render(<SelectableDestinationCard destination={mockDestination} onSelect={jest.fn()} />);

    const card = screen.getByRole('button');
    expect(card).toBeTruthy();
  });

  it('has accessibility hint', () => {
    render(<SelectableDestinationCard destination={mockDestination} onSelect={jest.fn()} />);

    const card = screen.getByLabelText('Select Home, 123 Main St, Austin, TX 78701');
    expect(card.props.accessibilityHint).toBe('Tap to select this destination for your ride');
  });

  it('has minimum 56dp height for touch target', () => {
    render(<SelectableDestinationCard destination={mockDestination} onSelect={jest.fn()} />);

    const card = screen.getByRole('button');
    // Check for min-h-[56px] class
    expect(card.props.className).toContain('min-h-[56px]');
  });
});
