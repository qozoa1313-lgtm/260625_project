import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import type { Category, Expense } from './lib/supabase';
import AddExpenseForm from './components/AddExpenseForm';
import ExpenseRow from './components/ExpenseRow';
import DailySummaryTable from './components/DailySummaryTable';
import DailyTotalBar from './components/DailyTotalBar';
import ChartPage from './pages/ChartPage';

type Page = 'home' | 'chart';

const getSeoulDate = () =>
  new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(getSeoulDate);
  const [clockNow, setClockNow] = useState(new Date());

  useEffect(() => {
    Promise.all([fetchCategories(), fetchExpenses()]).finally(() =>
      setLoading(false)
    );
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setClockNow(new Date()), 1000);
    return () => clearInterval(timer);
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

  const handleAdd = (expense: Expense) => setExpenses(prev => [expense, ...prev]);
  const handleUpdate = (updated: Expense) => setExpenses(prev => prev.map(e => e.id === updated.id ? updated : e));
  const handleDelete = (id: string) => setExpenses(prev => prev.filter(e => e.id !== id));

  const filteredExpenses = filterDate
    ? expenses.filter(e => e.expense_date === filterDate)
    : expenses;

  const currentDate = filterDate || getSeoulDate();

  const headerDate = clockNow.toLocaleDateString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  });
  const headerTime = clockNow.toLocaleTimeString('ko-KR', {
    timeZone: 'Asia/Seoul',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  return (
    <div className="min-h-screen bg-[#EAE0D5]">
      {/* 헤더 */}
      <header className="bg-[#2A1A0E] shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💰</span>
            <h1 className="text-xl font-bold text-[#F9F5F1]">어서오세요</h1>
          </div>
          <p className="text-sm text-white">{headerDate}&nbsp;&nbsp;{headerTime}</p>
        </div>

        {/* 상단 탭 */}
        <div className="max-w-7xl mx-auto px-4 flex border-t border-[#3D2A1A]">
          <button
            onClick={() => setPage('home')}
            className={`px-6 py-2.5 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
              page === 'home' ? 'border-[#C4956A] text-[#C4956A]' : 'border-transparent text-[#6B5248] hover:text-[#9A8070]'
            }`}
          >
            📒 가계부
          </button>
          <button
            onClick={() => setPage('chart')}
            className={`px-6 py-2.5 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
              page === 'chart' ? 'border-[#C4956A] text-[#C4956A]' : 'border-transparent text-[#6B5248] hover:text-[#9A8070]'
            }`}
          >
            📊 그래프
          </button>
        </div>
      </header>

      {page === 'home' ? (
        <main className="max-w-7xl mx-auto px-4 py-6">
          <AddExpenseForm
            categories={categories}
            onCategoriesChange={setCategories}
            onAdd={handleAdd}
          />

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col gap-4">
              <DailyTotalBar expenses={expenses} selectedDate={currentDate} />

              <div className="bg-[#F9F5F1] rounded-2xl shadow-sm border border-[#D9CFC5] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#EDE5DC] flex items-center justify-between">
                  <h2 className="text-base font-semibold text-[#2A1A0E]">지출 내역</h2>
                  <input
                    type="date"
                    value={filterDate}
                    onChange={e => setFilterDate(e.target.value)}
                    className="px-3 py-1.5 text-xs border border-[#D9CFC5] rounded-lg bg-[#EDE5DC] text-[#2A1A0E] focus:outline-none focus:ring-1 focus:ring-[#8B5E45]"
                  />
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

            <div className="lg:col-span-1">
              <DailySummaryTable expenses={expenses} filterDate={filterDate} />
            </div>
          </div>
        </main>
      ) : (
        <ChartPage expenses={expenses} />
      )}
    </div>
  );
}
