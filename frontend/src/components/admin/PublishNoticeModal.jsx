import React from 'react';
import EmptyState from '../ui/EmptyState';

/**
 * PublishNoticeModal — modal dialog for broadcasting a new notice.
 * All state and handlers are passed via props from AdminDashboard.
 */
export default function PublishNoticeModal({
  noticeTitle, setNoticeTitle,
  noticeContent, setNoticeContent,
  noticeSuccessMsg,
  onSubmit,
  onClose,
}) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-scaleIn"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-headline-md text-on-surface dark:text-zinc-100 font-extrabold flex items-center gap-2">
              Broadcast Notice
            </h2>
            <p className="text-sm text-on-surface-variant dark:text-zinc-400 mt-1">Draft a society-wide notification</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 flex items-center justify-center transition-all active-scale"
          >
            <span className="material-symbols-outlined text-slate-500 dark:text-zinc-400 text-sm">close</span>
          </button>
        </div>

        {/* Success message */}
        {noticeSuccessMsg && (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-semibold p-3 rounded-lg flex items-center gap-2 animate-fadeIn">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            {noticeSuccessMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-[15px] font-bold text-on-surface-variant dark:text-zinc-400 uppercase tracking-wider mb-1.5">
              Notice Title
            </label>
            <input
              type="text"
              placeholder="e.g. Water Supply Shutdown"
              value={noticeTitle}
              onChange={e => setNoticeTitle(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-on-surface dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 rounded-lg text-sm font-mono focus:outline-none focus:border-primary focus:bg-white dark:focus:bg-zinc-800/80 transition-all"
            />
          </div>
          <div>
            <label className="block text-[15px] font-bold text-on-surface-variant dark:text-zinc-400 uppercase tracking-wider">
              Notice Details
            </label>
            <textarea
              rows={4}
              placeholder="Write the full announcement…"
              value={noticeContent}
              onChange={e => setNoticeContent(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-on-surface dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 rounded-lg text-sm font-mono focus:outline-none focus:border-primary focus:bg-white dark:focus:bg-zinc-800/80 transition-all resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-on-surface-variant dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-all active-scale"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg shadow-soft hover:bg-primary flex items-center justify-center gap-1.5 transition-all active-scale"
            >
              <span className="material-symbols-outlined text-sm">campaign</span>
              Publish Notice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
