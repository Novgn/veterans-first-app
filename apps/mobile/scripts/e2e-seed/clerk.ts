import { createClerkClient } from '@clerk/backend';
import { TEST_USERS, type TestUser } from '../e2e-seed.config';

const secretKey = process.env.CLERK_SECRET_KEY;
if (!secretKey) throw new Error('CLERK_SECRET_KEY is required for e2e seed');
const clerk = createClerkClient({ secretKey });

async function findByPhone(phone: string) {
  const res = await clerk.users.getUserList({ phoneNumber: [phone], limit: 1 });
  return res.data[0] ?? null;
}

export async function seedClerkUsers(): Promise<Map<TestUser['key'], string>> {
  const ids = new Map<TestUser['key'], string>();
  for (const u of TEST_USERS) {
    let user = await findByPhone(u.phone);
    if (!user) {
      user = await clerk.users.createUser({
        phoneNumber: [u.phone],
        firstName: u.firstName,
        lastName: u.lastName,
        emailAddress: [u.email],
        publicMetadata: { role: u.role, suspended: u.suspended ?? false },
        skipPasswordRequirement: true,
      });
    } else {
      user = await clerk.users.updateUser(user.id, {
        publicMetadata: { role: u.role, suspended: u.suspended ?? false },
      });
    }
    ids.set(u.key, user.id);
    console.log(`clerk ✓ ${u.key} (${u.role}) → ${user.id}`);
  }
  return ids;
}

export async function teardownClerkUsers(): Promise<void> {
  for (const u of TEST_USERS) {
    const user = await findByPhone(u.phone);
    if (user) {
      await clerk.users.deleteUser(user.id);
      console.log(`clerk ✗ deleted ${u.key} (${user.id})`);
    }
  }
}
