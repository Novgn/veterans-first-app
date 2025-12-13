/**
 * EmergencyContactForm Component Tests
 *
 * Tests for form fields, validation, and accessibility.
 * Story 2.12: Implement Rider Profile Management (AC: #2, #4)
 */

import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import {
  EmergencyContactForm,
  validateEmergencyContact,
  RELATIONSHIP_OPTIONS,
  type EmergencyContactFormValues,
} from '../EmergencyContactForm';

const defaultValues: EmergencyContactFormValues = {
  name: '',
  phone: '',
  relationship: null,
};

describe('EmergencyContactForm', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      render(
        <EmergencyContactForm values={defaultValues} onChange={jest.fn()} testID="emergency-form" />
      );
      expect(screen.getByTestId('emergency-form')).toBeTruthy();
    });

    it('displays section header and description', () => {
      render(<EmergencyContactForm values={defaultValues} onChange={jest.fn()} />);
      expect(screen.getByText('Emergency Contact')).toBeTruthy();
      expect(
        screen.getByText('This person will be contacted in case of an emergency during your ride.')
      ).toBeTruthy();
    });

    it('renders all form fields', () => {
      render(
        <EmergencyContactForm values={defaultValues} onChange={jest.fn()} testID="emergency-form" />
      );
      expect(screen.getByTestId('emergency-form-name-input')).toBeTruthy();
      expect(screen.getByTestId('emergency-form-phone-input')).toBeTruthy();
    });

    it('renders all relationship options', () => {
      render(
        <EmergencyContactForm values={defaultValues} onChange={jest.fn()} testID="emergency-form" />
      );
      RELATIONSHIP_OPTIONS.forEach((option) => {
        expect(screen.getByTestId(`emergency-form-relationship-${option.value}`)).toBeTruthy();
      });
    });

    it('displays current values in inputs', () => {
      const values: EmergencyContactFormValues = {
        name: 'John Smith',
        phone: '5551234567',
        relationship: 'spouse',
      };
      render(<EmergencyContactForm values={values} onChange={jest.fn()} testID="emergency-form" />);
      expect(screen.getByDisplayValue('John Smith')).toBeTruthy();
      expect(screen.getByDisplayValue('5551234567')).toBeTruthy();
    });
  });

  describe('interactions', () => {
    it('calls onChange when name is entered', () => {
      const onChange = jest.fn();
      render(
        <EmergencyContactForm values={defaultValues} onChange={onChange} testID="emergency-form" />
      );

      fireEvent.changeText(screen.getByTestId('emergency-form-name-input'), 'Jane Doe');

      expect(onChange).toHaveBeenCalledWith({
        ...defaultValues,
        name: 'Jane Doe',
      });
    });

    it('calls onChange when phone is entered', () => {
      const onChange = jest.fn();
      render(
        <EmergencyContactForm values={defaultValues} onChange={onChange} testID="emergency-form" />
      );

      fireEvent.changeText(screen.getByTestId('emergency-form-phone-input'), '5559876543');

      expect(onChange).toHaveBeenCalledWith({
        ...defaultValues,
        phone: '5559876543',
      });
    });

    it('calls onChange when relationship is selected', () => {
      const onChange = jest.fn();
      render(
        <EmergencyContactForm values={defaultValues} onChange={onChange} testID="emergency-form" />
      );

      fireEvent.press(screen.getByTestId('emergency-form-relationship-spouse'));

      expect(onChange).toHaveBeenCalledWith({
        ...defaultValues,
        relationship: 'spouse',
      });
    });

    it('shows selected relationship with primary styling', () => {
      const values: EmergencyContactFormValues = {
        name: '',
        phone: '',
        relationship: 'parent',
      };
      render(<EmergencyContactForm values={values} onChange={jest.fn()} testID="emergency-form" />);

      const parentButton = screen.getByTestId('emergency-form-relationship-parent');
      expect(parentButton.props.accessibilityState).toEqual({ selected: true });
    });
  });

  describe('validation errors', () => {
    it('displays name error when provided', () => {
      render(
        <EmergencyContactForm
          values={defaultValues}
          onChange={jest.fn()}
          errors={{ name: 'Name must be at least 2 characters' }}
        />
      );
      expect(screen.getByText('Name must be at least 2 characters')).toBeTruthy();
    });

    it('displays phone error when provided', () => {
      render(
        <EmergencyContactForm
          values={defaultValues}
          onChange={jest.fn()}
          errors={{ phone: 'Please enter a valid phone number' }}
        />
      );
      expect(screen.getByText('Please enter a valid phone number')).toBeTruthy();
    });

    it('error messages have alert accessibility role', () => {
      render(
        <EmergencyContactForm
          values={defaultValues}
          onChange={jest.fn()}
          errors={{ name: 'Name error', phone: 'Phone error' }}
        />
      );
      const nameError = screen.getByText('Name error');
      const phoneError = screen.getByText('Phone error');
      expect(nameError.props.accessibilityRole).toBe('alert');
      expect(phoneError.props.accessibilityRole).toBe('alert');
    });
  });

  describe('accessibility', () => {
    it('name input has correct accessibility label', () => {
      render(
        <EmergencyContactForm values={defaultValues} onChange={jest.fn()} testID="emergency-form" />
      );
      const nameInput = screen.getByTestId('emergency-form-name-input');
      expect(nameInput.props.accessibilityLabel).toBe('Emergency contact name');
    });

    it('phone input has correct accessibility label', () => {
      render(
        <EmergencyContactForm values={defaultValues} onChange={jest.fn()} testID="emergency-form" />
      );
      const phoneInput = screen.getByTestId('emergency-form-phone-input');
      expect(phoneInput.props.accessibilityLabel).toBe('Emergency contact phone number');
    });

    it('relationship buttons have radio accessibility role', () => {
      render(
        <EmergencyContactForm values={defaultValues} onChange={jest.fn()} testID="emergency-form" />
      );
      const spouseButton = screen.getByTestId('emergency-form-relationship-spouse');
      expect(spouseButton.props.accessibilityRole).toBe('radio');
    });

    it('inputs have accessibility hints', () => {
      render(
        <EmergencyContactForm values={defaultValues} onChange={jest.fn()} testID="emergency-form" />
      );
      const nameInput = screen.getByTestId('emergency-form-name-input');
      const phoneInput = screen.getByTestId('emergency-form-phone-input');
      expect(nameInput.props.accessibilityHint).toBe(
        'Enter the full name of your emergency contact'
      );
      expect(phoneInput.props.accessibilityHint).toBe(
        "Enter your emergency contact's phone number"
      );
    });
  });
});

