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
        className="bg-white dark:bg-zinc-900 max-w-md w-full rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 space-y-5 animate-scaleIn"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div>
            <h3 className="font-headline-md text-on-surface dark:text-zinc-100 font-extrabold leading-tight">
              Delete Tenement Unit {tenement.tenementNumber}?
            </h3>
            <p className="text-sm text-on-surface-variant dark:text-zinc-400 font-semibold tracking-wider mt-1">
              {tenement.ownerName}
            </p>
          </div>
        </div>

        <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border font-mono border-red-200 dark:border-red-900/60 text-error dark:text-red-400 rounded-xl text-sm space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            Permanent Action Warning
          </p>
          <p className="text-[15px] text-slate-700 dark:text-zinc-300 leading-relaxed font-medium">
            This will permanently remove 
          </p>
          <div className="flex font-bold bg-zinc-100 dark:bg-zinc-800 p-1 justify-center rounded-md border border-zinc-300 dark:border-zinc-700 text-[18px] text-error dark:text-red-400 mt-3 mb-3">
            Unit {tenement.tenementNumber} ({tenement.ownerName})
          </div>
          <p className="text-[15px] text-slate-700 dark:text-zinc-300 leading-relaxed font-medium">
            all its 12-month maintenance dues, payment installments, and resident login account from the database.
          </p>
        </div>

        <div className="flex justify-end gap-2.5 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 text-xs font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-700 transition-all active-scale"
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
