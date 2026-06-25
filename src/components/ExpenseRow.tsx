import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Expense, Category } from '../lib/supabase';
import CategorySelect from './CategorySelect';

type ExpenseRowProps = {
  expense: Expense;
  categories: Category[];
  onCategoriesChange: (cats: Category[]) => void;
  onUpdate: (updated: Expense) => void;
  onDelete: (id: string) => void;
};

export default function ExpenseRow({
  expense,
  categories,
  onCategoriesChange,
  onUpdate,
  onDelete,
}: ExpenseRowProps) {
  const [editing, setEditing] = useState(false);
  const [catName, setCatName] = useState(expense.category_name);
  const [storeName, setStoreName] = useState(expense.store_name);
  const [amount, setAmount] = useState(String(expense.amount));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const parsedAmount = parseInt(amount.replace(/,/g, ''), 10) || 0;
    const cat = categories.find(c => c.name === catName);
    const { data, error } = await supabase
      .from('expenses')
      .update({
        category_id: cat?.id ?? null,
        category_name: catName,
        store_name: storeName,
        amount: parsedAmount,
      })
      .eq('id', expense.id)
      .select()
      .single();
    if (!error && data) {
      onUpdate(data);
      setEditing(false);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm('이 항목을 삭제할까요?')) return;
    await supabase.from('expenses').delete().eq('id', expense.id);
    onDelete(expense.id);
  };

  const formatAmount = (n: number) => n.toLocaleString('ko-KR');

  // 편집 모드: 4열 (날짜 | 항목 | 지출한곳 | 금액+저장/취소)
  if (editing) {
    return (
      <tr className="bg-[#F0E6DE]">
        <td className="px-3 py-2 text-sm text-[#6B5248] whitespace-nowrap">{expense.expense_date}</td>
        <td className="px-3 py-2">
          <CategorySelect
            value={catName}
            onChange={setCatName}
            categories={categories}
            onCategoriesChange={onCategoriesChange}
          />
        </td>
        <td className="px-3 py-2">
          <input
            type="text"
            value={storeName}
            onChange={e => setStoreName(e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-[#D9CFC5] rounded-lg text-[#2A1A0E] focus:outline-none focus:ring-1 focus:ring-[#C4956A]"
          />
        </td>
        <td className="px-3 py-2">
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-24 px-2 py-1.5 text-sm border border-[#D9CFC5] rounded-lg text-right text-[#2A1A0E] focus:outline-none focus:ring-1 focus:ring-[#C4956A]"
            />
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-2 py-1 text-xs bg-[#8B5E45] text-[#F9F5F1] rounded hover:bg-[#6E4A35] disabled:opacity-40 whitespace-nowrap"
            >
              저장
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-2 py-1 text-xs bg-[#EDE5DC] text-[#6B5248] rounded hover:bg-[#D9CFC5] whitespace-nowrap"
            >
              취소
            </button>
          </div>
        </td>
      </tr>
    );
  }

  // 일반 모드: 4열, 마지막 열(금액)에 hover 시 버튼 오버레이
  return (
    <tr className="hover:bg-[#F5EFE9] group border-b border-[#EDE5DC]">
      <td className="px-3 py-2 text-sm text-[#6B5248] whitespace-nowrap">{expense.expense_date}</td>
      <td className="px-3 py-2">
        <span className="inline-block px-2 py-0.5 bg-[#F0E6DE] text-[#8B5E45] rounded-full text-xs font-medium whitespace-nowrap">
          {expense.category_name}
        </span>
      </td>
      <td className="px-3 py-2 text-sm text-[#2A1A0E]">{expense.store_name}</td>
      {/* 금액 셀: hover 시 오른쪽에 버튼 오버레이 */}
      <td className="relative px-3 py-2 text-sm text-right font-medium text-[#2A1A0E] whitespace-nowrap">
        {formatAmount(expense.amount)}원
        <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-1 bg-[#F5EFE9] pl-3 rounded-l-lg h-full">
            <button
              onClick={() => setEditing(true)}
              className="px-2 py-0.5 text-xs bg-[#EDE5DC] text-[#6B5248] rounded hover:bg-[#D9CFC5]"
            >
              수정
            </button>
            <button
              onClick={handleDelete}
              className="px-2 py-0.5 text-xs bg-red-50 text-red-500 rounded hover:bg-red-100"
            >
              삭제
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
}
