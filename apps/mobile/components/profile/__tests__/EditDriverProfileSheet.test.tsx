/**
 * Tests for EditDriverProfileSheet validation (Story 3.11)
 */

import { validateDriverProfileForm } from '../EditDriverProfileSheet';

describe('validateDriverProfileForm', () => {
  const base = {
    firstName: 'Dave',
    lastName: 'Driver',
    email: '',
    vehicleMake: 'Honda',
    vehicleModel: 'Civic',
    vehicleYear: '',
    vehicleColor: 'Blue',
    vehiclePlate: 'ABC123',
    bio: '',
    yearsExperience: '',
  };

  it('accepts a complete form', () => {
    expect(validateDriverProfileForm(base)).toBeNull();
  });

  it('rejects missing first name', () => {
    expect(validateDriverProfileForm({ ...base, firstName: '  ' })).toBe('First name is required');
  });

  it('rejects missing last name', () => {
    expect(validateDriverProfileForm({ ...base, lastName: '' })).toBe('Last name is required');
  });

  it('rejects missing vehicle fields', () => {
    expect(validateDriverProfileForm({ ...base, vehicleMake: '' })).toBe(
      'Vehicle make is required'
    );
    expect(validateDriverProfileForm({ ...base, vehicleModel: '' })).toBe(
      'Vehicle model is required'
    );
    expect(validateDriverProfileForm({ ...base, vehicleColor: '' })).toBe(
      'Vehicle color is required'
    );
    expect(validateDriverProfileForm({ ...base, vehiclePlate: '' })).toBe(
      'Vehicle plate is required'
    );
  });
});
