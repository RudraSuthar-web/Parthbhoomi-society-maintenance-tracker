import React from 'react';
import { createPortal } from 'react-dom';
import { ALL_MONTHS, CURRENT_MONTH, CURRENT_YEAR, getBilledMonths } from '../../utils/dateUtils';
import { CellContent, MonthHeaderCell, STATUS } from './GridCells';

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
      <div className="bg-white border border-slate-200 rounded-xl shadow-soft overflow-hidden print:border-none print:shadow-none print:overflow-visible print:bg-transparent">

        {/* Print-only header */}
        <div className="hidden print:block text-center mb-6 pb-4 border-b-2 border-black">
          <h1 className="text-2xl font-extrabold text-black">Parthbhoomi CHS</h1>
          <p className="text-sm font-bold text-slate-700 mt-1">Society Maintenance Ledger · FY {selectedYear}</p>
        </div>

        <div className="overflow-auto max-h-[580px] sm:max-h-[calc(120vh-260px)] thin-scrollbar print:max-h-none print:overflow-visible relative">
          <table className="border-collapse text-xs w-full min-w-max print:min-w-0 print:text-[10px]">
            <thead>
              <tr className="bg-slate-100 print:bg-slate-100">
                {/* Unit/Owner col header - sticky top & left */}
                <th className="sticky top-0 left-0 z-40 print:static print:z-auto bg-slate-100/95 backdrop-blur-sm border-b border-r border-slate-200 px-2 sm:px-4 py-3 text-left w-[80px] sm:w-auto max-w-[80px] sm:max-w-none print:w-auto print:max-w-none shadow-sm">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider overflow-hidden">
                    <span className="material-symbols-outlined text-sm hidden sm:block print:hidden">home</span>
                    <span className="truncate print:whitespace-normal">Unit/Owner</span>
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
                  className="hidden sm:table-cell print:table-cell sticky top-0 right-0 z-40 print:static print:z-auto bg-slate-100/95 backdrop-blur-sm border-b border-l border-slate-200 px-3 py-3 text-center shadow-sm"
                  style={{ minWidth: '80px' }}
                >
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">YTD {selectedYear}</span>
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
                    className={`group transition-colors duration-100 hover:bg-blue-50/40 ${isEven ? 'bg-white' : 'bg-slate-50/40'}`}
                  >
                    {/* Identity cell */}
                    <td
                      className={`sticky left-0 z-10 print:static print:z-auto border-b border-r border-slate-100 px-2 sm:px-3 py-3 transition-colors duration-100 w-[80px] sm:w-auto max-w-[80px] sm:max-w-none print:max-w-none print:w-auto print:whitespace-nowrap ${isEven ? 'bg-white group-hover:bg-blue-50/40' : 'bg-slate-50/40 group-hover:bg-blue-50/40'}`}
                    >
                      <div className="flex items-center gap-1.5 sm:gap-2.5 overflow-hidden print:overflow-visible">
                        <div className="relative flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white text-black flex items-center justify-center font-bold text-[9px] sm:text-xs shadow-lg print:shadow-none">
                            {tenement.tenementNumber}
                          </div>
                        </div>
                        <div className="min-w-0 overflow-hidden print:overflow-visible">
                          <p className="font-bold text-on-surface text-[10px] sm:text-xs truncate max-w-[40px] sm:max-w-[120px] print:whitespace-nowrap print:max-w-none print:overflow-visible">
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
                        'border-b border-r px-0.5 py-1 transition-colors duration-100 cursor-pointer',
                        isCurrent ? 'bg-blue-50/30' : '',
                        isPaid    ? 'border-emerald-100 bg-emerald-50/40 hover:bg-emerald-100'
                        : isPartial ? 'border-amber-100 bg-amber-50 hover:bg-amber-100'
                        : isUnpaid  ? 'border-red-100 bg-red-50 hover:bg-red-100'
                        : 'border-slate-100 bg-white hover:bg-slate-100',
                      ].join(' ');

                      return (
                        <td key={month} className={cellCls}>
                          <div
                            role="button"
                            tabIndex={0}
                            aria-label={`${month} ${selectedYear}: ${due.status} — Unit ${tenement.tenementNumber}`}
                            className="flex flex-col items-center justify-center gap-0.5 rounded mx-0.5 min-h-[36px] transition-all duration-100"
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
                      className={`hidden sm:table-cell print:table-cell sticky right-0 z-10 print:static print:z-auto border-b border-l border-slate-100 px-2 py-2 text-center transition-colors duration-100 ${isEven ? 'bg-white group-hover:bg-blue-50/40' : 'bg-slate-50/40 group-hover:bg-blue-50/40'}`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className={`font-extrabold text-sm leading-tight ${
                          billedMonths === 0 ? 'text-slate-400'
                          : paidCount >= billedMonths ? 'text-emerald-600'
                          : paidCount >= Math.ceil(billedMonths * 0.75) ? 'text-green-500'
                          : paidCount >= Math.ceil(billedMonths * 0.5)  ? 'text-black/40'
                          : 'text-error'
                        }`}>
                          {paidCount}/{billedMonths}
                        </span>
                        {partialCount > 0 && (
                          <span className="text-[9px] font-bold text-amber-600">{partialCount}p</span>
                        )}
                        <div className="w-9 h-1 bg-slate-200 rounded-full overflow-hidden print:hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              billedMonths === 0 ? 'bg-slate-300'
                              : paidCount >= billedMonths ? 'bg-emerald-500'
                              : paidCount >= Math.ceil(billedMonths * 0.75) ? 'bg-green-400'
                              : paidCount >= Math.ceil(billedMonths * 0.5)  ? 'bg-blue-400'
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
            <tfoot>
              <tr className="bg-slate-800">
                <td className="sticky bottom-0 left-0 z-40 bg-slate-800 border-t border-slate-700 px-2 sm:px-4 py-3 w-[80px] sm:w-auto max-w-[80px] sm:max-w-none shadow-md">
                  <div className="flex items-center gap-1.5 text-[9px] sm:text-[13px] font-bold text-slate-300 uppercase tracking-wider truncate">
                    Grand Total
                  </div>
                </td>
                {monthStats.map(stats => (
                  <td key={stats.month} className="sticky bottom-0 z-30 bg-slate-800 border-t border-slate-700 px-1 py-3 text-center shadow-md">
                    {stats.collected > 0 && (
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="font-extrabold text-[13px] text-white">
                          ₹{stats.collected.toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}
                  </td>
                ))}
                <td className="hidden sm:table-cell print:table-cell sticky bottom-0 right-0 z-40 print:static print:z-auto bg-slate-800 print:bg-slate-200 border-t border-l border-slate-700 print:border-slate-300 px-3 py-3 text-center shadow-md">
                  <span className="font-extrabold text-sm text-blue-400 print:text-emerald-700">
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
          className="fixed z-[200] pointer-events-none px-3 py-2 bg-slate-900 text-white text-[15px] font-semibold rounded-lg shadow-2xl whitespace-pre-line border border-slate-700 animate-fadeIn"
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
