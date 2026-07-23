import React from 'react';
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
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-soft p-5 sm:p-6 space-y-5 animate-fadeIn">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-headline-md text-on-surface font-extrabold">Transaction Ledger</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Maintenance record for FY {selectedYear} — Unit {tenementData.tenementNumber}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">YTD Paid ({selectedYear})</p>
          <p className="text-lg font-extrabold text-primary">₹{yearlyAmountPaid.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="space-y-2">
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
              className={`border rounded-xl overflow-hidden transition-all duration-200 ${isCurrent ? 'ring-1 ring-primary/20' : ''}`}
            >
              {/* Row header */}
              <div
                role={!isUnbilled ? 'button' : undefined}
                tabIndex={!isUnbilled ? 0 : undefined}
                onClick={() => !isUnbilled && setExpandedIdx(isExpanded ? null : idx)}
                onKeyDown={e => !isUnbilled && e.key === 'Enter' && setExpandedIdx(isExpanded ? null : idx)}
                className={`px-4 py-3.5 flex items-center justify-between ${
                  isUnbilled ? 'cursor-default opacity-60' : 'cursor-pointer select-none hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined text-xl ${
                    isPaid    ? 'text-emerald-500'
                    : isPartial ? 'text-amber-500'
                    : isUnpaid ? 'text-error'
                    :            'text-slate-300'
                  }`}>
                    {isPaid ? 'verified' : isPartial ? 'pending' : isUnpaid ? 'cancel' : 'schedule'}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-on-surface">{due.month} {selectedYear}</h4>
                      {isCurrent && (
                        <span className="text-[9px] font-bold text-primary bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-full uppercase">Current</span>
                      )}
                    </div>
                    <p className="text-[11px] text-on-surface-variant font-semibold">
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
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    isPaid    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : isPartial ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : isUnpaid ? 'bg-red-50 text-error border border-red-200'
                    :            'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    {due.status}
                  </span>
                  {!isUnbilled && (
                    <span className={`material-symbols-outlined text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                      expand_more
                    </span>
                  )}
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && !isUnbilled && (
                <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50/50 animate-fadeIn">
                  {(isPaid || isPartial) ? (
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                      <div className="space-y-3 w-full">
                        {installments.length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                              Payment History ({installments.length} installment{installments.length !== 1 ? 's' : ''})
                            </p>
                            <div className="space-y-1.5">
                              {installments.map((inst, i) => (
                                <div key={i} className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs">
                                  <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-emerald-500 text-sm">verified</span>
                                    <span className="font-semibold text-on-surface">{formatDate(inst.date)}</span>
                                    <span className="text-on-surface-variant">· {inst.method}</span>
                                    {inst.reference && <span className="font-mono text-primary text-[10px]">{inst.reference}</span>}
                                  </div>
                                  <span className="font-bold text-emerald-700">+₹{inst.amount.toLocaleString('en-IN')}</span>
                                </div>
                              ))}
                            </div>
                            {isPartial && (
                              <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex justify-between text-xs font-bold">
                                <span className="text-amber-700">Remaining balance</span>
                                <span className="text-error">₹{(maintenanceAmount - (due.amountPaid || 0)).toLocaleString('en-IN')}</span>
                              </div>
                            )}
                          </div>
                        )}
                        {isPaid && (
                          <button
                            onClick={e => { e.stopPropagation(); onOpenReceipt(due); }}
                            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg shadow-soft hover:bg-primary-container transition-all active-scale whitespace-nowrap"
                          >
                            Download Receipt
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 text-xs">
                      <p className="text-on-surface-variant leading-relaxed">
                        <span className="font-bold text-error">Overdue:</span> Please submit{' '}
                        <span className="font-bold text-on-surface">₹{(due.amount || maintenanceAmount).toLocaleString('en-IN')}</span> to the
                        society treasurer's desk. Accepted modes: Cheque, Cash, or Bank Transfer (NEFT/UPI on request).
                      </p>
                      <div className="bg-red-50 border border-red-200 text-error p-2.5 rounded-lg font-semibold">
                        Payments are offline-verified by the committee.
                      </div>
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
