import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Category } from '../lib/supabase';

type CategorySelectProps = {
  value: string;
  onChange: (name: string) => void;
  categories: Category[];
  onCategoriesChange: (cats: Category[]) => void;
};

export default function CategorySelect({
  value,
  onChange,
  categories,
  onCategoriesChange,
}: CategorySelectProps) {
  const [open, setOpen] = useState(false);
  const [newCat, setNewCat] = useState('');
  const [adding, setAdding] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleAdd = async () => {
    const trimmed = newCat.trim();
    if (!trimmed || categories.some(c => c.name === trimmed)) return;
    setAdding(true);
    const { data, error } = await supabase
      .from('categories')
      .insert({ name: trimmed })
      .select()
      .single();
    if (!error && data) {
      onCategoriesChange([...categories, data]);
      onChange(data.name);
    }
    setNewCat('');
    setAdding(false);
    setOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full px-3 py-2 border border-[#D9CFC5] rounded-lg text-sm text-left bg-white hover:border-[#8B5E45] focus:outline-none focus:ring-2 focus:ring-[#C4956A] transition-colors flex items-center justify-between"
      >
        <span className={value ? 'text-[#2A1A0E]' : 'text-[#C4B5A8]'}>
          {value || '항목 선택'}
        </span>
        <span className="text-[#9A8070] text-xs">▼</span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 bg-white border border-[#D9CFC5] rounded-xl shadow-xl w-full">
          <ul className="max-h-48 overflow-y-auto py-1">
            {categories.map(cat => (
              <li key={cat.id}>
                <button
                  type="button"
                  onClick={() => { onChange(cat.name); setOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    value === cat.name
                      ? 'bg-[#F0E6DE] text-[#8B5E45] font-medium'
                      : 'text-[#2A1A0E] hover:bg-[#F9F5F1]'
                  }`}
                >
                  {value === cat.name && <span className="mr-1">✓</span>}
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>

          <div className="border-t border-[#EDE5DC] p-2">
            <div className="flex gap-1">
              <input
                type="text"
                value={newCat}
                onChange={e => setNewCat(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                placeholder="새 항목 추가..."
                className="flex-1 px-2 py-1.5 text-xs border border-[#D9CFC5] rounded-lg text-[#2A1A0E] placeholder-[#C4B5A8] focus:outline-none focus:ring-1 focus:ring-[#C4956A]"
              />
              <button
                type="button"
                onClick={handleAdd}
                disabled={adding || !newCat.trim()}
                className="px-2 py-1.5 text-xs bg-[#8B5E45] text-[#F9F5F1] rounded-lg hover:bg-[#6E4A35] disabled:opacity-40 transition-colors"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
