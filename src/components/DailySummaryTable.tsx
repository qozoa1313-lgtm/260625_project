import { useState, useEffect } from 'react';
import type { Expense } from '../lib/supabase';

type DailySummaryTableProps = {
  expenses: Expense[];
};

type DailySummary = {
  date: string;
  total: number;
  count: number;
};

type CategoryBreakdown = {
  category: string;
  total: number;
  count: number;
};

export default function DailySummaryTable({ expenses }: DailySummaryTableProps) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  // 새 지출이 추가될 때 가장 최근 지출의 월로 자동 이동
  useEffect(() => {
    if (expenses.length === 0) return;
    const latest = expenses.reduce((a, b) =>
      a.expense_date > b.expense_date ? a : b
    );
    const [y, m] = latest.expense_date.split('-').map(Number);
    setViewYear(y);
    setViewMonth(m);
    setExpandedDate(null);
  }, [expenses.length]);

  const prevMonth = () => {
    if (viewMonth === 1) { setViewYear(y => y - 1); setViewMonth(12); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 12) { setViewYear(y => y + 1); setViewMonth(1); }
    else setViewMonth(m => m + 1);
  };

  const monthStr = `${viewYear}-${String(viewMonth).padStart(2, '0')}`;
  const monthExpenses = expenses.filter(e => e.expense_date.startsWith(monthStr));

  const summaryMap = new Map<string, DailySummary>();
  for (const exp of monthExpenses) {
    const existing = summaryMap.get(exp.expense_date);
    if (existing) {
      existing.total += exp.amount;
      existing.count += 1;
    } else {
      summaryMap.set(exp.expense_date, { date: exp.expense_date, total: exp.amount, count: 1 });
    }
  }

  const summaries = Array.from(summaryMap.values()).sort((a, b) => b.date.localeCompare(a.date));
  const monthTotal = summaries.reduce((sum, s) => sum + s.total, 0);

  const getCategoryBreakdown = (date: string): CategoryBreakdown[] => {
    const catMap = new Map<string, CategoryBreakdown>();
    for (const exp of expenses.filter(e => e.expense_date === date)) {
      const existing = catMap.get(exp.category_name);
      if (existing) {
        existing.total += exp.amount;
        existing.count += 1;
      } else {
        catMap.set(exp.category_name, { category: exp.category_name, total: exp.amount, count: 1 });
      }
    }
    return Array.from(catMap.values()).sort((a, b) => b.total - a.total);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
  };
  const formatAmount = (n: number) => n.toLocaleString('ko-KR');

  return (
    <div className="bg-[#F9F5F1] rounded-2xl shadow-sm border border-[#D9CFC5] p-5 h-full">
      <h2 className="text-base font-semibold text-[#2A1A0E] mb-3">일별 합계</h2>

      {/* 연/월 선택 */}
      <div className="flex items-center justify-between bg-[#EDE5DC] rounded-xl px-3 py-2 mb-4">
        <button
          onClick={prevMonth}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#D9CFC5] text-[#6B5248] transition-colors font-bold"
        >
          ‹
        </button>
        <span className="text-sm font-semibold text-[#2A1A0E]">
          {viewYear}년 {viewMonth}월
        </span>
        <button
          onClick={nextMonth}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#D9CFC5] text-[#6B5248] transition-colors font-bold"
        >
          ›
        </button>
      </div>

      <p className="text-xs text-[#9A8070] mb-3">날짜 클릭 시 항목별 내역을 볼 수 있어요</p>

      {summaries.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-[#C4B5A8]">
          <span className="text-3xl mb-2">💸</span>
          <p className="text-sm">{viewYear}년 {viewMonth}월 지출 내역이 없습니다</p>
        </div>
      ) : (
        <>
          <div className="overflow-y-auto max-h-[420px]">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-[#F9F5F1] z-10">
                <tr className="border-b border-[#D9CFC5]">
                  <th className="text-left py-2 text-xs font-medium text-[#9A8070]">날짜</th>
                  <th className="text-center py-2 text-xs font-medium text-[#9A8070]">건수</th>
                  <th className="text-right py-2 text-xs font-medium text-[#9A8070]">합계</th>
                </tr>
              </thead>
              <tbody>
                {summaries.map(s => {
                  const isOpen = expandedDate === s.date;
                  const breakdown = isOpen ? getCategoryBreakdown(s.date) : [];
                  return (
                    <>
                      <tr
                        key={s.date}
                        onClick={() => setExpandedDate(prev => prev === s.date ? null : s.date)}
                        className={`border-b border-[#EDE5DC] cursor-pointer transition-colors ${
                          isOpen ? 'bg-[#F0E6DE]' : 'hover:bg-[#EDE5DC]'
                        }`}
                      >
                        <td className="py-2.5 text-xs text-[#6B5248]">
                          <span className="inline-block mr-1 text-[#C4B5A8] text-[10px]">
                            {isOpen ? '▼' : '▶'}
                          </span>
                          {formatDate(s.date)}
                        </td>
                        <td className="py-2.5 text-center">
                          <span className="inline-block px-2 py-0.5 bg-[#EDE5DC] text-[#6B5248] rounded-full text-xs">
                            {s.count}건
                          </span>
                        </td>
                        <td className="py-2.5 text-right font-semibold text-[#2A1A0E]">
                          {formatAmount(s.total)}원
                        </td>
                      </tr>

                      {isOpen && breakdown.map(b => (
                        <tr key={`${s.date}-${b.category}`} className="bg-[#F0E6DE] border-b border-[#E8D8CC]">
                          <td className="py-2 pl-6 text-xs text-[#8B5E45]">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#C4956A] mr-2 align-middle" />
                            {b.category}
                            <span className="ml-1 text-[#C4B5A8]">({b.count}건)</span>
                          </td>
                          <td />
                          <td className="py-2 text-right text-xs font-medium text-[#8B5E45] pr-0">
                            {formatAmount(b.total)}원
                          </td>
                        </tr>
                      ))}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-3 border-t-2 border-[#D9CFC5] flex justify-between items-center">
            <span className="text-sm font-semibold text-[#6B5248]">{viewMonth}월 합계</span>
            <span className="text-base font-bold text-[#8B5E45]">
              {formatAmount(monthTotal)}원
            </span>
          </div>
        </>
      )}
    </div>
  );
}
