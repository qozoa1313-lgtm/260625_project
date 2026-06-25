import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Category, Expense } from '../lib/supabase';
import DatePicker from './DatePicker';
import CategorySelect from './CategorySelect';

type AddExpenseFormProps = {
  categories: Category[];
  onCategoriesChange: (cats: Category[]) => void;
  onAdd: (expense: Expense) => void;
};

export default function AddExpenseForm({
  categories,
  onCategoriesChange,
  onAdd,
}: AddExpenseFormProps) {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [categoryName, setCategoryName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !categoryName || !amount) {
      setError('날짜, 항목, 금액은 필수 입력 항목입니다.');
      return;
    }
    const parsedAmount = parseInt(amount.replace(/,/g, ''), 10);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      setError('올바른 금액을 입력해주세요.');
      return;
    }
    setError('');
    setSaving(true);

    const cat = categories.find(c => c.name === categoryName);
    const { data, error: dbErr } = await supabase
      .from('expenses')
      .insert({
        expense_date: date,
        category_id: cat?.id ?? null,
        category_name: categoryName,
        store_name: storeName,
        amount: parsedAmount,
      })
      .select()
      .single();

    if (dbErr) {
      setError('저장 중 오류가 발생했습니다.');
    } else if (data) {
      onAdd(data);
      setCategoryName('');
      setStoreName('');
      setAmount('');
    }
    setSaving(false);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setAmount(raw ? Number(raw).toLocaleString('ko-KR') : '');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#F9F5F1] rounded-2xl shadow-sm border border-[#D9CFC5] p-5">
      <h2 className="text-base font-semibold text-[#2A1A0E] mb-4">지출 입력</h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="block text-xs font-medium text-[#6B5248] mb-1">날짜</label>
          <DatePicker value={date} onChange={setDate} />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#6B5248] mb-1">항목</label>
          <CategorySelect
            value={categoryName}
            onChange={setCategoryName}
            categories={categories}
            onCategoriesChange={onCategoriesChange}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#6B5248] mb-1">지출한 곳</label>
          <input
            type="text"
            value={storeName}
            onChange={e => setStoreName(e.target.value)}
            placeholder="가게 이름 (선택)"
            className="w-full px-3 py-2 border border-[#D9CFC5] rounded-lg text-sm text-[#2A1A0E] bg-white placeholder-[#C4B5A8] focus:outline-none focus:ring-2 focus:ring-[#C4956A] focus:border-[#8B5E45] transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#6B5248] mb-1">금액 (원)</label>
          <input
            type="text"
            inputMode="numeric"
            value={amount}
            onChange={handleAmountChange}
            placeholder="0"
            className="w-full px-3 py-2 border border-[#D9CFC5] rounded-lg text-sm text-right text-[#2A1A0E] bg-white placeholder-[#C4B5A8] focus:outline-none focus:ring-2 focus:ring-[#C4956A] focus:border-[#8B5E45] transition-colors"
          />
        </div>
      </div>

      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-[#8B5E45] text-[#F9F5F1] text-sm font-medium rounded-lg hover:bg-[#6E4A35] disabled:opacity-40 transition-colors shadow-sm"
        >
          {saving ? '저장 중...' : '+ 추가'}
        </button>
      </div>
    </form>
  );
}
