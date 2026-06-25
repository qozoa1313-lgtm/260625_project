import { useState } from 'react';
import type { Expense } from '../lib/supabase';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LabelList,
} from 'recharts';

type Props = { expenses: Expense[] };

const pad = (n: number) => String(n).padStart(2, '0');

const shortFmt = (n: number | null): string => {
  if (!n) return '';
  if (n >= 10000) {
    const v = n / 10000;
    return (v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)) + '만';
  }
  if (n >= 1000) return Math.round(n / 1000) + '천';
  return String(n);
};

const fmt = (n: number) => n.toLocaleString('ko-KR');

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.[0]?.value) return null;
  return (
    <div className="bg-white border border-[#D9CFC5] rounded-xl px-3 py-2 shadow-lg">
      <p className="text-xs text-[#6B5248] mb-0.5">{label}일</p>
      <p className="text-sm font-bold text-[#8B5E45]">{fmt(payload[0].value)}원</p>
    </div>
  );
}

export default function ChartPage({ expenses }: Props) {
  const seoulToday = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });
  const [sy, sm] = seoulToday.split('-').map(Number);
  const [viewYear, setViewYear] = useState(sy);
  const [viewMonth, setViewMonth] = useState(sm);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const monthStr = `${viewYear}-${pad(viewMonth)}`;
  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();

  const chartData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dateStr = `${monthStr}-${pad(day)}`;
    const total = expenses
      .filter(e => e.expense_date === dateStr)
      .reduce((s, e) => s + e.amount, 0);
    return { day, amount: total > 0 ? total : null, dateStr };
  });

  const maxAmount = Math.max(...chartData.map(d => d.amount ?? 0));
  const maxDay = chartData.find(d => (d.amount ?? 0) === maxAmount && maxAmount > 0);
  const hasData = chartData.some(d => d.amount);

  // 선택된 날짜 상세
  const selectedExps = selectedDay
    ? expenses.filter(e => e.expense_date === `${monthStr}-${pad(selectedDay)}`)
    : [];
  const catMap = new Map<string, number>();
  for (const e of selectedExps) catMap.set(e.category_name, (catMap.get(e.category_name) ?? 0) + e.amount);
  const breakdown = Array.from(catMap.entries())
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total);
  const topCat = breakdown[0];
  const dayTotal = selectedExps.reduce((s, e) => s + e.amount, 0);

  // 커스텀 점 렌더러
  const renderDot = (dotProps: any) => {
    const { cx, cy, payload } = dotProps;
    if (!payload.amount) return <circle key={`dot-empty-${payload.day}`} cx={cx} cy={cy} r={0} fill="none" />;
    const isMax = payload.day === maxDay?.day;
    const isSel = payload.day === selectedDay;
    return (
      <circle
        key={`dot-${payload.day}`}
        cx={cx}
        cy={cy}
        r={isMax ? 9 : isSel ? 7 : 5}
        fill={isMax ? '#8B5E45' : isSel ? '#C4956A' : '#D4A882'}
        stroke="white"
        strokeWidth={2}
      />
    );
  };

  // 커스텀 라벨 렌더러
  const renderLabel = (labelProps: any) => {
    const { x, y, value, index } = labelProps;
    if (!value || x === undefined || y === undefined) return null;
    const day = chartData[index]?.day;
    const isMax = day === maxDay?.day;
    const isSel = day === selectedDay;
    return (
      <text
        key={`lbl-${day}`}
        x={x}
        y={y - (isMax ? 18 : 13)}
        textAnchor="middle"
        fontSize={isMax ? 12 : 9}
        fontWeight={isMax ? '700' : '400'}
        fill={isMax ? '#8B5E45' : isSel ? '#C4956A' : '#6B5248'}
      >
        {shortFmt(value)}
      </text>
    );
  };

  const handleChartClick = (state: any) => {
    if (state?.activePayload?.[0]?.payload?.amount) {
      const day = state.activePayload[0].payload.day as number;
      setSelectedDay(prev => prev === day ? null : day);
    }
  };

  return (
    <div className="min-h-screen bg-[#EAE0D5] pb-20">
      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* 연/월 선택 */}
        <div className="bg-[#F9F5F1] rounded-2xl shadow-sm border border-[#D9CFC5] p-5 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => setViewYear(y => y - 1)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#EDE5DC] text-[#6B5248] font-bold transition-colors"
            >
              ‹
            </button>
            <span className="font-bold text-[#2A1A0E] text-sm">{viewYear}년</span>
            <button
              onClick={() => setViewYear(y => y + 1)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#EDE5DC] text-[#6B5248] font-bold transition-colors"
            >
              ›
            </button>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <button
                key={m}
                onClick={() => { setViewMonth(m); setSelectedDay(null); }}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  m === viewMonth
                    ? 'bg-[#8B5E45] text-white shadow-sm'
                    : 'bg-[#EDE5DC] text-[#6B5248] hover:bg-[#D9CFC5]'
                }`}
              >
                {m}월
              </button>
            ))}
          </div>
        </div>

        {/* 차트 + 상세 패널 */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* 꺾은선 그래프 */}
          <div className="lg:col-span-3 bg-[#F9F5F1] rounded-2xl shadow-sm border border-[#D9CFC5] p-5">
            <h2 className="text-base font-semibold text-[#2A1A0E] mb-1">
              {viewYear}년 {viewMonth}월 일별 지출
            </h2>

            {maxDay && (
              <div className="inline-flex items-center gap-1.5 bg-[#F0E6DE] rounded-lg px-3 py-1.5 mb-4">
                <span className="text-[#8B5E45] text-xs">🔥 최다 지출일</span>
                <span className="text-[#8B5E45] font-bold text-sm">
                  {maxDay.day}일 ({fmt(maxAmount)}원)
                </span>
              </div>
            )}

            {!hasData ? (
              <div className="flex flex-col items-center justify-center h-64 text-[#C4B5A8]">
                <span className="text-3xl mb-2">💸</span>
                <p className="text-sm">{viewYear}년 {viewMonth}월 지출 내역이 없습니다</p>
              </div>
            ) : (
              <>
                <div style={{ cursor: 'pointer' }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={chartData}
                      margin={{ top: 36, right: 16, bottom: 4, left: 8 }}
                      onClick={handleChartClick}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#EDE5DC" vertical={false} />
                      <XAxis
                        dataKey="day"
                        tick={{ fontSize: 11, fill: '#9A8070' }}
                        tickLine={false}
                        axisLine={{ stroke: '#D9CFC5' }}
                        interval={daysInMonth > 20 ? 2 : 0}
                      />
                      <YAxis hide />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#D9CFC5', strokeWidth: 1 }} />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="#C4956A"
                        strokeWidth={2.5}
                        dot={renderDot}
                        activeDot={false}
                        connectNulls={false}
                      >
                        <LabelList dataKey="amount" content={renderLabel} />
                      </Line>
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-center text-xs text-[#C4B5A8] mt-1">
                  날짜를 클릭하면 오른쪽에 상세 내역이 표시됩니다
                </p>
              </>
            )}
          </div>

          {/* 일별 상세 패널 */}
          <div className="lg:col-span-2 bg-[#F9F5F1] rounded-2xl shadow-sm border border-[#D9CFC5] p-5">
            {selectedDay ? (
              <>
                <div className="flex items-baseline gap-2 mb-4">
                  <h2 className="text-base font-semibold text-[#2A1A0E]">
                    {viewMonth}월 {selectedDay}일
                  </h2>
                  {dayTotal > 0 && (
                    <span className="text-xs text-[#9A8070]">총 {fmt(dayTotal)}원</span>
                  )}
                </div>

                {breakdown.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-[#C4B5A8]">
                    <span className="text-3xl mb-2">📭</span>
                    <p className="text-sm">이 날은 지출이 없습니다</p>
                  </div>
                ) : (
                  <>
                    {/* 최다 지출 항목 - 크게 */}
                    <div className="bg-gradient-to-br from-[#8B5E45] to-[#C4956A] rounded-2xl p-5 mb-4 shadow-sm">
                      <p className="text-xs text-[#F0E6DE] opacity-80 mb-1 tracking-wide">최다 지출 항목</p>
                      <p className="text-xl font-bold text-white leading-tight">{topCat.name}</p>
                      <p className="text-3xl font-bold text-white mt-1.5">{fmt(topCat.total)}<span className="text-lg ml-1">원</span></p>
                    </div>

                    {/* 항목별 목록 */}
                    <div className="space-y-2">
                      {breakdown.map((cat, i) => (
                        <div
                          key={cat.name}
                          className={`flex justify-between items-center px-4 py-3 rounded-xl border ${
                            i === 0
                              ? 'bg-[#F0E6DE] border-[#D9CFC5]'
                              : 'bg-[#EDE5DC] border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#C4B5A8] w-5">#{i + 1}</span>
                            <span className="text-sm font-medium text-[#2A1A0E]">{cat.name}</span>
                          </div>
                          <span className={`text-sm font-semibold ${i === 0 ? 'text-[#8B5E45]' : 'text-[#6B5248]'}`}>
                            {fmt(cat.total)}원
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[240px] text-[#C4B5A8]">
                <span className="text-5xl mb-4">📅</span>
                <p className="text-sm text-center leading-relaxed">
                  그래프에서 날짜를 클릭하면<br />항목별 지출 내역이<br />여기에 표시됩니다
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
