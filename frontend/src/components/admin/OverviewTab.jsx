import React from 'react';
import AlertBanner from '../ui/AlertBanner';
import EmptyState from '../ui/EmptyState';

/**
 * OverviewTab — Admin "Global Overview" tab.
 * Displays KPIs, maintenance amount setting, defaulters grid, and bulletin preview.
 */
export default function OverviewTab({
  selectedMonth, selectedYear,
  totalTenementsCount,
  currentMonthPaid, currentMonthUnpaid,
  totalCollectedDisplay, totalPendingThisMonth,
  collectionRate,
  defaulterTenements,
  notices,
  maintenanceAmount,
  settingsAmount, setSettingsAmount,
  settingsSuccess, settingsError,
  onSaveSettings,
  onOpenTenement,
}) {
  return (
    <div className="space-y-6 animate-fadeIn">

      {/* Page header */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-soft p-5 sm:p-6 flex items-center justify-between gap-4">
        <div>
          <h2 className=" text-lg font-bold text-on-surface">Society Overview</h2>
          <p className="text-xs text-on-surface-variant mt-1">
            Maintenance fund summary
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-black/5 border border-black/20 rounded-md shadow-md flex-shrink-0">
          <span className="text-xs font-bold text-primary">{selectedMonth} {selectedYear}</span>
        </div>
      </div>

     
      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Collected */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-soft p-5 flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[13px] font-bold text-on-surface-variant uppercase tracking-wider">
                {selectedMonth} Collection
              </span>
              <h3 className="text-2xl font-extrabold text-on-surface tracking-tight">
                ₹{totalCollectedDisplay.toLocaleString('en-IN')}
              </h3>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-on-surface-variant font-semibold">
                {currentMonthPaid.length}/{totalTenementsCount} fully paid
              </span>
              <span className="text-xs font-bold text-emerald-800">{collectionRate}%</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full  bg-gradient-to-r from-black to-emerald-500 rounded-full transition-all duration-700 ease-out origin-left"
                style={ { transform: `scaleX(${collectionRate / 100})` } } 
              />
            </div>
          </div>
        </div>

        {/* Outstanding */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-soft p-5 flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[13px] font-bold text-on-surface-variant uppercase tracking-wider">
                Outstanding Dues
              </span>
              <h3 className="text-2xl font-extrabold text-error tracking-tight">
                ₹{totalPendingThisMonth.toLocaleString('en-IN')}
              </h3>
            </div>
          </div>
          <p className="text-sm text-on-surface-variant font-semibold mt-2">
            {currentMonthPaid.length === 0 && currentMonthUnpaid.length === 0 ? (
              <span className="text-slate-500 font-medium">Billing has not started for {selectedMonth}</span>
            ) : (
              <>
                <span className="font-bold text-on-surface">{currentMonthUnpaid.length}</span>{' '}
                tenement{currentMonthUnpaid.length !== 1 ? 's' : ''} yet to fully pay for {selectedMonth}
              </>
            )}
          </p>
        </div>
      </div>

      {/* Defaulters grid / Status banner */}
      {totalTenementsCount > 0 && (
      <div className="bg-white border border-slate-200 rounded-xl shadow-soft">
        {currentMonthPaid.length === totalTenementsCount ? (
          <div className="flex items-center bg-emerald-800 rounded-xl p-3 justify-between">
            <div className="flex gap-2 items-center">
              <span className="material-symbols-outlined text-white">verified</span>
              <h3 className="font-title-lg font-bold text-white">All {totalTenementsCount} tenements have paid</h3>
            </div>
            <h3 className="font-title-lg font-bold text-white">{selectedMonth} - {selectedYear}</h3>
          </div>
        ) : defaulterTenements.length === 0 ? (
          <div className="flex items-center bg-primary/80 rounded-xl p-3 justify-between">
            <div className="flex gap-2 items-center">
              <h3 className="font-title-lg font-bold text-white">Billing has not started for {selectedMonth} {selectedYear}</h3>
            </div>
            <h3 className="font-title-lg font-bold text-white">{selectedMonth} - {selectedYear}</h3>
          </div>
        ) : (
          <>
            <div className="flex items-center  bg-gradient-to-tl from-red-900 to-error rounded-t-xl p-3 justify-between">
              <h3 className="font-title-lg font-bold text-white">
                <span className="font-bold text-white text-[20px]">{defaulterTenements.length}</span> Unpaid
              </h3>
              <h3 className="font-title-lg font-bold text-white">{selectedMonth} - {selectedYear}</h3>
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-12">
              {defaulterTenements.map(t => {
                const due = t.dues.find(d => d.month === selectedMonth && d.year === selectedYear);
                const isPartial = due?.status === 'Partial';
                return (
                  <button
                    key={t.tenementNumber}
                    onClick={() => onOpenTenement(t.tenementNumber)}
                    className={`
                      group relative aspect-square flex flex-col items-center justify-center
                      border  active:scale-95 transition-all duration-150
                      cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2
                      ${isPartial
                        ? 'bg-amber-50 border-amber-300 hover:bg-amber-100 hover:border-amber-500 focus:ring-amber-400'
                        : 'bg-white border-red-200 hover:bg-red-100 hover:border-error hover:shadow-lg hover:shadow-red-100 focus:ring-error'
                      }
                    `}
                    aria-label={`Unit ${t.tenementNumber} — ${t.ownerName} — ${due?.status}`}
                  >
                    <span className={`text-xl sm:text-xl font-extrabold leading-none group-hover:translate-y-[-12px] transition-transform duration-150 ${isPartial ? 'text-amber-700' : 'text-error'}`}>
                      {t.tenementNumber}
                    </span>
                    {isPartial && (
                      <span className="text-[8px] font-bold text-amber-600 uppercase">Partial</span>
                    )}
                    <span className="
                      absolute bottom-0 left-0 right-0 bg-black/50 text-white 
                      text-[15px] font-bold text-center py-1
                      opacity-0 group-hover:opacity-100 transition-opacity duration-150 truncate px-1
                    ">
                      {t.ownerName.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>)}

      {/* Bulletin preview */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-soft p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-title-lg font-bold text-on-surface">Active Bulletin Board</h3>
          <span className="text-[12px] font-bold text-on-surface-variant bg-primary/5 border border-slate-300 rounded-md px-2.5 py-0.5">
            {notices.length} notice{notices.length !== 1 ? 's' : ''}
          </span>
        </div>
        {notices.length === 0 ? (
          <EmptyState icon="campaign" message="No active notices published." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {notices.slice(0, 3).map(notice => (
              <div key={notice.id} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <span className="text-[12px] font-bold uppercase text-on-surface-variant">{notice.date}</span>
                <h4 className="font-bold text-[15px] text-on-surface leading-tight truncate">{notice.title}</h4>
                <p className="text-[15px] text-on-surface-variant line-clamp-2 leading-relaxed">{notice.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
