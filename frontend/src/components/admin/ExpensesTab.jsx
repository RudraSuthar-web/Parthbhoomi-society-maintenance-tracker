import React from 'react';
import {
  Wallet,
  ReceiptText,
  Banknote,
  BadgeCheck,
  FileText,
  Plus,
  Trash2,
  CloudCheck,
  HardDrive
} from 'lucide-react';

/**
 * DriveIconSVG — crisp vector Google Drive icon component.
 */
function DriveIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 87.3 78" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066DA"/>
      <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" fill="#00AC47"/>
      <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H59.8l5.95 10.3z" fill="#EA4335"/>
      <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.4-4.5 1.2z" fill="#00832D"/>
      <path d="m59.8 53h27.5c0-1.55-.4-3.1-1.2-4.5l-25.4-44c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8z" fill="#FFBA00"/>
      <path d="m73.55 76.8c1.6 0 3.15-.4 4.5-1.2H24.1c1.35.8 2.9 1.2 4.5 1.2z" fill="#2684FC"/>
    </svg>
  );
}

/**
 * ExpensesTab — Admin Expense Tracker Tab.
 * Top header with "+ Add Expense" button that opens the centered modal dialog.
 * Fully responsive on mobile with clean drive icons and card/scrollable table layout in both light and dark themes.
 */
