import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import PeriodSelector from './PeriodSelector';

export default function Layout({ children, currentTab, setCurrentTab }) {
  const { user, logout } = useContext(AppContext);

  if (!user) return <>{children}</>;

  const isAdmin = user.role === 'admin';

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      logout();
    }
  };

  const menuItems = isAdmin
    ? [
        { id: 'overview',      name: 'Global Overview',    icon: 'space_dashboard' },
        { id: 'tenements',     name: 'All Tenements',      icon: 'apartment' },
        { id: 'monthly-grid',  name: 'Monthly Grid',       icon: 'calendar_month' },
        { id: 'notices',       name: 'Notice Broadcaster', icon: 'campaign' },
        { id: 'expenses',      name: 'Expense Tracker',    icon: 'payments' },

      ]
    : [
        { id: 'dashboard', name: 'My Dashboard',      icon: 'space_dashboard' },
        { id: 'ledger',    name: 'Transaction Ledger', icon: 'receipt_long' },
        { id: 'notices',   name: 'Society Bulletin',   icon: 'notifications' },
        { id: 'expenses',  name: 'Society Expenses',   icon: 'payments' },
        { id: 'profile',   name: 'My Profile',         icon: 'account_circle' },
      ];

  const currentTabName = menuItems.find(item => item.id === currentTab)?.name || 'Dashboard';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">

      {/* ── DESKTOP SIDEBAR ─────────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 fixed top-0 bottom-0 left-0 z-30 shadow-lg">

        {/* Brand header */}
        <div className="px-5 py-5 border-b border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div>
              <h2 className="text-base font-extrabold text-on-surface leading-tight">Parthbhoomi</h2>
              <p className="text-[12px] text-on-surface-variant font-medium leading-tight">CHS Maintenance</p>
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
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-xl transition-all duration-150 active-scale text-left ${
                  isActive
                    ? 'bg-gradient-to-br from-primary to-primary/70 text-white shadow-lg'
                    : 'text-on-surface-variant hover:bg-slate-100 hover:text-on-surface'
                }`}
              >
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* User + logout */}
        <div className="p-4 border-t border-slate-200 space-y-3">
          <div className="flex items-center gap-2.5 px-1">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
              {isAdmin ? 'A' : user.username.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-on-surface truncate">{user.name}</p>
              <p className="text-[12px] font-mono text-on-surface-variant truncate pt-1">
                {isAdmin ? 'Administrator' : `Unit ${user.username}`}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-slate-50 text-error border border-slate-200 hover:bg-red-50 hover:border-red-200 hover:shadow-lg py-2 px-3 text-xs font-bold rounded-xl transition-all active-scale"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── MOBILE HEADER ──────────────────────────────────────────────────── */}
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-slate-200 px-2 py-3 shadow-sm flex flex-col">
        {/* Row 1: Brand & User Profile */}
        <div className="px-4 pt-3 pb-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
           
            <div>
              <h1 className="text-lg font-extrabold text-on-surface leading-tight">Parthbhoomi CHS</h1>
              <p className="text-[12px] text-on-surface-variant font-medium mt-1 leading-none">Society Maintenance</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="text-right">
              <p className="text-sm font-bold text-on-surface leading-tight max-w-[100px] truncate">
                {user.name}
              </p>
              <p className="text-[12px] text-on-surface-variant truncate leading-none mt-0.5">
                {isAdmin ? 'Admin' : `Unit ${user.username}`}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="w-8 h-8 rounded-full bg-red-50 text-error border border-red-100 flex items-center justify-center transition-all active:scale-95 shadow-sm"
              title="Sign Out"
            >
              <span className="material-symbols-outlined text-[16px] font-extrabold">logout</span>
            </button>
          </div>
        </div>

        {/* Row 2: Page name & Period Selector */}
      </header>


          <div className="md:hidden fixed bottom-24 right-4 z-50 scale-90 origin-bottom-right shadow-2xl rounded-xl">
        <PeriodSelector />
      </div>


      {/* ── MOBILE BOTTOM NAV ─────────────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-2px_12px_rgba(0,0,0,0.06)] px-1 py-4 flex justify-around items-center">
        {menuItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex flex-col items-center justify-center px-2 py-1.5 rounded-xl transition-all duration-150 active-scale min-w-0 flex-1 ${
                isActive ? 'text-primary' : 'text-on-surface-variant/70'
              }`}
            >
              <span 
                className="material-symbols-outlined transition-all duration-200"
                style={{ 
                  fontSize: '26px',
                  fontVariationSettings: isActive ? "'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 24" : "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24" 
                }}
              >
                {item.icon}
              </span>
              <span className="text-[12px] font-bold mt-0.5 truncate max-w-full">
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
