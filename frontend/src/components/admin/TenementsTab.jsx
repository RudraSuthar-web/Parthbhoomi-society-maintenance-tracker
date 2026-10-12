import React, { useState, useEffect, useRef } from 'react';
import AlertBanner from '../ui/AlertBanner';
import EmptyState from '../ui/EmptyState';
import { getBilledMonths } from '../../utils/dateUtils';
import SOCIETY_CONFIG from '../../config/societyConfig';

/**
 * TenementsTab — Admin "All Tenements" tab.
 * Displays search, add-unit form, and tenement list with full dark/light theme support.
 */
export default function TenementsTab({
  tenements, filteredTenements,
  selectedMonth, selectedYear,
  maintenanceAmount,
  searchQuery, setSearchQuery,
  isAddingTenement, setIsAddingTenement,
  newTenementNumber, setNewTenementNumber,
  newName, setNewName,
  newContact, setNewContact,
  newPassword, setNewPassword,
  adminRegError, adminRegSuccess,
  onRegisterTenement,
  onOpenTenement,
  onDeleteTenement,
}) {
  const [isStuck, setIsStuck] = useState(false);
  const sentinelRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sentinelRef.current) return;
      const rect = sentinelRef.current.getBoundingClientRect();
      const isMobile = window.innerWidth < 768;
      const threshold = isMobile ? 58 : 0;
      setIsStuck(rect.top <= threshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-soft animate-fadeIn transition-colors">

      <div ref={sentinelRef} className="h-0 w-0" />
      <div
        className={`sticky top-[57px] md:top-0 z-20 transition-all duration-300 ${
          isStuck
            ? '-mx-4 -mt-4 md:-mx-6 md:-mt-6 lg:-mx-8 lg:-mt-8'
            : 'mx-0 mt-0'
        }`}
      >
        <div
          className={`bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-all duration-300 ${
            isStuck ? 'rounded-none shadow-md p-4' : 'rounded-t-xl p-6'
          }`}
        >
          
          <div className={`transition-all duration-300 overflow-hidden ${isStuck ? 'max-h-0 lg:max-h-20 opacity-0 lg:opacity-100' : 'max-h-20 opacity-100'}`}>
            <h2 className="font-headline-md text-on-surface dark:text-zinc-100 font-extrabold">Tenement Directory</h2>
            <p className="text-sm lg:text-xs text-on-surface-variant dark:text-zinc-400 mt-1">
              Tap any unit to view full ledger &amp; manage payments · {selectedMonth} {selectedYear}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap justify-between">
            {/* Search */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 text-lg pointer-events-none">search</span>
              <input
                type="text"
                placeholder="Search unit or owner…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-8 py-1.5 border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-on-surface dark:text-zinc-100 rounded-md text-xs font-mono focus:outline-none focus:border-primary dark:focus:border-white focus:bg-white dark:focus:bg-zinc-800 transition-all w-52"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              )}
            </div>
            {/* Add unit */}
            <button
              onClick={() => {
                const nextState = !isAddingTenement;
                setIsAddingTenement(nextState);
                if (nextState) {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 bg-primary dark:bg-white text-white dark:text-zinc-950 text-xs font-bold rounded-lg shadow-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all active-scale"
            >
              <span className="material-symbols-outlined text-sm">{isAddingTenement ? 'close' : 'add'}</span>
              <div className="hidden md:block">
                {isAddingTenement ? 'Cancel' : 'Add Unit'}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Registration form */}
      {isAddingTenement && (
        <form
          onSubmit={onRegisterTenement}
          className="p-6 bg-slate-50 dark:bg-zinc-800/50 border-b border-slate-200 dark:border-zinc-800 space-y-6 animate-fadeIn"
        >
          <h3 className="font-semibold text-sm text-on-surface dark:text-zinc-100 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary dark:text-white text-lg">add_home</span>
            Register New Tenement Unit
          </h3>
          <AlertBanner type="error"   message={adminRegError} />
          <AlertBanner type="success" message={adminRegSuccess} />
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {[
              { label: 'Tenement Number', placeholder: `e.g. 42 (1–${SOCIETY_CONFIG.maxTenements})`, value: newTenementNumber, setter: setNewTenementNumber, type: 'text' },
              { label: 'Owner Full Name', placeholder: 'e.g. Rohan Mehta', value: newName,           setter: setNewName,           type: 'text' },
              { label: 'Contact Number',  placeholder: '+91 99887 76655', value: newContact,         setter: setNewContact,         type: 'text' },
              { label: 'Unit Password',   placeholder: 'Min. 6 characters', value: newPassword,      setter: setNewPassword,        type: 'password' },
            ].map(({ label, placeholder, value, setter, type }) => (
              <div key={label}>
                <label className="block text-[12px] font-bold text-on-surface-variant dark:text-zinc-400 uppercase tracking-wider mb-1">{label}</label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={value}
                  onChange={e => setter(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-on-surface dark:text-zinc-100 rounded-lg text-xs font-mono focus:outline-none focus:border-primary dark:focus:border-white transition-all"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddingTenement(false)}
              className="px-4 py-1.5 border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-on-surface dark:text-zinc-200 text-xs font-bold rounded-md hover:bg-slate-50 dark:hover:bg-zinc-700 transition-all active-scale"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-primary dark:bg-white text-white dark:text-zinc-950 text-xs font-bold rounded-md shadow-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all active-scale"
            >
              Register
            </button>
          </div>
        </form>
      )}

      {/* Result count */}
      {searchQuery && (
        <p className="text-xs text-on-surface-variant dark:text-zinc-400 p-6">
          Showing <span className="font-bold text-on-surface dark:text-zinc-100">{filteredTenements.length}</span> of {tenements.length} tenements
        </p>
      )}

      {/* Tenement list */}
      {filteredTenements.length === 0 ? (
        <EmptyState icon="search_off" message="No tenements match your search." />
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-zinc-800">
          {filteredTenements.map(tenement => {
            const currentDue   = tenement.dues.find(d => d.month === selectedMonth && d.year === selectedYear);
            const billedMonths = getBilledMonths(selectedYear);
            const paidCount    = tenement.dues.filter(d => d.status === 'Paid'    && d.year === selectedYear).length;
            const unpaidCount  = tenement.dues.filter(d => (d.status === 'Unpaid' || d.status === 'Partial') && d.year === selectedYear).length;
            const isUnpaid     = currentDue?.status === 'Unpaid';
            const isPartial    = currentDue?.status === 'Partial';
            const allPaid      = billedMonths > 0 && paidCount >= billedMonths;

            return (
              <div
                key={tenement.tenementNumber}
                className="group w-full flex items-center justify-between p-4 transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800/80 hover:bg-slate-50 dark:hover:bg-zinc-800/40"
              >
                <button
                  onClick={() => onOpenTenement(tenement.tenementNumber)}
                  className="flex-1 flex items-center justify-between text-left focus:outline-none"
                  aria-label={`Unit ${tenement.tenementNumber} — ${tenement.ownerName}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0 w-10 h-10">
                      <div className={`absolute inset-0 rounded-full flex items-center justify-center text-white transition-all shadow-sm ${isUnpaid ? 'bg-red-600/15 dark:bg-red-500/20' : 'bg-transparent'}`} />
                      <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 text-black dark:text-white border border-slate-200 dark:border-zinc-700 flex items-center justify-center font-extrabold text-sm shadow-md">
                        {tenement.tenementNumber}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-on-surface dark:text-zinc-100">{tenement.ownerName}</h4>
                      <p className="text-[11px] text-on-surface-variant dark:text-zinc-400">{tenement.contact}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6 mr-3">
                    <div className="text-right hidden md:block">
                      <span className="text-[10px] text-on-surface-variant dark:text-zinc-500 font-bold uppercase tracking-wider block">Year {selectedYear}</span>
                      <span className={`text-xs font-bold ${allPaid ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-zinc-400'}`}>{paidCount}/{billedMonths} paid</span>
                      {unpaidCount > 0 && (
                        <span className="text-[13px] font-mono font-bold text-error dark:text-red-400 block">{unpaidCount} overdue</span>
                      )}
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant dark:text-zinc-500 group-hover:text-primary dark:group-hover:text-white transition-colors duration-150">
                      arrow_forward
                    </span>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
