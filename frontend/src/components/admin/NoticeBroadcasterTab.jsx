import React from 'react';
import EmptyState from '../ui/EmptyState';

/**
 * NoticeBroadcasterTab — Admin "Notice Broadcaster" tab.
 * Shows list of notices with delete; tapping a notice opens a detail view inline.
 */
export default function NoticeBroadcasterTab({
  notices,
  selectedNotice, setSelectedNotice,
  onDelete,
  onOpenPublish,
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-soft p-5 sm:p-6 space-y-5 animate-fadeIn">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="font-headline-md text-on-surface font-extrabold">Active Announcements</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">Manage live bulletins broadcasted to residents</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-bold bg-slate-50 border border-slate-200 text-on-surface-variant px-2.5 py-2 rounded-md">
            {notices.length} total
          </span>
          <button
            onClick={onOpenPublish}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg shadow-md hover:bg-primary transition-all active-scale"
          >
            <span className="material-symbols-outlined text-sm">campaign</span>
            Publish Notice
          </button>
        </div>
      </div>

      {/* Notice list */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto thin-scrollbar pr-1">
        {notices.length === 0 ? (
          <EmptyState icon="campaign" message="No notices published yet." />
        ) : notices.map(notice => (
          <div
            key={notice.id}
            className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-start gap-4 hover:bg-white hover:border-slate-300 transition-all cursor-pointer group"
            onClick={() => setSelectedNotice(notice)}
          >
            <div className="flex gap-3 flex-1 min-w-0">
              <div className="space-y-1 flex-1 min-w-0">
                <span className="text-[12px] text-on-surface-variant font-bold">{notice.date}</span>
                <h4 className="font-bold text-md text-on-surface leading-tight group-hover:text-primary transition-colors">{notice.title}</h4>
                <p className="text-[15px] sm:text-md text-on-surface-variant leading-relaxed font-medium line-clamp-2">{notice.content}</p>
              </div>
            </div>
            <button
              onClick={e => { e.stopPropagation(); onDelete(notice.id); }}
              className="p-1.5 text-slate-400 hover:text-error hover:bg-red-50 rounded-lg transition-all active-scale flex-shrink-0"
              title="Delete Notice"
            >
              <span className="material-symbols-outlined text-sm">delete</span>
            </button>
          </div>
        ))}
      </div>

      {/* Notice detail overlay */}
      {selectedNotice && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedNotice(null)}
        >
          <div
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-scaleIn"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] text-on-surface-variant font-bold">{selectedNotice.date}</span>
                <h2 className="font-headline-md text-on-surface font-extrabold pr-4">{selectedNotice.title}</h2>
              </div>
              <button
                onClick={() => setSelectedNotice(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all active-scale flex-shrink-0"
              >
                <span className="material-symbols-outlined text-slate-500 text-sm">close</span>
              </button>
            </div>
            <div className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-100">
              {selectedNotice.content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
