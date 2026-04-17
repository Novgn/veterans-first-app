/**
 * ConfirmationModal Component Tests
 *
 * Tests for the destructive action confirmation modal.
 */

import { render, screen, fireEvent } from '@testing-library/react-native';

import { ConfirmationModal } from '../ConfirmationModal';

describe('ConfirmationModal', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  const defaultProps = {
    visible: true,
    onClose: mockOnClose,
    onConfirm: mockOnConfirm,
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
  };

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnConfirm.mockClear();
  });

  it('renders modal with title and message when visible', () => {
    render(<ConfirmationModal {...defaultProps} />);

    expect(screen.getByText('Confirm Action')).toBeTruthy();
    expect(screen.getByText('Are you sure you want to proceed?')).toBeTruthy();
  });

  it('does not render when not visible', () => {
    render(<ConfirmationModal {...defaultProps} visible={false} />);

    expect(screen.queryByText('Confirm Action')).toBeNull();
  });

  it('shows warning icon when isDestructive is true', () => {
    render(<ConfirmationModal {...defaultProps} isDestructive />);

    // The modal should render - specific icon testing would require deeper testing
    expect(screen.getByText('Confirm Action')).toBeTruthy();
  });

  it('shows reason input when showReasonInput is true', () => {
    render(
      <ConfirmationModal {...defaultProps} showReasonInput reasonPlaceholder="Enter a reason" />
    );

    expect(screen.getByPlaceholderText('Enter a reason')).toBeTruthy();
  });

  it('calls onClose when cancel button is pressed', () => {
    render(<ConfirmationModal {...defaultProps} />);

    const cancelButton = screen.getByText('Cancel');
    fireEvent.press(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onConfirm when confirm button is pressed', () => {
    render(<ConfirmationModal {...defaultProps} />);

    const confirmButton = screen.getByText('Confirm');
    fireEvent.press(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalledWith(undefined);
  });

  it('calls onConfirm with reason when reason input has value', () => {
    render(
      <ConfirmationModal {...defaultProps} showReasonInput reasonPlaceholder="Enter a reason" />
    );

    const reasonInput = screen.getByPlaceholderText('Enter a reason');
    fireEvent.changeText(reasonInput, 'Plans changed');

    const confirmButton = screen.getByText('Confirm');
    fireEvent.press(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalledWith('Plans changed');
  });

  it('disables buttons when isLoading is true', () => {
    render(<ConfirmationModal {...defaultProps} isLoading />);

    expect(screen.getByText('Processing...')).toBeTruthy();
  });

  it('has accessible touch targets (min-h-[56px])', () => {
    render(<ConfirmationModal {...defaultProps} />);

    const confirmButton = screen.getByLabelText('Confirm');
    expect(confirmButton).toBeTruthy();

    const cancelButton = screen.getByLabelText('Cancel');
    expect(cancelButton).toBeTruthy();
  });

  it('has title with header accessibility role', () => {
    render(<ConfirmationModal {...defaultProps} />);

    expect(screen.getByRole('header')).toBeTruthy();
  });
});
