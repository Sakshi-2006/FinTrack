import { supabase, type ExpenseInput } from './supabase';
import { CATEGORIES, PAYMENT_METHODS } from './constants';

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randBetween(min: number, max: number): number {
  return Math.round((min + Math.random() * (max - min)) * 100) / 100;
}

const CATEGORY_AMOUNTS: Record<string, [number, number]> = {
  Food: [80, 600],
  Transport: [40, 800],
  Rent: [8000, 18000],
  Bills: [300, 2500],
  Entertainment: [150, 1500],
  Shopping: [200, 3000],
  Health: [100, 2000],
  Other: [50, 1000],
};

const DESCRIPTIONS: Record<string, string[]> = {
  Food: ['Lunch at cafe', 'Grocery shopping', 'Dinner with friends', 'Food delivery order', 'Breakfast'],
  Transport: ['Cab ride', 'Fuel', 'Metro recharge', 'Bus pass', 'Auto rickshaw'],
  Rent: ['Monthly rent', 'Maintenance'],
  Bills: ['Electricity bill', 'Internet bill', 'Mobile recharge', 'Water bill'],
  Entertainment: ['Movie tickets', 'Streaming subscription', 'Concert', 'Game purchase'],
  Shopping: ['Clothes', 'Electronics', 'Home decor', 'Books'],
  Health: ['Pharmacy', 'Doctor visit', 'Gym membership', 'Supplements'],
  Other: ['Misc expense', 'Gift', 'Donation'],
};

export function generateSampleExpenses(months = 4): ExpenseInput[] {
  const rows: ExpenseInput[] = [];
  const today = new Date();
  for (let m = months - 1; m >= 0; m--) {
    const base = new Date(today.getFullYear(), today.getMonth() - m, 1);
    const daysInMonth = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();

    // Salary income once a month
    rows.push({
      date: `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, '0')}-01`,
      category: 'Salary',
      description: 'Monthly salary',
      amount: randBetween(45000, 75000),
      type: 'Income',
      payment_method: 'Bank Transfer',
    });

    // Occasional freelance income
    if (Math.random() < 0.4) {
      rows.push({
        date: `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 20) + 5).padStart(2, '0')}`,
        category: 'Freelance',
        description: 'Freelance project payment',
        amount: randBetween(5000, 20000),
        type: 'Income',
        payment_method: 'Bank Transfer',
      });
    }

    const txCount = 35 + Math.floor(Math.random() * 25);
    for (let i = 0; i < txCount; i++) {
      const day = Math.floor(Math.random() * daysInMonth) + 1;
      const category = pick(CATEGORIES);
      const [min, max] = CATEGORY_AMOUNTS[category] ?? [50, 1000];
      rows.push({
        date: `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        category,
        description: pick(DESCRIPTIONS[category] ?? ['Expense']),
        amount: randBetween(min, max),
        type: 'Expense',
        payment_method: pick(PAYMENT_METHODS),
      });
    }
  }
  return rows;
}

export async function seedSampleData(months = 4): Promise<number> {
  const rows = generateSampleExpenses(months);
  const { data, error } = await supabase.from('expenses').insert(rows).select('id');
  if (error) throw error;
  return data?.length ?? 0;
}
