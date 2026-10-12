import React from 'react';

/**
 * StatCard — reusable KPI card supporting light and dark themes.
 * Props:
 *   label  {string}  — metric label
 *   value  {string|number} — primary value displayed large
 *   sub    {string}  — small subtitle
 *   icon   {React.ComponentType}  — Lucide or React icon component
 *   color  {string}  — tailwind text color class for icon
 */
export default function StatCard({ label, value, sub, icon: Icon, color }) {
  return (
    <div className="relative overflow-hidden bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 sm:p-4 shadow-soft transition-colors duration-200">
      <div className="relative z-10">
        <p className="font-extrabold text-xl sm:text-2xl text-on-surface dark:text-zinc-100">{value}</p>
        <p className="text-[13px] sm:text-[14px] font-bold text-on-surface-variant dark:text-zinc-400 uppercase tracking-wider mt-0.5">{label}</p>
        {sub && <p className="text-[12px] sm:text-[13px] text-on-surface-variant dark:text-zinc-400 mt-0.5">{sub}</p>}
      </div>
      {Icon && (
        <Icon
          aria-hidden="true"
          className={`absolute -bottom-3 -right-3 w-20 h-20 sm:w-24 sm:h-24 opacity-20 pointer-events-none select-none ${color || 'text-primary dark:text-zinc-200'}`}
        />
      )}
    </div>
  );
}
