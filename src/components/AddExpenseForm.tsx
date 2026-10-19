import { useState } from 'react';
import { Plus, Loader2, Check, AlertCircle } from 'lucide-react';
import { supabase, type ExpenseInput, type ExpenseType } from '@/lib/supabase';
import { CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from '@/lib/constants';

interface Props {
  onAdded: () => void;
}

export function AddExpenseForm({ onAdded }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [type, setType] = useState<ExpenseType>('Expense');
  const [category, setCategory] = useState<string>('Food');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const categories = type === 'Expense' ? CATEGORIES : INCOME_CATEGORIES;

  function handleTypeChange(t: ExpenseType) {
    setType(t);
    setCategory(t === 'Expense' ? 'Food' : 'Salary');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!date || !category || !Number.isFinite(amt) || amt <= 0) {
      setStatus('error');
      setErrorMsg('Please enter a valid amount, date, and category.');
      return;
    }
    setStatus('saving');
    const input: ExpenseInput = {
      date,
      category,
      description: description.trim() || null,
      amount: amt,
      type,
      payment_method: paymentMethod,
    };
    const { error } = await supabase.from('expenses').insert(input);
    if (error) {
      setStatus('error');
      setErrorMsg(error.message);
      return;
    }
    setStatus('idle');
    setAmount('');
    setDescription('');
    onAdded();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex rounded-lg bg-slate-100 p-1">
        {(['Expense', 'Income'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => handleTypeChange(t)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-semibold transition ${
              type === t ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t === 'Expense' ? 'Expense' : 'Income'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Date">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input"
            max={today}
          />
        </Field>
        <Field label="Amount (₹)">
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="input"
          />
        </Field>
        <Field label="Category">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input">
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Payment Method">
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="input">
            {PAYMENT_METHODS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Description (optional)">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Lunch with team"
          className="input"
          maxLength={80}
        />
      </Field>

      {status === 'error' && (
        <div className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle size={16} /> {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'saving'}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
      >
        {status === 'saving' ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Saving…
          </>
        ) : (
          <>
            <Plus size={16} /> Add {type}
          </>
        )}
      </button>

      <style>{`
        .input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid #e2e8f0;
          background: white;
          padding: 0.55rem 0.75rem;
          font-size: 0.875rem;
          color: #0f172a;
          outline: none;
          transition: border-color .15s, box-shadow .15s;
        }
        .input:focus {
          border-color: #0ea5e9;
          box-shadow: 0 0 0 3px rgba(14,165,233,.15);
        }
      `}</style>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-500">{label}</span>
      {children}
    </label>
  );
}
