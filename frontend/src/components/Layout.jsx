import React, { useContext } from 'react';
import {
  LayoutDashboard,
  Building2,
  CalendarDays,
  Megaphone,
  Wallet,
  ReceiptText,
  Bell,
  User,
  LogOut,
} from 'lucide-react';
import { AppContext } from '../context/AppContext';
import PeriodSelector from './PeriodSelector';
import ThemeToggle from './ui/ThemeToggle';
import SOCIETY_CONFIG from '../config/societyConfig';

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
        { id: 'overview',     name: 'Overview',           Icon: LayoutDashboard },
        { id: 'tenements',    name: 'All Tenements',     Icon: Building2 },
        { id: 'monthly-grid', name: 'Monthly Grid',      Icon: CalendarDays },
        { id: 'notices',      name: 'Notice Broadcaster', Icon: Megaphone },
        { id: 'expenses',     name: 'Expense Tracker',   Icon: Wallet },
        { id: 'profile',      name: 'Profile',      Icon: User },
      ]
    : [
        { id: 'dashboard', name: 'Dashboard',          Icon: LayoutDashboard },
        { id: 'ledger',    name: 'Transaction Ledger', Icon: ReceiptText },
        { id: 'notices',   name: 'Society Bulletin',   Icon: Bell },
        { id: 'expenses',  name: 'Society Expenses',   Icon: Wallet },
        { id: 'profile',   name: 'Profile',         Icon: User },
      ];

  const [poppedTab, setPoppedTab] = React.useState(null);
  const popTimeoutRef = React.useRef(null);

  const handleMobileTabClick = (itemId) => {
    setCurrentTab(itemId);
    setPoppedTab(itemId);
    if (popTimeoutRef.current) {
      clearTimeout(popTimeoutRef.current);
    }
    popTimeoutRef.current = setTimeout(() => {
      setPoppedTab(null);
    }, 1800);
  };

  React.useEffect(() => {
    return () => {
      if (popTimeoutRef.current) clearTimeout(popTimeoutRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col md:flex-row transition-colors duration-200">

      {/* ── DESKTOP SIDEBAR ─────────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 fixed top-0 bottom-0 left-0 z-30 shadow-lg transition-colors duration-200">

        {/* Brand header */}
        <div className="px-5 py-5 border-b border-slate-200 dark:border-zinc-800">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="min-w-0">
              <h2 className="text-base font-extrabold text-on-surface dark:text-zinc-100 leading-tight truncate">
                {SOCIETY_CONFIG.shortName}
              </h2>
              <p className="text-[12px] text-on-surface-variant dark:text-zinc-400 font-medium leading-tight">
                CHS Maintenance
              </p>
            </div>
           
          </div>
          <PeriodSelector />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => {
            const isActive = currentTab === item.id;
            const ItemIcon = item.Icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-xl transition-all duration-150 active-scale text-left ${
                  isActive
                    ? 'bg-gradient-to-br from-primary to-primary/80 dark:from-white dark:to-zinc-200 text-white dark:text-zinc-950 shadow-md font-bold'
                    : 'text-on-surface-variant dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-on-surface dark:hover:text-zinc-100'
                }`}
              >
                <ItemIcon className="w-4 h-4 flex-shrink-0" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* User + logout */}
        <div className="p-4 border-t border-slate-200 dark:border-zinc-800 space-y-3">
          <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentTab('profile')}
            className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-xl text-left transition-colors ${
              currentTab === 'profile'
                ? 'bg-slate-100 dark:bg-zinc-800'
                : 'hover:bg-slate-50 dark:hover:bg-zinc-850'
            }`}
            title="View & Edit Profile / Password"
          >
            <div className="w-8 h-8 rounded-full bg-primary dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm">
              {isAdmin ? 'A' : user.username.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-on-surface dark:text-zinc-100 truncate">{user.name}</p>
              <p className="text-[12px] font-mono text-on-surface-variant dark:text-zinc-400 truncate pt-0.5">
                {isAdmin ? 'Administrator' : `Unit ${user.username}`}
              </p>
            </div>
          </button>
             <ThemeToggle compact />
             </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-slate-50 dark:bg-zinc-800/80 text-error border border-slate-200 dark:border-zinc-700/80 hover:bg-red-50 dark:hover:bg-red-950/40 hover:border-red-200 dark:hover:border-red-900/50 hover:shadow-md py-2 px-3 text-xs font-bold rounded-xl transition-all active-scale"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── MOBILE HEADER ──────────────────────────────────────────────────── */}
      <header className="md:hidden sticky top-0 z-40 flex flex-col">
        {/* Subtle gradient fade-out behind top sticky header */}
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-slate-50 via-slate-50/80 dark:from-zinc-950 dark:via-zinc-950/80 to-transparent pointer-events-none" />

        {/* Brand & User Profile Bar */}
        <div className="relative z-10 px-3.5 pt-3 pb-2 flex items-center justify-between gap-2">
          {/* Society Name Pill */}
          <div className="flex-1 min-w-0 bg-white/95 dark:bg-zinc-900/90 px-4 py-3 rounded-full border border-slate-200/90 dark:border-zinc-800 shadow-sm backdrop-blur-md flex items-center">
            <h1 className="text-sm sm:text-sm font-extrabold text-on-surface dark:text-zinc-100 leading-tight truncate">
              {SOCIETY_CONFIG.name}
            </h1>
          </div>

          {/* User & Actions */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <ThemeToggle compact className="p-2" />
            <button
              onClick={() => setCurrentTab('profile')}
              className={`bg-white/95 dark:bg-zinc-900/90 px-3 py-1.5 rounded-full border border-slate-200/90 dark:border-zinc-800 shadow-sm backdrop-blur-md text-right max-w-[110px] sm:max-w-none transition-all active:scale-95 ${
                currentTab === 'profile' ? 'ring-2 ring-primary dark:ring-white' : ''
              }`}
              title="View & Edit Profile / Password"
            >
              <p className="text-[12px] font-bold text-on-surface dark:text-zinc-100 leading-tight truncate">
                {user.name ? user.name.split(' ')[0] : ''}
              </p>
              <p className="text-[10px] font-mono text-on-surface-variant dark:text-zinc-400 truncate leading-none mt-0.5">
                {isAdmin ? 'Admin' : `Unit ${user.username}`}
              </p>
            </button>
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-full bg-white/95 dark:bg-zinc-900/90 text-error border border-red-100 dark:border-red-950/60 shadow-sm flex items-center justify-center transition-all active:scale-95"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Floating Period Selector Widget */}
      <div className="md:hidden fixed bottom-24 right-4 z-50 shadow-2xl rounded-xl">
        <PeriodSelector />
      </div>

      {/* ── MOBILE BOTTOM GRADIENT FADE ─────────────────────────────────────── */}
      <div 
        aria-hidden="true" 
        className="md:hidden fixed bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-slate-50 via-slate-50/80 dark:from-zinc-950 dark:via-zinc-950/80 to-transparent pointer-events-none z-40"
      />

      {/* ── MOBILE BOTTOM NAV ─────────────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-5 left-5 right-5 z-50 bg-white/80 backdrop-blur-md dark:bg-zinc-900/60  border border-slate-200/90 dark:border-zinc-800 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.15)] px-2 py-3 flex justify-around items-center transition-colors">
        {menuItems.map((item, idx) => {
          const isActive = currentTab === item.id;
          const isPopped = poppedTab === item.id;
          const ItemIcon = item.Icon;
          return (
            <div key={item.id} className="relative flex-1 flex justify-center">
              {/* Popping label tooltip */}
              {isPopped && (
                <div
                  className={`absolute -top-11 pointer-events-none z-50 whitespace-nowrap animate-scaleIn ${
                    idx === 0
                      ? 'left-2'
                      : idx === menuItems.length - 1
                      ? 'right-2'
                      : 'left-1/6 -translate-x-1/2'
                  }`}
                >
                  <div className="bg-slate-900/95 dark:bg-zinc-800 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg backdrop-blur-sm flex items-center border border-white/20 dark:border-zinc-700">
                    <span>{item.name}</span>
                  </div>
                </div>
              )}

              <button
                onClick={() => handleMobileTabClick(item.id)}
                className={`flex items-center justify-center py-1.5 rounded-xl transition-all duration-150 active-scale min-w-0 w-full ${
                  isActive ? 'text-primary dark:text-white' : 'text-on-surface-variant/70 dark:text-zinc-500 hover:text-on-surface dark:hover:text-zinc-300'
                }`}
              >
                <ItemIcon 
                  className={`w-6 h-6 transition-transform duration-200 ${isActive ? 'text-primary dark:text-white scale-110 stroke-[2.4]' : 'text-zinc-500 dark:text-zinc-400 stroke-[1.8]'}`}
                />
              </button>
            </div>
          );
        })}
      </nav>

      {/* ── MAIN CONTENT ──────────────────────────────────────────────────── */}
      <main className="flex-1 md:ml-64 p-4 md:p-6 lg:p-8 pb-32 md:pb-8 max-w-[1400px] w-full mx-auto mobile-scroll-fade">
        {children}
      </main>
    </div>
  );
}
