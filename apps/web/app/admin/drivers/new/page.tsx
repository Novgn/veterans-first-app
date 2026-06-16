/**
 * Add Driver (Story 5.3)
 *
 * Server-rendered onboarding form. Submits to createDriverOnboarding,
 * which validates, creates a Clerk user invitation, and writes the DB
 * rows in a single round.
 */

import Link from 'next/link';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { createDriverOnboarding } from '@/lib/admin/createDriverOnboarding';

export default async function NewDriverPage(props: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await props.searchParams;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/admin/drivers"
          className="text-callout font-semibold text-navy hover:underline"
        >
          ← All drivers
        </Link>
        <h2 className="mt-1 text-title-2 font-semibold text-ink">Add driver</h2>
        <p className="text-body text-ink-secondary">
          Create a new driver record and send a Clerk invitation. Credentials upload links are
          optional now but required before the driver can accept rides.
        </p>
      </div>

      {error ? (
        <div
          className="rounded-md border border-error bg-error-100 p-4 text-body text-ink"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      <form action={createDriverOnboarding} className="space-y-8">
        <Card className="space-y-4 p-6">
          <h3 className="text-title-3 font-semibold text-ink">Personal</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input label="First name" name="firstName" required />
            <Input label="Last name" name="lastName" required />
            <Input label="Phone" name="phone" required placeholder="(555) 123-4567" />
            <Input label="Email" name="email" type="email" />
          </div>
        </Card>

        <Card className="space-y-4 p-6">
          <h3 className="text-title-3 font-semibold text-ink">Vehicle</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Make" name="vehicleMake" required />
            <Input label="Model" name="vehicleModel" required />
            <Input label="Year" name="vehicleYear" />
            <Input label="Color" name="vehicleColor" required />
            <Input label="Plate" name="vehiclePlate" required />
            <Input label="Years of experience" name="yearsExperience" />
          </div>
        </Card>

        <Card className="space-y-4 p-6">
          <h3 className="text-title-3 font-semibold text-ink">Credentials</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Driver's license document URL" name="licenseUrl" />
            <Input label="License number" name="licenseNumber" />
            <Input label="License expiration" name="licenseExpiration" type="date" />
            <Input label="Insurance document URL" name="insuranceUrl" />
            <Input label="Insurance expiration" name="insuranceExpiration" type="date" />
            <Input label="Background check document URL" name="backgroundCheckUrl" />
          </div>
          <p className="text-caption text-ink-secondary">
            New drivers start inactive until credentials are verified (Story 5.9).
          </p>
        </Card>

        <div className="flex justify-end gap-3">
          <Link href="/admin/drivers">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit">Create driver</Button>
        </div>
      </form>
    </div>
  );
}