describe('validateEmergencyContact', () => {
  it('returns empty object for valid values', () => {
    const errors = validateEmergencyContact({
      name: 'John Smith',
      phone: '5551234567',
      relationship: 'spouse',
    });
    expect(errors).toEqual({});
  });

  it('returns error for name shorter than 2 characters', () => {
    const errors = validateEmergencyContact({
      name: 'J',
      phone: '',
      relationship: null,
    });
    expect(errors.name).toBe('Name must be at least 2 characters');
  });

  it('returns no error for empty name (optional field)', () => {
    const errors = validateEmergencyContact({
      name: '',
      phone: '',
      relationship: null,
    });
    expect(errors.name).toBeUndefined();
  });

  it('returns error for invalid phone format', () => {
    const errors = validateEmergencyContact({
      name: '',
      phone: '123',
      relationship: null,
    });
    expect(errors.phone).toBe('Please enter a valid phone number');
  });

  it('accepts valid phone formats', () => {
    const formats = ['5551234567', '555-123-4567', '(555) 123-4567', '555.123.4567'];
    formats.forEach((phone) => {
      const errors = validateEmergencyContact({
        name: '',
        phone,
        relationship: null,
      });
      expect(errors.phone).toBeUndefined();
    });
  });

  it('returns no error for empty phone (optional field)', () => {
    const errors = validateEmergencyContact({
      name: '',
      phone: '',
      relationship: null,
    });
    expect(errors.phone).toBeUndefined();
  });
});
