import React from 'react';

/**
 * AlertBanner — inline success or error message strip
 * Props:
 *   type    {'success'|'error'} — visual variant
 *   message {string}
 */
export default function AlertBanner({ type, message }) {
  if (!message) return null;

  const isSuccess = type === 'success';
  const styles = isSuccess
    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
    : 'bg-red-50 border-red-200 text-error';
  const icon = isSuccess ? 'verified' : 'error';

  return (
    <div className={`border text-xs font-semibold p-2.5 rounded-lg flex items-center gap-2 animate-fadeIn ${styles}`}>
      <span className="material-symbols-outlined text-sm">{icon}</span>
      {message}
    </div>
  );
}
