import Link from 'next/link';

export default function ReportsIndexPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Reports</h2>
        <p className="text-sm text-zinc-600">Operational and financial reporting views.</p>
      </div>
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <li className="rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50">
          <Link href="/business/reports/operations" className="block">
            <div className="text-sm font-semibold">Operational metrics</div>
            <p className="mt-1 text-xs text-zinc-500">
              Rides, completion rate, no-show rate by window.
            </p>
          </Link>
        </li>
        <li className="rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50">
          <Link href="/business/reports/financial" className="block">
            <div className="text-sm font-semibold">Financial summary</div>
            <p className="mt-1 text-xs text-zinc-500">
              Revenue, outstanding invoices, driver payouts.
            </p>
          </Link>
        </li>
      </ul>
    </div>
  );
}
