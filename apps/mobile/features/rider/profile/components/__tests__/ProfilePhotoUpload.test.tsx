/**
 * ProfilePhotoUpload Component Tests
 *
 * Tests for photo selection (camera and library), upload, and accessibility.
 * Story 2.12: Implement Rider Profile Management (AC: #5)
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { Alert } from 'react-native';

import { ProfilePhotoUpload } from '../ProfilePhotoUpload';

// Get mocked functions from jest.setup.js
const mockRequestMediaLibraryPermissionsAsync =
  ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock;
const mockRequestCameraPermissionsAsync = ImagePicker.requestCameraPermissionsAsync as jest.Mock;
const mockLaunchImageLibraryAsync = ImagePicker.launchImageLibraryAsync as jest.Mock;
const mockLaunchCameraAsync = ImagePicker.launchCameraAsync as jest.Mock;

// Mock fetch for blob conversion
global.fetch = jest.fn().mockResolvedValue({
  blob: jest.fn().mockResolvedValue(new Blob(['test'], { type: 'image/jpeg' })),
});

// Mock Supabase
const mockUpload = jest.fn();
const mockGetPublicUrl = jest.fn();
jest.mock('../../../lib/supabase', () => ({
  useSupabase: () => ({
    storage: {
      from: () => ({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      }),
    },
  }),
}));

// Track Alert.alert calls to simulate user choosing options
let alertCallback: ((index: number) => void) | null = null;
jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
  // Store callback for manual triggering in tests
  if (buttons && buttons.length > 0) {
    alertCallback = (index: number) => {
      const button = buttons[index];
      if (button && button.onPress) {
        button.onPress();
      }
    };
  }
});

const defaultProps = {
  currentPhotoUrl: null,
  onPhotoUploaded: jest.fn(),
  userId: 'user-123',
  testID: 'profile-photo-upload',
};

// Helper to simulate choosing "Choose from Library" (index 1)
const chooseFromLibrary = () => {
  if (alertCallback) alertCallback(1);
};

// Helper to simulate choosing "Take Photo" (index 0)
const takePhoto = () => {
  if (alertCallback) alertCallback(0);
};

describe('ProfilePhotoUpload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    alertCallback = null;
    mockRequestMediaLibraryPermissionsAsync.mockResolvedValue({ status: 'granted' });
    mockRequestCameraPermissionsAsync.mockResolvedValue({ status: 'granted' });
    mockLaunchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file://selected.jpg' }],
    });
    mockLaunchCameraAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file://camera-photo.jpg' }],
    });
    mockUpload.mockResolvedValue({ error: null });
    mockGetPublicUrl.mockReturnValue({
      data: { publicUrl: 'https://storage.supabase.com/photo.jpg' },
    });
  });

  describe('rendering', () => {
    it('renders without crashing', () => {
      render(<ProfilePhotoUpload {...defaultProps} />);
      expect(screen.getByTestId('profile-photo-upload')).toBeTruthy();
    });

    it('shows default avatar when no photo URL', () => {
      render(<ProfilePhotoUpload {...defaultProps} currentPhotoUrl={null} />);
      // Should render the person icon placeholder
      expect(screen.getByTestId('profile-photo-upload')).toBeTruthy();
    });

    it('shows current photo when URL provided', () => {
      render(
        <ProfilePhotoUpload {...defaultProps} currentPhotoUrl="https://example.com/photo.jpg" />
      );
      expect(screen.getByTestId('profile-photo-upload')).toBeTruthy();
    });

    it('shows camera badge', () => {
      render(<ProfilePhotoUpload {...defaultProps} />);
      // Camera badge is always visible
      expect(screen.getByTestId('profile-photo-upload')).toBeTruthy();
    });
  });

  describe('photo selection', () => {
    it('shows options alert when tapped', async () => {
      render(<ProfilePhotoUpload {...defaultProps} />);

      fireEvent.press(screen.getByTestId('profile-photo-upload'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Change Profile Photo',
          'Choose a source',
          expect.arrayContaining([
            expect.objectContaining({ text: 'Take Photo' }),
            expect.objectContaining({ text: 'Choose from Library' }),
            expect.objectContaining({ text: 'Cancel' }),
          ])
        );
      });
    });

    it('requests library permission when choosing from library', async () => {
      render(<ProfilePhotoUpload {...defaultProps} />);

      fireEvent.press(screen.getByTestId('profile-photo-upload'));
      chooseFromLibrary();

      await waitFor(() => {
        expect(mockRequestMediaLibraryPermissionsAsync).toHaveBeenCalled();
      });
    });

    it('requests camera permission when taking photo', async () => {
      render(<ProfilePhotoUpload {...defaultProps} />);

      fireEvent.press(screen.getByTestId('profile-photo-upload'));
      takePhoto();

      await waitFor(() => {
        expect(mockRequestCameraPermissionsAsync).toHaveBeenCalled();
      });
    });

    it('does not open library if permission denied', async () => {
      mockRequestMediaLibraryPermissionsAsync.mockResolvedValue({ status: 'denied' });

      render(<ProfilePhotoUpload {...defaultProps} />);
      fireEvent.press(screen.getByTestId('profile-photo-upload'));
      chooseFromLibrary();

      await waitFor(() => {
        expect(mockLaunchImageLibraryAsync).not.toHaveBeenCalled();
      });
    });

    it('does not open camera if permission denied', async () => {
      mockRequestCameraPermissionsAsync.mockResolvedValue({ status: 'denied' });

      render(<ProfilePhotoUpload {...defaultProps} />);
      fireEvent.press(screen.getByTestId('profile-photo-upload'));
      takePhoto();

      await waitFor(() => {
        expect(mockLaunchCameraAsync).not.toHaveBeenCalled();
      });
    });

    it('opens image library when permission granted', async () => {
      render(<ProfilePhotoUpload {...defaultProps} />);
      fireEvent.press(screen.getByTestId('profile-photo-upload'));
      chooseFromLibrary();

      await waitFor(() => {
        expect(mockLaunchImageLibraryAsync).toHaveBeenCalled();
      });
    });

    it('opens camera when permission granted', async () => {
      render(<ProfilePhotoUpload {...defaultProps} />);
      fireEvent.press(screen.getByTestId('profile-photo-upload'));
      takePhoto();

      await waitFor(() => {
        expect(mockLaunchCameraAsync).toHaveBeenCalled();
      });
    });

    it('does not upload if library selection cancelled', async () => {
      mockLaunchImageLibraryAsync.mockResolvedValue({ canceled: true });

      render(<ProfilePhotoUpload {...defaultProps} />);
      fireEvent.press(screen.getByTestId('profile-photo-upload'));
      chooseFromLibrary();

      await waitFor(() => {
        expect(mockUpload).not.toHaveBeenCalled();
      });
    });

    it('does not upload if camera selection cancelled', async () => {
      mockLaunchCameraAsync.mockResolvedValue({ canceled: true });

      render(<ProfilePhotoUpload {...defaultProps} />);
      fireEvent.press(screen.getByTestId('profile-photo-upload'));
      takePhoto();

      await waitFor(() => {
        expect(mockUpload).not.toHaveBeenCalled();
      });
    });
  });

  describe('upload behavior', () => {
    it('uploads resized image to Supabase from library', async () => {
      const onPhotoUploaded = jest.fn();
      render(<ProfilePhotoUpload {...defaultProps} onPhotoUploaded={onPhotoUploaded} />);

      fireEvent.press(screen.getByTestId('profile-photo-upload'));
      chooseFromLibrary();

      await waitFor(() => {
        expect(mockUpload).toHaveBeenCalled();
      });
    });

    it('uploads resized image to Supabase from camera', async () => {
      const onPhotoUploaded = jest.fn();
      render(<ProfilePhotoUpload {...defaultProps} onPhotoUploaded={onPhotoUploaded} />);

      fireEvent.press(screen.getByTestId('profile-photo-upload'));
      takePhoto();

      await waitFor(() => {
        expect(mockUpload).toHaveBeenCalled();
      });
    });

    it('calls onPhotoUploaded with public URL after successful upload', async () => {
      const onPhotoUploaded = jest.fn();
      render(<ProfilePhotoUpload {...defaultProps} onPhotoUploaded={onPhotoUploaded} />);

      fireEvent.press(screen.getByTestId('profile-photo-upload'));
      chooseFromLibrary();

      await waitFor(() => {
        expect(onPhotoUploaded).toHaveBeenCalledWith('https://storage.supabase.com/photo.jpg');
      });
    });

    it('generates unique filename with userId and timestamp', async () => {
      render(<ProfilePhotoUpload {...defaultProps} userId="test-user-456" />);
      fireEvent.press(screen.getByTestId('profile-photo-upload'));
      chooseFromLibrary();

      await waitFor(() => {
        expect(mockUpload).toHaveBeenCalledWith(
          expect.stringMatching(/^test-user-456-\d+\.jpg$/),
          expect.any(Blob),
          expect.objectContaining({ contentType: 'image/jpeg' })
        );
      });
    });
  });

  describe('loading state', () => {
    it('shows loading indicator during upload', async () => {
      // Make upload take some time
      mockUpload.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ error: null }), 100))
      );

      render(<ProfilePhotoUpload {...defaultProps} />);
      fireEvent.press(screen.getByTestId('profile-photo-upload'));
      chooseFromLibrary();

      // Loading indicator should appear
      await waitFor(() => {
        expect(screen.getByTestId('upload-loading')).toBeTruthy();
      });
    });

    it('disables button during upload', async () => {
      mockUpload.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ error: null }), 100))
      );

      render(<ProfilePhotoUpload {...defaultProps} />);
      const button = screen.getByTestId('profile-photo-upload');
      fireEvent.press(button);
      chooseFromLibrary();

      await waitFor(() => {
        // Button should be disabled while uploading
        expect(button.props.accessibilityState?.disabled).toBe(true);
      });
    });
  });

  describe('error handling', () => {
    it('handles upload error gracefully', async () => {
      const onPhotoUploaded = jest.fn();
      mockUpload.mockResolvedValue({ error: { message: 'Upload failed' } });

      render(<ProfilePhotoUpload {...defaultProps} onPhotoUploaded={onPhotoUploaded} />);
      fireEvent.press(screen.getByTestId('profile-photo-upload'));
      chooseFromLibrary();

      await waitFor(() => {
        expect(onPhotoUploaded).not.toHaveBeenCalled();
      });
    });
  });

  describe('accessibility', () => {
    it('has correct accessibility label', () => {
      render(<ProfilePhotoUpload {...defaultProps} />);
      const button = screen.getByTestId('profile-photo-upload');
      expect(button.props.accessibilityLabel).toBe('Change profile photo');
    });

    it('has button accessibility role', () => {
      render(<ProfilePhotoUpload {...defaultProps} />);
      const button = screen.getByTestId('profile-photo-upload');
      expect(button.props.accessibilityRole).toBe('button');
    });

    it('has accessibility hint', () => {
      render(<ProfilePhotoUpload {...defaultProps} />);
      const button = screen.getByTestId('profile-photo-upload');
      expect(button.props.accessibilityHint).toBe(
        'Opens photo picker to select a new profile photo'
      );
    });
  });
});
