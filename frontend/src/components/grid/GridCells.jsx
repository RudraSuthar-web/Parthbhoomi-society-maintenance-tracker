import React from 'react';
import { ALL_MONTHS, MONTHS_SHORT, CURRENT_MONTH, CURRENT_YEAR } from '../../utils/dateUtils';

const STATUS = { PAID: 'Paid', UNPAID: 'Unpaid', UNBILLED: 'Unbilled', PARTIAL: 'Partial' };

/**
 * CellContent — tiny component that renders the icon + amount inside a grid cell.
 */
export function CellContent({ due }) {
  if (due.status === STATUS.PAID) {
    return (
      <>
        <span className="material-symbols-outlined text-emerald-600/20 text-[18px] leading-none">verified</span>
        <span className="text-[10px] font-bold text-emerald-700 leading-tight">
          ₹{(due.amountPaid || due.amount || 0).toLocaleString('en-IN')}
        </span>
      </>
    );
  }
  if (due.status === STATUS.PARTIAL) {
    return (
      <>
        <span className="material-symbols-outlined text-amber-500 text-[18px] leading-none">pending</span>
        <span className="text-[10px] font-bold text-amber-700 leading-tight">
          ₹{(due.amountPaid || 0).toLocaleString('en-IN')}
        </span>
      </>
    );
  }
  if (due.status === STATUS.UNPAID) {
    return (
      <>
        <span className="material-symbols-outlined text-error text-[18px] leading-none">cancel</span>
        <span className="text-[10px] font-bold text-error leading-tight">
          ₹{(due.amount || 0).toLocaleString('en-IN')}
        </span>
      </>
    );
  }
  return <span className="text-[13px] font-semibold text-slate-300 select-none">—</span>;
}

/**
 * MonthHeaderCell — th cell for each month column in the grid header.
 */
export function MonthHeaderCell({ month, monthIdx, monthStats, selectedYear }) {
  const stats = monthStats[monthIdx];
  const paid  = stats?.paid ?? 0;
  const rate  = !stats || stats.total === 0 ? 0 : paid / stats.total;
  const isCurrentMonth = ALL_MONTHS[monthIdx] === CURRENT_MONTH && selectedYear === CURRENT_YEAR;

  const rateColor = rate > 0
    ? isCurrentMonth ? 'text-blue-700' : 'text-slate-700'
    : 'text-slate-400';

  return (
    <th
      className={`sticky top-0 z-30 border-b border-r border-slate-200 px-0.5 sm:px-1 py-2 text-center align-bottom select-none min-w-[50px] sm:min-w-[64px] ${
        isCurrentMonth ? 'bg-blue-100/90 backdrop-blur-sm' : 'bg-slate-100/90 backdrop-blur-sm'
      }`}
    >
      <div className="flex flex-col items-center gap-1">
        {isCurrentMonth && (
          <span className="text-[8px] font-bold text-primary uppercase tracking-wide leading-none">Current</span>
        )}
        <span className={`font-bold ${isCurrentMonth ? 'text-[15px]' : 'text-[11px]'} uppercase tracking-wide ${rateColor}`}>
          {MONTHS_SHORT[monthIdx]}
        </span>
      </div>
    </th>
  );
}

export { STATUS };
