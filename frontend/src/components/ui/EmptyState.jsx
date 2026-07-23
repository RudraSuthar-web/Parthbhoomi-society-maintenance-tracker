import React from 'react';

/**
 * EmptyState — centred placeholder shown when a list is empty
 * Props:
 *   icon    {string} — material symbol name
 *   message {string}
 */
export default function EmptyState({ icon, message }) {
  return (
    <div className="flex flex-col items-center py-12 gap-2">
      <span className="material-symbols-outlined text-4xl text-slate-300">{icon}</span>
      <p className="text-sm text-on-surface-variant font-medium">{message}</p>
    </div>
  );
}
