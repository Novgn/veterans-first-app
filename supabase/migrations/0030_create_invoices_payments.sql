-- Migration: 0030_create_invoices_payments
-- Stories 5.4, 5.5, 5.6, 5.7, 5.8.
--
-- Creates the billing + payment + earnings backbone for Epic 5.
-- Keeps every table RLS-locked to admins (+ rider SELECT on their own
-- invoices/payments so the rider profile → payment screen from Story 5.5
-- can render).

-- ---------------------------------------------------------------------------
-- invoices
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL UNIQUE,
  rider_id UUID REFERENCES users(id) NOT NULL,
  ride_id UUID REFERENCES rides(id),
  amount_cents INTEGER NOT NULL,
  tax_cents INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'paid', 'overdue', 'cancelled')
  ),
  billing_period TEXT NOT NULL DEFAULT 'per_ride' CHECK (
    billing_period IN ('per_ride', 'weekly', 'monthly')
  ),
  period_start DATE,
  period_end DATE,
  due_date DATE NOT NULL,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_rider_id ON invoices(rider_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage invoices" ON invoices;
CREATE POLICY "Admins manage invoices" ON invoices
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.clerk_id = auth.jwt()->>'sub' AND u.role = 'admin'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.clerk_id = auth.jwt()->>'sub' AND u.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Riders read own invoices" ON invoices;
CREATE POLICY "Riders read own invoices" ON invoices
  FOR SELECT USING (
    rider_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

-- ---------------------------------------------------------------------------
-- invoice_line_items
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invoice_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  ride_id UUID REFERENCES rides(id),
  description TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoice_line_items_invoice_id
  ON invoice_line_items(invoice_id);

ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage invoice line items" ON invoice_line_items;
CREATE POLICY "Admins manage invoice line items" ON invoice_line_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.clerk_id = auth.jwt()->>'sub' AND u.role = 'admin'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.clerk_id = auth.jwt()->>'sub' AND u.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Riders read own invoice line items" ON invoice_line_items;
CREATE POLICY "Riders read own invoice line items" ON invoice_line_items
  FOR SELECT USING (
    invoice_id IN (
      SELECT id FROM invoices
      WHERE rider_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
    )
  );

-- ---------------------------------------------------------------------------
-- payments
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) NOT NULL,
  rider_id UUID REFERENCES users(id) NOT NULL,
  amount_cents INTEGER NOT NULL,
  stripe_payment_intent_id TEXT,
  stripe_customer_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'succeeded', 'failed', 'refunded')
  ),
  payment_method_type TEXT,
  failure_reason TEXT,
  refunded_at TIMESTAMPTZ,
  refunded_amount_cents INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_rider_id ON payments(rider_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_intent_id
  ON payments(stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL;

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage payments" ON payments;
CREATE POLICY "Admins manage payments" ON payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.clerk_id = auth.jwt()->>'sub' AND u.role = 'admin'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.clerk_id = auth.jwt()->>'sub' AND u.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Riders read own payments" ON payments;
CREATE POLICY "Riders read own payments" ON payments
  FOR SELECT USING (
    rider_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

-- ---------------------------------------------------------------------------
-- rider_payment_accounts
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rider_payment_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  stripe_customer_id TEXT,
  default_payment_method_id TEXT,
  autopay_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  billing_frequency TEXT NOT NULL DEFAULT 'per_ride',
  credit_balance_cents INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE rider_payment_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage rider payment accounts" ON rider_payment_accounts;
CREATE POLICY "Admins manage rider payment accounts" ON rider_payment_accounts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.clerk_id = auth.jwt()->>'sub' AND u.role = 'admin'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.clerk_id = auth.jwt()->>'sub' AND u.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Riders manage own payment accounts" ON rider_payment_accounts;
CREATE POLICY "Riders manage own payment accounts" ON rider_payment_accounts
  FOR ALL USING (
    rider_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  ) WITH CHECK (
    rider_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

-- ---------------------------------------------------------------------------
-- driver_earnings
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS driver_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES users(id) NOT NULL,
  ride_id UUID REFERENCES rides(id) ON DELETE CASCADE UNIQUE NOT NULL,
  gross_amount_cents INTEGER NOT NULL,
  company_fee_cents INTEGER NOT NULL,
  net_amount_cents INTEGER NOT NULL,
  pay_period_start DATE,
  pay_period_end DATE,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_driver_earnings_driver_id ON driver_earnings(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_earnings_ride_id ON driver_earnings(ride_id);

ALTER TABLE driver_earnings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage driver earnings" ON driver_earnings;
CREATE POLICY "Admins manage driver earnings" ON driver_earnings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.clerk_id = auth.jwt()->>'sub' AND u.role = 'admin'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.clerk_id = auth.jwt()->>'sub' AND u.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Drivers read own earnings" ON driver_earnings;
CREATE POLICY "Drivers read own earnings" ON driver_earnings
  FOR SELECT USING (
    driver_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );
