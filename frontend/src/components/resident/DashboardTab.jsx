import React, { useState, useEffect, useRef } from 'react';
import { getBilledMonths, formatDate, monthIndex, CURRENT_YEAR } from '../../utils/dateUtils';

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
    <div className="space-y-5 animate-fadeIn">

      {/* Welcome header */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-soft p-5 sm:p-6">
        <div className="flex justify-between items-center gap-4">
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Welcome back</p>
            <h2 className="font-display-md text-on-surface mt-0.5">{tenementData.ownerName}</h2>
            <p className="text-sm text-on-surface-variant font-medium mt-0.5">
              Unit {tenementData.tenementNumber} · Parthbhoomi CHS
            </p>
          </div>
          <div className="hidden sm:flex w-14 h-14 rounded-full bg-primary text-white items-center justify-center font-extrabold text-xl shadow-md flex-shrink-0">
            {tenementData.tenementNumber}
          </div>
        </div>
      </div>

      {/* Current month dues status banner */}
      {isCurrentPaid ? (
        <div className="bg-white border border-emerald-200 rounded-xl p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-soft animate-fadeIn">
          <div className="flex items-start gap-3">
           
            <div>
              <h3 className="font-bold text-md text-emerald-800">Maintenance Paid - {selectedMonth} {selectedYear}</h3>
              <p className="text-sm font-mono text-primary font-medium mt-1">
                ₹{(currentDue?.amountPaid || currentDue?.amount)?.toLocaleString('en-IN')} cleared on{' '}
                {formatDate(currentDue?.dateCleared)} · {currentDue?.method}
              </p>
            </div>
          </div>
          <div className='flex justify-end'>
          <button
            onClick={() => onOpenReceipt(currentDue)}
            className=" px-4 py-2 bg-white text-emerald-700 border border-slate-300 hover:bg-emerald-50 rounded-md text-md font-bold shadow-sm transition-all active-scale whitespace-nowrap"
          >
            Receipt
          </button>
          </div>
        </div>
      ) : isCurrentPartial ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-soft animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-amber-600 text-xl">pending</span>
            </div>
            <div>
              <h3 className="font-bold text-md text-amber-800">Partial Payment — {selectedMonth} {selectedYear}</h3>
              <p className="text-sm text-amber-700 font-medium mt-0.5">
                Paid: ₹{(currentDue?.amountPaid || 0).toLocaleString('en-IN')} of ₹{maintenanceAmount.toLocaleString('en-IN')} ·{' '}
                Remaining: <span className="font-bold text-error">₹{(maintenanceAmount - (currentDue?.amountPaid || 0)).toLocaleString('en-IN')}</span>
              </p>
              <div className="mt-2 h-1.5 w-48 bg-amber-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${((currentDue?.amountPaid || 0) / maintenanceAmount) * 100}%` }}
                />
              </div>
            </div>
          </div>
          <div className="px-4 py-2 bg-white border border-amber-300 text-amber-700 font-extrabold text-md rounded-lg shadow-sm text-center whitespace-nowrap">
            Balance: ₹{(maintenanceAmount - (currentDue?.amountPaid || 0)).toLocaleString('en-IN')}
          </div>
        </div>
      ) : isFuture ? (
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-soft animate-fadeIn">
          <div className="flex items-start gap-3">
          
            <div>
              <h3 className="font-bold text-md text-primary">Future Period - {selectedMonth} {selectedYear}</h3>
              <p className="text-sm text-primary  font-mono mt-1">
                This billing period is in the future. Dues are not yet active.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div ref={sentinelRef} className="h-0 w-0" />
          <div
            className={`sticky top-[85px] md:top-0 z-30 transition-all duration-300 ${
              isStuck
                ? '-mx-4 -mt-4 md:-mx-6 md:-mt-6 lg:-mx-8 lg:-mt-8'
                : 'mx-0 mt-0'
            }`}
          >
            <div
              className={`bg-white border transition-all duration-300 ease-in-out flex justify-between sm:items-center gap-4 ${
                isStuck
                  ? 'border-b border-x-0 border-t-0 border-error rounded-none shadow-md p-4 flex-row sm:flex-col lg:flex-row'
                  : 'border-error rounded-xl p-5 shadow-soft flex-col lg:flex-row'
              }`}
            >
              <div className="flex items-start gap-3">
               
                <div>
                  <h3 className="font-bold text-md text-red-800">Maintenance Overdue - {selectedMonth} {selectedYear}</h3>
                  <p className="text-[15px] text-primary font-mono mt-0.5 leading-relaxed tracking-tight">
                    Please clear with the treasurer via Cheque, Cash, or Bank Transfer.
                  </p>
                </div>
              </div>
              <div className="relative flex items-center group z-10 self-end sm:self-auto">
              <code key="due-badge" className="absolute left-0 top-0 bottom-0 z-0 flex px-4 items-center bg-error/30 border border-error text-error font-extrabold text-[16px] rounded-l-md shadow-inner text-center whitespace-nowrap transition-transform duration-500 ease-out animate-slide-in-due ">
              Due
              </code>
              <div className="px-4 py-2 bg-white border border-red-300 text-error font-extrabold text-md rounded-md shadow-lg text-center whitespace-nowrap relative z-10">
                ₹{(currentDue?.amount ?? maintenanceAmount).toLocaleString('en-IN')}/-
              </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: 'Months Paid',    value: totalPaid,                   sub: `of ${getBilledMonths(selectedYear)} in ${selectedYear}`, icon: 'verified',       color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Months Pending', value: totalUnpaid + totalPartial,  sub: 'require attention',                                      icon: 'hourglass_empty', color: 'text-error',       bg: 'bg-red-50'     },
          { label: 'Amount Paid',    value: `₹${(yearlyAmountPaid / 1000).toFixed(1)}k`, sub: `year ${selectedYear} to date`,           icon: 'payments',        color: 'text-primary',     bg: 'bg-blue-50'    },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white flex justify-between border border-slate-200 rounded-xl p-3 shadow-soft">
            <div>
              <p className="font-extrabold text-xl text-on-surface">{kpi.value}</p>
              <p className="text-[14px] font-bold text-on-surface-variant uppercase tracking-wider mt-0.5">{kpi.label}</p>
              <p className="text-[13px] text-on-surface-variant mt-0.5">{kpi.sub}</p>
            </div>
             <span className={`material-symbols-outlined text-[18px] ${kpi.color}`}>{kpi.icon}</span>
           
          </div>
        ))}
      </div>

      {/* Yearly payment timeline */}
      <div className="flex flex-col bg-white border border-slate-200 gap-3 rounded-xl shadow-soft p-5">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-title-lg font-bold text-on-surface">{selectedYear} Payment Timeline</h3>
          <span className="text-xs font-bold text-primary bg-primary/5 border border-slate-300 px-3 py-1 rounded-md">
            {totalPaid}/{getBilledMonths(selectedYear)} Paid
          </span>
        </div>
        <div className="h-5 bg-slate-100 overflow-hidden flex p-0.5 gap-0.5 border border-slate-200">
          {yearDues.map((due, idx) => {
            let colorClass = 'bg-slate-200';
            if (due.status === 'Paid')    colorClass = 'bg-emerald-500';
            if (due.status === 'Partial') colorClass = 'bg-amber-400';
            if (due.status === 'Unpaid')  colorClass = 'bg-red-400';
            return (
              <div
                key={idx}
                title={`${due.month}: ${due.status}${due.status === 'Partial' ? ` (₹${due.amountPaid}/${maintenanceAmount})` : ''}`}
                className={`flex-1 h-full rounded-sm transition-all duration-500 hover:scale-y-125 hover:shadow-md cursor-pointer ${
                  animate ? colorClass : 'bg-slate-200'
                } ${due.month === selectedMonth && due.year === CURRENT_YEAR ? 'ring-2 ring-primary ring-offset-1 z-10' : ''}`}
                style={{
                  transitionDelay: animate ? `${idx * 75}ms` : '0ms',
                }}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-[12px] text-on-surface-variant font-bold mt-1.5 px-0.5 uppercase tracking-wider">
          <span>Jan {selectedYear}</span>
          <span>Jun</span>
          <span>Dec {selectedYear}</span>
        </div>
        <div className="flex items-center gap-4 mt-3 flex-wrap text-xs">
          {[
            { color: 'bg-emerald-500', label: 'Paid' },
            { color: 'bg-amber-400',   label: 'Partial' },
            { color: 'bg-red-400',     label: 'Unpaid' },
            { color: 'bg-slate-200',   label: 'Unbilled' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-sm ${color}`} />
              <span className="font-semibold text-on-surface-variant text-sm">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom grid: mini ledger + bulletin */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Mini ledger */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-soft p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-title-lg font-bold text-on-surface">Recent Dues</h3>
            
              <span className="text-[12px] font-bold text-on-surface-variant bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-md">{selectedYear}</span>
              
      
          </div>
          <div className="space-y-2">
            {([...yearDues].filter(d => d.status !== 'Unbilled').reverse().slice(0, 3).length > 0
              ? [...yearDues].filter(d => d.status !== 'Unbilled').reverse().slice(0, 3)
              : [...yearDues].reverse().slice(0, 3)
            ).map((due, idx) => (
              <div
                key={due.month || idx}
                className="flex items-center justify-between px-3 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-100 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  
                  <div>
                    <p className="text-sm font-bold text-on-surface">{due.month} {due.year}</p>
                    <p className="text-[15px] text-on-surface-variant font-semibold">
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
                      className="px-2.5 py-2 text-[13px] font-bold bg-white text-primary border border-slate-300 hover:bg-primary/80 hover:text-white rounded-md shadow-md transition-all active-scale"
                    >
                      Receipt
                    </button>
                  ) : due.status === 'Partial' ? (
                    <span className="text-[13px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-2 rounded-md">Partial</span>
                  ) : due.status === 'Unpaid' ? (
                    <span className="text-[13px] font-bold text-error bg-white   border border-red-200 px-2.5 py-2 shadow-md rounded-md">Unpaid</span>
                  ) : (
                    <span className="text-[13px] font-bold text-slate-400 bg-slate-100 border border-slate-200 px-2.5 py-2 rounded-md">Future</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => onSwitchToLedger('ledger')}
            className="w-full flex items-center justify-center gap-2 bg-slate-50 text-primary border border-slate-200 hover:bg-blue-50 hover:text-primary/90 py-2 px-3 text-sm font-bold rounded-xl transition-all active-scale mt-2"
          >
            View All Dues
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>

        {/* Bulletin board */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-soft p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-title-lg font-bold text-on-surface">Bulletin Board</h3>
            <span className="text-[13px] text-on-surface-variant font-semibold bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
              {notices.length} notice{notices.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="space-y-2.5 overflow-y-auto thin-scrollbar pr-1">
            {notices.length === 0 ? (
              <div className="flex flex-col items-center py-8 gap-2">
                <span className="material-symbols-outlined text-3xl text-slate-300">notifications_none</span>
                <p className="text-sm  text-on-surface-variant">No notices from the committee.</p>
              </div>
            ) : notices.map(notice => (
              <div key={notice.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 transition-all space-y-1">
                <span className="text-[12px] font-bold uppercase text-on-surface-variant">{notice.date}</span>
                <h4 className="font-bold text-md text-on-surface leading-snug">{notice.title}</h4>
                <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-2">{notice.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
