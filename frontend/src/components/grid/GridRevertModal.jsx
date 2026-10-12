import React from 'react';

/**
 * GridRevertModal — confirm-before-revert dialog used inside MonthlyGridView.
 */
export default function GridRevertModal({ state, onConfirm, onCancel }) {
  if (!state) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-2xl max-w-sm w-full p-6 space-y-4 animate-scaleIn"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/50 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-error text-xl">undo</span>
          </div>
          <div>
            <h3 className="font-bold text-sm text-on-surface dark:text-zinc-100">Revert Payment?</h3>
            <p className="text-xs text-on-surface-variant dark:text-zinc-400 mt-1 leading-relaxed">
              This will mark{' '}
              <span className="font-bold text-on-surface dark:text-zinc-200">{state.month} {state.year}</span> for{' '}
              <span className="font-bold text-primary">Unit {state.tenementNumber}</span> back to{' '}
              <span className="font-bold text-error dark:text-red-400">Unpaid</span>.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-on-surface-variant dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-all active-scale"
          >
            Keep Paid
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-xs font-bold text-white bg-error hover:bg-red-700 rounded-lg transition-all active-scale focus:outline-none focus:ring-2 focus:ring-error"
          >
            Yes, Revert
          </button>
        </div>
      </div>
    </div>
  );
}
