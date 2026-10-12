import React from 'react';
import { Search, X, ChevronDown, CheckCircle2, Clock, XCircle, HelpCircle } from 'lucide-react';

/**
 * GridToolbar — search, sort controls, and status legend for MonthlyGridView.
 * Fully optimized for both mobile screens and desktop devices.
 */
export default function GridToolbar({ search, setSearch, sortBy, setSortBy }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-soft p-3 sm:px-4 sm:py-3.5 space-y-3 sm:space-y-0 sm:flex sm:flex-wrap lg:flex-nowrap sm:items-center sm:gap-4 print:hidden">

      {/* Row 1 on mobile: Search + Sort controls */}
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[140px] sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search unit or owner..."
            className="w-full pl-9 pr-8 py-2 border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-on-surface dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 text-xs font-mono rounded-lg focus:outline-none focus:border-primary focus:bg-white dark:focus:bg-zinc-800 shadow-inner transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[11px] sm:text-xs font-bold text-on-surface-variant dark:text-zinc-400 uppercase tracking-wider hidden sm:inline">
            Sort
          </span>
          <div className="relative inline-flex items-center">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600 text-on-surface dark:text-zinc-200 text-xs font-bold rounded-lg pl-2.5 pr-7 py-2 outline-none cursor-pointer focus:ring-2 focus:ring-primary/20 appearance-none shadow-sm transition-all"
            >
              <option value="unit" className="dark:bg-zinc-900">Unit No.</option>
              <option value="name" className="dark:bg-zinc-900">Owner Name</option>
              <option value="paid" className="dark:bg-zinc-900">Most Paid</option>
              <option value="unpaid" className="dark:bg-zinc-900">Most Overdue</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute right-2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Row 2 on mobile: Status Legend + Helper Hint */}
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-zinc-800 text-xs">
        {/* Pills */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex-shrink-0" />
            <span className="text-[11px] sm:text-xs font-bold text-on-surface-variant dark:text-zinc-400">Paid</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-red-100 dark:bg-red-950/60 border border-red-300 dark:border-red-800 flex-shrink-0" />
            <span className="text-[11px] sm:text-xs font-bold text-on-surface-variant dark:text-zinc-400">Unpaid</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex-shrink-0" />
            <span className="text-[11px] sm:text-xs font-bold text-on-surface-variant dark:text-zinc-400">Unbilled</span>
          </div>
        </div>

        <span className="text-slate-300 dark:text-zinc-700 hidden md:inline">|</span>

        {/* Hint text */}
        <span className="text-[10px] sm:text-[11px] font-mono text-on-surface-variant dark:text-zinc-400 leading-none">
          Tap any cell to update
        </span>
      </div>

    </div>
  );
}
