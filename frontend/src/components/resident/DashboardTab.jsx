import React, { useState, useEffect, useRef } from 'react';
import {
  BadgeCheck,
  Hourglass,
  Wallet,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { getBilledMonths, formatDate, monthIndex, CURRENT_YEAR } from '../../utils/dateUtils';
import SOCIETY_CONFIG from '../../config/societyConfig';

/**
 * DashboardTab — Resident "My Dashboard" tab.
 * Shows current month status, KPIs, yearly timeline, mini ledger, and bulletin preview.
 */
export default function DashboardTab({
  tenementData, selectedMonth, selectedYear,
  currentDue, yearDues,
  totalPaid, totalUnpaid, totalPartial,
  isCurrentPaid, isCurrentPartial,
  yearlyAmountPaid, maintenanceAmount,
  notices,
  onOpenReceipt,
  onSwitchToLedger,
}) {
  const [animate, setAnimate] = useState(false);
  const [isStuck, setIsStuck] = useState(false);
  const sentinelRef = useRef(null);

  const cy = new Date().getFullYear();
  const cm = new Date().getMonth();
  const isFuture = (selectedYear > cy) || (selectedYear === cy && monthIndex(selectedMonth) > cm);

  useEffect(() => {
    setAnimate(false);
    const timer = setTimeout(() => {
      setAnimate(true);
    }, 50);
    return () => clearTimeout(timer);
  }, [selectedYear, yearDues]);

  useEffect(() => {
    const handleScroll = () => {
      if (!sentinelRef.current) return;
      const rect = sentinelRef.current.getBoundingClientRect();
      const isMobile = window.innerWidth < 768;
      const threshold = isMobile ? 56 : 0;
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
    <div className="space-y-5 animate-fadeIn">

      {/* Welcome header */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-soft p-5 sm:p-6">
        <div className="flex justify-between items-center gap-4">
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant dark:text-zinc-400 uppercase tracking-widest">Welcome back</p>
            <h2 className="font-display-md text-on-surface dark:text-zinc-100 mt-0.5">{tenementData.ownerName}</h2>
            <p className="text-sm text-on-surface-variant dark:text-zinc-400 font-medium mt-0.5">
              Unit {tenementData.tenementNumber} · {SOCIETY_CONFIG.name}
            </p>
          </div>
          <div className="hidden sm:flex w-14 h-14 rounded-full bg-primary text-white items-center justify-center font-extrabold text-xl shadow-md flex-shrink-0">
            {tenementData.tenementNumber}
          </div>
        </div>
      </div>

      {/* Current month dues status banner */}
      {isCurrentPaid ? (
        <div className="bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-soft animate-fadeIn">
          <div className="flex items-start gap-3">
            <div>
              <h3 className="font-bold text-md text-emerald-800 dark:text-emerald-400">Maintenance Paid - {selectedMonth} {selectedYear}</h3>
              <p className="text-sm font-mono text-primary dark:text-white font-medium mt-1">
                ₹{(currentDue?.amountPaid || currentDue?.amount)?.toLocaleString('en-IN')} cleared on{' '}
                {formatDate(currentDue?.dateCleared)} · {currentDue?.method}
              </p>
            </div>
          </div>
          <div className='flex justify-end'>
            <button
              onClick={() => onOpenReceipt(currentDue)}
              className="px-4 py-2 bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 border border-slate-300 dark:border-zinc-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-md text-md font-bold shadow-sm transition-all active-scale whitespace-nowrap"
            >
              Receipt
            </button>
          </div>
        </div>
      ) : isCurrentPartial ? (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 rounded-xl p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-soft animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-md text-amber-800 dark:text-amber-300">Partial Payment — {selectedMonth} {selectedYear}</h3>
              <p className="text-sm text-amber-700 dark:text-amber-400 font-medium mt-0.5">
                Paid: ₹{(currentDue?.amountPaid || 0).toLocaleString('en-IN')} of ₹{maintenanceAmount.toLocaleString('en-IN')} ·{' '}
                Remaining: <span className="font-bold text-error dark:text-red-400">₹{(maintenanceAmount - (currentDue?.amountPaid || 0)).toLocaleString('en-IN')}</span>
              </p>
              <div className="mt-2 h-1.5 w-48 bg-amber-200 dark:bg-amber-900/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${((currentDue?.amountPaid || 0) / maintenanceAmount) * 100}%` }}
                />
              </div>
            </div>
          </div>
          <div className="px-4 py-2 bg-white dark:bg-zinc-800 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 font-extrabold text-md rounded-lg shadow-sm text-center whitespace-nowrap">
            Balance: ₹{(maintenanceAmount - (currentDue?.amountPaid || 0)).toLocaleString('en-IN')}
          </div>
        </div>
      ) : isFuture ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-soft animate-fadeIn">
          <div className="flex items-start gap-3">
            <div>
              <h3 className="font-bold text-md text-primary dark:text-white">Future Period - {selectedMonth} {selectedYear}</h3>
              <p className="text-sm text-primary dark:text-white font-mono mt-1">
                This billing period is in the future. Dues are not yet active.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div ref={sentinelRef} className="h-0 w-0" />
          <div
            className={`sticky top-[65px] md:top-0 z-30 transition-all duration-300 ${
              isStuck
                ? 'md:-mx-6 md:-mt-16 lg:-mx-8 lg:-mt-16'
                : 'mx-0 mt-0'
            }`}
          >
            {isStuck ? (
              /* Stuck Mode: Sleek pill banner */
              <div className="border sm:border lg:border-b border-red-600 dark:border-red-500 rounded-full lg:rounded-none bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-md py-4 px-3.5 sm:px-5 flex items-center justify-between gap-3 transition-all duration-300">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="min-w-0">
                    <h3 className="font-bold text-red-800 dark:text-red-300 truncate text-[13px] sm:text-[12px] md:text-base lg:text-lg">
                      Maintenance Overdue · {selectedMonth} {selectedYear}
                    </h3>
                  </div>
                </div>
                <div className="flex items-center flex-shrink-0">
                  <div className="px-2 py-1 bg-white dark:bg-zinc-800 border border-red-300 dark:border-red-800 text-error dark:text-red-400 font-extrabold rounded-full lg:rounded-md text-[13px] sm:text-sm md:text-base shadow-sm text-center whitespace-nowrap">
                    ₹{(currentDue?.amount ?? maintenanceAmount).toLocaleString('en-IN')}/-
                  </div>
                </div>
              </div>
            ) : (
              /* Unstuck Mode: Original card layout with sliding Due badge */
              <div className="border border-error dark:border-red-800/80 rounded-xl p-5 shadow-soft bg-white dark:bg-zinc-900 flex flex-col lg:flex-row justify-between sm:items-center gap-4 transition-all duration-300">
                <div className="flex items-start gap-3">
                  <div>
                    <h3 className="font-bold text-md text-red-800 dark:text-red-300">
                      Maintenance Overdue - {selectedMonth} {selectedYear}
                    </h3>
                    <p className="text-[15px] text-primary dark:text-white font-mono mt-0.5 leading-relaxed tracking-tight">
                      Please clear with the treasurer via Cheque, Cash, or Bank Transfer.
                    </p>
                  </div>
                </div>
                <div className="relative flex items-center group z-10 self-end sm:self-auto">
                  <code
                    key="due-badge"
                    className="absolute left-0 top-0 bottom-0 z-0 flex px-4 items-center bg-error/30 text-error dark:text-red-400 border border-error rounded-l-md shadow-inner text-center whitespace-nowrap transition-transform duration-500 ease-out animate-slide-in-due"
                  >
                    Due
                  </code>
                  <div className="px-4 py-2 bg-white dark:bg-zinc-800 border border-red-300 dark:border-red-800 text-error dark:text-red-400 font-extrabold text-md rounded-md shadow-lg text-center whitespace-nowrap relative z-10">
                    ₹{(currentDue?.amount ?? maintenanceAmount).toLocaleString('en-IN')}/-
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: 'Months Paid',    value: totalPaid,                   sub: `of ${getBilledMonths(selectedYear)} in ${selectedYear}`, Icon: BadgeCheck,       color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
          { label: 'Months Pending', value: totalUnpaid + totalPartial,  sub: 'require attention',                                      Icon: Hourglass, color: 'text-error dark:text-red-400',       bg: 'bg-red-50 dark:bg-red-950/40'     },
          { label: 'Amount Paid',    value: `₹${(yearlyAmountPaid / 1000).toFixed(1)}k`, sub: `year ${selectedYear} to date`,           Icon: Wallet,        color: 'text-primary dark:text-white',     bg: 'bg-blue-50 dark:bg-blue-950/40'    },
        ].map(kpi => {
          const KpiIcon = kpi.Icon;
          return (
            <div key={kpi.label} className="relative overflow-hidden bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 sm:p-4 shadow-soft">
              <div className="relative z-10">
                <p className="font-extrabold text-xl sm:text-2xl text-on-surface dark:text-zinc-100">{kpi.value}</p>
                <p className="text-[12px] sm:text-[14px] font-bold text-on-surface-variant dark:text-zinc-400 uppercase tracking-wider mt-0.5">{kpi.label}</p>
                <p className="text-[11px] sm:text-[13px] text-on-surface-variant dark:text-zinc-400 mt-0.5">{kpi.sub}</p>
              </div>
              <KpiIcon
                aria-hidden="true"
                className={`absolute -bottom-3 -right-3 w-14 h-14 opacity-[0.06] dark:opacity-[0.08] stroke-[2] pointer-events-none select-none ${kpi.color}`}
              />
            </div>
          );
        })}
      </div>

      {/* Yearly payment timeline */}
      <div className="flex flex-col bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 gap-3 rounded-xl shadow-soft p-5">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-title-lg font-bold text-on-surface dark:text-zinc-100">{selectedYear} Payment Timeline</h3>
          <span className="text-xs font-bold text-primary dark:text-white bg-primary/5 dark:bg-primary/20 border border-slate-300 dark:border-zinc-700 px-3 py-1 rounded-md">
            {totalPaid}/{getBilledMonths(selectedYear)} Paid
          </span>
        </div>
        <div className="h-5 bg-slate-100 dark:bg-zinc-800 overflow-hidden flex p-0.5 gap-0.5 border border-slate-200 dark:border-zinc-700 rounded-md">
          {yearDues.map((due, idx) => {
            let colorClass = 'bg-slate-200 dark:bg-zinc-700';
            if (due.status === 'Paid')    colorClass = 'bg-emerald-500';
            if (due.status === 'Partial') colorClass = 'bg-amber-400';
            if (due.status === 'Unpaid')  colorClass = 'bg-red-400';
            return (
              <div
                key={idx}
                title={`${due.month}: ${due.status}${due.status === 'Partial' ? ` (₹${due.amountPaid}/${maintenanceAmount})` : ''}`}
                className={`flex-1 h-full rounded-sm transition-all duration-500 hover:scale-y-125 hover:shadow-md cursor-pointer ${
                  animate ? colorClass : 'bg-slate-200 dark:bg-zinc-700'
                } ${due.month === selectedMonth && due.year === CURRENT_YEAR ? 'ring-2 ring-primary ring-offset-1 z-10' : ''}`}
                style={{
                  transitionDelay: animate ? `${idx * 75}ms` : '0ms',
                }}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-[12px] text-on-surface-variant dark:text-zinc-400 font-bold mt-1.5 px-0.5 uppercase tracking-wider">
          <span>Jan {selectedYear}</span>
          <span>Jun</span>
          <span>Dec {selectedYear}</span>
        </div>
        <div className="flex items-center gap-4 mt-3 flex-wrap text-xs">
          {[
            { color: 'bg-emerald-500', label: 'Paid' },
            { color: 'bg-amber-400',   label: 'Partial' },
            { color: 'bg-red-400',     label: 'Unpaid' },
            { color: 'bg-slate-200 dark:bg-zinc-700', label: 'Unbilled' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-sm ${color}`} />
              <span className="font-semibold text-on-surface-variant dark:text-zinc-400 text-sm">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom grid: mini ledger + bulletin */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Mini ledger */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-soft p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-title-lg font-bold text-on-surface dark:text-zinc-100">Recent Dues</h3>
            <span className="text-[12px] font-bold text-on-surface-variant dark:text-zinc-400 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-2.5 py-0.5 rounded-md">{selectedYear}</span>
          </div>
          <div className="space-y-2">
            {([...yearDues].filter(d => d.status !== 'Unbilled').reverse().slice(0, 3).length > 0
              ? [...yearDues].filter(d => d.status !== 'Unbilled').reverse().slice(0, 3)
              : [...yearDues].reverse().slice(0, 3)
            ).map((due, idx) => (
              <div
                key={due.month || idx}
                className="flex items-center justify-between px-3 py-2.5 bg-slate-50 dark:bg-zinc-800/60 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg border border-slate-100 dark:border-zinc-800 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div>
                    <p className="text-sm font-bold text-on-surface dark:text-zinc-100">{due.month} {due.year}</p>
                    <p className="text-[15px] text-on-surface-variant dark:text-zinc-400 font-semibold">
                      {due.status === 'Partial'
                        ? `₹${(due.amountPaid || 0).toLocaleString('en-IN')} / ₹${maintenanceAmount.toLocaleString('en-IN')}`
                        : `₹${(due.amount || maintenanceAmount).toLocaleString('en-IN')}`
                      }
                    </p>
                  </div>
                </div>
                <div>
                  {due.status === 'Paid' ? (
                    <button
                      onClick={() => onOpenReceipt(due)}
                      className="px-2.5 py-2 text-[13px] font-bold bg-white dark:bg-zinc-800 text-primary dark:text-white border border-slate-300 dark:border-zinc-700 hover:bg-primary/80 dark:hover:bg-primary hover:text-white dark:hover:text-white rounded-md shadow-md transition-all active-scale"
                    >
                      Receipt
                    </button>
                  ) : due.status === 'Partial' ? (
                    <span className="text-[13px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2.5 py-2 rounded-md">Partial</span>
                  ) : due.status === 'Unpaid' ? (
                    <span className="text-[13px] font-bold text-error dark:text-red-400 bg-white dark:bg-zinc-800 border border-red-200 dark:border-red-900/60 px-2.5 py-2 shadow-md rounded-md">Unpaid</span>
                  ) : (
                    <span className="text-[13px] font-bold text-slate-400 dark:text-zinc-500 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-2.5 py-2 rounded-md">Future</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => onSwitchToLedger('ledger')}
            className="w-full flex items-center justify-center gap-2 bg-slate-50 dark:bg-zinc-800 text-primary dark:text-white border border-slate-200 dark:border-zinc-700 hover:bg-blue-50 dark:hover:bg-zinc-700 hover:text-primary/90 py-2 px-3 text-sm font-bold rounded-xl transition-all active-scale mt-2"
          >
            <span>View All Dues</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Bulletin board */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-soft p-5 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-title-lg font-bold text-on-surface dark:text-zinc-100">Bulletin Board</h3>
            <span className="text-[13px] text-on-surface-variant dark:text-zinc-400 font-semibold bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-2 py-0.5 rounded-md">
              {notices.length} notice{notices.length !== 1 ? 's' : ''}
            </span>
          </div>
          {notices.length === 0 ? (
            <div className="w-full flex-1 flex flex-col items-center justify-center py-8 px-4 bg-slate-50/70 dark:bg-zinc-800/40 rounded-xl border border-dashed border-slate-200 dark:border-zinc-700 text-center">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 shadow-sm flex items-center justify-center text-primary mb-2 relative">
                <div className="absolute -top-1 w-2.5 h-2.5 rounded-full bg-red-400 shadow-xs" />
                <CheckCircle2 className="w-5 h-5 text-slate-400 dark:text-zinc-500" />
              </div>
              <p className="text-xs font-mono text-on-surface dark:text-zinc-300">You're All Caught Up</p>
            </div>
          ) : (
            <div className="space-y-2.5 overflow-y-auto thin-scrollbar pr-1">
              {notices.map(notice => (
                <div key={notice.id} className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-lg border border-slate-200 dark:border-zinc-700/80 transition-all space-y-1">
                  <span className="text-[12px] font-bold uppercase text-on-surface-variant dark:text-zinc-400">{notice.date}</span>
                  <h4 className="font-bold text-md text-on-surface dark:text-zinc-100 leading-snug">{notice.title}</h4>
                  <p className="text-sm text-on-surface-variant dark:text-zinc-400 leading-relaxed line-clamp-2">{notice.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      </div>
   
  );
}
