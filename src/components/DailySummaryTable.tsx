import type { Expense } from '../lib/supabase';

type DailySummaryTableProps = {
  expenses: Expense[];
};

type DailySummary = {
  date: string;
  total: number;
  count: number;
};

export default function DailySummaryTable({ expenses }: DailySummaryTableProps) {
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

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
  };

  const formatAmount = (n: number) => n.toLocaleString('ko-KR');

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 h-full">
      <h2 className="text-base font-semibold text-gray-800 mb-1">일별 합계</h2>
      <p className="text-xs text-gray-400 mb-4">날짜별 지출 현황</p>

      {summaries.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-gray-300">
          <span className="text-3xl mb-2">💸</span>
          <p className="text-sm">아직 지출 내역이 없습니다</p>
        </div>
      ) : (
        <>
          <div className="overflow-y-auto max-h-96">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-xs font-medium text-gray-400">날짜</th>
                  <th className="text-center py-2 text-xs font-medium text-gray-400">건수</th>
                  <th className="text-right py-2 text-xs font-medium text-gray-400">합계</th>
                </tr>
              </thead>
              <tbody>
                {summaries.map(s => (
                  <tr key={s.date} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2.5 text-xs text-gray-600">{formatDate(s.date)}</td>
                    <td className="py-2.5 text-center">
                      <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">
                        {s.count}건
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-semibold text-gray-800">
                      {formatAmount(s.total)}원
                    </td>
                  </tr>
                ))}
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
