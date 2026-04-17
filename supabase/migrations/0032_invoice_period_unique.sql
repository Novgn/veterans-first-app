-- Migration: 0032_invoice_period_unique
-- Story 5.6: At-most-once consolidated invoice per rider per period.
--
-- Partial unique index: when billing_period is weekly or monthly, a
-- rider has at most one invoice for a given period_start/period_end
-- pair. Per-ride invoices keep their ride_id uniqueness (enforced in
-- app logic — tricky to do at the DB level since billing_period=per_ride
-- can legitimately share NULL periods).

CREATE UNIQUE INDEX IF NOT EXISTS invoices_rider_period_unique
  ON invoices (rider_id, billing_period, period_start, period_end)
  WHERE billing_period IN ('weekly', 'monthly')
    AND period_start IS NOT NULL
    AND period_end IS NOT NULL;
