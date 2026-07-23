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
export const DUES_AMOUNT = 500;

/** 1-based index of current month (e.g. July → 7) */
export const CURRENT_MONTH_IDX = new Date().getMonth() + 1;

/**
 * How many months are "billed" (i.e. should have been paid) for a given year.
 * - Past year  → always 12
 * - Current year → months elapsed so far (1–12)
 * - Future year  → 0  (nothing is due yet)
 */
export const getBilledMonths = (year) => {
  const y = Number(year);
  const cy = new Date().getFullYear();
  if (y < cy) return 12;
  if (y > cy) return 0;
  return new Date().getMonth() + 1; // 1-based
};

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


