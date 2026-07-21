// ─── Date Utilities ──────────────────────────────────────────────────────────
// Single source of truth for the current billing period.
// The app uses the REAL current month to determine "this month's" dues.

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const now = new Date();

/** e.g. "July" */
export const CURRENT_MONTH = MONTH_NAMES[now.getMonth()];

/** e.g. 2026 */
export const CURRENT_YEAR = now.getFullYear();

/** e.g. "July 2026" */
export const CURRENT_PERIOD = `${CURRENT_MONTH} ${CURRENT_YEAR}`;

/** Returns 0-based month index for a given month name */
export const monthIndex = (name) => MONTH_NAMES.indexOf(name);

/** All 12 month names */
export const ALL_MONTHS = MONTH_NAMES;

/** Abbreviated month names */
export const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

/** Standard maintenance amount (₹) */
export const DUES_AMOUNT = 1200;

/**
 * Formats a date string (YYYY-MM-DD) to a human-readable Indian locale date.
 * @param {string} dateStr
 * @returns {string}
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};


