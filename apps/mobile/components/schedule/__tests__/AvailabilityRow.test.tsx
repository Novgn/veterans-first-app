/**
 * Tests for AvailabilityRow (Story 3.7)
 */

import { fireEvent, render, screen } from '@testing-library/react-native';

import { AvailabilityRow, fmtTime } from '../AvailabilityRow';
import type { AvailabilityWindow } from '@/hooks/useDriverAvailability';

const baseWindow: AvailabilityWindow = {
  id: 'w-1',
  driverId: 'driver-1',
  dayOfWeek: 1,
  startTime: '08:00:00',
  endTime: '17:00:00',
  isActive: true,
};

describe('fmtTime', () => {
  it.each([
    ['08:00:00', '8:00 AM'],
    ['14:30:00', '2:30 PM'],
    ['00:00:00', '12:00 AM'],
    ['12:00:00', '12:00 PM'],
    ['23:45:00', '11:45 PM'],
  ])('formats %s as %s', (input, expected) => {
    expect(fmtTime(input)).toBe(expected);
  });
});

describe('AvailabilityRow', () => {
  it('renders day name and formatted time range', () => {
    render(
      <AvailabilityRow
        window={baseWindow}
        onToggleActive={jest.fn()}
        onDelete={jest.fn()}
        testID="row-1"
      />
    );

    expect(screen.getByText('Monday')).toBeTruthy();
    expect(screen.getByText('8:00 AM – 5:00 PM')).toBeTruthy();
  });

  it('fires onToggleActive when the switch changes', () => {
    const onToggle = jest.fn();
    render(
      <AvailabilityRow
        window={baseWindow}
        onToggleActive={onToggle}
        onDelete={jest.fn()}
        testID="row-1"
      />
    );
    fireEvent(screen.getByTestId('row-1-toggle'), 'valueChange', false);
    expect(onToggle).toHaveBeenCalledWith(baseWindow);
  });

  it('fires onDelete when delete is pressed', () => {
    const onDelete = jest.fn();
    render(
      <AvailabilityRow
        window={baseWindow}
        onToggleActive={jest.fn()}
        onDelete={onDelete}
        testID="row-1"
      />
    );
    fireEvent.press(screen.getByTestId('row-1-delete'));
    expect(onDelete).toHaveBeenCalledWith(baseWindow);
  });
});
