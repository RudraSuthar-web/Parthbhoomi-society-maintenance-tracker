import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, AlertCircle, UploadCloud, Loader2 } from 'lucide-react';
import { DriveIcon } from './ExpensesTab';

/**
 * AddExpenseModal — Modal dialog popup for recording a new society expense.
 * Syncs receipts to Google Drive archive.
 */
export default function AddExpenseModal({
  expCategory, setExpCategory,
  expDescription, setExpDescription,
  expAmount, setExpAmount,
  expDate, setExpDate,
  expFileName,
  uploadingToDrive,
  expSuccess, expError,
  handleFileChange,
  handleSaveExpense,
  onClose,
}) {
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const modalNode = (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-scaleIn max-h-[90vh] overflow-y-auto thin-scrollbar"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div>
              <h2 className="font-headline-md text-on-surface dark:text-zinc-100 font-extrabold">Record New Expense</h2>
              <p className="text-xs text-on-surface-variant dark:text-zinc-400 mt-1">Sync bill receipt to society's Google Drive archive</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 flex items-center justify-center transition-all active:scale-95"
            title="Close"
          >
            <X className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
          </button>
        </div>

        {/* Success Alert */}
        {expSuccess && (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-semibold p-3.5 rounded-lg flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span>{expSuccess}</span>
          </div>
        )}

        {/* Error Alert */}
        {expError && (
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-error dark:text-red-400 text-xs font-semibold p-3.5 rounded-lg flex items-start gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-error dark:text-red-400 flex-shrink-0 mt-0.5" />
            <span>{expError}</span>
          </div>
        )}

        <form onSubmit={handleSaveExpense} className="space-y-4 text-xs font-semibold">
          {/* Category */}
          <div className="space-y-1">
            <label className="text-on-surface-variant dark:text-zinc-400 uppercase tracking-wider block">Category</label>
            <select
              value={expCategory}
              onChange={e => setExpCategory(e.target.value)}
              className="w-full p-2.5 border border-slate-200 dark:border-zinc-700 rounded-lg bg-slate-50 dark:bg-zinc-800 text-on-surface dark:text-zinc-100 outline-none focus:border-primary transition-all cursor-pointer"
            >
              <option value="MAINTENANCE" className="dark:bg-zinc-900">Maintenance</option>
              <option value="REPAIRS" className="dark:bg-zinc-900">Repairs & Renovation</option>
              <option value="UTILITIES" className="dark:bg-zinc-900">Electricity & Utilities</option>
              <option value="SECURITY" className="dark:bg-zinc-900">Security / Watchman</option>
              <option value="CLEANING" className="dark:bg-zinc-900">Cleaning & Sanitation</option>
              <option value="MISC" className="dark:bg-zinc-900">Miscellaneous</option>
            </select>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-on-surface-variant dark:text-zinc-400 uppercase tracking-wider block">Description</label>
            <input
              type="text"
              required
              placeholder="e.g. Borewell pump repair, Common area bulb replacement"
              value={expDescription}
              onChange={e => setExpDescription(e.target.value)}
              className="w-full p-2.5 border border-slate-200 dark:border-zinc-700 rounded-lg bg-slate-50 dark:bg-zinc-800 text-on-surface dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 outline-none focus:border-primary transition-all font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Amount */}
            <div className="space-y-1">
              <label className="text-on-surface-variant dark:text-zinc-400 uppercase tracking-wider block">Amount (₹)</label>
              <input
                type="number"
                required
                min="1"
                placeholder="₹ Amount"
                value={expAmount}
                onChange={e => setExpAmount(e.target.value)}
                className="w-full p-2.5 border border-slate-200 dark:border-zinc-700 rounded-lg bg-slate-50 dark:bg-zinc-800 text-on-surface dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 outline-none focus:border-primary transition-all font-mono"
              />
            </div>

            {/* Date */}
            <div className="space-y-1">
              <label className="text-on-surface-variant dark:text-zinc-400 uppercase tracking-wider block">Date</label>
              <input
                type="date"
                required
                value={expDate}
                onChange={e => setExpDate(e.target.value)}
                className="w-full p-2.5 border border-slate-200 dark:border-zinc-700 rounded-lg bg-slate-50 dark:bg-zinc-800 text-on-surface dark:text-zinc-100 outline-none focus:border-primary transition-all font-mono"
              />
            </div>
          </div>

          {/* Bill Attachment / Drive sync */}
          <div className="space-y-1">
            <label className="text-on-surface-variant dark:text-zinc-400 uppercase tracking-wider block">Bill Receipt / Invoice</label>
            <div className="border-2 border-dashed border-slate-200 dark:border-zinc-700 rounded-xl p-4 text-center hover:border-primary dark:hover:border-primary transition-colors cursor-pointer relative group bg-slate-50/50 dark:bg-zinc-800/50">
              <input
                type="file"
                id="expense-file-input"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <UploadCloud className="w-8 h-8 text-slate-400 dark:text-zinc-500 group-hover:text-primary transition-colors mx-auto" />
              <p className="text-[13px] text-on-surface-variant dark:text-zinc-300 font-mono mt-1 group-hover:text-on-surface dark:group-hover:text-white transition-colors">
                {expFileName ? expFileName : 'Choose file or drag & drop'}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium font-mono mt-0.5">
                PDF or Images (will sync to Google Drive)
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-on-surface-variant dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploadingToDrive}
              className={`px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg shadow-soft hover:bg-primary flex items-center justify-center gap-1.5 transition-all active:scale-95 ${uploadingToDrive ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {uploadingToDrive ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Syncing to Google Drive...</span>
                </>
              ) : (
                <>
                  <DriveIcon className="w-4 h-4" />
                  <span>Record & Save Bill</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalNode, document.body);
  }
  return modalNode;
}
