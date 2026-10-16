import React from 'react';
import AlertBanner from '../ui/AlertBanner';
import EmptyState from '../ui/EmptyState';
import { CheckCircle2, ChevronLeft, ChevronRight, Megaphone, Banknote, Hourglass, Plus, MessageCircle } from 'lucide-react';
import { openWhatsAppReminder } from '../../utils/whatsappUtils';

/**
 * OverviewTab — Admin "Global Overview" tab.
 * Displays KPIs, maintenance amount setting, defaulters grid, and bulletin preview.
 * Fully styled for both light and dark themes.
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
  onPrevMonth,
  onNextMonth,
  onOpenPublish,
}) {
  const shortMonth = selectedMonth ? selectedMonth.slice(0, 3) : '';
  const shortYear = selectedYear ? String(selectedYear).slice(-2) : '';
  const shortPeriodLabel = `${shortMonth} '${shortYear}`;
  const fullPeriodLabel = `${selectedMonth} - ${selectedYear}`;

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* Page header */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-soft p-5 sm:p-6 flex items-center justify-between gap-4 transition-colors">
        <div>
          <h2 className="text-lg font-bold text-on-surface dark:text-zinc-100">Society Overview</h2>
          <p className="text-xs text-on-surface-variant dark:text-zinc-400 mt-1">
            Maintenance fund summary
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-black/5 dark:bg-white/10 border border-black/20 dark:border-white/20 rounded-md shadow-sm flex-shrink-0">
          <span className="text-xs font-bold text-primary dark:text-zinc-100">{selectedMonth} {selectedYear}</span>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Collected */}
        <div className="relative overflow-hidden bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-soft p-5 flex flex-col justify-between gap-4 transition-colors">
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <span className="text-[13px] font-bold text-on-surface-variant dark:text-zinc-400 uppercase tracking-wider">
                {selectedMonth} Collection
              </span>
              <h3 className="text-2xl font-extrabold text-on-surface dark:text-zinc-100 tracking-tight">
                ₹{totalCollectedDisplay.toLocaleString('en-IN')}
              </h3>
            </div>
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-on-surface-variant dark:text-zinc-400 font-semibold">
                {currentMonthPaid.length}/{totalTenementsCount} fully paid
              </span>
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400">{collectionRate}%</span>
            </div>
            <div className="h-3 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-black dark:from-white to-emerald-500 rounded-full transition-all duration-700 ease-out origin-left"
                style={{ transform: `scaleX(${collectionRate / 100})` }} 
              />
            </div>
          </div>
          <Banknote
            aria-hidden="true"
            className="absolute -top-2 -right-3 w-16 h-16 opacity-[0.06] dark:opacity-[0.08] stroke-[2] pointer-events-none select-none text-emerald-700 dark:text-emerald-400"
          />
        </div>

        {/* Outstanding */}
        <div className="relative overflow-hidden bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-soft p-5 flex flex-col justify-between gap-4 transition-colors">
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <span className="text-[13px] font-bold text-on-surface-variant dark:text-zinc-400 uppercase tracking-wider">
                Outstanding Dues
              </span>
              <h3 className="text-2xl font-extrabold text-error dark:text-red-400 tracking-tight">
                ₹{totalPendingThisMonth.toLocaleString('en-IN')}
              </h3>
            </div>
          </div>
          <p className="relative z-10 text-sm text-on-surface-variant dark:text-zinc-400 font-semibold mt-2">
            {currentMonthPaid.length === 0 && currentMonthUnpaid.length === 0 ? (
              <span className="text-slate-500 dark:text-zinc-500 font-medium">Billing has not started for {selectedMonth}</span>
            ) : (
              <>
                <span className="font-bold text-on-surface dark:text-zinc-100">{currentMonthUnpaid.length}</span>{' '}
                tenement{currentMonthUnpaid.length !== 1 ? 's' : ''} yet to fully pay for {selectedMonth}
              </>
            )}
          </p>
          <Hourglass
            aria-hidden="true"
            className="absolute -top-2 -right-3 w-16 h-16 opacity-[0.06] dark:opacity-[0.08] stroke-[2] pointer-events-none select-none text-error dark:text-red-400"
          />
        </div>
      </div>

      {/* Defaulters grid / Status banner */}
      {totalTenementsCount > 0 && (
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-soft overflow-hidden transition-colors">
        {currentMonthPaid.length === totalTenementsCount ? (
          <div className="flex items-center bg-emerald-800 dark:bg-emerald-900 p-3 justify-between">
            <div className="flex gap-2 items-center">
              <CheckCircle2 className="w-6 h-6 text-white flex-shrink-0" />
              <h3 className="font-title-lg font-bold text-white">All {totalTenementsCount} tenements have paid</h3>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <button onClick={onPrevMonth} aria-label="Previous month" className="text-white hover:bg-white/20 rounded-full p-1 transition-colors select-none focus:outline-none focus:ring-2 focus:ring-white/50 active:scale-95">
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <h3 className="font-title-lg font-bold text-white min-w-[70px] sm:min-w-[140px] text-center text-sm sm:text-base">
                <span className="inline sm:hidden">{shortPeriodLabel}</span>
                <span className="hidden sm:inline">{fullPeriodLabel}</span>
              </h3>
              <button onClick={onNextMonth} aria-label="Next month" className="text-white hover:bg-white/20 rounded-full p-1 transition-colors select-none focus:outline-none focus:ring-2 focus:ring-white/50 active:scale-95">
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>
        ) : defaulterTenements.length === 0 ? (
          <div className="flex items-center bg-primary/80 dark:bg-zinc-800 p-3 justify-between">
            <div className="flex gap-2 items-center">
              <h3 className="font-title-md lg:font-title-lg font-bold text-white">Billing has not started yet</h3>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <button onClick={onPrevMonth} aria-label="Previous month" className="text-white hover:bg-white/20 rounded-full p-1 transition-colors select-none focus:outline-none focus:ring-2 focus:ring-white/50 active:scale-95">
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <h3 className="font-title-lg font-bold text-white min-w-[70px] sm:min-w-[140px] text-center text-sm sm:text-base">
                <span className="inline sm:hidden">{shortPeriodLabel}</span>
                <span className="hidden sm:inline">{fullPeriodLabel}</span>
              </h3>
              <button onClick={onNextMonth} aria-label="Next month" className="text-white hover:bg-white/20 rounded-full p-1 transition-colors select-none focus:outline-none focus:ring-2 focus:ring-white/50 active:scale-95">
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center bg-gradient-to-tl from-red-900 to-error dark:from-red-950 dark:to-red-900 p-3 justify-between">
              <h3 className="font-title-lg font-bold text-white">
                <span className="font-bold text-white text-[20px]">{defaulterTenements.length}</span> Unpaid
              </h3>
              <div className="flex items-center gap-1 sm:gap-2">
                <button onClick={onPrevMonth} aria-label="Previous month" className="text-white hover:bg-white/20 rounded-full p-1 transition-colors select-none focus:outline-none focus:ring-2 focus:ring-white/50 active:scale-95">
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <h3 className="font-title-lg font-bold text-white min-w-[70px] sm:min-w-[140px] text-center text-sm sm:text-base">
                  <span className="inline sm:hidden">{shortPeriodLabel}</span>
                  <span className="hidden sm:inline">{fullPeriodLabel}</span>
                </h3>
                <button onClick={onNextMonth} aria-label="Next month" className="text-white hover:bg-white/20 rounded-full p-1 transition-colors select-none focus:outline-none focus:ring-2 focus:ring-white/50 active:scale-95">
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>
            <div className="bg-red-100/80 dark:bg-zinc-800 p-px grid grid-cols-5 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-12 gap-px">
              {defaulterTenements.map(t => {
                const due = t.dues.find(d => d.month === selectedMonth && d.year === selectedYear);
                const isPartial = due?.status === 'Partial';
                return (
                  <div
                    key={t.tenementNumber}
                    className="relative group aspect-square"
                  >
                    <button
                      onClick={() => onOpenTenement(t.tenementNumber)}
                      className={`
                        w-full h-full flex flex-col items-center justify-center
                        active:scale-95 transition-all duration-150
                        cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2
                        ${isPartial
                          ? 'bg-amber-50 dark:bg-zinc-900 hover:bg-amber-100 dark:hover:bg-amber-950/40 focus:ring-amber-400'
                          : 'bg-white dark:bg-zinc-900 hover:bg-red-50 dark:hover:bg-red-950/40 focus:ring-error'
                        }
                      `}
                      aria-label={`Unit ${t.tenementNumber} — ${t.ownerName} — ${due?.status}`}
                    >
                      <span className={`text-xl sm:text-xl font-extrabold leading-none group-hover:translate-y-[-10px] transition-transform duration-150 ${isPartial ? 'text-amber-700 dark:text-amber-400' : 'text-error dark:text-red-400'}`}>
                        {t.tenementNumber}
                      </span>
                      {isPartial && (
                        <span className="text-[8px] font-bold text-amber-600 dark:text-amber-400 uppercase mt-0.5">Partial</span>
                      )}
                      <span className="
                        absolute bottom-0 left-0 right-0 bg-black/70 text-white 
                        text-[12px] font-bold text-center py-0.5
                        opacity-0 group-hover:opacity-100 transition-opacity duration-150 truncate px-1 pointer-events-none
                      ">
                        {t.ownerName.split(' ')[0]}
                      </span>
                    </button>

                    {/* 1-Click WhatsApp Quick Reminder Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openWhatsAppReminder({
                          phone: t.contact,
                          unitNumber: t.tenementNumber,
                          ownerName: t.ownerName,
                          month: selectedMonth,
                          year: selectedYear,
                          amount: due?.amount || maintenanceAmount,
                          isPartial,
                          amountPaid: due?.amountPaid || 0,
                        });
                      }}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-md transition-all active:scale-90 z-10 hover:brightness-110"
                      title={`Send WhatsApp reminder to Unit ${t.tenementNumber}`}
                      aria-label={`Send WhatsApp reminder to Unit ${t.tenementNumber}`}
                    >
                      <img src="/whatsapp.svg" alt="WhatsApp" className="w-5 h-5 drop-shadow-sm" />
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>)}

      {/* Bulletin preview */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-soft p-5 sm:p-6 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-title-lg font-bold text-on-surface dark:text-zinc-100">Active Bulletin Board</h3>
          <span className="text-[12px] font-bold text-on-surface-variant dark:text-zinc-300 bg-primary/5 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-md px-2.5 py-0.5">
            {notices.length} notice{notices.length !== 1 ? 's' : ''}
          </span>
        </div>
        {notices.length === 0 ? (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-50/80 via-white to-slate-50/50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950 border border-dashed border-slate-200 dark:border-zinc-800 py-10 px-6 flex flex-col items-center text-center">
            {/* Ambient blur */}
            <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-primary/5 dark:bg-white/5 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full bg-amber-500/5 blur-2xl pointer-events-none" />

            {/* Visual pinboard card illustration */}
            <div className="relative mb-5">
              <div className="w-40 sm:w-48 h-28 bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700 rounded-xl shadow-sm rotate-6 absolute -inset-1 opacity-60" />
              <div className="relative w-40 sm:w-48 h-28 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl shadow-md p-3.5 flex flex-col justify-between -rotate-2 transition-transform duration-300 hover:rotate-0 animate-card-wiggle">
                {/* Pushpin at top */}
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-sm border-2 border-white dark:border-zinc-900 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/70" />
                </div>

                {/* Note line placeholders */}
                <div className="pt-2 space-y-1.5">
                  <div className="h-2 bg-slate-200 dark:bg-zinc-700 rounded-full w-3/4 mx-auto" />
                  <div className="h-1.5 bg-slate-100 dark:bg-zinc-750 rounded-full w-5/6 mx-auto" />
                  <div className="h-1.5 bg-slate-100 dark:bg-zinc-750 rounded-full w-1/2 mx-auto" />
                </div>

                <div className="flex items-center justify-center gap-1 text-[10px] font-bold font-mono text-primary dark:text-zinc-200 bg-primary/10 dark:bg-white/10 rounded-full py-0.5 px-2 w-fit mx-auto border border-primary/20 dark:border-white/20">
                  <Megaphone className="w-3 h-3 text-primary dark:text-zinc-200" />
                  <span>Broadcast Ready</span>
                </div>
              </div>
            </div>

            <h4 className="font-bold text-base sm:text-lg text-on-surface dark:text-zinc-100">
              No Notices Published Yet
            </h4>
            <p className="text-xs sm:text-sm text-on-surface-variant dark:text-zinc-400 max-w-sm mt-1.5 leading-relaxed">
              Broadcast maintenance schedules, meeting notices, or community circulars directly to all residents.
            </p>

            {onOpenPublish && (
              <button
                onClick={onOpenPublish}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary dark:bg-white text-white dark:text-zinc-950 text-xs font-bold rounded-xl shadow-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Broadcast Notice
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {notices.slice(0, 3).map(notice => (
              <div key={notice.id} className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 rounded-lg border border-slate-200 dark:border-zinc-700/60 space-y-2">
                <span className="text-[12px] font-bold uppercase text-on-surface-variant dark:text-zinc-400">{notice.date}</span>
                <h4 className="font-bold text-[15px] text-on-surface dark:text-zinc-100 leading-tight truncate">{notice.title}</h4>
                <p className="text-[15px] text-on-surface-variant dark:text-zinc-400 line-clamp-2 leading-relaxed">{notice.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
