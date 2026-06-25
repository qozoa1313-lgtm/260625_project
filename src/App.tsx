import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import type { Category, Expense } from './lib/supabase';
import AddExpenseForm from './components/AddExpenseForm';
import ExpenseRow from './components/ExpenseRow';
import DailySummaryTable from './components/DailySummaryTable';
import DailyTotalBar from './components/DailyTotalBar';

export default function App() {
  const today = new Date().toISOString().split('T')[0];
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    Promise.all([fetchCategories(), fetchExpenses()]).finally(() =>
      setLoading(false)
    );
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true });
    if (data) setCategories(data);
  };

  const fetchExpenses = async () => {
    const { data } = await supabase
      .from('expenses')
      .select('*')
      .order('expense_date', { ascending: false })
      .order('created_at', { ascending: false });
    if (data) setExpenses(data);
  };

  const handleAdd = (expense: Expense) => {
    setExpenses(prev => [expense, ...prev]);
  };

  const handleUpdate = (updated: Expense) => {
    setExpenses(prev => prev.map(e => (e.id === updated.id ? updated : e)));
  };

  const handleDelete = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const filteredExpenses = filterDate
    ? expenses.filter(e => e.expense_date === filterDate)
    : expenses;

  const currentDate = filterDate || today;

  return (
    <div className="min-h-screen bg-[#EAE0D5]">
      {/* 헤더 */}
      <header className="bg-[#2A1A0E] shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💰</span>
            <h1 className="text-xl font-bold text-[#F9F5F1]">가계부</h1>
          </div>
          <p className="text-sm text-[#C4956A]">
            {new Date().toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* 지출 입력 폼 */}
        <AddExpenseForm
          categories={categories}
          onCategoriesChange={setCategories}
          onAdd={handleAdd}
        />

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽: 지출 목록 */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* 일별 합계 바 */}
            <DailyTotalBar expenses={expenses} selectedDate={currentDate} />

            {/* 필터 + 목록 */}
            <div className="bg-[#F9F5F1] rounded-2xl shadow-sm border border-[#D9CFC5] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#EDE5DC] flex items-center justify-between">
                <h2 className="text-base font-semibold text-[#2A1A0E]">지출 내역</h2>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={filterDate}
                    onChange={e => setFilterDate(e.target.value)}
                    className="px-3 py-1.5 text-xs border border-[#D9CFC5] rounded-lg bg-[#EDE5DC] text-[#2A1A0E] focus:outline-none focus:ring-1 focus:ring-[#8B5E45]"
                  />
                  {filterDate && (
                    <button
                      onClick={() => setFilterDate('')}
                      className="text-xs text-[#9A8070] hover:text-[#6B5248]"
                    >
                      전체 보기
                    </button>
                  )}
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-40 text-[#C4B5A8]">
                  <p className="text-sm">불러오는 중...</p>
                </div>
              ) : filteredExpenses.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-[#C4B5A8]">
                  <span className="text-3xl mb-2">📝</span>
                  <p className="text-sm">지출 내역이 없습니다</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#EDE5DC]">
                      <tr>
                        <th className="text-left px-3 py-3 text-xs font-medium text-[#9A8070]">날짜</th>
                        <th className="text-left px-3 py-3 text-xs font-medium text-[#9A8070]">항목</th>
                        <th className="text-left px-3 py-3 text-xs font-medium text-[#9A8070]">지출한 곳</th>
                        <th className="text-right px-3 py-3 text-xs font-medium text-[#9A8070]">금액</th>
                        <th className="px-3 py-3 text-xs font-medium text-[#9A8070]"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExpenses.map(exp => (
                        <ExpenseRow
                          key={exp.id}
                          expense={exp}
                          categories={categories}
                          onCategoriesChange={setCategories}
                          onUpdate={handleUpdate}
                          onDelete={handleDelete}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* 오른쪽: 일별 합계 표 */}
          <div className="lg:col-span-1">
            <DailySummaryTable expenses={expenses} />
          </div>
        </div>
      </main>
    </div>
  );
}
