import React from 'react';

/**
 * StatCard — reusable KPI card
 * Props:
 *   label  {string}  — metric label
 *   value  {string|number} — primary value displayed large
 *   sub    {string}  — small subtitle
 *   icon   {string}  — material symbol name
 *   color  {string}  — tailwind text color class for icon
 *   bg     {string}  — tailwind bg color class for icon container
 */
export default function StatCard({ label, value, sub, icon, color, bg }) {
  return (
    <div className="bg-white flex justify-between border border-slate-200 rounded-xl p-2 sm:p-3 shadow-soft">
      <div>
        <p className="font-extrabold text-xl text-on-surface">{value}</p>
        <p className="text-[14px] font-bold text-on-surface-variant uppercase tracking-wider mt-0.5">{label}</p>
        <p className="text-[13px] text-on-surface-variant mt-0.5">{sub}</p>
      </div>
      <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-2`}>
        <span className={`material-symbols-outlined text-[18px] ${color}`}>{icon}</span>
      </div>
    </div>
  );
}
