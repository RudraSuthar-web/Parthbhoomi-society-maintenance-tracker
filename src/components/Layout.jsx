import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';

export default function Layout({ children, currentTab, setCurrentTab }) {
  const { user, logout } = useContext(AppContext);

  if (!user) return <>{children}</>;

  const isAdmin = user.role === 'admin';

  // Navigation Links based on role
  const menuItems = isAdmin
    ? [
        { id: 'overview', name: 'Global Overview', icon: 'dashboard' },
        { id: 'tenements', name: 'All Tenements', icon: 'domain' },
        { id: 'notices', name: 'Notice Broadcaster', icon: 'campaign' },
      ]
    : [
        { id: 'dashboard', name: 'Resident View', icon: 'home' },
        { id: 'ledger', name: 'Transaction Ledger', icon: 'receipt_long' },
        { id: 'notices', name: 'Society Bulletin', icon: 'campaign' },
        { id: 'profile', name: 'My Profile', icon: 'person' },
      ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-surface-container border-r border-[#E2E8F0] fixed top-0 bottom-0 left-0 z-30">
        {/* Header Section inside sidebar */}
        <div className="p-6 border-b border-[#E2E8F0] flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-primary-container text-white flex items-center justify-center mb-3 shadow-md">
            <span className="material-symbols-outlined text-3xl font-bold">
              {isAdmin ? 'shield_person' : 'home_pin'}
            </span>
          </div>
          <h2 className="text-[#191b23] font-bold text-lg leading-tight tracking-tight">
            Parthbhoomi
          </h2>
          <p className="text-xs text-on-surface-variant font-medium mt-1">
            Society Maintenance
          </p>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-semibold rounded transition-all duration-200 active-scale ${
                  isActive
                    ? 'bg-primary text-white shadow-soft'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* User profile & logout footer */}
        <div className="p-4 border-t border-[#E2E8F0] bg-surface-container-high bg-opacity-50">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
              {isAdmin ? 'A' : user.username.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-on-surface truncate">
                {user.name}
              </p>
              <p className="text-xs text-on-surface-variant truncate">
                {isAdmin ? 'Administrator' : `Unit ${user.username}`}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 bg-white text-error border border-outline-variant hover:bg-error-container hover:text-error hover:border-transparent py-2 px-3 text-xs font-bold rounded shadow-soft transition-all duration-200 active-scale"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER (Sticky Top) */}
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-[#E2E8F0] px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="material-symbols-outlined text-primary text-2xl font-bold">
            {isAdmin ? 'shield_person' : 'home_pin'}
          </span>
          <div>
            <h1 className="text-sm font-bold text-on-surface leading-none m-0 p-0">
              Parthbhoomi
            </h1>
            <p className="text-[10px] text-on-surface-variant font-medium">
              Maintenance Tracker
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-xs font-semibold text-on-surface leading-tight">
              {isAdmin ? 'Admin' : `Unit ${user.username}`}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="w-8 h-8 rounded-full bg-error-container text-error flex items-center justify-center transition-all duration-200 active-scale"
            title="Log Out"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
          </button>
        </div>
      </header>

      {/* MOBILE BOTTOM NAVIGATION UTILITY */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E2E8F0] shadow-[0_-4px_12px_rgba(0,0,0,0.05)] rounded-t-xl px-2 py-2 pb-safe flex justify-around items-center">
        {menuItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-lg transition-all duration-200 active-scale ${
                isActive
                  ? 'text-primary'
                  : 'text-on-surface-variant'
              }`}
            >
              <span className={`material-symbols-outlined text-xl ${isActive ? 'font-bold' : ''}`}>
                {item.icon}
              </span>
              <span className="text-[10px] font-semibold mt-0.5">{item.name.replace('View', '').replace('Broadcaster', '').replace('Bulletin', '')}</span>
            </button>
          );
        })}
      </nav>

      {/* MAIN CONTENT CANVAS */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pb-24 md:pb-8 max-w-[1280px] w-full mx-auto">
        {children}
      </main>
      
    </div>
  );
}
