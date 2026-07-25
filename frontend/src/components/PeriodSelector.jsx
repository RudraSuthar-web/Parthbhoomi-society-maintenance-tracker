import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { CURRENT_MONTH, CURRENT_YEAR } from '../utils/dateUtils';

/**
 * PeriodSelector — year/month period picker used in both sidebar and mobile header.
 * Reads and writes selectedYear/selectedMonth from AppContext directly.
 */
export default function PeriodSelector() {
  const {
    selectedYear, setSelectedYear,
    selectedMonth, setSelectedMonth,
    availableYears,
  } = useContext(AppContext);

  const isCurrentPeriod = selectedYear === CURRENT_YEAR && selectedMonth === CURRENT_MONTH;

  return (
    <div className="rounded-xl border border-slate-200 lg:bg-slate-50 bg-white shadow-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 pt-2 pb-2">
        <div className="flex items-center">
          <label className="block text-[18px] lg:text-[15px] font-bold text-on-surface-variant uppercase tracking-widest">
            Year
          </label>
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-[18px] lg:text-[15px] font-bold text-primary outline-none cursor-pointer appearance-none pr-8 block text-on-surface-variant tracking-widest px-1"
            >
              {availableYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] lg:text-[15px] pointer-events-none">
              expand_more
            </span>
          </div>
        </div>
        {!isCurrentPeriod && (
          <button
            onClick={() => { setSelectedYear(CURRENT_YEAR); setSelectedMonth(CURRENT_MONTH); }}
            className="text-[15px] lg:text-[12px] font-bold text-primary bg-white border border-slate-300 px-1.5 py-0.5 rounded-md shadow-md transition-all"
            title="Jump to current month"
          >
            Today
          </button>
        )}
      </div>
    </div>
  );
}
