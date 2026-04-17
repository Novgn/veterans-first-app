/**
 * Add Driver (Story 5.3)
 *
 * Server-rendered onboarding form. Submits to createDriverOnboarding,
 * which validates, creates a Clerk user invitation, and writes the DB
 * rows in a single round.
 */

import Link from 'next/link';

import { createDriverOnboarding } from '@/lib/admin/createDriverOnboarding';

export default async function NewDriverPage(props: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await props.searchParams;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/admin/drivers" className="text-sm text-blue-600 hover:underline">
          ← All drivers
        </Link>
        <h2 className="mt-1 text-lg font-semibold">Add driver</h2>
        <p className="text-sm text-zinc-600">
          Create a new driver record and send a Clerk invitation. Credentials upload links are
          optional now but required before the driver can accept rides.
        </p>
      </div>

      {error ? (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800" role="alert">
          {error}
        </div>
      ) : null}

      <form action={createDriverOnboarding} className="space-y-6">
        <section className="space-y-3">
          <h3 className="text-sm font-semibold">Personal</h3>
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name" name="firstName" required />
            <Field label="Last name" name="lastName" required />
            <Field label="Phone" name="phone" required placeholder="(555) 123-4567" />
            <Field label="Email" name="email" type="email" />
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold">Vehicle</h3>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Make" name="vehicleMake" required />
            <Field label="Model" name="vehicleModel" required />
            <Field label="Year" name="vehicleYear" />
            <Field label="Color" name="vehicleColor" required />
            <Field label="Plate" name="vehiclePlate" required />
            <Field label="Years of experience" name="yearsExperience" />
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold">Credentials</h3>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Driver's license document URL" name="licenseUrl" />
            <Field label="License number" name="licenseNumber" />
            <Field label="License expiration" name="licenseExpiration" type="date" />
            <Field label="Insurance document URL" name="insuranceUrl" />
            <Field label="Insurance expiration" name="insuranceExpiration" type="date" />
            <Field label="Background check document URL" name="backgroundCheckUrl" />
          </div>
          <p className="text-xs text-zinc-500">
            New drivers start inactive until credentials are verified (Story 5.9).
          </p>
        </section>

        <div className="flex justify-end gap-2">
          <Link
            href="/admin/drivers"
            className="inline-flex h-10 items-center rounded-md border border-zinc-300 px-4 text-sm"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="h-10 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white"
          >
            Create driver
          </button>
        </div>
      </form>
    </div>
  );
}

interface FieldProps {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}

function Field({ label, name, type = 'text', required = false, placeholder }: FieldProps) {
  return (
    <label className="flex flex-col text-sm">
      <span className="mb-1 font-medium text-zinc-700">
        {label}
        {required ? <span className="ml-0.5 text-red-500">*</span> : null}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="min-h-[40px] rounded-md border border-zinc-300 px-3 text-sm"
      />
    </label>
  );
}
