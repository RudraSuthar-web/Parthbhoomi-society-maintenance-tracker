import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { ALL_MONTHS, CURRENT_MONTH, CURRENT_YEAR, formatDate, getBilledMonths } from '../utils/dateUtils';

/**
 * TenementModal — Full popup card for a single tenement
 * Shows owner info, selected-month status, yearly stats,
 * 12-month payment grid with toggle + receipt access.
 */
import DeleteTenementModal from './admin/DeleteTenementModal';

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

  if (!tenement) return null;

  // ── Compute from modalYear (not CURRENT_YEAR) ──────────────────────────────
  const yearDues = tenement.dues
    .filter(d => d.year === modalYear)
    .sort((a, b) => ALL_MONTHS.indexOf(a.month) - ALL_MONTHS.indexOf(b.month));
  const currentDue = yearDues.find(d => d.month === modalMonth);
  const paidMonths = yearDues.filter(d => d.status === 'Paid');
  const partialMonths = yearDues.filter(d => d.status === 'Partial');
  const unpaidMonths = yearDues.filter(d => d.status === 'Unpaid');
  const paidCount = paidMonths.length;
  const unpaidCount = unpaidMonths.length;
  const partialCount = partialMonths.length;
  const billedMonths = getBilledMonths(modalYear);

  const isCurrentPaid = currentDue?.status === 'Paid';
  const isCurrentPartial = currentDue?.status === 'Partial';
  const isCurrentUnpaid = currentDue?.status === 'Unpaid';

  // "Current" month highlight only applies when viewing the CURRENT real year
  // — so month ring only shows for the actual real current month in the real current year
  const isViewingCurrentRealYear = modalYear === CURRENT_YEAR;

  // Footer total: sum of amountPaid across paid + partial for the modal year
  const totalCollected = yearDues.reduce((acc, d) => {
    if (d.status === 'Paid' || d.status === 'Partial') return acc + (d.amountPaid || d.amount || 0);
    return acc;
  }, 0);

  return (
    <div
      className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Modal card */}
      <div
        className="
          bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-3xl
          border border-slate-200 shadow-2xl
          flex flex-col overflow-hidden
          max-h-[92vh] sm:max-h-[88vh]
          animate-slideInUp sm:animate-scaleIn
        "
        onClick={e => e.stopPropagation()}
      >

        {/* ── Header ── */}
        <div className="relative bg-gradient-to-br from-primary/80 to-black text-white px-5 pt-6 pb-5 flex-shrink-0">
          {/* Drag handle (mobile) */}
          <div className="w-10 h-1 bg-white/30 rounded-full mx-auto mb-6 sm:hidden" />

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all active-scale"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-white text-lg">close</span>
          </button>

          <div className="flex items-start gap-4 mr-8 ">
            {/* Unit badge with exact full-size status icon overlay */}
            <div className="relative flex-shrink-0 w-14 h-14">
              <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center font-extrabold text-2xl shadow-inner">
                {tenement.tenementNumber}
              </div>
              
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-extrabold leading-tight truncate">{tenement.ownerName}</h2>
              <a
                href={`tel:${tenement.contact}`}
                className="flex items-center gap-1 mt-1 text-xs font-semibold text-blue-200 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-sm">call</span>
                {tenement.contact}
              </a>
            </div>

            {/* Current month status — uses modalMonth + modalYear (not hardcoded CURRENT_MONTH) */}
            <div className="flex flex-col items-end justify-end ">
              <p className={`text-sm text-right font-extrabold ${isCurrentPaid ? 'text-emerald-300'
                  : isCurrentPartial ? 'text-amber-300'
                    : 'text-red-300'
                }`}>
                {isCurrentPaid ? 'Paid' : isCurrentPartial ? 'Partial' : currentDue?.status === 'Unbilled' ? 'Unbilled' : 'Overdue'}
              </p>
              {/* ✅ Fixed: uses modalMonth and modalYear — not CURRENT_MONTH */}
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

          {/* Year selector — dropdown */}

        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto thin-scrollbar">

          {/* 12-month payment grid */}
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold text-on-surface uppercase tracking-wider">
                Monthly Ledger 
              </p>
                <select
                  value={modalYear}
                  onChange={(e) => setModalYear(Number(e.target.value))}
                  className="bg-slate/10 border border-black/20 text-black text-[13px] font-bold rounded-lg px-3 py-1.5 outline-none cursor-pointer hover:bg-white/20 transition-all appearance-none pr-7"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
                >
                  {availableYears.map(y => (
                    <option key={y} value={y} style={{ background: '#1e293b', color: 'white' }}>
                      {y}{y === CURRENT_YEAR ? ' ' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[11px] text-on-surface-variant font-semibold">Tap to toggle payment status</p>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
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
                    onClick={() => {
                      setModalMonth(due.month);
                      onTogglePayment(tenement.tenementNumber, due.month, due.status, modalYear);
                    }}
                    className={`
                      cursor-pointer relative rounded-xl border p-3 flex flex-col gap-2
                      transition-all duration-150
                      ${isPaid ? 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100' : ''}
                      ${isPartial ? 'bg-amber-50 border-amber-200 hover:bg-amber-100' : ''}
                      ${isUnpaid ? 'bg-red-50 border-red-200 hover:bg-red-100' : ''}
                      ${isUnbilled ? 'bg-slate-50 border-slate-200 opacity-60 hover:bg-slate-100' : ''}
                      ${isCurrent ? 'ring-2 ring-primary ring-offset-1' : ''}
                    `}
                  >
                    {/* Month name */}
                    <div className={`text-[15px] text-center font-bold leading-tight ${isCurrent ? 'text-primary' : 'text-on-surface'
                      }`}>
                      {due.month.slice(0, 3)}
                      {isCurrent && (
                        <span className="block text-[8px] font-bold text-primary uppercase tracking-wide">Now</span>
                      )}
                    </div>

                    {/* Status indicator */}
                    <div className="flex justify-center pb-0.5">
                      {isPaid && (
                        <div className="flex gap-1 items-center">
                          <h3 className="text-[13px] text-on-surface-variant">₹{(due.amountPaid || due.amount || maintenanceAmount).toLocaleString('en-IN')}</h3>
                          <span className="material-symbols-outlined text-emerald-500" style={{ fontSize: '15px' }}>verified</span>
                        </div>
                      )}
                      {isPartial && (
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="material-symbols-outlined text-amber-500 text-xl">pending</span>
                          <span className="text-[10px] font-bold text-amber-700">
                            ₹{(due.amountPaid || 0).toLocaleString('en-IN')}/{maintenanceAmount.toLocaleString('en-IN')}
                          </span>
                        </div>
                      )}
                      {isUnpaid && <span className="material-symbols-outlined text-error text-xl">cancel</span>}
                      {isUnbilled && <span className="material-symbols-outlined text-slate-300 text-xl">schedule</span>}
                    </div>

                    {/* Receipt link */}
                    {isPaid && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenReceipt(tenement, due);
                        }}
                        className="flex items-center justify-center gap-0.5 text-[11px] text-primary font-bold hover:underline relative z-10 py-1"
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
              <div className="text-center py-8 text-sm text-on-surface-variant">
                No dues data available for {modalYear}.
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex-shrink-0 px-5 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <div className="text-xs text-on-surface-variant font-medium space-y-0.5">
            <div>
              <span className="font-bold text-[18px] text-on-surface">₹{totalCollected.toLocaleString('en-IN')}</span>
              {' '}collected · FY {modalYear}
            </div>
            {partialCount > 0 && (
              <div className="text-[10px] text-amber-600 font-bold">{partialCount} partial · {unpaidCount} unpaid</div>
            )}
            {partialCount === 0 && unpaidCount > 0 && (
              <div className="text-[12px] text-error font-bold">{unpaidCount} month{unpaidCount !== 1 ? 's' : ''} unpaid</div>
            )}
            {paidCount === 12 && (
              <div className="text-[10px] text-emerald-600 font-bold">✓ All {billedMonths} months paid!</div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {user?.role === 'admin' && (
              <button
                type="button"
                onClick={() => setIsDeleting(true)}
                className="px-3.5 py-2 bg-red-50 text-error border border-red-200 hover:bg-red-100 text-xs font-bold rounded-xl transition-all active-scale flex items-center gap-1"
                title="Delete this tenement entry"
              >
                <span className="material-symbols-outlined text-base">delete</span>
                Delete Unit
              </button>
            )}
            <button
              onClick={onClose}
              className="px-5 py-2 bg-white text-slate-800 text-xs font-bold rounded-xl border border-slate-400/30 transition-all active-scale"
            >
              Close
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <DeleteTenementModal
          tenement={isDeleting ? tenement : null}
          onConfirm={() => {
            deleteTenement(tenement.tenementNumber);
            setIsDeleting(false);
            onClose();
          }}
          onCancel={() => setIsDeleting(false)}
        />

      </div>
    </div>
  );
}
