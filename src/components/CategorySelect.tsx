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
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-left bg-white hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors flex items-center justify-between"
      >
        <span className={value ? 'text-gray-800' : 'text-gray-400'}>
          {value || '항목 선택'}
        </span>
        <span className="text-gray-400 text-xs">▼</span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl w-full">
          {/* 스크롤 가능한 목록 */}
          <ul className="max-h-48 overflow-y-auto py-1">
            {categories.map(cat => (
              <li key={cat.id}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(cat.name);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition-colors ${
                    value === cat.name
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700'
                  }`}
                >
                  {value === cat.name && <span className="mr-1">✓</span>}
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>

          {/* 항목 추가 */}
          <div className="border-t border-gray-100 p-2">
            <div className="flex gap-1">
              <input
                type="text"
                value={newCat}
                onChange={e => setNewCat(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                placeholder="새 항목 추가..."
                className="flex-1 px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300"
              />
              <button
                type="button"
                onClick={handleAdd}
                disabled={adding || !newCat.trim()}
                className="px-2 py-1.5 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-40 transition-colors"
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
