import React from 'react';

/**
 * GridToolbar — search, sort controls, and legend for MonthlyGridView.
 */
export default function GridToolbar({ search, setSearch, sortBy, setSortBy }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-soft px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 print:hidden">

      {/* Search */}
      <div className="relative flex-1 max-w-xs">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">search</span>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search.."
          className="w-full pl-9 pr-3 py-1.5 border border-slate-200 bg-slate-50 text-on-surface text-xs font-semibold rounded-lg focus:outline-none focus:border-primary focus:bg-white transition-all"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        )}
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider whitespace-nowrap">Sort</span>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="border border-slate-200 bg-slate-50 text-on-surface text-xs font-bold rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary transition-all"
        >
          <option value="unit">Unit No.</option>
          <option value="name">Owner Name</option>
          <option value="paid">Most Paid</option>
          <option value="unpaid">Most Overdue</option>
        </select>
        <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block" />
      </div>

      {/* Spacer */}
      <div className="hidden sm:block flex-1" />

      {/* Legend */}
      <div className="flex items-center gap-3 flex-wrap text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-emerald-100 border border-emerald-300 flex-shrink-0" />
          <span className="font-semibold text-on-surface-variant">Paid</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-red-100 border border-red-300 flex-shrink-0" />
          <span className="font-semibold text-on-surface-variant">Unpaid</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-slate-100 border border-slate-200 flex-shrink-0" />
          <span className="font-semibold text-on-surface-variant">Unbilled</span>
        </div>
        <span className="text-slate-300">|</span>
        <span className="text-[12px] text-on-surface-variant italic">Click any billed cell to toggle status</span>
      </div>
    </div>
  );
}
