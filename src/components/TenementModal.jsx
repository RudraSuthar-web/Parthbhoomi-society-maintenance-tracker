import React from 'react';
import { CURRENT_MONTH, CURRENT_YEAR, DUES_AMOUNT, formatDate } from '../utils/dateUtils';

/**
 * TenementModal — Full popup card for a single tenement
 * Shows owner info, current-month status, yearly stats,
 * 12-month payment grid with toggle + receipt access.
 */
export default function TenementModal({
  tenement,
  onClose,
  onTogglePayment,   // fn(tenementNumber, month, currentStatus)
  onOpenReceipt,     // fn(tenement, monthDue)
}) {
  if (!tenement) return null;

  const currentDue  = tenement.dues.find(d => d.month === CURRENT_MONTH);
  const paidMonths  = tenement.dues.filter(d => d.status === 'Paid');
  const unpaidMonths = tenement.dues.filter(d => d.status === 'Unpaid');
  const paidCount   = paidMonths.length;
  const unpaidCount = unpaidMonths.length;
  const isCurrentPaid = currentDue?.status === 'Paid';

  const progressPct = Math.round((paidCount / 12) * 100);

  return (
    <div
      className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Modal card — slides up on mobile, scales in on desktop */}
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

          <div className="flex items-start gap-4">
            {/* Unit badge */}
            
            <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center font-extrabold text-2xl flex-shrink-0 shadow-inner">
              {tenement.tenementNumber}
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
               {/* Current month status strip */}
          <div className={`flex items-end justify-between px-4  rounded-xl`}>
            <div className="flex items-end gap-2">
             
              <div>
                <p className={`text-sm  text-right sm:text-sm md:text-md lg:text-md font-extrabold ${isCurrentPaid ? 'text-emerald-300' : 'text-red-300'}`}>
                  {isCurrentPaid ? 'Paid' : 'Overdue'}
                </p>
                <p className="text-[13px] text-right font-bold text-white/60 uppercase tracking-wider">{CURRENT_MONTH} {CURRENT_YEAR}</p>
                 <p className="text-md  text-right font-bold text-white/70">₹{(currentDue?.amount ?? DUES_AMOUNT).toLocaleString('en-IN')}</p>
              {isCurrentPaid && currentDue?.dateCleared && (
                <p className="text-[10px] text-right text-white/50">{formatDate(currentDue.dateCleared)}</p>
              )}
              </div>
            </div>
            <div className="text-right">
             
            </div>
          </div>
          </div>

       
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto thin-scrollbar">

          {/* Yearly stats bar */}
          <div className="px-5 py-4 border-b border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-on-surface">Year {CURRENT_YEAR} Progress</span>
              </div>
              <span className={`text-sm font-extrabold ${
                paidCount === 12 ? 'text-emerald-600' : paidCount >= 8 ? 'text-green-500' : paidCount >= 5 ? 'text-amber-500' : 'text-error'
              }`}>
                {paidCount}/12
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  paidCount === 12 ? 'bg-emerald-500' : paidCount >= 8 ? 'bg-green-400' : paidCount >= 5 ? 'bg-amber-400' : 'bg-red-400'
                }`}
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {/* Quick stats row */}
            <div className="grid grid-cols-3 gap-3 mt-3">
              {[
                { label: 'Paid', value: paidCount, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
                { label: 'Unpaid', value: unpaidCount, color: 'text-error', bg: 'bg-red-50', border: 'border-red-200' },
                { label: 'Unbilled', value: 12 - paidCount - unpaidCount, color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200' },
              ].map(({ label, value, color, bg, border }) => (
                <div key={label} className={`${bg} border ${border} rounded-xl py-2 text-center`}>
                  <p className={`text-lg font-extrabold ${color}`}>{value}</p>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 12-month payment grid */}
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-on-surface uppercase tracking-wider">Monthly Ledger</p>
              <p className="text-[10px] text-on-surface-variant font-semibold">Tap to toggle payment status</p>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {tenement.dues.map((due) => {
                const isPaid     = due.status === 'Paid';
                const isUnpaid   = due.status === 'Unpaid';
                const isUnbilled = due.status === 'Unbilled';
                const isCurrent  = due.month === CURRENT_MONTH;

                return (
                  <div
                    key={due.month}
                    onClick={() => !isUnbilled && onTogglePayment(tenement.tenementNumber, due.month, due.status)}
                      disabled={isUnbilled}
                  
                    className={`cursor-pointer
                      relative rounded-xl border p-3 flex flex-col gap-2
                      transition-all duration-150
                      ${isPaid    ? 'bg-emerald-50 border-emerald-200' : ''}
                      ${isUnpaid  ? 'bg-red-50 border-red-200' : ''}
                      ${isUnbilled ? 'bg-slate-50 border-slate-200 opacity-60' : ''}
                      ${isCurrent ? 'ring-2 ring-primary ring-offset-1' : ''}
                    `}
                  >
                   
                    {/* Month + amount */}
                      <div className={`text-[15px] text-center font-bold leading-tight ${isCurrent ? 'text-primary' : 'text-on-surface'}`}>
                        {due.month.slice(0, 3)}
                      </div>
                   

                    {/* Status icon */}
                

                    {/* Toggle button area (receives clicks from parent div) */}
                    <div className="flex justify-center pb-0.5">
                      {isPaid && <div className="flex gap-1 items-center"> <h3 className='text-[15px] text-on-surface-variant'>₹{due.amount}</h3> <span className="material-symbols-outlined print:hidden text-emerald-500" style={{ fontSize: '15px' }}>verified</span></div>}
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
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex-shrink-0 px-5 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <div className="text-xs text-on-surface-variant font-medium">
            <span className="font-bold text-on-surface">₹{(paidCount * DUES_AMOUNT).toLocaleString('en-IN')}</span>
            {' '}collected · FY {CURRENT_YEAR}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white  text-slate-800 text-xs font-bold rounded-xl border border-slate-400/30 transition-all active-scale"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
