import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * AlertBanner — inline success or error message strip with light & dark theme support
 * Props:
 *   type    {'success'|'error'} — visual variant
 *   message {string}
 */
export default function AlertBanner({ type, message }) {
  if (!message) return null;

  const isSuccess = type === 'success';
  const styles = isSuccess
    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300'
    : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300';

  return (
    <div className={`border text-xs font-semibold p-2.5 rounded-lg flex items-center gap-2 animate-fadeIn ${styles}`}>
      {isSuccess ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
      ) : (
        <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
      )}
      <span>{message}</span>
    </div>
  );
}
