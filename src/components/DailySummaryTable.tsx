import { useState } from 'react';
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
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  const summaryMap = new Map<string, DailySummary>();
  for (const exp of expenses) {
    const existing = summaryMap.get(exp.expense_date);
    if (existing) {
      existing.total += exp.amount;
      existing.count += 1;
    } else {
      summaryMap.set(exp.expense_date, {
        date: exp.expense_date,
        total: exp.amount,
        count: 1,
      });
    }
  }

  const summaries = Array.from(summaryMap.values()).sort((a, b) =>
    b.date.localeCompare(a.date)
  );
  const grandTotal = summaries.reduce((sum, s) => sum + s.total, 0);

  const getCategoryBreakdown = (date: string): CategoryBreakdown[] => {
    const catMap = new Map<string, CategoryBreakdown>();
    for (const exp of expenses.filter(e => e.expense_date === date)) {
      const existing = catMap.get(exp.category_name);
      if (existing) {
        existing.total += exp.amount;
        existing.count += 1;
      } else {
        catMap.set(exp.category_name, {
          category: exp.category_name,
          total: exp.amount,
          count: 1,
        });
      }
    }
    return Array.from(catMap.values()).sort((a, b) => b.total - a.total);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
  };

  const formatAmount = (n: number) => n.toLocaleString('ko-KR');

  const handleRowClick = (date: string) => {
    setExpandedDate(prev => (prev === date ? null : date));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 h-full">
      <h2 className="text-base font-semibold text-gray-800 mb-1">일별 합계</h2>
      <p className="text-xs text-gray-400 mb-4">날짜를 클릭하면 항목별 내역을 볼 수 있어요</p>

      {summaries.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-gray-300">
          <span className="text-3xl mb-2">💸</span>
          <p className="text-sm">아직 지출 내역이 없습니다</p>
        </div>
      ) : (
        <>
          <div className="overflow-y-auto max-h-[480px]">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-xs font-medium text-gray-400">날짜</th>
                  <th className="text-center py-2 text-xs font-medium text-gray-400">건수</th>
                  <th className="text-right py-2 text-xs font-medium text-gray-400">합계</th>
                </tr>
              </thead>
              <tbody>
                {summaries.map(s => {
                  const isOpen = expandedDate === s.date;
                  const breakdown = isOpen ? getCategoryBreakdown(s.date) : [];

                  return (
                    <>
                      {/* 날짜 행 */}
                      <tr
                        key={s.date}
                        onClick={() => handleRowClick(s.date)}
                        className={`border-b border-gray-50 cursor-pointer transition-colors ${
                          isOpen ? 'bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="py-2.5 text-xs text-gray-600">
                          <span className="inline-block mr-1 text-gray-300 text-[10px]">
                            {isOpen ? '▼' : '▶'}
                          </span>
                          {formatDate(s.date)}
                        </td>
                        <td className="py-2.5 text-center">
                          <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">
                            {s.count}건
                          </span>
                        </td>
                        <td className="py-2.5 text-right font-semibold text-gray-800">
                          {formatAmount(s.total)}원
                        </td>
                      </tr>

                      {/* 항목별 내역 (펼침) */}
                      {isOpen && breakdown.map(b => (
                        <tr key={`${s.date}-${b.category}`} className="bg-blue-50 border-b border-blue-100">
                          <td className="py-2 pl-6 text-xs text-blue-700">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-300 mr-2 align-middle" />
                            {b.category}
                            <span className="ml-1 text-blue-400">({b.count}건)</span>
                          </td>
                          <td />
                          <td className="py-2 text-right text-xs font-medium text-blue-700 pr-0">
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

          {/* 총합 */}
          <div className="mt-4 pt-3 border-t-2 border-gray-200 flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-600">총 합계</span>
            <span className="text-base font-bold text-blue-600">
              {formatAmount(grandTotal)}원
            </span>
          </div>
        </>
      )}
    </div>
  );
}
