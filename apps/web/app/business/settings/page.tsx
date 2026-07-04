import { redirect } from 'next/navigation';

// Business settings now live under admin configuration (service area,
// pricing, operating hours) — this route just forwards there.
export default function BusinessSettingsPage() {
  redirect('/admin/configuration');
}
