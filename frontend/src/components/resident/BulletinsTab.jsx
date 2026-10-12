import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import EmptyState from '../ui/EmptyState';

/**
 * BulletinsTab — Resident "Society Bulletin" tab.
 * Displays all notices published by the admin.
 */
export default function BulletinsTab({ notices }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-soft p-5 sm:p-6 space-y-5 animate-fadeIn">
      <div>
        <h2 className="font-headline-md text-on-surface dark:text-zinc-100 font-extrabold">Society Bulletin Board</h2>
        <p className="text-xs text-on-surface-variant dark:text-zinc-400 mt-0.5">
          Important announcements from the Management Committee
        </p>
      </div>

      {notices.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-50/80 via-white to-slate-50/50 dark:from-zinc-900/80 dark:via-zinc-900 dark:to-zinc-800/50 border border-dashed border-slate-200 dark:border-zinc-800 py-12 px-6 flex flex-col items-center text-center">
          {/* Decorative ambient background blur */}
          <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-primary/5 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />

          {/* Visual pinboard card illustration */}
          <div className="relative mb-5">
            {/* Background tilted card */}
            <div className="w-40 sm:w-48 h-28 bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700/80 rounded-xl shadow-sm rotate-6 absolute -inset-1 opacity-60" />
            
            {/* Front card styled as a pinned notice sheet */}
            <div className="relative w-40 sm:w-48 h-28 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl shadow-md p-3.5 flex flex-col justify-between -rotate-2 transition-transform duration-300 hover:rotate-0 animate-card-wiggle">
              {/* Pushpin at the top */}
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-sm border-2 border-white dark:border-zinc-900 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white/70" />
              </div>

              {/* Placeholder note lines */}
              <div className="pt-2 space-y-1.5">
                <div className="h-2 bg-slate-200 dark:bg-zinc-700 rounded-full w-3/4 mx-auto" />
                <div className="h-1.5 bg-slate-100 dark:bg-zinc-700/60 rounded-full w-5/6 mx-auto" />
                <div className="h-1.5 bg-slate-100 dark:bg-zinc-700/60 rounded-full w-1/2 mx-auto" />
              </div>

              <div className="flex items-center justify-center gap-1 text-[10px] font-bold font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 rounded-full py-0.5 px-2 w-fit mx-auto border border-emerald-100 dark:border-emerald-800">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>All Clear</span>
              </div>
            </div>
          </div>

          {/* Creative message */}
          <h3 className="font-bold text-base sm:text-lg text-on-surface dark:text-zinc-100">
            The Bulletin Board is Quiet
          </h3>
          <p className="text-xs sm:text-sm text-on-surface-variant dark:text-zinc-400 max-w-sm mt-2 font-mono leading-relaxed">
            No active announcements or circulars right now. Everything is running smoothly in the society!
          </p>

          {/* Status pill tag */}
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700 text-[11px] font-semibold text-on-surface-variant dark:text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Updated recently · No pending notices</span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map(notice => (
            <div
              key={notice.id}
              className="p-5 bg-slate-50 dark:bg-zinc-800/60 border rounded-xl border-slate-200 dark:border-zinc-700/80 space-y-3 hover:bg-white dark:hover:bg-zinc-800 transition-all"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-sm font-bold text-on-surface-variant dark:text-zinc-400">{notice.date}</span>
              </div>
              <div>
                <h3 className="font-bold text-md text-on-surface dark:text-zinc-100">{notice.title}</h3>
                <p className="text-md text-on-surface-variant dark:text-zinc-300 leading-relaxed font-medium mt-1 whitespace-pre-wrap">{notice.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
