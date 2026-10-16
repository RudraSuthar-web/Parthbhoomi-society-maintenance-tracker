/**
 * Society Configuration
 * Provides centralized branding and labels for the entire application.
 * Values can be customized per deployment using VITE_ environment variables,
 * defaulting safely to Parthbhoomi CHS so existing live deployments never break.
 */

export const SOCIETY_CONFIG = {
  // Full formal name of the society (e.g. "Parthbhoomi CHS")
  name: import.meta.env.VITE_SOCIETY_NAME || 'CHS',

  // Short display name (e.g. "Parthbhoomi")
  shortName: import.meta.env.VITE_SOCIETY_SHORT_NAME || 'CHS',

  // Subtitle / tagline for login and headers
  subtitle: import.meta.env.VITE_SOCIETY_SUBTITLE || 'Co-operative Housing Society · Maintenance Tracker',

  // Code / Authorized signatory tag for receipts (e.g. "PARTHBHOOMI_CHS")
  code: import.meta.env.VITE_SOCIETY_CODE || 'CHS',

  // Label for expenses and invoices
  expenseTag: import.meta.env.VITE_SOCIETY_EXPENSE_TAG || 'Society Expense Records',

  // Maximum tenement number allowed for this society (defaults to 60 for Parthbhoomi)
  maxTenements: Number(import.meta.env.VITE_MAX_TENEMENTS) || 60,
};

export default SOCIETY_CONFIG;
