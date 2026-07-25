import React from 'react';

/**
 * PaymentInstallmentModal — modal for adding a payment installment to a due.
 * All state and handlers passed via props from AdminDashboard.
 */
export default function PaymentInstallmentModal({
  paymentToggleState,
  maintenanceAmount,
  paymentAmount, setPaymentAmount,
  paymentReference, setPaymentReference,
  onConfirm,
  onClose,
}) {
  if (!paymentToggleState) return null;

  const remaining = maintenanceAmount - (paymentToggleState.amountPaid || 0);
  const existingInstallments = paymentToggleState.currentInstallments || [];

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 space-y-5 animate-scaleIn"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-3">
         
          <div>
            <h3 className="font-bold text-sm text-on-surface">Add Payment Installment</h3>
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
              Unit <span className="font-bold text-primary">{paymentToggleState.tenementNumber}</span> ·{' '}
              <span className="font-bold text-on-surface">{paymentToggleState.month} {paymentToggleState.year}</span>
            </p>
          </div>
        </div>

        {/* Summary box */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-on-surface-variant">Amount required</span>
            <span className="text-on-surface">₹{maintenanceAmount.toLocaleString('en-IN')}</span>
          </div>

          {existingInstallments.length > 0 && (
            <>
              <div className="flex justify-between text-xs font-bold">
                <span className="text-on-surface-variant">
                  Already paid ({existingInstallments.length} installment{existingInstallments.length !== 1 ? 's' : ''})
                </span>
                <span className="text-emerald-600">₹{(paymentToggleState.amountPaid || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span className="text-on-surface-variant">Remaining balance</span>
                <span className="text-error">₹{remaining.toLocaleString('en-IN')}</span>
              </div>
              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, ((paymentToggleState.amountPaid || 0) / maintenanceAmount) * 100)}%` }}
                />
              </div>
              {/* Installment history */}
              <div className="space-y-1 pt-1 border-t border-slate-200 mt-1">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Previous installments</p>
                {existingInstallments.map((inst, i) => (
                  <div key={i} className="flex justify-between text-[11px]">
                    <span className="text-on-surface-variant">{inst.date} · {inst.method}</span>
                    <span className="font-bold text-emerald-700">+₹{inst.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Inputs */}
        <div className="space-y-3">
          <div>
            <label className="block text-[12px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Installment Amount (₹){' '}
              <span className="text-slate-400 font-mono normal-case font-normal">- remaining: ₹{remaining.toLocaleString('en-IN')}</span>
            </label>
            <input
              type="number"
              value={paymentAmount}
              onChange={e => setPaymentAmount(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 bg-white text-on-surface rounded-lg text-xs font-semibold focus:outline-none focus:border-primary transition-all"
              min="1"
              max={remaining}
              placeholder={`Max ₹${remaining}`}
            />
          </div>
          <div>
            <label className="block text-[12px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Reference / Cheque No.
            </label>
            <input
              type="text"
              value={paymentReference}
              onChange={e => setPaymentReference(e.target.value)}
              placeholder="Optional"
              className="w-full px-3 py-2 border border-slate-200 bg-white text-on-surface rounded-lg text-xs font-mono focus:outline-none focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Amount validation error */}
        {paymentAmount && Number(paymentAmount) > remaining && (
          <p className="text-[15px] text-error  p-2 ">
            Amount cannot exceed remaining balance of ₹{remaining.toLocaleString('en-IN')}.
          </p>
        )}

        {/* Payment method buttons */}
        <div className="space-y-1.5">
          <p className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">Select payment mode</p>
          <div className="grid grid-cols-3 gap-2">
            {['Cheque', 'Cash', 'Bank Transfer'].map(method => (
              <button
                key={method}
                onClick={() => onConfirm(method)}
                disabled={!paymentAmount || Number(paymentAmount) <= 0 || Number(paymentAmount) > remaining}
                className="py-2 border border-slate-200 bg-slate-50 hover:bg-primary/80 hover:text-white hover:border-primary text-[15px] font-bold text-on-surface rounded-md transition-all active-scale disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {method}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-on-surface-variant hover:bg-slate-100 rounded-lg transition-all active-scale"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
