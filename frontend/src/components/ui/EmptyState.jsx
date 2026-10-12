import React from 'react';
import { Inbox } from 'lucide-react';

/**
 * EmptyState — centred placeholder shown when a list is empty
 * Props:
 *   icon    {React.ComponentType|string} — Lucide icon component or material symbol name
 *   message {string}
 */
export default function EmptyState({ icon: Icon = Inbox, message }) {
  const isStringIcon = typeof Icon === 'string';

  return (
    <div className="flex flex-col items-center py-12 gap-2 text-center">
      {isStringIcon ? (
        <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-zinc-600">
          {Icon}
        </span>
      ) : (
        <Icon className="w-10 h-10 text-slate-300 dark:text-zinc-600 stroke-[1.5]" />
      )}
      <p className="text-sm text-on-surface-variant dark:text-zinc-400 font-medium">{message}</p>
    </div>
  );
}
