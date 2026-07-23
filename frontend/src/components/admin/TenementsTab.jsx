import React from 'react';
import AlertBanner from '../ui/AlertBanner';
import EmptyState from '../ui/EmptyState';
import { getBilledMonths } from '../../utils/dateUtils';

/**
 * TenementsTab — Admin "All Tenements" tab.
 * Displays search, add-unit form, and tenement list.
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
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-soft p-5 sm:p-6 space-y-5 animate-fadeIn">

      {/* Header + controls */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="font-headline-md text-on-surface font-extrabold">Tenement Directory</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Tap any unit to view full ledger &amp; manage payments · {selectedMonth} {selectedYear}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">search</span>
            <input
              type="text"
              placeholder="Search unit or owner…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 border border-slate-200 bg-slate-50 text-on-surface rounded-lg text-xs font-semibold focus:outline-none focus:border-primary focus:bg-white transition-all w-52"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            )}
          </div>
          {/* Add unit */}
          <button
            onClick={() => { setIsAddingTenement(!isAddingTenement); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg shadow-soft hover:bg-primary-container transition-all active-scale"
          >
            <span className="material-symbols-outlined text-sm">{isAddingTenement ? 'close' : 'add'}</span>
            {isAddingTenement ? 'Cancel' : 'Add Unit'}
          </button>
        </div>
      </div>

      {/* Registration form */}
      {isAddingTenement && (
        <form
          onSubmit={onRegisterTenement}
          className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 animate-fadeIn"
        >
          <h3 className="font-semibold text-sm text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">add_home</span>
            Register New Tenement Unit
          </h3>
          <AlertBanner type="error"   message={adminRegError} />
          <AlertBanner type="success" message={adminRegSuccess} />
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {[
              { label: 'Tenement Number', placeholder: 'e.g. 42 (1–60)', value: newTenementNumber, setter: setNewTenementNumber, type: 'text' },
              { label: 'Owner Full Name', placeholder: 'e.g. Rohan Mehta', value: newName,           setter: setNewName,           type: 'text' },
              { label: 'Contact Number',  placeholder: '+91 99887 76655', value: newContact,         setter: setNewContact,         type: 'text' },
              { label: 'Unit Password',   placeholder: 'Min. 6 characters', value: newPassword,      setter: setNewPassword,        type: 'password' },
            ].map(({ label, placeholder, value, setter, type }) => (
              <div key={label}>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">{label}</label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={value}
                  onChange={e => setter(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 bg-white text-on-surface rounded-lg text-xs font-semibold focus:outline-none focus:border-primary transition-all"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsAddingTenement(false)} className="px-4 py-1.5 border border-slate-200 bg-white text-on-surface text-xs font-bold rounded-lg hover:bg-slate-50 transition-all active-scale">Cancel</button>
            <button type="submit" className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-lg shadow-soft hover:bg-primary-container transition-all active-scale">Register</button>
          </div>
        </form>
      )}

      {/* Result count */}
      {searchQuery && (
        <p className="text-xs text-on-surface-variant">
          Showing <span className="font-bold text-on-surface">{filteredTenements.length}</span> of {tenements.length} tenements
        </p>
      )}

      {/* Tenement list */}
      {filteredTenements.length === 0 ? (
        <EmptyState icon="search_off" message="No tenements match your search." />
      ) : (
        <div className="space-y-3">
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
                className="group w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 bg-white border-slate-200 hover:border-slate-300"
              >
                <button
                  onClick={() => onOpenTenement(tenement.tenementNumber)}
                  className="flex-1 flex items-center justify-between text-left focus:outline-none"
                  aria-label={`Unit ${tenement.tenementNumber} — ${tenement.ownerName}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0 w-10 h-10">
                      <div className={`absolute inset-0 rounded-full flex items-center justify-center text-white transition-all shadow-sm ${isUnpaid ? 'bg-red-600/15' : 'bg-transparent'}`} />
                      <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-extrabold text-sm shadow-lg">
                        {tenement.tenementNumber}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-on-surface">{tenement.ownerName}</h4>
                      <p className="text-[11px] text-on-surface-variant">{tenement.contact}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6 mr-3">
                    <div className="text-right hidden md:block">
                      <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block">Year {selectedYear}</span>
                      <span className={`text-xs font-bold ${allPaid ? 'text-emerald-600' : 'text-slate-600'}`}>{paidCount}/{billedMonths} paid</span>
                      {unpaidCount > 0 && (
                        <span className="text-[13px] font-bold text-error block">{unpaidCount} overdue</span>
                      )}
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors duration-150">
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
