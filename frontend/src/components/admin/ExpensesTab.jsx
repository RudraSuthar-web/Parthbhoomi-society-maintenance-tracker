import React from 'react';

/**
 * ExpensesTab — Admin Expense Tracker Tab.
 * Top header with "+ Add Expense" button that opens the centered modal dialog.
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
      <div className="bg-white border border-slate-200 rounded-xl shadow-soft p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display-lg text-on-surface font-extrabold">Society Expense Tracker</h2>
          <p className="text-xs text-on-surface-variant font-medium mt-0.5">
            Manage society expenditures for FY {selectedYear} & auto-sync bill receipts to Google Drive.
          </p>
        </div>
        <button
          onClick={onOpenAddExpense}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg shadow-soft hover:bg-primary-container transition-all active-scale self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Add Expense
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl shadow-soft p-5 flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Total Spent ({selectedYear})</span>
            <span className="material-symbols-outlined text-primary bg-primary-container/10 p-2 rounded-full text-base">account_balance_wallet</span>
          </div>
          <h3 className="text-2xl font-extrabold text-[#191b23]">₹{totalSpent.toLocaleString('en-IN')}</h3>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-soft p-5 flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Storage Status</span>
            <span className="material-symbols-outlined text-blue-700 bg-blue-50 p-2 rounded-full text-base">add_to_drive</span>
          </div>
          <h3 className="text-xs font-extrabold text-black/50  flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">cloud_done</span> Auto Google Drive Sync Active
          </h3>
        </div>
      </div>

      {/* Expenditures Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-soft p-5 sm:p-6 space-y-4">
        <h3 className="font-title-lg font-bold text-on-surface">Expenditures List</h3>
        {periodExpenses.length === 0 ? (
          <p className="text-xs text-on-surface-variant text-center py-6">No expenses found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-semibold">
              <thead>
                <tr className="border-b border-slate-200 text-on-surface-variant uppercase tracking-wider">
                  <th className="pb-3 pr-2">Date</th>
                  <th className="pb-3 pr-2">Category</th>
                  <th className="pb-3 pr-2">Description</th>
                  <th className="pb-3 pr-2 text-right">Amount</th>
                  <th className="pb-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {periodExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 pr-2 font-medium">{exp.date}</td>
                    <td className="py-3 pr-2">
                      <span className="bg-slate-100 text-on-surface px-2 py-0.5 rounded-full border border-slate-200 uppercase text-[9px] font-bold">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3 pr-2 font-bold text-on-surface">{exp.description}</td>
                    <td className="py-3 pr-2 text-right font-bold text-on-surface">₹{exp.amount.toLocaleString('en-IN')}</td>
                    <td className="py-3 text-center flex items-center justify-center gap-2">
                      <button
                        onClick={() => onViewBill(exp)}
                        className="px-2 py-1 border border-slate-200 bg-white hover:bg-slate-100 rounded text-[10px] font-bold shadow-soft flex items-center justify-center gap-1 transition-all active-scale"
                      >
                        <span className="material-symbols-outlined text-[13px] text-amber-500 font-bold">add_to_drive</span>
                        <span>View Bill</span>
                      </button>
                      <button
                        onClick={() => onDeleteExpense(exp)}
                        className="p-1 text-slate-400 hover:text-error hover:bg-red-50 rounded transition-all active-scale"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
