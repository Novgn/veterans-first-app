/**
 * Tests for DeclineReasonSheet component
 * Tests reason selection and submission
 */

import { render, screen, fireEvent } from '@testing-library/react-native';

import { DeclineReasonSheet } from '../DeclineReasonSheet';

describe('DeclineReasonSheet', () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnSubmit.mockClear();
  });

  describe('display', () => {
    it('renders when visible', () => {
      render(<DeclineReasonSheet visible={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

      expect(screen.getByText('Why are you declining?')).toBeTruthy();
    });

    it('does not render when not visible', () => {
      render(<DeclineReasonSheet visible={false} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

      expect(screen.queryByText('Why are you declining?')).toBeNull();
    });

    it('renders all decline reason options', () => {
      render(<DeclineReasonSheet visible={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

      expect(screen.getByText('Schedule conflict')).toBeTruthy();
      expect(screen.getByText('Too far away')).toBeTruthy();
      expect(screen.getByText('Vehicle issue')).toBeTruthy();
      expect(screen.getByText('Personal emergency')).toBeTruthy();
      expect(screen.getByText('Other reason')).toBeTruthy();
    });

    it('renders Skip and Decline buttons', () => {
      render(<DeclineReasonSheet visible={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

      expect(screen.getByTestId('decline-skip-button')).toBeTruthy();
      expect(screen.getByTestId('decline-confirm-button')).toBeTruthy();
    });

    it('applies testID correctly', () => {
      render(
        <DeclineReasonSheet
          visible={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          testID="test-sheet"
        />
      );

      expect(screen.getByTestId('test-sheet')).toBeTruthy();
    });
  });

  describe('reason selection', () => {
    it('allows selecting a reason', () => {
      render(<DeclineReasonSheet visible={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

      const scheduleOption = screen.getByTestId('decline-reason-schedule');
      fireEvent.press(scheduleOption);

      // Verify selection state changed
      expect(scheduleOption.props.accessibilityState.selected).toBe(true);
    });

    it('allows changing selected reason', () => {
      render(<DeclineReasonSheet visible={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

      // Select first option
      fireEvent.press(screen.getByTestId('decline-reason-schedule'));
      expect(screen.getByTestId('decline-reason-schedule').props.accessibilityState.selected).toBe(
        true
      );

      // Select different option
      fireEvent.press(screen.getByTestId('decline-reason-distance'));
      expect(screen.getByTestId('decline-reason-distance').props.accessibilityState.selected).toBe(
        true
      );
      expect(screen.getByTestId('decline-reason-schedule').props.accessibilityState.selected).toBe(
        false
      );
    });
  });

  describe('submission', () => {
    it('calls onSubmit with selected reason when Decline is pressed', () => {
      render(<DeclineReasonSheet visible={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

      fireEvent.press(screen.getByTestId('decline-reason-schedule'));
      fireEvent.press(screen.getByTestId('decline-confirm-button'));

      expect(mockOnSubmit).toHaveBeenCalledWith('Schedule conflict');
    });

    it('calls onSubmit without reason when Skip is pressed', () => {
      render(<DeclineReasonSheet visible={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

      fireEvent.press(screen.getByTestId('decline-skip-button'));

      expect(mockOnSubmit).toHaveBeenCalledWith(undefined);
    });

    it('calls onSubmit without reason when Decline pressed without selection', () => {
      render(<DeclineReasonSheet visible={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

      fireEvent.press(screen.getByTestId('decline-confirm-button'));

      expect(mockOnSubmit).toHaveBeenCalledWith(undefined);
    });
  });

  describe('accessibility', () => {
    it('has correct accessibility roles for options', () => {
      render(<DeclineReasonSheet visible={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

      const option = screen.getByTestId('decline-reason-schedule');
      expect(option.props.accessibilityRole).toBe('radio');
    });

    it('has correct accessibility roles for buttons', () => {
      render(<DeclineReasonSheet visible={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

      expect(screen.getByTestId('decline-skip-button').props.accessibilityRole).toBe('button');
      expect(screen.getByTestId('decline-confirm-button').props.accessibilityRole).toBe('button');
    });
  });
});