export default function ExpensesTab({
  expenses,
  selectedYear,
  onOpenAddExpense,
  onViewBill,
  onDeleteExpense,
}) {
  const periodExpenses = expenses.filter(e => e.date.startsWith(selectedYear.toString()));
  const totalSpent = periodExpenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header bar */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-soft p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <h2 className="font-display-lg text-on-surface dark:text-zinc-100 font-extrabold">Society Expense Tracker</h2>
          <p className="text-xs text-on-surface-variant dark:text-zinc-400 font-medium mt-0.5">
            Manage society expenditures for FY {selectedYear} & auto-sync bill receipts to Google Drive.
          </p>
        </div>
        <button
          onClick={onOpenAddExpense}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary dark:bg-white text-white dark:text-zinc-950 text-xs font-bold rounded-lg shadow-soft hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Expense
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Total spent card */}
        <div className="relative overflow-hidden bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-soft p-5 flex flex-col justify-between space-y-4 transition-colors">
          <div className="relative z-10">
            <span className="text-[11px] sm:text-xs font-bold text-on-surface-variant dark:text-zinc-400 uppercase tracking-wider">Total Spent ({selectedYear})</span>
            <h3 className="text-2xl font-extrabold text-on-surface dark:text-zinc-100 mt-1">₹{totalSpent.toLocaleString('en-IN')}</h3>
            <p className="text-xs text-on-surface-variant dark:text-zinc-400 font-medium mt-1">
              {periodExpenses.length} transaction{periodExpenses.length !== 1 ? 's' : ''} recorded
            </p>
          </div>
          <Wallet
            aria-hidden="true"
            className="absolute -bottom-3 -right-3 w-16 h-16 sm:w-20 sm:h-20 text-primary dark:text-zinc-100 opacity-[0.06] dark:opacity-[0.08] stroke-[1] pointer-events-none select-none"
          />
        </div>

        {/* Google Drive Status card */}
        <div className="relative overflow-hidden bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-soft p-5 flex flex-col justify-between space-y-4 transition-colors">
          <div className="relative z-10">
            <span className="text-[11px] sm:text-xs font-bold text-on-surface-variant dark:text-zinc-400 uppercase tracking-wider">Storage Status</span>
            <h3 className="text-sm font-bold text-on-surface dark:text-zinc-100 mt-1 flex items-center gap-1.5">
              <CloudCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span>Auto Google Drive Sync Active</span>
            </h3>
            <p className="text-xs text-on-surface-variant dark:text-zinc-400 font-medium mt-1">
              All receipts automatically linked to Google Drive
            </p>
          </div>
          <div className="absolute -bottom-3 -right-2 opacity-[0.08] dark:opacity-[0.10] pointer-events-none select-none">
            <DriveIcon className="w-16 h-16 sm:w-20 sm:h-20" />
          </div>
        </div>
      </div>

      {/* Expenditures Table */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-soft p-4 sm:p-6 space-y-4 transition-colors">
        <div className="flex items-center justify-between">
          <h3 className="font-title-lg font-bold text-on-surface dark:text-zinc-100">Expenditures List</h3>
          <span className="text-xs font-bold text-on-surface-variant dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md">
            {periodExpenses.length} items
          </span>
        </div>

        {periodExpenses.length === 0 ? (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-50/80 via-white to-slate-50/50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950 border border-dashed border-slate-200 dark:border-zinc-800 py-12 px-6 flex flex-col items-center text-center">
            {/* Ambient blur */}
            <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-primary/5 dark:bg-white/5 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />

            {/* Visual receipt illustration */}
            <div className="relative mb-5">
              <div className="w-36 sm:w-44 h-28 bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700 rounded-xl shadow-sm rotate-6 absolute -inset-1 opacity-60" />
              <div className="relative w-36 sm:w-44 h-28 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl shadow-md p-3.5 flex flex-col justify-between -rotate-2 transition-transform duration-300 hover:rotate-0 animate-card-wiggle">
                <div className="flex justify-between items-center border-b border-dashed border-slate-200 dark:border-zinc-700 pb-1.5">
                  <div className="w-8 h-2 bg-slate-200 dark:bg-zinc-700 rounded-full" />
                  <Banknote className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-1.5 bg-slate-100 dark:bg-zinc-700 rounded-full w-5/6 mx-auto" />
                  <div className="h-1.5 bg-slate-100 dark:bg-zinc-700 rounded-full w-2/3 mx-auto" />
                </div>
                <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-primary dark:text-zinc-200 bg-slate-100 dark:bg-zinc-700 rounded-full py-0.5 px-2 w-fit mx-auto border border-slate-200 dark:border-zinc-600">
                  <BadgeCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  ₹0 Spent
                </div>
              </div>
            </div>

            <h3 className="font-bold text-base sm:text-lg text-on-surface dark:text-zinc-100">
              No Expenditures Logged for {selectedYear}
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant dark:text-zinc-400 max-w-sm mt-1 leading-relaxed">
              Click &quot;+ Add Expense&quot; above to record a new society expenditure and attach its bill receipt.
            </p>
          </div>
        ) : (
          <div>
            {/* Mobile View: Simplified stacked cards (zero horizontal scroll) */}
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

                  {/* Bottom row: Description + Actions */}
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200 leading-snug flex-1">
                      {exp.description}
                    </p>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => onViewBill(exp)}
                        className="p-1.5 border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 rounded-lg shadow-sm flex items-center justify-center transition-all active:scale-95"
                        title="View Bill in Google Drive"
                        aria-label="View Google Drive Bill"
                      >
                        <DriveIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteExpense(exp)}
                        className="p-1.5 text-slate-400 dark:text-zinc-500 hover:text-error dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-all active:scale-95"
                        title="Delete Expense"
                        aria-label="Delete Expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop / Tablet View: Full table (sm+) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-semibold">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-800 text-on-surface-variant dark:text-zinc-400 uppercase tracking-wider text-[11px]">
                    <th className="pb-3 pr-3 w-28">Date</th>
                    <th className="pb-3 pr-3 w-36">Category</th>
                    <th className="pb-3 pr-3">Description</th>
                    <th className="pb-3 pr-3 text-right w-28">Amount</th>
                    <th className="pb-3 text-center w-24">Actions</th>
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
                      <td className="py-3.5 pr-3 font-medium text-on-surface dark:text-zinc-200 leading-snug">
                        <div className="font-bold text-slate-800 dark:text-zinc-100">{exp.description}</div>
                      </td>
                      <td className="py-3.5 pr-3 text-right font-extrabold text-on-surface dark:text-zinc-100 text-sm whitespace-nowrap">
                        ₹{exp.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 text-center whitespace-nowrap">
                        <div className="inline-flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onViewBill(exp)}
                            className="p-1.5 border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600 rounded-lg shadow-sm flex items-center justify-center transition-all active:scale-95"
                            title="View Bill in Google Drive"
                            aria-label="View Google Drive Bill"
                          >
                            <DriveIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteExpense(exp)}
                            className="p-1.5 text-slate-400 dark:text-zinc-500 hover:text-error dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-all active:scale-95"
                            title="Delete Expense"
                            aria-label="Delete Expense"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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

export { DriveIcon };
