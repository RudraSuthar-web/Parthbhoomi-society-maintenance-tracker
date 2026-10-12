import React from 'react';
import { createPortal } from 'react-dom';
import { Home } from 'lucide-react';
import { ALL_MONTHS, CURRENT_MONTH, CURRENT_YEAR, getBilledMonths } from '../../utils/dateUtils';
import { CellContent, MonthHeaderCell, STATUS } from './GridCells';
import SOCIETY_CONFIG from '../../config/societyConfig';

/**
 * GridTable — the main scrollable table with:
 *   - sticky unit/owner column
 *   - 12 month columns
 *   - sticky YTD summary column
 *   - grand-total footer row
 *   - hover tooltip portal
 */
export default function GridTable({
  sorted, selectedYear, maintenanceAmount,
  monthStats, grandCollected,
  tooltip,
  onCellClick,
  onCellMouseEnter,
  onCellMouseLeave,
}) {
  return (
    <>
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-soft overflow-hidden print:border-none print:shadow-none print:overflow-visible print:bg-white print:rounded-none">

        {/* Print-only header */}
        <div className="hidden print:block mb-4 pb-2 border-b-2 border-slate-900 text-black">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black uppercase tracking-wide text-black">{SOCIETY_CONFIG.name}</h1>
              <p className="text-xs font-semibold text-slate-700 mt-0.5">
                Annual Maintenance Register · Financial Year {selectedYear}
              </p>
            </div>
            <div className="text-right text-[11px] font-mono text-slate-600">
              <p><span className="font-semibold text-slate-900">Total Units:</span> {sorted.length}</p>
              <p><span className="font-semibold text-slate-900">Maintenance:</span> ₹{maintenanceAmount.toLocaleString('en-IN')}/month</p>
            </div>
          </div>
        </div>

        <div className="overflow-auto max-h-[580px] sm:max-h-[calc(120vh-260px)] thin-scrollbar print:max-h-none print:overflow-visible relative">
          <table className="border-collapse text-xs w-full min-w-max print:min-w-full print:w-full print:text-[10px] print:border print:border-slate-300">
            <thead>
              <tr className="bg-slate-100 dark:bg-zinc-800 print:bg-slate-200">
                {/* Unit/Owner col header - sticky top & left */}
                <th className="sticky top-0 left-0 z-40 print:static print:z-auto bg-slate-100 dark:bg-zinc-800 print:bg-slate-200 border-b border-r border-slate-200 dark:border-zinc-700 print:border-slate-300 px-2 sm:px-4 py-3 print:py-1.5 text-left w-[110px] sm:w-auto max-w-[110px] sm:max-w-none print:w-36 print:max-w-none shadow-[2px_0_5px_rgba(0,0,0,0.06)] print:shadow-none">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant dark:text-zinc-300 print:text-black uppercase tracking-wider overflow-hidden">
                    <Home className="w-3.5 h-3.5 hidden sm:block print:hidden text-slate-500 dark:text-zinc-400" />
                    <span className="truncate print:whitespace-nowrap">Unit / Resident</span>
                  </div>
                </th>

                {/* Month columns */}
                {ALL_MONTHS.map((month, idx) => (
                  <MonthHeaderCell
                    key={month}
                    month={month}
                    monthIdx={idx}
                    monthStats={monthStats}
                    selectedYear={selectedYear}
                  />
                ))}

                {/* YTD col header - sticky top & right */}
                <th
                  className="hidden sm:table-cell print:table-cell sticky top-0 right-0 z-40 print:static print:z-auto bg-slate-100/95 dark:bg-zinc-800/95 print:bg-slate-200 backdrop-blur-sm border-b border-l border-slate-200 dark:border-zinc-700 print:border-slate-300 px-3 py-3 print:py-1.5 text-center shadow-sm print:shadow-none"
                  style={{ minWidth: '70px' }}
                >
                  <span className="text-[12px] print:text-[10px] font-bold text-on-surface-variant dark:text-zinc-300 print:text-black uppercase tracking-wider">Paid / {getBilledMonths(selectedYear)}</span>
                </th>
              </tr>
            </thead>


            <tbody>
              {sorted.map((tenement, rowIdx) => {
                const paidCount    = tenement.dues.filter(d => d.status === STATUS.PAID    && d.year === selectedYear).length;
                const partialCount = tenement.dues.filter(d => d.status === STATUS.PARTIAL && d.year === selectedYear).length;
                const unpaidCount  = tenement.dues.filter(d => d.status === STATUS.UNPAID  && d.year === selectedYear).length;
                const billedMonths = getBilledMonths(selectedYear);
                const isEven = rowIdx % 2 === 0;

                return (
                  <tr
                    key={tenement.tenementNumber}
                    className={`group transition-colors duration-100 hover:bg-blue-50/40 dark:hover:bg-zinc-800/60 print:break-inside-avoid print:border-b print:border-slate-300 ${isEven ? 'bg-white dark:bg-zinc-900 print:bg-white' : 'bg-slate-50/40 dark:bg-zinc-900/60 backdrop-blur-lg print:bg-slate-50/50 print:backdrop-blur-none'}`}
                  >
                    {/* Identity cell */}
                    <td
                      className={`sticky left-0 z-10 print:static print:z-auto border-b border-r border-slate-100 dark:border-zinc-800 print:border-slate-300 px-2 sm:px-3 py-3 print:py-1.5 transition-colors duration-100 w-[110px] sm:w-auto max-w-[110px] sm:max-w-none print:max-w-none print:w-36 print:whitespace-nowrap shadow-[2px_0_5px_rgba(0,0,0,0.06)] print:shadow-none ${isEven ? 'bg-white dark:bg-zinc-900 print:bg-transparent group-hover:bg-blue-50/40 dark:group-hover:bg-zinc-800/60' : 'bg-slate-50/40 dark:bg-zinc-900/60 print:bg-transparent group-hover:bg-blue-50/40 dark:group-hover:bg-zinc-800/60 backdrop-blur-lg print:backdrop-blur-none'}`}
                    >
                      <div className="flex items-center gap-1.5 sm:gap-2.5 print:gap-1.5 print:overflow-visible">
                        <div className="relative rounded-full flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 print:w-5 print:h-5">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 print:w-5 print:h-5 rounded-full bg-white dark:bg-zinc-800 print:bg-slate-100 text-black dark:text-white print:text-black border border-slate-200 dark:border-zinc-700 print:border-slate-400 flex items-center justify-center font-bold text-[9px] sm:text-xs print:text-[9px] shadow-lg print:shadow-none">
                            {tenement.tenementNumber}
                          </div>
                        </div>
                        <div className="min-w-0 overflow-hidden print:overflow-visible">
                          <p className="font-bold text-on-surface dark:text-zinc-200 print:text-black text-[10px] sm:text-xs print:text-[10px] truncate max-w-[70px] sm:max-w-[120px] print:whitespace-nowrap print:max-w-none print:overflow-visible">
                            {tenement.ownerName.split(' ')[0]}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Month cells */}
                    {ALL_MONTHS.map(month => {
                      const due = tenement.dues.find(d => d.month === month && d.year === selectedYear) || {
                        month,
                        year: selectedYear,
                        status: STATUS.UNBILLED,
                        amount: maintenanceAmount,
                        amountPaid: 0,
                        installments: [],
                      };

                      const isPaid     = due.status === STATUS.PAID;
                      const isPartial  = due.status === STATUS.PARTIAL;
                      const isUnpaid   = due.status === STATUS.UNPAID;
                      const isUnbilled = due.status === STATUS.UNBILLED;
                      const isCurrent  = month === CURRENT_MONTH && selectedYear === CURRENT_YEAR;

                      const cellCls = [
                        'border-b border-r px-0.5 py-1 print:py-0.5 print:border-slate-300 transition-colors duration-100 cursor-pointer',
                        isPaid    ? 'border-emerald-100 dark:border-emerald-950/50 bg-emerald-50/40 dark:bg-emerald-950/20 print:bg-emerald-50/70 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
                        : isPartial ? 'border-amber-100 dark:border-amber-950/50 bg-amber-50 dark:bg-amber-950/20 print:bg-amber-50/70 hover:bg-amber-100 dark:hover:bg-amber-900/30'
                        : isUnpaid  ? 'border-red-100 dark:border-red-950/50 bg-red-50 dark:bg-red-950/20 print:bg-red-50/70 hover:bg-red-100 dark:hover:bg-red-900/30'
                        : 'border-slate-100 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 print:bg-white hover:bg-slate-100 dark:hover:bg-zinc-800',
                      ].join(' ');

                      return (
                        <td key={month} className={cellCls}>
                          <div
                            role="button"
                            tabIndex={0}
                            aria-label={`${month} ${selectedYear}: ${due.status} — Unit ${tenement.tenementNumber}`}
                            className="flex flex-col items-center justify-center gap-0.5 rounded mx-0.5 min-h-[42px] print:min-h-[28px] transition-all duration-100"
                            onClick={() => onCellClick(tenement.tenementNumber, month, due.status, due)}
                            onKeyDown={e => e.key === 'Enter' && onCellClick(tenement.tenementNumber, month, due.status, due)}
                            onMouseEnter={e => onCellMouseEnter(e, due)}
                            onMouseLeave={onCellMouseLeave}
                          >
                            <CellContent due={due} />
                          </div>
                        </td>
                      );
                    })}

                    {/* YTD column */}
                    <td
                      className={`hidden sm:table-cell print:table-cell sticky right-0 z-10 print:static print:z-auto border-b border-l border-slate-100 dark:border-zinc-800 print:border-slate-300 px-2 py-2 print:py-1 text-center transition-colors duration-100 ${isEven ? 'bg-white dark:bg-zinc-900 print:bg-white group-hover:bg-blue-50/40 dark:group-hover:bg-zinc-800/60' : 'bg-slate-50/40 dark:bg-zinc-900/60 print:bg-slate-50/50 group-hover:bg-blue-50/40 dark:group-hover:bg-zinc-800/60'}`}
                    >
                      <div className="flex flex-col items-center gap-0.5">
                        <span className={`font-extrabold text-sm print:text-xs leading-tight ${
                          billedMonths === 0 ? 'text-slate-400 dark:text-zinc-500'
                          : paidCount >= billedMonths ? 'text-emerald-600 dark:text-emerald-400 print:text-emerald-700'
                          : paidCount >= Math.ceil(billedMonths * 0.75) ? 'text-emerald-600 dark:text-emerald-400 print:text-emerald-700'
                          : paidCount >= Math.ceil(billedMonths * 0.5)  ? 'text-primary/70 dark:text-white print:text-slate-800'
                          : 'text-error dark:text-red-400 print:text-red-600'
                        }`}>
                          {paidCount}/{billedMonths}
                        </span>
                        {partialCount > 0 && (
                          <span className="text-[9px] print:text-[8px] font-bold text-amber-600 dark:text-amber-400 print:text-amber-700">{partialCount}p</span>
                        )}
                        <div className="w-9 h-1 bg-slate-200 dark:bg-zinc-700 rounded-full overflow-hidden print:hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              billedMonths === 0 ? 'bg-slate-300 dark:bg-zinc-600'
                              : paidCount >= billedMonths ? 'bg-emerald-600 dark:bg-emerald-500'
                              : paidCount >= Math.ceil(billedMonths * 0.75) ? 'bg-green-600 dark:bg-green-500'
                              : paidCount >= Math.ceil(billedMonths * 0.5)  ? 'bg-primary/70'
                              : 'bg-red-400'
                            }`}
                            style={{ width: billedMonths > 0 ? `${(paidCount / billedMonths) * 100}%` : '0%' }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Footer totals row - sticky bottom */}
            <tfoot className="print:table-footer-group">
              <tr className="bg-primary print:bg-slate-200 print:border-t-2 print:border-slate-800">
                <td className="sticky bottom-0 left-0 z-40 bg-primary print:bg-slate-200 print:static print:z-auto border-t border-slate-700 dark:border-zinc-700 print:border-slate-300 px-2 sm:px-4 py-3 print:py-2 w-[110px] sm:w-auto max-w-[110px] sm:max-w-none shadow-[2px_0_5px_rgba(0,0,0,0.08)] print:shadow-none">
                  <div className="flex items-center gap-1.5 text-[9px] sm:text-[13px] print:text-[11px] font-bold text-white print:text-black uppercase tracking-wider truncate">
                    Total
                  </div>
                </td>
                {monthStats.map(stats => (
                  <td key={stats.month} className="sticky bottom-0 z-30 bg-primary print:bg-slate-200 print:static print:z-auto border-t border-slate-700 dark:border-zinc-700 print:border-slate-300 px-1 py-3 print:py-2 text-center shadow-md print:shadow-none">
                    {stats.collected > 0 && (
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="font-bold text-[13px] print:text-[9px] text-white print:text-black print:font-extrabold leading-tight">
                          ₹{stats.collected.toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}
                  </td>
                ))}
                <td className="hidden sm:table-cell print:table-cell sticky bottom-0 right-0 z-40 print:static print:z-auto bg-primary print:bg-slate-300 border-t border-l border-slate-700 dark:border-zinc-700 print:border-slate-400 px-3 py-3 print:py-2 text-center shadow-md print:shadow-none">
                  <span className="font-extrabold text-sm print:text-xs text-white print:text-emerald-800">
                    ₹{grandCollected.toLocaleString('en-IN')}
                  </span>
                </td>
              </tr>
            </tfoot>

          </table>
        </div>
      </div>

      {/* Tooltip portal */}
      {tooltip && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed z-[200] pointer-events-none px-3 py-2 bg-slate-900 dark:bg-zinc-800 text-white text-[15px] font-semibold rounded-lg shadow-2xl whitespace-pre-line border border-slate-700 dark:border-zinc-700 animate-fadeIn"
          style={{
            top:       tooltip.rect.bottom + 8,
            left:      tooltip.rect.left + tooltip.rect.width / 2,
            transform: 'translateX(-50%)',
          }}
        >
          {tooltip.text}
        </div>,
        document.body
      )}
    </>
  );
}
