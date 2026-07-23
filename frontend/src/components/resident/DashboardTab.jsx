import React from 'react';
import { getBilledMonths, formatDate } from '../../utils/dateUtils';

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
  return (
    <div className="space-y-5 animate-fadeIn">

      {/* Welcome header */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-soft p-5 sm:p-6">
        <div className="flex justify-between items-center gap-4">
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Welcome back</p>
            <h2 className="font-display-lg text-on-surface mt-0.5">{tenementData.ownerName}</h2>
            <p className="text-sm text-on-surface-variant font-medium mt-0.5">
              Unit {tenementData.tenementNumber} · Parthbhoomi CHS
            </p>
          </div>
          <div className="hidden sm:flex w-14 h-14 rounded-full bg-primary text-white items-center justify-center font-extrabold text-xl shadow-soft flex-shrink-0">
            {tenementData.tenementNumber}
          </div>
        </div>
      </div>

      {/* Current month dues status banner */}
      {isCurrentPaid ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-soft animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-emerald-600 text-xl">verified</span>
            </div>
            <div>
              <h3 className="font-bold text-md text-emerald-800">Maintenance Paid — {selectedMonth} {selectedYear}</h3>
              <p className="text-sm text-emerald-600 font-medium mt-0.5">
                ₹{(currentDue?.amountPaid || currentDue?.amount)?.toLocaleString('en-IN')} cleared on{' '}
                {formatDate(currentDue?.dateCleared)} · {currentDue?.method}
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenReceipt(currentDue)}
            className="flex items-center gap-1.5 px-4 py-2 bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-50 rounded-lg text-md font-bold shadow-sm transition-all active-scale whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-sm">receipt_long</span>
            View Receipt
          </button>
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
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-soft animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-error text-xl">warning</span>
            </div>
            <div>
              <h3 className="font-bold text-md text-red-800">Maintenance Overdue — {selectedMonth} {selectedYear}</h3>
              <p className="text-[18px] text-red-600 font-medium mt-0.5 leading-relaxed">
                Please clear with the treasurer via Cheque, Cash, or Bank Transfer.
              </p>
            </div>
          </div>
          <div className="px-4 py-2 bg-white border border-red-300 text-error font-extrabold text-md rounded-lg shadow-sm text-center whitespace-nowrap">
            Due: ₹{(currentDue?.amount ?? maintenanceAmount).toLocaleString('en-IN')}/-
          </div>
        </div>
      )}

      {/* KPI grid */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: 'Months Paid',    value: totalPaid,                   sub: `of ${getBilledMonths(selectedYear)} in ${selectedYear}`, icon: 'verified',       color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Months Pending', value: totalUnpaid + totalPartial,  sub: 'require attention',                                      icon: 'hourglass_empty', color: 'text-error',       bg: 'bg-red-50'     },
          { label: 'Amount Paid',    value: `₹${(yearlyAmountPaid / 1000).toFixed(1)}k`, sub: `year ${selectedYear} to date`,           icon: 'payments',        color: 'text-primary',     bg: 'bg-blue-50'    },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white flex justify-between border border-slate-200 rounded-xl p-2 sm:p-3 shadow-soft">
            <div>
              <p className="font-extrabold text-xl text-on-surface">{kpi.value}</p>
              <p className="text-[14px] font-bold text-on-surface-variant uppercase tracking-wider mt-0.5">{kpi.label}</p>
              <p className="text-[13px] text-on-surface-variant mt-0.5">{kpi.sub}</p>
            </div>
            <div className={`w-8 h-8 rounded-lg ${kpi.bg} flex items-center justify-center mb-2`}>
              <span className={`material-symbols-outlined text-[18px] ${kpi.color}`}>{kpi.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Yearly payment timeline */}
      <div className="flex flex-col bg-white border border-slate-200 gap-3 rounded-xl shadow-soft p-5">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-title-lg font-bold text-on-surface">{selectedYear} Payment Timeline</h3>
          <span className="text-sm font-bold text-primary bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
            {totalPaid}/{getBilledMonths(selectedYear)} Paid
          </span>
        </div>
        <div className="h-5 bg-slate-100 overflow-hidden flex p-0.5 gap-0.5 border border-slate-200">
          {yearDues.map((due, idx) => {
            let color = 'bg-slate-200';
            if (due.status === 'Paid')    color = 'bg-emerald-500';
            if (due.status === 'Partial') color = 'bg-amber-400';
            if (due.status === 'Unpaid')  color = 'bg-red-400';
            return (
              <div
                key={idx}
                title={`${due.month}: ${due.status}${due.status === 'Partial' ? ` (₹${due.amountPaid}/${maintenanceAmount})` : ''}`}
                className={`flex-1 h-full rounded-sm transition-all duration-300 ${color} ${due.month === selectedMonth ? 'ring-1 ring-primary ring-offset-1' : ''}`}
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
            
              <span className="text-[12px] font-bold text-on-surface-variant bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-full">{selectedYear}</span>
              
      
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
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    due.status === 'Paid' ? 'bg-emerald-500'
                    : due.status === 'Partial' ? 'bg-amber-400'
                    : due.status === 'Unpaid' ? 'bg-error'
                    : 'bg-slate-300'
                  }`} />
                  <div>
                    <p className="text-md font-bold text-on-surface">{due.month} {selectedYear}</p>
                    <p className="text-[13px] text-on-surface-variant font-semibold">
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
                      className="px-2.5 py-2 text-[13px] font-bold bg-white text-primary border border-blue-200 hover:bg-primary hover:text-white rounded-lg shadow-sm transition-all active-scale"
                    >
                      Receipt
                    </button>
                  ) : due.status === 'Partial' ? (
                    <span className="text-[13px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-2 rounded-lg">Partial</span>
                  ) : due.status === 'Unpaid' ? (
                    <span className="text-[13px] font-bold text-error bg-red-50 border border-red-200 px-2.5 py-2 rounded-lg">Unpaid</span>
                  ) : (
                    <span className="text-[13px] font-bold text-slate-400 bg-slate-100 border border-slate-200 px-2.5 py-2 rounded-lg">Future</span>
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
            <span className="text-[13px] text-on-surface-variant font-semibold bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
              {notices.length} notice{notices.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="space-y-2.5 overflow-y-auto thin-scrollbar pr-1">
            {notices.length === 0 ? (
              <div className="flex flex-col items-center py-8 gap-2">
                <span className="material-symbols-outlined text-3xl text-slate-300">notifications_none</span>
                <p className="text-md text-on-surface-variant">No notices from the committee.</p>
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
