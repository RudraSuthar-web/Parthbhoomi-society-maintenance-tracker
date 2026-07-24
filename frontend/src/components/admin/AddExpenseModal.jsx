import React from 'react';

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
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-scaleIn max-h-[90vh] overflow-y-auto thin-scrollbar"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
          
            <div>
              <h2 className="font-headline-md text-on-surface font-extrabold">Record New Expense</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">Sync bill receipt to society's Google Drive archive</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all active-scale"
            title="Close"
          >
            <span className="material-symbols-outlined text-slate-500 text-sm">close</span>
          </button>
        </div>

        {/* Success Alert */}
        {expSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold p-3.5 rounded-lg flex items-center gap-2 animate-fadeIn">
            <span className="material-symbols-outlined text-sm font-bold">check_circle</span>
            <span>{expSuccess}</span>
          </div>
        )}

        {/* Error Alert */}
        {expError && (
          <div className="bg-red-50 border border-red-200 text-error text-xs font-semibold p-3.5 rounded-lg flex items-start gap-2 animate-fadeIn">
            <span className="material-symbols-outlined text-sm font-bold mt-0.5">error</span>
            <span>{expError}</span>
          </div>
        )}

        {/* Expense Form */}
        <form onSubmit={handleSaveExpense} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={expCategory}
              onChange={(e) => setExpCategory(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-200 bg-slate-50 text-on-surface rounded-lg text-xs font-semibold focus:outline-none focus:border-primary focus:bg-white transition-all"
            >
              <option value="Maintenance">Maintenance</option>
              <option value="Utilities">Utilities</option>
              <option value="Salaries">Salaries</option>
              <option value="Repairs">Repairs</option>
              <option value="Others">Others</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Description
            </label>
            <input
              type="text"
              placeholder="e.g. Common Lift Maintenance"
              value={expDescription}
              onChange={(e) => setExpDescription(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-200 bg-slate-50 text-on-surface rounded-lg text-xs font-semibold focus:outline-none focus:border-primary focus:bg-white transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Amount (₹)
              </label>
              <input
                type="number"
                placeholder="Amount"
                value={expAmount}
                onChange={(e) => setExpAmount(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 bg-slate-50 text-on-surface rounded-lg text-xs font-semibold focus:outline-none focus:border-primary focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Date
              </label>
              <input
                type="date"
                value={expDate}
                onChange={(e) => setExpDate(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 bg-slate-50 text-on-surface rounded-lg text-xs font-semibold focus:outline-none focus:border-primary focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Upload Bill / Receipt
            </label>
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center bg-slate-50 hover:bg-slate-100/50 hover:border-primary/50 transition-all cursor-pointer relative group">
              <input
                type="file"
                id="expense-file-input"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors text-2xl">
                cloud_upload
              </span>
              <p className="text-[10px] text-on-surface-variant font-bold mt-1 group-hover:text-on-surface transition-colors">
                {expFileName ? expFileName : 'Choose file or drag & drop'}
              </p>
              <p className="text-[9px] text-slate-400 font-medium mt-0.5">
                PDF or Images (will sync to Google Drive)
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-on-surface-variant hover:bg-slate-100 rounded-lg transition-all active-scale"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploadingToDrive}
              className={`px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg shadow-soft hover:bg-primary-container flex items-center justify-center gap-1.5 transition-all active-scale ${uploadingToDrive ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {uploadingToDrive ? (
                <>
                  <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                  <span>Syncing to Google Drive...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">add_to_drive</span>
                  <span>Record & Save Bill</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
