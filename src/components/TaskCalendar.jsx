import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const toYMD = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
const endOfMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const startOfWeekMonday = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day + 6) % 7;
  return addDays(d, -diff);
};

export default function TaskCalendar({
  month,
  selectedDate,
  onSelectDate,
  onMonthChange,
  countsByDate = {},
}) {
  const monthStart = useMemo(() => startOfMonth(month), [month]);
  const monthEnd = useMemo(() => endOfMonth(month), [month]);

  const gridStart = useMemo(() => startOfWeekMonday(monthStart), [monthStart]);
  const gridDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 42; i += 1) {
      days.push(addDays(gridStart, i));
    }
    return days;
  }, [gridStart]);

  const selectedYMD = selectedDate ? toYMD(selectedDate) : null;
  const todayYMD = toYMD(new Date());

  const monthLabel = month.toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });

  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  return (
    <div className="col-span-12 md:col-span-4 bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          aria-label="Mois précédent"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
        </button>

        <div className="text-base font-bold text-gray-900 dark:text-white capitalize">
          {monthLabel}
        </div>

        <button
          type="button"
          onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          aria-label="Mois suivant"
        >
          <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-200" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
        {weekDays.map((d) => (
          <div key={d} className="text-center font-semibold">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {gridDays.map((day) => {
          const ymd = toYMD(day);
          const inMonth = day.getMonth() === monthStart.getMonth();
          const isSelected = selectedYMD === ymd;
          const isToday = todayYMD === ymd;
          const count = countsByDate?.[ymd] || 0;

          return (
            <button
              key={ymd}
              type="button"
              onClick={() => onSelectDate(day)}
              className={`relative h-10 rounded-xl text-sm font-medium transition ${
                isSelected
                  ? 'bg-indigo-600 text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              } ${inMonth ? '' : 'opacity-45'} ${
                !isSelected ? 'text-gray-900 dark:text-white' : ''
              }`}
            >
              <span className={`inline-flex items-center justify-center w-full ${isToday && !isSelected ? 'text-indigo-600 dark:text-indigo-400' : ''}`}>
                {day.getDate()}
              </span>

              {count > 0 && (
                <span
                  className={`absolute bottom-1 left-1/2 -translate-x-1/2 h-1.5 rounded-full ${
                    isSelected ? 'bg-white/90' : 'bg-indigo-500'
                  }`}
                  style={{ width: `${Math.min(18, 6 + count * 2)}px` }}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            const t = new Date();
            onMonthChange(new Date(t.getFullYear(), t.getMonth(), 1));
            onSelectDate(t);
          }}
          className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 transition text-sm font-medium"
        >
          Aujourd’hui
        </button>

        <div className="text-xs text-gray-500 dark:text-gray-400">
          {monthStart.toLocaleDateString('fr-FR', { month: 'short' })} {monthEnd.getDate()}
        </div>
      </div>
    </div>
  );
}

