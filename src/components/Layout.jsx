import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { ALL_MONTHS, CURRENT_MONTH, CURRENT_YEAR } from '../utils/dateUtils';

export default function Layout({ children, currentTab, setCurrentTab }) {
  const {
    user, logout,
    selectedYear, setSelectedYear,
    selectedMonth, setSelectedMonth,
    availableYears,
  } = useContext(AppContext);

  if (!user) return <>{children}</>;

  const isAdmin = user.role === 'admin';
  const isCurrentPeriod = selectedYear === CURRENT_YEAR && selectedMonth === CURRENT_MONTH;

  const menuItems = isAdmin
    ? [
        { id: 'overview',      name: 'Global Overview',    icon: 'dashboard' },
        { id: 'tenements',     name: 'All Tenements',      icon: 'domain' },
        { id: 'monthly-grid',  name: 'Monthly Grid',       icon: 'grid_view' },
        { id: 'notices',       name: 'Notice Broadcaster', icon: 'campaign' },
        { id: 'expenses',      name: 'Expense Tracker',    icon: 'account_balance_wallet' },
      ]
    : [
        { id: 'dashboard', name: 'My Dashboard',      icon: 'home' },
        { id: 'ledger',    name: 'Transaction Ledger', icon: 'receipt_long' },
        { id: 'notices',   name: 'Society Bulletin',   icon: 'campaign' },
        { id: 'expenses',  name: 'Society Expenses',   icon: 'account_balance_wallet' },
        { id: 'profile',   name: 'My Profile',         icon: 'person' },
      ];

  // ── Shared Period Selector (used in both sidebar + mobile) ─────────────────
  const PeriodSelector = ({ compact = false }) => (
    <div className={`rounded-xl border border-slate-200 bg-slate-50 overflow-hidden ${compact ? '' : ''}`}>
      {/* Header label */}
      <div className="flex items-center justify-between px-3 pt-2 pb-2">
        <div className="flex items-center ">

          <label className="block text-[12px] font-bold text-on-surface-variant uppercase tracking-widest px-1 ">
            Year
          </label>
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full bg-transparent text-[13px] font-bold text-primary outline-none cursor-pointer px-1 appearance-none pr-6"
            >
              {availableYears.map(y => (
                <option key={y} value={y}>
                  {y}{y === CURRENT_YEAR ? ' ●' : ''}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-[14px] pointer-events-none">
              expand_more
            </span>
          </div>
        
        </div>
        {!isCurrentPeriod && (
          <button
            onClick={() => { setSelectedYear(CURRENT_YEAR); setSelectedMonth(CURRENT_MONTH); }}
            className="text-[9px] font-bold text-primary bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-full hover:bg-blue-100 transition-all"
            title="Jump to current month"
          >
            Today
          </button>
        )}
        {isCurrentPeriod && (
          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
            Current
          </span>
        )}
      </div>

     
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">

      {/* ── DESKTOP SIDEBAR ─────────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 fixed top-0 bottom-0 left-0 z-30 shadow-sm">

        {/* Brand header */}
        <div className="px-5 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-4">
           
            <div>
              <h2 className="text-base font-extrabold text-on-surface leading-tight">Parthbhoomi</h2>
              <p className="text-[11px] text-on-surface-variant font-medium leading-tight">CHS Maintenance</p>
            </div>
          </div>

          {/* Period selector */}
          <PeriodSelector />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-150 active-scale text-left ${
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-on-surface-variant hover:bg-slate-100 hover:text-on-surface'
                }`}
              >
                <span className={`material-symbols-outlined text-xl ${isActive ? 'text-white' : ''}`}>
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* User + logout */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center gap-2.5 px-1">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
              {isAdmin ? 'A' : user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-on-surface truncate">{user.name}</p>
              <p className="text-[10px] text-on-surface-variant truncate">
                {isAdmin ? 'Administrator' : `Unit ${user.username}`}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 bg-slate-50 text-error border border-slate-200 hover:bg-red-50 hover:border-red-200 py-2 px-3 text-xs font-bold rounded-xl transition-all active-scale"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── MOBILE HEADER ──────────────────────────────────────────────────── */}
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[16px]">apartment</span>
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-on-surface leading-tight">Parthbhoomi</h1>
              <p className="text-[10px] text-on-surface-variant font-medium leading-tight">CHS Maintenance</p>
            </div>
          </div>

          {/* Mobile period selector — compact inline version */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-1 py-1 flex-1 max-w-[220px]">
            <span className="material-symbols-outlined text-primary text-[15px] ml-1 flex-shrink-0">calendar_month</span>

            {/* Month dropdown */}
            <div className="relative flex-1">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full bg-transparent text-[12px] font-bold text-primary outline-none cursor-pointer appearance-none pr-4 py-0.5"
              >
                {ALL_MONTHS.map(m => (
                  <option key={m} value={m}>{m.slice(0, 3)}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 text-[12px] pointer-events-none">
                expand_more
              </span>
            </div>

            <span className="text-slate-300 text-xs flex-shrink-0">|</span>

            {/* Year dropdown */}
            <div className="relative flex-shrink-0">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-transparent text-[12px] font-bold text-primary outline-none cursor-pointer appearance-none pr-4 py-0.5"
              >
                {availableYears.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 text-[12px] pointer-events-none">
                expand_more
              </span>
            </div>

            {/* Current indicator dot */}
            {isCurrentPeriod && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 mr-0.5" title="Current period" />
            )}
          </div>

          {/* User info */}
          <div className="text-right flex-shrink-0">
            <p className="text-[11px] font-bold text-on-surface leading-tight">
              {isAdmin ? 'Admin' : `Unit ${user.username}`}
            </p>
            <p className="text-[10px] text-on-surface-variant truncate max-w-[80px]">{user.name.split(' ')[0]}</p>
          </div>
        </div>
      </header>

      {/* ── MOBILE BOTTOM NAV ─────────────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-2px_12px_rgba(0,0,0,0.06)] px-1 py-2 flex justify-around items-center">
        {menuItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex flex-col items-center justify-center px-2 py-1.5 rounded-xl transition-all duration-150 active-scale min-w-0 flex-1 ${
                isActive ? 'text-primary' : 'text-on-surface-variant'
              }`}
            >
              <span className={`material-symbols-outlined text-xl ${isActive ? 'font-bold' : ''}`}>
                {item.icon}
              </span>
              <span className="text-[10px] font-bold mt-0.5 truncate max-w-full">
                {item.name
                  .replace('My ', '')
                  .replace(' Broadcaster', '')
                  .replace('Society ', '')
                  .replace(' Ledger', '')
                  .replace('Global ', '')}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ── MAIN CONTENT ──────────────────────────────────────────────────── */}
      <main className="flex-1 md:ml-64 p-4 md:p-6 lg:p-8 pb-24 md:pb-8 max-w-[1400px] w-full mx-auto">
        {children}
      </main>
    </div>
  );
}
