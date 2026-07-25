import React from 'react';

/**
 * ExpensesTab — Resident Society Expenses View.
 * Displays total expenditures summary cards and list of expenses with Google Drive bill preview.
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
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-soft">
        <h2 className="font-headline-md text-on-surface font-extrabold">Society Expenses Tracker</h2>
        <p className="text-xs text-on-surface-variant font-medium mt-0.5">Overview of expenditures for {selectedYear}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-soft flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Total Expenditures ({selectedYear})</span>
            <span className="material-symbols-outlined text-primary bg-blue-50 p-2 rounded-full">account_balance_wallet</span>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-[#191b23]">₹{totalSpent.toLocaleString('en-IN')}</h3>
            <p className="text-xs text-on-surface-variant font-semibold mt-1">
              Spent across {periodExpenses.length} verified transactions
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-soft flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Recent Expense</span>
            <span className="material-symbols-outlined text-emerald-600 bg-emerald-50 p-2 rounded-full">receipt</span>
          </div>
          <div>
            <h3 className="text-md font-bold text-on-surface truncate">{periodExpenses[0]?.description || 'No expenses recorded'}</h3>
            <p className="text-sm text-on-surface-variant font-semibold mt-1">
              {periodExpenses[0] ? `₹${periodExpenses[0].amount.toLocaleString('en-IN')} on ${periodExpenses[0].date}` : ''}
            </p>
          </div>
        </div>

      </div>

      {/* Expense Log Table */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-soft space-y-8">
        <h3 className="font-title font-bold text-on-surface">Expense Log</h3>

        {periodExpenses.length === 0 ? (
          <p className="text-xs text-on-surface-variant text-center py-6">No expenses recorded for this period.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm font-semibold">
              <thead>
                <tr className="border-b border-slate-200 text-on-surface-variant uppercase tracking-wider">
                  <th className="pb-3 pr-2">Date</th>
                  <th className="pb-3 pr-2">Category</th>
                  <th className="pb-3 pr-2">Description</th>
                  <th className="pb-3 pr-2 text-right">Amount</th>
                  <th className="pb-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {periodExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 pr-2 font-medium">{exp.date}</td>
                    <td className="py-3.5 pr-2">
                        {exp.category}
                      
                    </td>
                    <td className="py-3.5 pr-2 font-bold text-on-surface">{exp.description}</td>
                    <td className="py-3.5 pr-2 text-right font-bold text-on-surface">₹{exp.amount.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 text-center">
                      <button
                        onClick={() => onViewBill(exp)}
                        className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-100 rounded text-[15px] font-bold shadow-soft flex items-center justify-center space-x-1 mx-auto transition-all duration-200 active-scale"
                      >
                        <span className="material-symbols-outlined text-[14px] text-black font-bold">
                          add_to_drive
                        </span>
                        <span>View Bill</span>
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
