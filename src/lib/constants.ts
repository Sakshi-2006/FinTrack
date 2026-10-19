export const CATEGORIES = [
  'Food',
  'Transport',
  'Rent',
  'Bills',
  'Entertainment',
  'Shopping',
  'Health',
  'Other',
] as const;

export const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Other Income'] as const;

export const PAYMENT_METHODS = ['Cash', 'Card', 'UPI', 'Bank Transfer'] as const;

export const CATEGORY_META: Record<string, { color: string; icon: string }> = {
  Food: { color: '#f97316', icon: 'utensils' },
  Transport: { color: '#0ea5e9', icon: 'car' },
  Rent: { color: '#8b5cf6', icon: 'home' },
  Bills: { color: '#ef4444', icon: 'receipt' },
  Entertainment: { color: '#ec4899', icon: 'film' },
  Shopping: { color: '#10b981', icon: 'shopping-bag' },
  Health: { color: '#14b8a6', icon: 'heart-pulse' },
  Other: { color: '#64748b', icon: 'package' },
  Salary: { color: '#22c55e', icon: 'wallet' },
  Freelance: { color: '#84cc16', icon: 'laptop' },
  Investment: { color: '#06b6d4', icon: 'trending-up' },
  'Other Income': { color: '#a3a3a3', icon: 'circle-dollar-sign' },
};

export function colorFor(category: string): string {
  return CATEGORY_META[category]?.color ?? '#64748b';
}
