import React, { useState, useEffect, useRef } from 'react';
import { 
  BadgeCheck, 
  Clock, 
  XCircle, 
  Calendar, 
  ChevronDown 
} from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';

/**
 * LedgerTab — Resident "Transaction Ledger" tab.
 * Shows yearly accordion of dues with installment history.
 */
export default function LedgerTab({
  tenementData, selectedYear, selectedMonth,
  yearDues, yearlyAmountPaid, maintenanceAmount,
  expandedIdx, setExpandedIdx,
  onOpenReceipt,
}) {
  const [isStuck, setIsStuck] = useState(false);
  const sentinelRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sentinelRef.current) return;
      const rect = sentinelRef.current.getBoundingClientRect();
      const isMobile = window.innerWidth < 768;
      const threshold = isMobile ? 58 : 0;
      setIsStuck(rect.top <= threshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-soft animate-fadeIn">
      <div ref={sentinelRef} className="h-0 w-0" />
      <div
        className={`sticky top-[70px] md:top-0 z-20 transition-all duration-300 ${
          isStuck
            ? ' -mt-4 md:-mx-6 md:-mt-6 lg:-mx-8 lg:-mt-8'
            : 'mx-0 mt-0'
        }`}
      >
        {isStuck ? (
          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-full lg:rounded-none border border-slate-200 dark:border-zinc-800 flex items-start justify-between gap-4 p-4 transition-all duration-300">
            <div>
              <h2 className="sm:font-headline-sm md:font-headline-md lg:font-headline-lg font-extrabold text-on-surface dark:text-zinc-100 p-1">Transaction Ledger</h2>
              <p className="text-xs hidden lg:block font-mono text-on-surface-variant dark:text-zinc-400 mt-1">
                Maintenance record for FY {selectedYear} - Unit {tenementData.tenementNumber}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-[7px]  sm:text-[8px] md:text-[9px] lg:text-[10px] font-bold text-on-surface-variant dark:text-zinc-400 uppercase tracking-wider">YTD Paid ({selectedYear})</p>
              <p className="text-md sm:text-md md:text-lg lg:text-lg font-extrabold text-primary dark:text-white">₹{yearlyAmountPaid.toLocaleString('en-IN')}</p>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 flex items-start justify-between gap-4 rounded-t-xl p-6 transition-all duration-300">
            <div>
              <h2 className="font-headline-md text-on-surface dark:text-zinc-100 font-extrabold">Transaction Ledger</h2>
              <p className="text-xs font-mono text-on-surface-variant dark:text-zinc-400 mt-1">
                Maintenance record for FY {selectedYear} - Unit {tenementData.tenementNumber}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-[10px] font-bold text-on-surface-variant dark:text-zinc-400 uppercase tracking-wider">YTD Paid ({selectedYear})</p>
              <p className="text-lg font-extrabold text-primary dark:text-white">₹{yearlyAmountPaid.toLocaleString('en-IN')}</p>
            </div>
          </div>
        )}
      </div>

      <div>
        {yearDues.map((due, idx) => {
          const isExpanded = expandedIdx === idx;
          const isPaid     = due.status === 'Paid';
          const isPartial  = due.status === 'Partial';
          const isUnpaid   = due.status === 'Unpaid';
          const isUnbilled = due.status === 'Unbilled';
          const isCurrent  = due.month === selectedMonth;
          const installments = due.installments || [];

          return (
            <div
              key={idx}
              className={`border border-slate-200 dark:border-zinc-800 overflow-hidden transition-all duration-200 ${isCurrent ? 'ring-1 ring-primary/20 z-50' : ''}`}
            >
              {/* Row header */}
              <div
                role={!isUnbilled ? 'button' : undefined}
                tabIndex={!isUnbilled ? 0 : undefined}
                onClick={() => !isUnbilled && setExpandedIdx(isExpanded ? null : idx)}
                onKeyDown={e => !isUnbilled && e.key === 'Enter' && setExpandedIdx(isExpanded ? null : idx)}
                className={`px-4 py-3.5 flex items-center justify-between ${
                  isUnbilled ? 'cursor-default opacity-60' : 'cursor-pointer select-none hover:bg-slate-50 dark:hover:bg-zinc-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isPaid ? (
                    <BadgeCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  ) : isPartial ? (
                    <Clock className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  ) : isUnpaid ? (
                    <XCircle className="w-5 h-5 text-error flex-shrink-0" />
                  ) : (
                    <Calendar className="w-5 h-5 text-slate-300 dark:text-zinc-600 flex-shrink-0" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-on-surface dark:text-zinc-100">{due.month} {selectedYear}</h4>
                      {isCurrent && (
                        <span className="text-[9px] font-bold text-primary dark:text-white bg-primary/5 dark:bg-primary/20 border border-slate-300 dark:border-zinc-700 px-1.5 py-0.5 rounded-md uppercase">Current</span>
                      )}
                    </div>
                    <p className="text-[11px] text-on-surface-variant dark:text-zinc-400 font-semibold">
                      {isPaid
                        ? `₹${(due.amountPaid || due.amount).toLocaleString('en-IN')} · ${due.method}`
                        : isPartial
                        ? `₹${(due.amountPaid || 0).toLocaleString('en-IN')} paid of ₹${maintenanceAmount.toLocaleString('en-IN')}`
                        : `₹${(due.amount || maintenanceAmount).toLocaleString('en-IN')}`
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[12px] font-bold px-2.5 py-1 rounded-md ${
                    isPaid    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                    : isPartial ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                    : isUnpaid ? 'bg-red-50 dark:bg-red-950/40 text-error dark:text-red-400 border border-red-200 dark:border-red-900/60'
                    :            'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700'
                  }`}>
                    {due.status}
                  </span>
                  {!isUnbilled && (
                    <ChevronDown className={`w-4 h-4 text-slate-400 dark:text-zinc-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                  )}
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && !isUnbilled && (
                <div className="px-4 pb-4 pt-2 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30 animate-fadeIn">
                  {(isPaid || isPartial) ? (
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                      <div className="space-y-3 w-full">
                        {installments.length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold text-on-surface-variant dark:text-zinc-400 uppercase tracking-wider mb-2">
                              Payment History ({installments.length} installment{installments.length !== 1 ? 's' : ''})
                            </p>
                            <div className="space-y-1.5">
                              {installments.map((inst, i) => (
                                <div key={i} className="flex items-center justify-between bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-md px-3 py-2 text-xs">
                                  <div className="flex items-center gap-2">
                                    <BadgeCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                                    <span className="font-semibold text-on-surface dark:text-zinc-100">{formatDate(inst.date)}</span>
                                    <span className="text-on-surface-variant dark:text-zinc-400">· {inst.method}</span>
                                    {inst.reference && <span className="font-mono text-primary dark:text-white text-[10px]">{inst.reference}</span>}
                                  </div>
                                  <span className="font-bold text-emerald-700 dark:text-emerald-400">+₹{inst.amount.toLocaleString('en-IN')}</span>
                                </div>
                              ))}
                            </div>
                            {isPartial && (
                              <div className="mt-2 p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-lg flex justify-between text-xs font-bold">
                                <span className="text-amber-700 dark:text-amber-400">Remaining balance</span>
                                <span className="text-error dark:text-red-400">₹{(maintenanceAmount - (due.amountPaid || 0)).toLocaleString('en-IN')}</span>
                              </div>
                            )}
                          </div>
                        )}
                        {isPaid && (
                          <div className='flex items-end justify-end'>
                            <button
                              onClick={e => { e.stopPropagation(); onOpenReceipt(due); }}
                              className="flex items-center gap-1.5 px-4 py-2 bg-primary/80 text-white text-xs font-bold rounded-md shadow-lg hover:bg-primary transition-all active-scale whitespace-nowrap"
                            >
                              Download Receipt
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 text-xs">
                      <p className="text-on-surface-variant dark:text-zinc-400 font-mono leading-relaxed">
                        <span className="font-bold text-error dark:text-red-400">Overdue:</span> Please submit{' '}
                        <span className="font-bold text-on-surface dark:text-zinc-200">₹{(due.amount || maintenanceAmount).toLocaleString('en-IN')}</span> to the
                        society treasurer's desk. Accepted modes: Cheque, Cash, or Bank Transfer.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
