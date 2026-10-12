import React from 'react';
import { 
  Wallet, 
  ReceiptText, 
  Banknote, 
  BadgeCheck, 
  FileText 
} from 'lucide-react';
import { DriveIcon } from '../admin/ExpensesTab';

/**
 * ExpensesTab — Resident Society Expenses View.
 * Displays total expenditures summary cards and list of expenses with Google Drive bill preview.
 * Fully responsive: simplified stacked cards on mobile to avoid horizontal scrolling, clean table on desktop.
 */
export default function ExpensesTab({
  expenses,
  selectedYear,
  onViewBill,
}) {
  const periodExpenses = expenses.filter(e => e.date.startsWith(selectedYear.toString()));
  const totalSpent = periodExpenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-soft">
        <h2 className="font-headline-md text-on-surface dark:text-zinc-100 font-extrabold">Society Expenses Tracker</h2>
        <p className="text-xs text-on-surface-variant dark:text-zinc-400 font-medium mt-0.5">Overview of expenditures for {selectedYear}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="relative overflow-hidden bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-soft flex flex-col justify-between space-y-4">
          <div className="relative z-10">
            <span className="text-[11px] sm:text-xs font-bold text-on-surface-variant dark:text-zinc-400 uppercase tracking-wider">Total Expenditures ({selectedYear})</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-on-surface dark:text-zinc-100 mt-1">₹{totalSpent.toLocaleString('en-IN')}</h3>
            <p className="text-xs text-on-surface-variant dark:text-zinc-400 font-medium mt-1">
              Spent across {periodExpenses.length} verified transaction{periodExpenses.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Wallet
            aria-hidden="true"
            className="absolute -bottom-3 -right-3 w-16 h-16 sm:w-20 sm:h-20 text-primary dark:text-zinc-100 opacity-[0.06] dark:opacity-[0.08] stroke-[2] pointer-events-none select-none"
          />
        </div>

        <div className="relative overflow-hidden bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-soft flex flex-col justify-between space-y-4">
          <div className="relative z-10 min-w-0">
            <span className="text-[11px] sm:text-xs font-bold text-on-surface-variant dark:text-zinc-400 uppercase tracking-wider">Latest Expenditure</span>
            <h3 className="text-base sm:text-lg font-bold text-on-surface dark:text-zinc-100 truncate mt-1">
              {periodExpenses[0]?.description || 'No expenses recorded'}
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant dark:text-zinc-400 font-medium mt-1">
              {periodExpenses[0] ? `₹${periodExpenses[0].amount.toLocaleString('en-IN')} on ${periodExpenses[0].date}` : `FY ${selectedYear} to date`}
            </p>
          </div>
          <ReceiptText
            aria-hidden="true"
            className="absolute -bottom-3 -right-3 w-16 h-16 sm:w-20 sm:h-20 text-emerald-600 dark:text-emerald-400 opacity-[0.06] dark:opacity-[0.08] stroke-[2] pointer-events-none select-none"
          />
        </div>
      </div>

      {/* Expense Log Table / Card List */}
      <div className="bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-title-lg font-bold text-on-surface dark:text-zinc-100">Expense Log</h3>
          <span className="text-xs font-bold text-on-surface-variant dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md">
            {periodExpenses.length} entries
          </span>
        </div>

        {periodExpenses.length === 0 ? (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-50/80 via-white to-slate-50/50 dark:from-zinc-900/80 dark:via-zinc-900 dark:to-zinc-800/50 border border-dashed border-slate-200 dark:border-zinc-800 py-12 px-6 flex flex-col items-center text-center">
            {/* Ambient blur */}
            <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-primary/5 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />

            {/* Visual receipt illustration */}
            <div className="relative mb-5">
              <div className="w-36 sm:w-44 h-28 bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700/80 rounded-xl shadow-sm rotate-6 absolute -inset-1 opacity-60" />
              <div className="relative w-36 sm:w-44 h-28 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl shadow-md p-3.5 flex flex-col justify-between -rotate-2 transition-transform duration-300 hover:rotate-0 animate-card-wiggle">
                <div className="flex justify-between items-center border-b border-dashed border-slate-200 dark:border-zinc-700 pb-1.5">
                  <div className="w-8 h-2 bg-slate-200 dark:bg-zinc-700 rounded-full" />
                  <Banknote className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
                </div>
                <div className="space-y-2">
                  <div className="h-1.5 bg-slate-100 dark:bg-zinc-700/60 rounded-full w-5/6 mx-auto" />
                  <div className="h-1.5 bg-slate-100 dark:bg-zinc-700/60 rounded-full w-2/3 mx-auto" />
                </div>
                <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-primary bg-slate-100 dark:bg-zinc-700/60 rounded-full py-0.5 px-2 w-fit mx-auto border border-slate-200 dark:border-zinc-600">
                  <BadgeCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>₹0 Spent</span>
                </div>
              </div>
            </div>

            <h3 className="font-bold text-base sm:text-lg text-on-surface dark:text-zinc-100">
              No Expenses Logged for {selectedYear}
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant dark:text-zinc-400 max-w-sm mt-2 font-mono leading-relaxed">
              No maintenance expenditures or bills have been recorded yet for this year.
            </p>
          </div>
        ) : (
          <div>
            {/* Mobile View: Simplified stacked list (zero horizontal scroll) */}
            <div className="block sm:hidden divide-y divide-slate-100 dark:divide-zinc-800">
              {periodExpenses.map((exp) => (
                <div key={exp.id} className="py-3.5 first:pt-0 last:pb-0 space-y-2">
                  {/* Top row: Date + Category pill + Amount */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-zinc-400">{exp.date}</span>
                      <span className="bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-700 font-bold uppercase text-[10px] font-mono">
                        {exp.category}
                      </span>
                    </div>
                    <span className="text-base font-extrabold text-on-surface dark:text-zinc-100">
                      ₹{exp.amount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Bottom row: Description + Bill Preview CTA */}
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200 leading-snug flex-1">
                      {exp.description}
                    </p>
                    <button
                      onClick={() => onViewBill(exp)}
                      className="p-1.5 border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 rounded-lg shadow-sm flex items-center justify-center transition-all active:scale-95 flex-shrink-0"
                      title="View Bill in Google Drive"
                      aria-label="View Google Drive Bill"
                    >
                      <DriveIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View: Clean Table (sm+) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-semibold">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-800 text-on-surface-variant dark:text-zinc-400 uppercase tracking-wider text-[11px]">
                    <th className="pb-3 pr-3 w-28">Date</th>
                    <th className="pb-3 pr-3 w-36">Category</th>
                    <th className="pb-3 pr-3">Description</th>
                    <th className="pb-3 pr-3 text-right w-28">Amount</th>
                    <th className="pb-3 text-center w-20">Bill</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {periodExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="py-3.5 pr-3 font-mono text-[11px] text-slate-600 dark:text-zinc-400 whitespace-nowrap">{exp.date}</td>
                      <td className="py-3.5 pr-3">
                        <span className="inline-block bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-700 font-bold uppercase text-[11px] font-mono tracking-tight">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-3.5 pr-3 font-medium text-on-surface leading-snug">
                        <div className="font-bold text-slate-800 dark:text-zinc-200">{exp.description}</div>
                      </td>
                      <td className="py-3.5 pr-3 text-right font-extrabold text-on-surface dark:text-zinc-100 text-sm whitespace-nowrap">
                        ₹{exp.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 text-center whitespace-nowrap">
                        <button
                          onClick={() => onViewBill(exp)}
                          className="p-1.5 border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600 rounded-lg shadow-sm inline-flex items-center justify-center transition-all active:scale-95"
                          title="View Bill in Google Drive"
                          aria-label="View Google Drive Bill"
                        >
                          <DriveIcon className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
