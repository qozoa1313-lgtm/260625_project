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
    <div className="bg-gradient-to-r from-[#8B5E45] to-[#C4956A] rounded-2xl p-4 flex items-center justify-between shadow-sm">
      <div className="text-[#F9F5F1]">
        <p className="text-sm opacity-80">{displayDate} 지출 합계</p>
        <p className="text-2xl font-bold mt-0.5">{formatAmount(total)}원</p>
      </div>
      <div className="text-right text-[#F9F5F1] opacity-80">
        <p className="text-sm">{todayExpenses.length}건</p>
      </div>
    </div>
  );
}
