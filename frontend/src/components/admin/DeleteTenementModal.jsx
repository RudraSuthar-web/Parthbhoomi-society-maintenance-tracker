import React from 'react';

/**
 * DeleteTenementModal — Confirmation dialog before deleting a tenement.
 */
export default function DeleteTenementModal({
  tenement,
  onConfirm,
  onCancel,
}) {
  if (!tenement) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onCancel}
    >
      <div
        className="bg-white max-w-md w-full rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-5 animate-scaleIn"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
         
          <div>
            <h3 className="font-headline-md text-on-surface font-extrabold leading-tight">
              Delete Tenement Unit {tenement.tenementNumber}?
            </h3>
            <p className="text-sm text-on-surface-variant font-semibold tracking-wider mt-1">
              {tenement.ownerName}
            </p>
          </div>
        </div>

        <div className="p-3.5 bg-red-50 border font-mono border-red-200 text-error rounded-xl text-sm space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            Permanent Action Warning
          </p>
          <p className="text-[15px] text-black leading-relaxed font-medium">
            This will permanently remove 
          </p>
          <div className="flex font-bold bg-zinc-100 p-1  justify-center rounded-md border border-zinc-800 text-[18px] text-error mt-3 mb-3">Unit {tenement.tenementNumber} ({tenement.ownerName})</div>
          <p className="text-[15px] text-black leading-relaxed font-medium">
            all its 12-month maintenance dues, payment installments, and resident login account from the database.
          </p>
        </div>

        <div className="flex justify-end gap-2.5 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-white text-slate-700 border border-slate-200 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all active-scale"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 bg-error text-white text-xs font-bold rounded-xl shadow-soft hover:bg-red-700 transition-all active-scale flex items-center gap-1.5"
          >
            Delete Tenement
          </button>
        </div>
      </div>
    </div>
  );
}
