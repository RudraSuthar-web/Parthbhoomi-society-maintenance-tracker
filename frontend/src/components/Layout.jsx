import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import PeriodSelector from './PeriodSelector';

export default function Layout({ children, currentTab, setCurrentTab }) {
  const { user, logout } = useContext(AppContext);

  if (!user) return <>{children}</>;

  const isAdmin = user.role === 'admin';

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
                    ? 'bg-primary text-white shadow-lg'
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
              {isAdmin ? 'A' : user.username.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-on-surface truncate">{user.name}</p>
              <p className="text-[12px] text-on-surface-variant truncate">
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
          <div className="flex items-center gap-2 flex-shrink-0">
            <div>
              <h1 className="text-lg font-extrabold text-on-surface leading-tight">Parthbhoomi</h1>
              <p className="text-[15px] text-on-surface-variant font-medium leading-tight">CHS Maintenance</p>
            </div>
          </div>

          <PeriodSelector />

          <div className="text-right flex-shrink-0">
            <p className="text-sm font-bold text-on-surface leading-tight">
              {isAdmin ? 'Admin' : `Unit ${user.username}`}
            </p>
            <p className="text-[13px] text-on-surface-variant truncate leading-tight max-w-[80px]">{user.name.split(' ')[0]}</p>
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
