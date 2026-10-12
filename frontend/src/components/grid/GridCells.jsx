import React from 'react';
import { ALL_MONTHS, MONTHS_SHORT, CURRENT_MONTH, CURRENT_YEAR } from '../../utils/dateUtils';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

const STATUS = { PAID: 'Paid', UNPAID: 'Unpaid', UNBILLED: 'Unbilled', PARTIAL: 'Partial' };

/**
 * CellContent — renders the icon + amount inside a monthly grid cell.
 * Optimized with Lucide React icons for crisp rendering on all screen sizes.
 */
export function CellContent({ due }) {
  if (due.status === STATUS.PAID) {
    return (
      <>
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600/70 dark:text-emerald-400" />
        <span className="text-[9px] sm:text-[10px] font-bold text-emerald-700 dark:text-emerald-400 leading-none">
          ₹{(due.amountPaid || due.amount || 0).toLocaleString('en-IN')}
        </span>
      </>
    );
  }
  if (due.status === STATUS.PARTIAL) {
    return (
      <>
        <Clock className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
        <span className="text-[9px] sm:text-[10px] font-bold text-amber-700 dark:text-amber-400 leading-none">
          ₹{(due.amountPaid || 0).toLocaleString('en-IN')}
        </span>
      </>
    );
  }
  if (due.status === STATUS.UNPAID) {
    return (
      <>
        <XCircle className="w-3.5 h-3.5 text-error dark:text-red-400" />
        <span className="text-[9px] sm:text-[10px] font-bold text-error dark:text-red-400 leading-none">
          ₹{(due.amount || 0).toLocaleString('en-IN')}
        </span>
      </>
    );
  }
  return <span className="text-xs font-semibold text-slate-300 dark:text-zinc-600 select-none">—</span>;
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
    ? isCurrentMonth ? 'text-black dark:text-white' : 'text-slate-700 dark:text-zinc-200'
    : 'text-slate-400 dark:text-zinc-500';

  return (
    <th
      className={`sticky top-0 z-30 border-b border-r border-slate-200 dark:border-zinc-700 px-0.5 sm:px-1 py-2 text-center align-bottom select-none min-w-[54px] sm:min-w-[64px] ${
        isCurrentMonth ? 'bg-primary/10 dark:bg-primary/20 backdrop-blur-sm' : 'bg-slate-100/90 dark:bg-zinc-800/90 backdrop-blur-sm'
      }`}
    >
      <div className="flex flex-col items-center gap-0.5 sm:gap-1">
        {isCurrentMonth && (
          <span className="text-[7px] sm:text-[8px] font-extrabold text-primary uppercase tracking-wide leading-none">NOW</span>
        )}
        <span className={`font-bold ${isCurrentMonth ? 'text-xs sm:text-[13px]' : 'text-[11px]'} uppercase tracking-wide ${rateColor}`}>
          {MONTHS_SHORT[monthIdx]}
        </span>
      </div>
    </th>
  );
}

export { STATUS };
