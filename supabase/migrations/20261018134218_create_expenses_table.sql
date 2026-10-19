/*
# Create expenses table (single-tenant, no auth)

1. New Tables
- `expenses`
  - `id` (uuid, primary key)
  - `date` (date, not null) — the date the expense occurred
  - `category` (text, not null) — e.g. Food, Travel, Rent, Bills, Entertainment, Shopping, Other
  - `description` (text) — optional note describing the transaction
  - `amount` (numeric, not null, check > 0) — transaction amount in INR
  - `type` (text, not null, default 'Expense') — 'Expense' or 'Income'
  - `payment_method` (text) — e.g. Cash, Card, UPI, Bank Transfer
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `expenses`.
- Single-tenant app with no sign-in screen: allow anon + authenticated full CRUD
  because the data is intentionally shared/public.

3. Indexes
- Index on `date` for trend queries.
- Index on `category` for category aggregation.
*/

CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  category text NOT NULL,
  description text,
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  type text NOT NULL DEFAULT 'Expense' CHECK (type IN ('Expense','Income')),
  payment_method text DEFAULT 'Cash',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_expenses" ON expenses;
CREATE POLICY "anon_select_expenses" ON expenses FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_expenses" ON expenses;
CREATE POLICY "anon_insert_expenses" ON expenses FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_expenses" ON expenses;
CREATE POLICY "anon_update_expenses" ON expenses FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_expenses" ON expenses;
CREATE POLICY "anon_delete_expenses" ON expenses FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
