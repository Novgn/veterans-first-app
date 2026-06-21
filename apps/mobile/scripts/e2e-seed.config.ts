export type Role = 'rider' | 'driver' | 'family';

export interface TestUser {
  key: 'rider' | 'driver' | 'family' | 'suspended';
  role: Role;
  phone: string; // Clerk dev test phone → verifies with code 424242
  firstName: string;
  lastName: string;
  email: string;
  suspended?: boolean;
}

// Deterministic test phones in the dev test-mode allow-list pattern.
export const TEST_USERS: TestUser[] = [
  {
    key: 'rider',
    role: 'rider',
    phone: '+12015550100',
    firstName: 'Test',
    lastName: 'Rider',
    email: 'e2e-rider@example.com',
  },
  {
    key: 'driver',
    role: 'driver',
    phone: '+12015550101',
    firstName: 'Test',
    lastName: 'Driver',
    email: 'e2e-driver@example.com',
  },
  {
    key: 'family',
    role: 'family',
    phone: '+12015550102',
    firstName: 'Test',
    lastName: 'Family',
    email: 'e2e-family@example.com',
  },
  {
    key: 'suspended',
    role: 'rider',
    phone: '+12015550103',
    firstName: 'Test',
    lastName: 'Suspended',
    email: 'e2e-suspended@example.com',
    suspended: true,
  },
];

export const VERIFY_CODE = '424242';
