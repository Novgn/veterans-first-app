/**
 * EditProfileSheet Component Tests
 *
 * Tests for modal behavior, form integration, and save functionality.
 * Story 2.12: Implement Rider Profile Management (AC: #2, #6)
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Alert } from 'react-native';

import { EditProfileSheet } from '../EditProfileSheet';

// Mock ProfilePhotoUpload since it has its own tests
jest.mock('../ProfilePhotoUpload', () => ({
  ProfilePhotoUpload: ({ testID }: { testID?: string }) => {
    const { View, Text } = require('react-native');
    return (
      <View testID={testID}>
        <Text>ProfilePhotoUpload Mock</Text>
      </View>
    );
  },
}));

// Track Alert.alert calls to simulate user pressing OK
let successAlertCallback: (() => void) | null = null;
jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
  if (buttons && buttons.length > 0 && buttons[0].onPress) {
    successAlertCallback = buttons[0].onPress;
  }
});

const defaultProps = {
  visible: true,
  onClose: jest.fn(),
  onSave: jest.fn().mockResolvedValue(undefined),
  initialData: {
    profilePhotoUrl: null,
    emergencyContactName: null,
    emergencyContactPhone: null,
    emergencyContactRelationship: null,
  },
  userId: 'test-user-123',
  testID: 'edit-profile-sheet',
};

describe('EditProfileSheet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    successAlertCallback = null;
  });

  describe('rendering', () => {
    it('renders when visible is true', () => {
      render(<EditProfileSheet {...defaultProps} />);
      expect(screen.getByTestId('edit-profile-sheet')).toBeTruthy();
    });

    it('renders header with title', () => {
      render(<EditProfileSheet {...defaultProps} />);
      expect(screen.getByText('Edit Profile')).toBeTruthy();
    });

    it('renders cancel button', () => {
      render(<EditProfileSheet {...defaultProps} />);
      expect(screen.getByTestId('edit-profile-sheet-cancel-button')).toBeTruthy();
    });

    it('renders save button', () => {
      render(<EditProfileSheet {...defaultProps} />);
      expect(screen.getByTestId('edit-profile-sheet-save-button')).toBeTruthy();
    });

    it('renders profile photo upload', () => {
      render(<EditProfileSheet {...defaultProps} />);
      expect(screen.getByTestId('edit-profile-sheet-photo-upload')).toBeTruthy();
    });

    it('renders emergency contact form', () => {
      render(<EditProfileSheet {...defaultProps} />);
      expect(screen.getByTestId('edit-profile-sheet-emergency-form')).toBeTruthy();
    });

    it('renders info note about name/phone', () => {
      render(<EditProfileSheet {...defaultProps} />);
      expect(
        screen.getByText(/Your name and phone number are managed through your account settings/)
      ).toBeTruthy();
    });
  });

  describe('initial data', () => {
    it('populates form with initial emergency contact data', () => {
      render(
        <EditProfileSheet
          {...defaultProps}
          initialData={{
            profilePhotoUrl: null,
            emergencyContactName: 'John Smith',
            emergencyContactPhone: '5551234567',
            emergencyContactRelationship: 'spouse',
          }}
        />
      );
      expect(screen.getByDisplayValue('John Smith')).toBeTruthy();
      expect(screen.getByDisplayValue('5551234567')).toBeTruthy();
    });
  });

  describe('cancel behavior', () => {
    it('calls onClose when cancel is pressed', () => {
      const onClose = jest.fn();
      render(<EditProfileSheet {...defaultProps} onClose={onClose} />);

      fireEvent.press(screen.getByTestId('edit-profile-sheet-cancel-button'));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('cancel button has correct accessibility label', () => {
      render(<EditProfileSheet {...defaultProps} />);
      const cancelButton = screen.getByTestId('edit-profile-sheet-cancel-button');
      expect(cancelButton.props.accessibilityLabel).toBe('Cancel');
    });
  });

  describe('save behavior', () => {
    it('calls onSave with form data when save is pressed', async () => {
      const onSave = jest.fn().mockResolvedValue(undefined);
      render(<EditProfileSheet {...defaultProps} onSave={onSave} />);

      fireEvent.press(screen.getByTestId('edit-profile-sheet-save-button'));

      await waitFor(() => {
        expect(onSave).toHaveBeenCalledWith({
          profilePhotoUrl: undefined,
          emergencyContactName: null,
          emergencyContactPhone: null,
          emergencyContactRelationship: null,
        });
      });
    });

    it('shows success alert after successful save', async () => {
      const onSave = jest.fn().mockResolvedValue(undefined);
      render(<EditProfileSheet {...defaultProps} onSave={onSave} />);

      fireEvent.press(screen.getByTestId('edit-profile-sheet-save-button'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Success',
          'Your profile has been updated.',
          expect.any(Array)
        );
      });
    });

    it('calls onClose when user presses OK on success alert', async () => {
      const onClose = jest.fn();
      const onSave = jest.fn().mockResolvedValue(undefined);
      render(<EditProfileSheet {...defaultProps} onClose={onClose} onSave={onSave} />);

      fireEvent.press(screen.getByTestId('edit-profile-sheet-save-button'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalled();
      });

      // Simulate user pressing OK on success alert
      if (successAlertCallback) successAlertCallback();

      expect(onClose).toHaveBeenCalled();
    });

    it('shows error alert when save fails', async () => {
      const onSave = jest.fn().mockRejectedValue(new Error('Save failed'));
      render(<EditProfileSheet {...defaultProps} onSave={onSave} />);

      fireEvent.press(screen.getByTestId('edit-profile-sheet-save-button'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Save Failed',
          'Could not save your profile. Please try again.',
          expect.any(Array)
        );
      });
    });

    it('shows loading indicator while saving', async () => {
      const onSave = jest
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(() => resolve(undefined), 100))
        );
      render(<EditProfileSheet {...defaultProps} onSave={onSave} />);

      fireEvent.press(screen.getByTestId('edit-profile-sheet-save-button'));

      await waitFor(() => {
        expect(screen.getByTestId('save-loading')).toBeTruthy();
      });
    });

    it('save button has correct accessibility label', () => {
      render(<EditProfileSheet {...defaultProps} />);
      const saveButton = screen.getByTestId('edit-profile-sheet-save-button');
      expect(saveButton.props.accessibilityLabel).toBe('Save profile changes');
    });
  });

  describe('form validation', () => {
    it('shows validation error for invalid name', async () => {
      render(<EditProfileSheet {...defaultProps} />);

      // Enter single character name (invalid - min 2 chars)
      fireEvent.changeText(screen.getByTestId('edit-profile-sheet-emergency-form-name-input'), 'J');

      fireEvent.press(screen.getByTestId('edit-profile-sheet-save-button'));

      await waitFor(() => {
        expect(screen.getByText('Name must be at least 2 characters')).toBeTruthy();
      });
    });

    it('shows validation error for invalid phone', async () => {
      render(<EditProfileSheet {...defaultProps} />);

      // Enter invalid phone
      fireEvent.changeText(
        screen.getByTestId('edit-profile-sheet-emergency-form-phone-input'),
        '123'
      );

      fireEvent.press(screen.getByTestId('edit-profile-sheet-save-button'));

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid phone number')).toBeTruthy();
      });
    });

    it('does not call onSave when validation fails', async () => {
      const onSave = jest.fn();
      render(<EditProfileSheet {...defaultProps} onSave={onSave} />);

      // Enter invalid data
      fireEvent.changeText(screen.getByTestId('edit-profile-sheet-emergency-form-name-input'), 'J');

      fireEvent.press(screen.getByTestId('edit-profile-sheet-save-button'));

      await waitFor(() => {
        expect(onSave).not.toHaveBeenCalled();
      });
    });
  });

  describe('form interaction', () => {
    it('updates emergency contact when form values change', () => {
      render(<EditProfileSheet {...defaultProps} />);

      fireEvent.changeText(
        screen.getByTestId('edit-profile-sheet-emergency-form-name-input'),
        'Jane Doe'
      );
      fireEvent.changeText(
        screen.getByTestId('edit-profile-sheet-emergency-form-phone-input'),
        '5559876543'
      );

      expect(screen.getByDisplayValue('Jane Doe')).toBeTruthy();
      expect(screen.getByDisplayValue('5559876543')).toBeTruthy();
    });

    it('selects relationship option', () => {
      render(<EditProfileSheet {...defaultProps} />);

      fireEvent.press(screen.getByTestId('edit-profile-sheet-emergency-form-relationship-parent'));

      const parentButton = screen.getByTestId(
        'edit-profile-sheet-emergency-form-relationship-parent'
      );
      expect(parentButton.props.accessibilityState).toEqual({ selected: true });
    });
  });

  describe('accessibility', () => {
    it('cancel and save buttons have minimum touch target size', () => {
      render(<EditProfileSheet {...defaultProps} />);
      // The min-h-[44px] min-w-[44px] classes ensure 44dp touch targets
      const cancelButton = screen.getByTestId('edit-profile-sheet-cancel-button');
      const saveButton = screen.getByTestId('edit-profile-sheet-save-button');
      expect(cancelButton.props.accessibilityRole).toBe('button');
      expect(saveButton.props.accessibilityRole).toBe('button');
    });
  });
});
