import React, { useContext, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AppContext } from '../context/AppContext';
import { ALL_MONTHS, CURRENT_MONTH, CURRENT_YEAR, formatDate, getBilledMonths } from '../utils/dateUtils';
import DeleteTenementModal from './admin/DeleteTenementModal';
import { 
  X, 
  Phone, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Trash2, 
  ChevronDown 
} from 'lucide-react';

/**
 * TenementModal — Full popup card for a single tenement
 * Shows owner info, selected-month status, yearly stats,
 * 12-month payment grid with toggle + receipt access.
 */
export default function TenementModal({
  tenement,
  onClose,
  onTogglePayment,   // fn(tenementNumber, month, currentStatus, year)
  onOpenReceipt,     // fn(tenement, monthDue)
}) {
  const { selectedYear, availableYears, selectedMonth, maintenanceAmount, user, deleteTenement } = useContext(AppContext);

  // Modal has its own local year/month that syncs with global selection
  const [modalYear, setModalYear] = useState(selectedYear);
  const [modalMonth, setModalMonth] = useState(selectedMonth);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => { setModalYear(selectedYear); }, [selectedYear]);
  useEffect(() => { setModalMonth(selectedMonth); }, [selectedMonth]);

  // Lock body scroll while modal is mounted
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  if (!tenement) return null;

  // ── Compute from modalYear (not CURRENT_YEAR) ──────────────────────────────
  const yearDues = tenement.dues
    .filter(d => d.year === modalYear)
    .sort((a, b) => ALL_MONTHS.indexOf(a.month) - ALL_MONTHS.indexOf(b.month));
  const currentDue = yearDues.find(d => d.month === modalMonth);
  const paidMonths = yearDues.filter(d => d.status === 'Paid');
  const paidCount = paidMonths.length;
  const partialCount = yearDues.filter(d => d.status === 'Partial').length;
  const unpaidCount = yearDues.filter(d => d.status === 'Unpaid').length;

  // Real-time billed months for the selected year
  const billedMonths = getBilledMonths(modalYear);

  // Total collected = sum of amountPaid for Paid & Partial
  const totalCollected = yearDues.reduce((acc, d) => {
    if (d.status === 'Paid') return acc + (d.amountPaid || d.amount || maintenanceAmount);
    if (d.status === 'Partial') return acc + (d.amountPaid || 0);
    return acc;
  }, 0);

  // Current month statuses
  const isCurrentPaid = currentDue?.status === 'Paid';
  const isCurrentPartial = currentDue?.status === 'Partial';
  const isViewingCurrentRealYear = modalYear === CURRENT_YEAR;

  const modalNode = (
    <>
      <div
        className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      >
        <div
          className="bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl max-w-2xl w-full max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden animate-slideUp sm:animate-scaleIn pb-[env(safe-area-inset-bottom,0px)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Modal Header ── */}
          <div className="relative bg-gradient-to-br from-primary/80 to-black dark:from-primary/60 dark:to-zinc-950 text-white px-5 pt-6 pb-5 flex-shrink-0">
            {/* Drag handle (mobile) */}
            <div className="w-10 h-1 bg-white/30 rounded-full mx-auto mb-6 sm:hidden" />

            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all active:scale-95"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-white" />
            </button>

            <div className="flex items-start gap-4 mr-0 md:mr-8 lg:mr-8">
              {/* Unit badge with exact full-size status icon overlay */}
              <div className="relative flex-shrink-0 w-14 h-14">
                <div className="w-14 h-14 rounded-xl bg-white/30 border border-white/20 flex items-center justify-center font-extrabold text-2xl shadow-inner">
                  {tenement.tenementNumber}
                </div>
              </div>

              <div className="flex-1 min-w-0 pr-1">
                <h2 className="text-base sm:text-xl font-extrabold leading-tight text-white break-words">
                  {tenement.ownerName}
                </h2>
                <a
                  href={`tel:${tenement.contact}`}
                  className="inline-flex items-center gap-1.5 mt-1 text-xs font-semibold text-white/80 hover:text-white transition-colors"
                >
                  <Phone className="w-3 h-3 text-white/80 flex-shrink-0" />
                  <span>{tenement.contact}</span>
                </a>
              </div>

              {/* Current month status — uses modalMonth + modalYear */}
              <div className="flex flex-col items-end justify-end">
                <p className={`text-sm text-right font-extrabold ${isCurrentPaid ? 'text-emerald-300'
                    : isCurrentPartial ? 'text-amber-300'
                      : 'text-error'
                  }`}>
                  {isCurrentPaid ? 'Paid' : isCurrentPartial ? 'Partial' : currentDue?.status === 'Unbilled' ? 'Unbilled' : 'Overdue'}
                </p>
                <p className="text-[13px] text-right font-bold text-white/60 uppercase tracking-wider">
                  {modalMonth} {modalYear}
                </p>
                <p className="text-md text-right font-bold text-white/70">
                  {isCurrentPartial
                    ? `₹${(currentDue?.amountPaid || 0).toLocaleString('en-IN')} / ₹${maintenanceAmount.toLocaleString('en-IN')}`
                    : `₹${(currentDue?.amount ?? maintenanceAmount).toLocaleString('en-IN')}`
                  }
                </p>
                {isCurrentPaid && currentDue?.dateCleared && (
                  <p className="text-[10px] text-right text-white/50">{formatDate(currentDue.dateCleared)}</p>
                )}
              </div>
            </div>
          </div>

          {/* ── Scrollable body ── */}
          <div className="flex-1 overflow-y-auto thin-scrollbar">

            {/* 12-month payment grid */}
            <div className="sm:p-0 md:px-3 lg:px-3 md:py-4 lg:py-4">
              <div className="flex items-center justify-between lg:mb-3 p-4 sm:p-4 md:p-0 lg:p-0">
                
                <div className="flex items-center gap-2.5">
                  <div className="hidden md:block">
                    <p className="text-xs font-bold text-on-surface dark:text-zinc-100 uppercase tracking-wider">
                      Monthly Ledger 
                    </p>
                  </div>
                  
                  {/* Clean Modern Year Selector */}
                  <div className="relative inline-flex items-center">
                    <select
                      value={modalYear}
                      onChange={(e) => setModalYear(Number(e.target.value))}
                      className="bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 text-[13px] font-bold rounded-lg pl-3 pr-8 py-1.5 outline-none cursor-pointer hover:border-slate-400 dark:hover:border-zinc-600 focus:ring-2 focus:ring-primary/20 shadow-sm appearance-none transition-all"
                    >
                      {availableYears.map(y => (
                        <option key={y} value={y} className="dark:bg-zinc-900">
                          {y}{y === CURRENT_YEAR ? ' (Current)' : ''}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute right-2.5 pointer-events-none" />
                  </div>
                </div>
                <p className="text-[12px] sm:text-[13px] text-right ml-auto font-mono text-on-surface-variant dark:text-zinc-400">Tap to toggle payment status</p>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6">
                {yearDues.map((due) => {
                  const isPaid = due.status === 'Paid';
                  const isPartial = due.status === 'Partial';
                  const isUnpaid = due.status === 'Unpaid';
                  const isUnbilled = due.status === 'Unbilled';
                  // "Current" ring only when viewing the real current year AND it's the real current month
                  const isCurrent = isViewingCurrentRealYear && due.month === CURRENT_MONTH;

                  return (
                    <div
                      key={due.month}
                      onClick={() => onTogglePayment && onTogglePayment(tenement.tenementNumber, due.month, due.status, modalYear)}
                      className={`
                        relative border py-2.5 px-1.5 flex flex-col justify-between cursor-pointer select-none
                        transition-all duration-150 active:scale-95 group
                        ${isPaid ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/30'
                          : isPartial ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60 hover:bg-amber-100/60 dark:hover:bg-amber-900/30'
                            : isUnpaid ? 'bg-red-50/40 dark:bg-red-950/20 border-red-200 dark:border-red-900/50 hover:bg-red-100/60 dark:hover:bg-red-900/30'
                              : 'bg-slate-50/30 dark:bg-zinc-900/40 border-slate-200 dark:border-zinc-800 hover:bg-slate-100/60 dark:hover:bg-zinc-800/60'
                        }
                        ${isCurrent ? 'ring-2 ring-black dark:ring-white ring-inset z-10' : ''}
                      `}
                    >
                      {/* Month label */}
                      <div className="text-center">
                        <span className="text-[13px] font-bold text-on-surface dark:text-zinc-100">
                          {due.month.slice(0, 3)}
                        </span>
                      </div>

                      {/* Status indicator */}
                      <div className="flex justify-center pb-0.5">
                        {isPaid && (
                          <div className="flex gap-1 items-center">
                            <h3 className="text-[15px] text-on-surface-variant dark:text-zinc-300">₹{(due.amountPaid || due.amount || maintenanceAmount).toLocaleString('en-IN')}</h3>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          </div>
                        )}
                        {isPartial && (
                          <div className="flex flex-col items-center gap-0.5">
                            <Clock className="w-4 h-4 text-amber-500" />
                            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
                              ₹{(due.amountPaid || 0).toLocaleString('en-IN')}/{maintenanceAmount.toLocaleString('en-IN')}
                            </span>
                          </div>
                        )}
                        {isUnpaid && <XCircle className="w-5 h-5 text-error dark:text-red-400" />}
                        {isUnbilled && <Clock className="w-5 h-5 text-slate-300 dark:text-zinc-600" />}
                      </div>

                      {/* Receipt link */}
                      {isPaid && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenReceipt(tenement, due);
                          }}
                          className="flex items-center justify-center gap-0.5 text-[11px] text-primary dark:text-white font-bold hover:underline relative z-10 py-1"
                        >
                          Receipt
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* No dues for this year */}
              {yearDues.length === 0 && (
                <div className="text-center py-8 text-sm text-on-surface-variant dark:text-zinc-400">
                  No dues data available for {modalYear}.
                </div>
              )}
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="flex-shrink-0 px-5 py-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/90 flex items-center justify-between gap-3">
            <div className="sm:text-sm lg:text-xs text-on-surface-variant dark:text-zinc-400 font-medium space-y-0.5">
              <div>
                <span className="font-bold text-[16px] lg:text-[18px] text-on-surface dark:text-zinc-100">₹{totalCollected.toLocaleString('en-IN')}</span>
                {' '}collected · FY {modalYear}
              </div>
              {partialCount > 0 && (
                <div className="text-[15px] lg:text-[12px] font-mono text-amber-600 dark:text-amber-400 font-bold">{partialCount} partial · {unpaidCount} unpaid</div>
              )}
              {partialCount === 0 && unpaidCount > 0 && (
                <div className="text-[15px] lg:text-[13px] font-mono text-error dark:text-red-400 font-bold">{unpaidCount} month{unpaidCount !== 1 ? 's' : ''} unpaid</div>
              )}
              {paidCount === 12 && (
                <div className="sm:text-[14px] lg:text-[12px] text-emerald-600 dark:text-emerald-400 font-bold">All {billedMonths} months paid!</div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {user?.role === 'admin' && (
                <button
                  type="button"
                  onClick={() => setIsDeleting(true)}
                  className="px-3.5 py-2 bg-red-50 dark:bg-red-950/40 text-error dark:text-red-400 border border-red-200 dark:border-red-900/60 hover:bg-red-100 dark:hover:bg-red-900/60 text-xs font-bold rounded-xl transition-all active:scale-95 flex items-center gap-1.5"
                  title="Delete this tenement entry"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Unit
                </button>
              )}
              <div className="hidden md:block">
                <button
                  onClick={onClose}
                  className="px-5 py-2 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-xs font-bold rounded-xl border border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-all active:scale-95"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {isDeleting && (
        <DeleteTenementModal
          tenementNumber={tenement.tenementNumber}
          ownerName={tenement.ownerName}
          onConfirm={async () => {
            const success = await deleteTenement(tenement.tenementNumber);
            if (success) {
              setIsDeleting(false);
              onClose();
            }
          }}
          onCancel={() => setIsDeleting(false)}
        />
      )}
    </>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalNode, document.body);
  }
  return modalNode;
}
