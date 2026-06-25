import { useState, useEffect, useRef } from 'react';
import type { Expense } from '../lib/supabase';

// 초기 로드(fetch)와 신규 추가를 구분하기 위한 플래그

type DailySummaryTableProps = {
  expenses: Expense[];
  filterDate: string;
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

export default function DailySummaryTable({ expenses, filterDate }: DailySummaryTableProps) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(now.getFullYear());
  const pickerRef = useRef<HTMLDivElement>(null);
  const initialLoadDone = useRef(false);

  // 하단 날짜 필터가 바뀌면 오른쪽 월 동기화 (단방향)
  useEffect(() => {
    if (!filterDate) return;
    const [y, m] = filterDate.split('-').map(Number);
    setViewYear(y);
    setViewMonth(m);
    setExpandedDate(null);
  }, [filterDate]);

  // 신규 지출 추가 시에만 해당 월로 이동 (초기 fetch는 무시)
  useEffect(() => {
    if (expenses.length === 0) return;
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      return; // 초기 로드 시 자동 이동 안함 → 오늘 월 유지
    }
    const latest = expenses.reduce((a, b) =>
      a.expense_date > b.expense_date ? a : b
    );
    const [y, m] = latest.expense_date.split('-').map(Number);
    setViewYear(y);
    setViewMonth(m);
    setExpandedDate(null);
  }, [expenses.length]);

  // 팝업 바깥 클릭 시 닫기
  useEffect(() => {
    if (!showPicker) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showPicker]);

  const prevMonth = () => {
    if (viewMonth === 1) { setViewYear(y => y - 1); setViewMonth(12); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 12) { setViewYear(y => y + 1); setViewMonth(1); }
    else setViewMonth(m => m + 1);
  };

  const openPicker = () => {
    setPickerYear(viewYear);
    setShowPicker(true);
  };

  const selectYearMonth = (year: number, month: number) => {
    setViewYear(year);
    setViewMonth(month);
    setExpandedDate(null);
    setShowPicker(false);
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
      <div className="relative flex items-center justify-between bg-[#EDE5DC] rounded-xl px-3 py-2 mb-4">
        <button
          onClick={prevMonth}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#D9CFC5] text-[#6B5248] transition-colors font-bold"
        >
          ‹
        </button>

        <button
          onClick={openPicker}
          className="text-sm font-semibold text-[#2A1A0E] hover:text-[#8B5E45] transition-colors px-2 py-0.5 rounded-lg hover:bg-[#D9CFC5]"
        >
          {viewYear}년 {viewMonth}월
        </button>

        <button
          onClick={nextMonth}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#D9CFC5] text-[#6B5248] transition-colors font-bold"
        >
          ›
        </button>

        {/* 년/월 선택 팝업 */}
        {showPicker && (
          <div
            ref={pickerRef}
            className="absolute z-50 top-full mt-2 left-1/2 -translate-x-1/2 bg-white border border-[#D9CFC5] rounded-2xl shadow-xl p-4 w-64"
          >
            {/* 연도 선택 */}
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setPickerYear(y => y - 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#EDE5DC] text-[#6B5248] font-bold transition-colors"
              >
                ‹
              </button>
              <span className="text-sm font-bold text-[#2A1A0E]">{pickerYear}년</span>
              <button
                onClick={() => setPickerYear(y => y + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#EDE5DC] text-[#6B5248] font-bold transition-colors"
              >
                ›
              </button>
            </div>

            {/* 월 선택 그리드 */}
            <div className="grid grid-cols-4 gap-1">
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <button
                  key={m}
                  onClick={() => selectYearMonth(pickerYear, m)}
                  className={`py-2 text-xs rounded-lg transition-colors font-medium ${
                    pickerYear === viewYear && m === viewMonth
                      ? 'bg-[#8B5E45] text-white'
                      : 'text-[#2A1A0E] hover:bg-[#F0E6DE] hover:text-[#8B5E45]'
                  }`}
                >
                  {m}월
                </button>
              ))}
            </div>
          </div>
        )}
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
