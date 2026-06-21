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
  // Note: no "suspended" user is seeded — the suspended screen is an orphan
  // edge state covered by a deep-link render-check (edge-suspended.yaml), and no
  // behavioral suspended-routing trigger exists in the app to exercise.
];

export const VERIFY_CODE = '424242';
