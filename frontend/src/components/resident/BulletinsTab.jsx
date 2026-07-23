import React from 'react';
import EmptyState from '../ui/EmptyState';

/**
 * BulletinsTab — Resident "Society Bulletin" tab.
 * Displays all notices published by the admin.
 */
export default function BulletinsTab({ notices }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-soft p-5 sm:p-6 space-y-5 animate-fadeIn">
      <div>
        <h2 className="font-headline-md text-on-surface font-extrabold">Society Bulletin Board</h2>
        <p className="text-xs text-on-surface-variant mt-0.5">
          Important announcements from the Management Committee
        </p>
      </div>

      {notices.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-3">
          <span className="material-symbols-outlined text-5xl text-slate-300">notifications_none</span>
          <p className="text-sm font-semibold text-on-surface-variant">No notices published yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map(notice => (
            <div
              key={notice.id}
              className="p-5 bg-slate-50 border rounded-xl border-slate-200 space-y-3 hover:bg-white transition-all"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-sm font-bold text-on-surface-variant">{notice.date}</span>
              </div>
              <div>
                <h3 className="font-bold text-md text-on-surface">{notice.title}</h3>
                <p className="text-md text-on-surface-variant leading-relaxed font-medium mt-1 whitespace-pre-wrap">{notice.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
