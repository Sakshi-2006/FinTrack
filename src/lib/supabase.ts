import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: false },
});

export type ExpenseType = 'Expense' | 'Income';

export interface ExpenseRow {
  id: string;
  date: string; // ISO yyyy-mm-dd
  category: string;
  description: string | null;
  amount: number;
  type: ExpenseType;
  payment_method: string;
  created_at: string;
}

export interface ExpenseInput {
  date: string;
  category: string;
  description?: string | null;
  amount: number;
  type: ExpenseType;
  payment_method: string;
}
