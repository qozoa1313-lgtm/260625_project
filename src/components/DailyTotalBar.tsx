import type { Expense } from '../lib/supabase';

type DailyTotalBarProps = {
  expenses: Expense[];
  selectedDate: string;
};

export default function DailyTotalBar({ expenses, selectedDate }: DailyTotalBarProps) {
  const todayExpenses = expenses.filter(e => e.expense_date === selectedDate);
  const total = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
  const formatAmount = (n: number) => n.toLocaleString('ko-KR');

  const displayDate = selectedDate
    ? new Date(selectedDate).toLocaleDateString('ko-KR', {
        month: 'long',
        day: 'numeric',
        weekday: 'short',
      })
    : '';

  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-4 flex items-center justify-between shadow-sm">
      <div className="text-white">
        <p className="text-sm opacity-80">{displayDate} 지출 합계</p>
        <p className="text-2xl font-bold mt-0.5">{formatAmount(total)}원</p>
      </div>
      <div className="text-right text-white opacity-80">
        <p className="text-sm">{todayExpenses.length}건</p>
      </div>
    </div>
  );
}
