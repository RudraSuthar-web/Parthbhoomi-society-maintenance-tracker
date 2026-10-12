import React, { useContext, useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Calendar, Check } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { CURRENT_MONTH, CURRENT_YEAR, ALL_MONTHS, MONTHS_SHORT } from '../utils/dateUtils';

/**
 * PeriodSelector — year & month selection calendar popover.
 * Fully supports dark & light themes with high visual polish.
 */
export default function PeriodSelector() {
  const {
    selectedYear, setSelectedYear,
    selectedMonth, setSelectedMonth,
    availableYears,
  } = useContext(AppContext);

  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState(selectedYear);
  const popoverRef = useRef(null);

  // Sync viewYear when selectedYear changes from outside
  useEffect(() => {
    setViewYear(selectedYear);
  }, [selectedYear]);

  // Close popover when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const isCurrentPeriod = selectedYear === CURRENT_YEAR && selectedMonth === CURRENT_MONTH;

  const handleSelectMonth = (monthName) => {
    setSelectedYear(viewYear);
    setSelectedMonth(monthName);
    setIsOpen(false);
  };

  const handleTodayClick = (e) => {
    e.stopPropagation();
    setViewYear(CURRENT_YEAR);
    setSelectedYear(CURRENT_YEAR);
    setSelectedMonth(CURRENT_MONTH);
    setIsOpen(false);
  };

  const shortMonth = selectedMonth ? selectedMonth.slice(0, 3) : '';

  return (
    <div className="relative" ref={popoverRef}>
      {/* Trigger pill */}
      <div className="rounded-full lg:rounded-xl border border-slate-300 dark:border-zinc-700 lg:bg-slate-50/80 dark:lg:bg-zinc-800/60 bg-white/80 dark:bg-zinc-800/60 backdrop-blur-md shadow-md overflow-hidden transition-all duration-150">
        <div className="flex items-center justify-between px-3 py-2 gap-2">
          {/* Main button to toggle calendar popover */}
          <button
            type="button"
            onClick={() => {
              setViewYear(selectedYear);
              setIsOpen(prev => !prev);
            }}
            className="flex items-center gap-1.5 text-left group focus:outline-none rounded-full py-0.5 px-1 -ml-1"
            aria-expanded={isOpen}
            aria-label="Select month and year"
          >
            <span className="text-[16px] lg:text-[16px] font-extrabold text-on-surface dark:text-zinc-100 tracking-wide uppercase">
              <span className="inline lg:hidden">{shortMonth}</span>
              <span className="hidden lg:inline">{selectedMonth}</span>
            </span>
            <span className="text-[16px] lg:text-[16px] font-extrabold text-on-surface dark:text-zinc-100 tracking-wide">
              {selectedYear}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 dark:text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary dark:text-white' : 'group-hover:text-slate-600 dark:group-hover:text-zinc-200'}`}
            />
          </button>

          {/* Today button */}
          {!isCurrentPeriod && (
            <button
              type="button"
              onClick={handleTodayClick}
              className="text-[12px] font-bold text-primary dark:text-zinc-900 bg-white dark:bg-zinc-200 border border-slate-300 dark:border-zinc-400 px-2 py-0.5 rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-white active:scale-95 transition-all"
              title="Jump to current month"
            >
              Today
            </button>
          )}
        </div>
      </div>

      {/* Calendar Month + Year Dropdown Popover */}
      {isOpen && (
        <div
          className="absolute z-50 right-0 bottom-full mb-2 md:bottom-auto md:top-full md:mt-2 md:left-0 md:right-auto w-72 sm:w-80 md:w-64 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl dark:shadow-black/70 p-4 md:p-3 animate-fadeIn"
          style={{ minWidth: '18rem' }}
        >
          {/* Popover Header: Year navigator */}
          <div className="flex items-center justify-between pb-3 md:pb-2.5 mb-3 md:mb-2.5 border-b border-slate-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => {
                const prev = viewYear - 1;
                if (availableYears.includes(prev)) setViewYear(prev);
              }}
              disabled={!availableYears.includes(viewYear - 1)}
              className="p-1.5 md:p-1 rounded-xl text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous year"
            >
              <ChevronLeft className="w-5 h-5 md:w-4 md:h-4" />
            </button>

            <div className="flex items-center gap-1.5">
              <span className="text-sm md:text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Year</span>
              <select
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                className="bg-transparent text-base md:text-sm font-extrabold text-on-surface dark:text-zinc-100 cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/40 dark:focus:ring-white/40 rounded pr-1.5 py-0.5 [&>option]:bg-white dark:[&>option]:bg-zinc-900 dark:[&>option]:text-zinc-100"
              >
                {availableYears.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => {
                const next = viewYear + 1;
                if (availableYears.includes(next)) setViewYear(next);
              }}
              disabled={!availableYears.includes(viewYear + 1)}
              className="p-1.5 md:p-1 rounded-xl text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Next year"
            >
              <ChevronRight className="w-5 h-5 md:w-4 md:h-4" />
            </button>
          </div>

          {/* Month Grid (3 columns x 4 rows) */}
          <div className="grid grid-cols-3 gap-2 md:gap-1.5">
            {ALL_MONTHS.map((monthName, idx) => {
              const isSelected = selectedYear === viewYear && selectedMonth === monthName;
              const isCurrent = CURRENT_YEAR === viewYear && CURRENT_MONTH === monthName;
              const shortName = MONTHS_SHORT[idx];

              return (
                <button
                  key={monthName}
                  type="button"
                  onClick={() => handleSelectMonth(monthName)}
                  className={`
                    relative py-3 md:py-2 px-2 md:px-1 text-sm md:text-xs font-bold rounded-xl transition-all duration-150 active:scale-95 flex flex-col items-center justify-center
                    ${
                      isSelected
                        ? 'bg-primary dark:bg-white text-white dark:text-zinc-950 shadow-md font-extrabold'
                        : isCurrent
                        ? 'bg-primary/10 dark:bg-white/10 text-primary dark:text-white border border-primary/30 dark:border-white/30 hover:bg-primary/20 dark:hover:bg-white/20'
                        : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-on-surface dark:hover:text-zinc-100'
                    }
                  `}
                  title={`${monthName} ${viewYear}`}
                >
                  <span className="tracking-wide">{shortName}</span>
                </button>
              );
            })}
          </div>

          {/* Footer Quick Action */}
          <div className="mt-3.5 md:mt-3 pt-2.5 md:pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs md:text-[11px]">
            <button
              type="button"
              onClick={handleTodayClick}
              className="text-primary dark:text-zinc-200 font-bold hover:underline py-1 px-1 rounded active:scale-95 transition-transform"
            >
              Current Month ({CURRENT_MONTH.slice(0, 3)} '{String(CURRENT_YEAR).slice(-2)})
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 font-semibold py-1 px-1.5 rounded active:scale-95 transition-transform"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
