import React, { useState } from 'react';

/**
 * GridPaymentModal — payment installment modal used inside MonthlyGridView.
 * Manages its own amount/reference input state since it's self-contained.
 */
export default function GridPaymentModal({ state, maintenanceAmount, onConfirm, onCancel }) {
  const [amount, setAmount]       = useState('');
  const [reference, setReference] = useState('');

  React.useEffect(() => {
    if (state) {
      const remaining = maintenanceAmount - (state.amountPaid || 0);
      setAmount(String(remaining > 0 ? remaining : maintenanceAmount));
      setReference('');
    }
  }, [state, maintenanceAmount]);

  if (!state) return null;

  const existing  = state.currentInstallments || [];
  const remaining = maintenanceAmount - (state.amountPaid || 0);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 space-y-5 animate-scaleIn"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-primary text-xl">payments</span>
          </div>
          <div>
            <h3 className="font-bold text-sm text-on-surface">Add Payment Installment</h3>
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
              Unit <span className="font-bold text-primary">{state.tenementNumber}</span> ·{' '}
              <span className="font-bold text-on-surface">{state.month} {state.year}</span>
            </p>
          </div>
        </div>

        {/* Progress / installment history */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-on-surface-variant">Required</span>
            <span className="text-on-surface">₹{maintenanceAmount.toLocaleString('en-IN')}</span>
          </div>
          {existing.length > 0 && (
            <>
              <div className="flex justify-between text-xs font-bold">
                <span className="text-on-surface-variant">Paid so far</span>
                <span className="text-emerald-600">₹{(state.amountPaid || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span className="text-on-surface-variant">Remaining</span>
                <span className="text-error">₹{remaining.toLocaleString('en-IN')}</span>
              </div>
              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, ((state.amountPaid || 0) / maintenanceAmount) * 100)}%` }}
                />
              </div>
              <div className="space-y-1 pt-1 border-t border-slate-200">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Previous installments</p>
                {existing.map((inst, i) => (
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
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Installment Amount (₹){' '}
              <span className="text-slate-400 normal-case font-normal">— remaining: ₹{remaining.toLocaleString('en-IN')}</span>
            </label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 bg-white text-on-surface rounded-lg text-xs font-semibold focus:outline-none focus:border-primary transition-all"
              min="1"
              max={remaining}
              placeholder={`Max ₹${remaining}`}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Reference / Cheque No.
            </label>
            <input
              type="text"
              value={reference}
              onChange={e => setReference(e.target.value)}
              placeholder="Optional"
              className="w-full px-3 py-2 border border-slate-200 bg-white text-on-surface rounded-lg text-xs font-semibold focus:outline-none focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Amount validation error */}
        {amount && Number(amount) > remaining && (
          <p className="text-[11px] font-bold text-error bg-red-50 p-2 rounded-lg border border-red-200">
            Amount cannot exceed remaining balance of ₹{remaining.toLocaleString('en-IN')}.
          </p>
        )}

        {/* Payment method buttons */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Select payment mode</p>
          <div className="grid grid-cols-3 gap-2">
            {['Cheque', 'Cash', 'Bank Transfer'].map(method => (
              <button
                key={method}
                onClick={() => onConfirm(method, Number(amount), reference)}
                disabled={!amount || Number(amount) <= 0 || Number(amount) > remaining}
                className="py-3 border border-slate-200 bg-slate-50 hover:bg-primary hover:text-white hover:border-primary text-[11px] font-bold text-on-surface rounded-lg transition-all duration-150 active-scale focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {method}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-slate-100 rounded-lg transition-all active-scale focus:outline-none"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
