import { useState } from 'react';

type DatePickerProps = {
  value: string;
  onChange: (date: string) => void;
};

const DAYS_OF_WEEK = ['일', '월', '화', '수', '목', '금', '토'];

export default function DatePicker({ value, onChange }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const today = new Date();
  const selected = value ? new Date(value) : today;
  const [viewYear, setViewYear] = useState(selected.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected.getMonth());

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const handleSelect = (day: number) => {
    const month = String(viewMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    onChange(`${viewYear}-${month}-${d}`);
    setOpen(false);
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const displayValue = value
    ? new Date(value).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
    : '날짜 선택';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full px-3 py-2 border border-[#D9CFC5] rounded-lg text-sm text-left bg-white text-[#2A1A0E] hover:border-[#8B5E45] focus:outline-none focus:ring-2 focus:ring-[#C4956A] transition-colors"
      >
        📅 {displayValue}
      </button>

      {open && (
        <div className="absolute z-50 mt-1 bg-white border border-[#D9CFC5] rounded-xl shadow-xl w-72">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#EDE5DC]">
            <button type="button" onClick={prevMonth} className="p-1 rounded hover:bg-[#EDE5DC] text-[#6B5248]">‹</button>
            <span className="font-semibold text-sm text-[#2A1A0E]">{viewYear}년 {viewMonth + 1}월</span>
            <button type="button" onClick={nextMonth} className="p-1 rounded hover:bg-[#EDE5DC] text-[#6B5248]">›</button>
          </div>

          <div className="grid grid-cols-7 px-2 pt-2">
            {DAYS_OF_WEEK.map((d, i) => (
              <div
                key={d}
                className={`text-center text-xs font-medium py-1 ${
                  i === 0 ? 'text-red-400' : i === 6 ? 'text-[#8B5E45]' : 'text-[#9A8070]'
                }`}
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 px-2 pb-3">
            {cells.map((day, idx) => {
              if (day === null) return <div key={`empty-${idx}`} />;
              const col = idx % 7;
              const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isSelected = dateStr === value;
              const isToday =
                day === today.getDate() &&
                viewMonth === today.getMonth() &&
                viewYear === today.getFullYear();

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelect(day)}
                  className={`text-center text-sm py-1.5 rounded-lg mx-0.5 my-0.5 transition-colors ${
                    isSelected
                      ? 'bg-[#8B5E45] text-white font-semibold'
                      : isToday
                      ? 'bg-[#F0E6DE] text-[#8B5E45] font-semibold'
                      : col === 0
                      ? 'text-red-500 hover:bg-red-50'
                      : col === 6
                      ? 'text-[#8B5E45] hover:bg-[#F0E6DE]'
                      : 'text-[#2A1A0E] hover:bg-[#EDE5DC]'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
    </div>
  );
}
