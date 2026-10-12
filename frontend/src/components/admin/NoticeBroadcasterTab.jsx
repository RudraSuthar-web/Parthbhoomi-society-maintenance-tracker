import React from 'react';
import { Megaphone, Plus, Trash2, X, CheckCircle2, BellRing, Sparkles } from 'lucide-react';

/**
 * NoticeBroadcasterTab — Admin "Notice Broadcaster" tab.
 * Shows list of notices with delete, publish CTA, and creative empty state.
 * Tapping a notice opens a detail view inline with full light/dark theme support.
 */
export default function NoticeBroadcasterTab({
  notices,
  selectedNotice, setSelectedNotice,
  onDelete,
  onOpenPublish,
}) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-soft p-5 sm:p-6 space-y-5 animate-fadeIn transition-colors">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-4">
        <div>
          <h2 className="font-headline-md text-on-surface dark:text-zinc-100 font-extrabold">Active Announcements</h2>
          <p className="text-xs text-on-surface-variant dark:text-zinc-400 mt-0.5">Manage live bulletins broadcasted to residents</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-bold bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-on-surface-variant dark:text-zinc-300 px-2.5 py-2 rounded-md">
            {notices.length} total
          </span>
          <button
            onClick={onOpenPublish}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary dark:bg-white text-white dark:text-zinc-950 text-xs font-bold rounded-lg shadow-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Publish Notice
          </button>
        </div>
      </div>

      {/* Notice list or Creative Empty State */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto thin-scrollbar pr-1">
        {notices.length === 0 ? (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-50/80 via-white to-slate-50/50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950 border border-dashed border-slate-200 dark:border-zinc-800 py-12 px-6 flex flex-col items-center text-center">
            {/* Decorative ambient background blur */}
            <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-primary/5 dark:bg-white/5 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full bg-amber-500/5 blur-2xl pointer-events-none" />

            {/* Visual pinboard card illustration */}
            <div className="relative mb-5">
              {/* Background tilted card */}
              <div className="w-44 sm:w-52 h-28 bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700 rounded-xl shadow-sm rotate-6 absolute -inset-1 opacity-60" />
              
              {/* Front card styled as a pinned announcement sheet */}
              <div className="relative w-44 sm:w-52 h-28 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl shadow-md p-3.5 flex flex-col justify-between -rotate-2 transition-transform duration-300 hover:rotate-0 animate-card-wiggle">
                {/* Pushpin at the top */}
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-sm border-2 border-white dark:border-zinc-900 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/70" />
                </div>

                {/* Placeholder note lines */}
                <div className="pt-2 space-y-1.5">
                  <div className="h-2 bg-slate-200 dark:bg-zinc-700 rounded-full w-3/4 mx-auto" />
                  <div className="h-1.5 bg-slate-100 dark:bg-zinc-750 rounded-full w-5/6 mx-auto" />
                  <div className="h-1.5 bg-slate-100 dark:bg-zinc-750 rounded-full w-1/2 mx-auto" />
                </div>

                <div className="flex items-center justify-center gap-1 text-[10px] font-bold font-mono text-primary dark:text-zinc-200 bg-primary/10 dark:bg-white/10 rounded-full py-0.5 px-2 w-fit mx-auto border border-primary/20 dark:border-white/20">
                  <Megaphone className="w-3 h-3 text-primary dark:text-zinc-200" />
                  <span>Broadcast Ready</span>
                </div>
              </div>
            </div>

            {/* Creative message */}
            <h3 className="font-bold text-base sm:text-lg text-on-surface dark:text-zinc-100">
              No Notices Published Yet
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant dark:text-zinc-400 max-w-sm mt-2 leading-relaxed">
              Keep residents informed about maintenance schedules, AGMs, water supply updates, or urgent community alerts.
            </p>

            {/* Action button inside empty state */}
            <button
              onClick={onOpenPublish}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-primary dark:bg-white text-white dark:text-zinc-950 text-xs font-bold rounded-xl shadow-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Broadcast First Notice
            </button>
          </div>
        ) : notices.map(notice => (
          <div
            key={notice.id}
            className="p-4 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 rounded-xl flex justify-between items-start gap-4 hover:bg-white dark:hover:bg-zinc-800 hover:border-slate-300 dark:hover:border-zinc-600 transition-all cursor-pointer group"
            onClick={() => setSelectedNotice(notice)}
          >
            <div className="flex gap-3 flex-1 min-w-0">
              <div className="space-y-1 flex-1 min-w-0">
                <span className="text-[12px] text-on-surface-variant dark:text-zinc-400 font-bold">{notice.date}</span>
                <h4 className="font-bold text-md text-on-surface dark:text-zinc-100 leading-tight group-hover:text-primary dark:group-hover:text-white transition-colors">{notice.title}</h4>
                <p className="text-[15px] sm:text-md text-on-surface-variant dark:text-zinc-300 leading-relaxed font-medium line-clamp-2">{notice.content}</p>
              </div>
            </div>
            <button
              onClick={e => { e.stopPropagation(); onDelete(notice.id); }}
              className="p-1.5 text-slate-400 dark:text-zinc-500 hover:text-error dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-all active:scale-95 flex-shrink-0"
              title="Delete Notice"
            >
              <Trash2 className="w-4 h-4" />
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
            className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-scaleIn text-on-surface dark:text-zinc-100"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] text-on-surface-variant dark:text-zinc-400 font-bold">{selectedNotice.date}</span>
                <h2 className="font-headline-md text-on-surface dark:text-zinc-100 font-extrabold pr-4">{selectedNotice.title}</h2>
              </div>
              <button
                onClick={() => setSelectedNotice(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center transition-all active:scale-95 flex-shrink-0"
              >
                <X className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
              </button>
            </div>
            <div className="text-sm text-on-surface-variant dark:text-zinc-300 leading-relaxed whitespace-pre-wrap bg-slate-50 dark:bg-zinc-800/60 p-4 rounded-xl border border-slate-100 dark:border-zinc-700/60">
              {selectedNotice.content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
