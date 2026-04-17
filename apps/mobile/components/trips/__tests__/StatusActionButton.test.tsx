/**
 * Tests for StatusActionButton (Story 3.4)
 */

import { fireEvent, render, screen } from '@testing-library/react-native';

import { StatusActionButton } from '../StatusActionButton';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Medium: 'medium' },
}));

describe('StatusActionButton', () => {
  it('renders "Start Route" for assigned trips and invokes onPress with next status', () => {
    const onPress = jest.fn();
    render(
      <StatusActionButton currentStatus="assigned" onPress={onPress} testID="status-action" />
    );

    expect(screen.getByText('Start Route')).toBeTruthy();

    fireEvent.press(screen.getByTestId('status-action'));
    expect(onPress).toHaveBeenCalledWith('en_route');
  });

  it('renders "Arrived at Pickup" for en_route trips', () => {
    const onPress = jest.fn();
    render(
      <StatusActionButton currentStatus="en_route" onPress={onPress} testID="status-action" />
    );
    expect(screen.getByText('Arrived at Pickup')).toBeTruthy();
    fireEvent.press(screen.getByTestId('status-action'));
    expect(onPress).toHaveBeenCalledWith('arrived');
  });

  it('renders "Start Trip" for arrived trips', () => {
    const onPress = jest.fn();
    render(<StatusActionButton currentStatus="arrived" onPress={onPress} testID="status-action" />);
    expect(screen.getByText('Start Trip')).toBeTruthy();
    fireEvent.press(screen.getByTestId('status-action'));
    expect(onPress).toHaveBeenCalledWith('in_progress');
  });

  it('renders "Complete Trip" for in_progress trips', () => {
    const onPress = jest.fn();
    render(
      <StatusActionButton currentStatus="in_progress" onPress={onPress} testID="status-action" />
    );
    expect(screen.getByText('Complete Trip')).toBeTruthy();
    fireEvent.press(screen.getByTestId('status-action'));
    expect(onPress).toHaveBeenCalledWith('completed');
  });

  it('renders nothing when status is completed', () => {
    const onPress = jest.fn();
    const { toJSON } = render(
      <StatusActionButton currentStatus="completed" onPress={onPress} testID="status-action" />
    );
    expect(toJSON()).toBeNull();
  });

  it('shows loading indicator and disables interaction when isLoading is true', () => {
    const onPress = jest.fn();
    render(
      <StatusActionButton
        currentStatus="assigned"
        onPress={onPress}
        isLoading
        testID="status-action"
      />
    );

    const button = screen.getByTestId('status-action');
    expect(button.props.accessibilityState).toMatchObject({ busy: true, disabled: true });
  });

  it('respects explicit disabled prop', () => {
    const onPress = jest.fn();
    render(
      <StatusActionButton
        currentStatus="assigned"
        onPress={onPress}
        disabled
        testID="status-action"
      />
    );

    const button = screen.getByTestId('status-action');
    expect(button.props.accessibilityState).toMatchObject({ disabled: true });
  });
});
