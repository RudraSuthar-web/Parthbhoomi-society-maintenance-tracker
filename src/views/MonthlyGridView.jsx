import React, { useContext, useState, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { AppContext } from '../context/AppContext';
import {
  ALL_MONTHS, MONTHS_SHORT, CURRENT_MONTH, CURRENT_YEAR, DUES_AMOUNT, formatDate,
} from '../utils/dateUtils';

// ─── Helpers ────────────────────────────────────────────────────────────────
const STATUS = { PAID: 'Paid', UNPAID: 'Unpaid', UNBILLED: 'Unbilled', PARTIAL: 'Partial' };

function CellContent({ due }) {
  if (due.status === STATUS.PAID) {
    return (
      <>
        <span className="material-symbols-outlined text-emerald-600/20 text-[18px] leading-none">verified</span>
        <span className="text-[10px] font-bold text-emerald-700 leading-tight">
          ₹{(due.amountPaid || due.amount || 0).toLocaleString('en-IN')}
        </span>
      </>
    );
  }
  if (due.status === STATUS.PARTIAL) {
    return (
      <>
        <span className="material-symbols-outlined text-amber-500 text-[18px] leading-none">pending</span>
        <span className="text-[10px] font-bold text-amber-700 leading-tight">
          ₹{(due.amountPaid || 0).toLocaleString('en-IN')}
        </span>
      </>
    );
  }
  if (due.status === STATUS.UNPAID) {
    return (
      <>
        <span className="material-symbols-outlined text-error text-[18px] leading-none">cancel</span>
        <span className="text-[10px] font-bold text-error leading-tight">
          ₹{(due.amount || 0).toLocaleString('en-IN')}
        </span>
      </>
    );
  }
  return <span className="text-[13px] font-semibold text-slate-300 select-none">—</span>;
}

function MonthHeaderCell({ month, monthIdx, monthStats, selectedYear }) {
  const stats = monthStats[monthIdx];
  const paid = stats?.paid ?? 0;
  const rate = !stats || stats.total === 0 ? 0 : paid / stats.total;
  // Only highlight as "current" when actually viewing the real current year
  const isCurrentMonth = ALL_MONTHS[monthIdx] === CURRENT_MONTH && selectedYear === CURRENT_YEAR;

  const rateColor =
    rate > 0 ? isCurrentMonth ? 'text-blue-700' : 'text-slate-700'
    : 'text-slate-400';

  return (
    <th
      className={`border-b border-r border-slate-200 px-0.5 sm:px-1 py-2 text-center align-bottom select-none min-w-[50px] sm:min-w-[64px] ${
        isCurrentMonth ? 'bg-blue-50' : ''
      }`}
    >
      <div className="flex flex-col items-center gap-1">
        {isCurrentMonth && (
          <span className="text-[8px] font-bold text-primary uppercase tracking-wide leading-none">Current</span>
        )}
        {isCurrentMonth ? (
          <span className={`font-bold text-[15px] uppercase tracking-wide ${rateColor}`}>{MONTHS_SHORT[monthIdx]}</span>
        ) : (
          <span className={`font-bold text-[11px] uppercase tracking-wide ${rateColor}`}>
            {MONTHS_SHORT[monthIdx]}
          </span>
        )}
      </div>
    </th>
  );
}

// ─── Installment Payment Modal ───────────────────────────────────────────────
function PaymentModal({ state, maintenanceAmount, onConfirm, onCancel }) {
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');

  React.useEffect(() => {
    if (state) {
      const remaining = maintenanceAmount - (state.amountPaid || 0);
      setAmount(String(remaining > 0 ? remaining : maintenanceAmount));
      setReference('');
    }
  }, [state, maintenanceAmount]);

  if (!state) return null;

  const existing = state.currentInstallments || [];
  const remaining = maintenanceAmount - (state.amountPaid || 0);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 space-y-5 animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-primary text-xl">payments</span>
          </div>
          <div>
            <h3 className="font-bold text-sm text-on-surface">Add Payment Installment</h3>
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
              Unit <span className="font-bold text-primary">{state.tenementNumber}</span> ·{' '}
              <span className="font-bold text-on-surface">{state.month} {state.year}</span>
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-on-surface-variant">Required</span>
            <span className="text-on-surface">₹{maintenanceAmount.toLocaleString('en-IN')}</span>
          </div>
          {existing.length > 0 && (
            <>
              <div className="flex justify-between text-xs font-bold">
                <span className="text-on-surface-variant">Paid so far</span>
                <span className="text-emerald-600">₹{(state.amountPaid || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span className="text-on-surface-variant">Remaining</span>
                <span className="text-error">₹{remaining.toLocaleString('en-IN')}</span>
              </div>
              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, ((state.amountPaid || 0) / maintenanceAmount) * 100)}%` }}
                />
              </div>
              <div className="space-y-1 pt-1 border-t border-slate-200">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Previous installments</p>
                {existing.map((inst, i) => (
                  <div key={i} className="flex justify-between text-[11px]">
                    <span className="text-on-surface-variant">{inst.date} · {inst.method}</span>
                    <span className="font-bold text-emerald-700">+₹{inst.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Installment Amount (₹) <span className="text-slate-400 normal-case font-normal">— remaining: ₹{remaining.toLocaleString('en-IN')}</span>
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 bg-white text-on-surface rounded-lg text-xs font-semibold focus:outline-none focus:border-primary transition-all"
              min="1"
              max={remaining}
              placeholder={`Max ₹${remaining}`}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Reference / Cheque No.</label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Optional"
              className="w-full px-3 py-2 border border-slate-200 bg-white text-on-surface rounded-lg text-xs font-semibold focus:outline-none focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Select payment mode</p>
          <div className="grid grid-cols-3 gap-2">
            {['Cheque', 'Cash', 'Bank Transfer'].map((method) => (
              <button
                key={method}
                onClick={() => onConfirm(method, Number(amount), reference)}
                disabled={!amount || Number(amount) <= 0}
                className="py-3 border border-slate-200 bg-slate-50 hover:bg-primary hover:text-white hover:border-primary text-[11px] font-bold text-on-surface rounded-lg transition-all duration-150 active-scale focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {method}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-slate-100 rounded-lg transition-all active-scale focus:outline-none"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Revert Confirm Modal ─────────────────────────────────────────────────
function RevertConfirmModal({ state, onConfirm, onCancel }) {
  if (!state) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 space-y-4 animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-error text-xl">undo</span>
          </div>
          <div>
            <h3 className="font-bold text-sm text-on-surface">Revert Payment?</h3>
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
              This will mark <span className="font-bold text-on-surface">{state.month} {state.year}</span> for{' '}
              <span className="font-bold text-primary">Unit {state.tenementNumber}</span> back to{' '}
              <span className="font-bold text-error">Unpaid</span>. 
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-on-surface-variant hover:bg-slate-100 rounded-lg transition-all active-scale"
          >
            Keep Paid
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-xs font-bold text-white bg-error hover:bg-red-700 rounded-lg transition-all active-scale focus:outline-none focus:ring-2 focus:ring-error"
          >
            Yes, Revert
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function MonthlyGridView() {
  const { tenements, addInstallment, revertPayment, selectedYear, maintenanceAmount } = useContext(AppContext);

  const [paymentModal, setPaymentModal] = useState(null);
  const [revertModal, setRevertModal]   = useState(null);
  const [tooltip, setTooltip]           = useState(null);
  const [sortBy, setSortBy]             = useState('unit');
  const [search, setSearch]             = useState('');

  // ── Filter + Sort ────────────────────────────────────────────────────────
  const filtered = tenements.filter(
    (t) =>
      t.tenementNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.ownerName.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'unit')   return parseInt(a.tenementNumber) - parseInt(b.tenementNumber);
    if (sortBy === 'name')   return a.ownerName.localeCompare(b.ownerName);
    // Sort by paid count for the SELECTED year only
    if (sortBy === 'paid')   return (
      b.dues.filter(d => d.status === STATUS.PAID && d.year === selectedYear).length -
      a.dues.filter(d => d.status === STATUS.PAID && d.year === selectedYear).length
    );
    if (sortBy === 'unpaid') {
      const aUnpaid = a.dues.filter(d => (d.status === STATUS.UNPAID || d.status === STATUS.PARTIAL) && d.year === selectedYear).length;
      const bUnpaid = b.dues.filter(d => (d.status === STATUS.UNPAID || d.status === STATUS.PARTIAL) && d.year === selectedYear).length;
      return bUnpaid - aUnpaid;
    }
    return 0;
  });

  // ── Per-month aggregates (scoped to selectedYear) ────────────────────────
  const monthStats = ALL_MONTHS.map((month) => ({
    month,
    paid:     tenements.filter(t => t.dues.find(d => d.month === month && d.year === selectedYear)?.status === STATUS.PAID).length,
    partial:  tenements.filter(t => t.dues.find(d => d.month === month && d.year === selectedYear)?.status === STATUS.PARTIAL).length,
    unpaid:   tenements.filter(t => t.dues.find(d => d.month === month && d.year === selectedYear)?.status === STATUS.UNPAID).length,
    total:    tenements.length,
    collected: tenements.reduce((acc, t) => {
      const due = t.dues.find(d => d.month === month && d.year === selectedYear);
      if (!due) return acc;
      if (due.status === STATUS.PAID) return acc + (due.amountPaid || due.amount || maintenanceAmount);
      if (due.status === STATUS.PARTIAL) return acc + (due.amountPaid || 0);
      return acc;
    }, 0),
  }));

  const grandCollected  = monthStats.reduce((s, m) => s + m.collected, 0);
  const grandPaidSlots  = monthStats.reduce((s, m) => s + m.paid, 0);
  const grandPendingAmt = tenements.reduce((acc, t) =>
    acc + t.dues.reduce((tAcc, d) => {
      if (d.year !== selectedYear) return tAcc;
      if (d.status === STATUS.UNPAID) return tAcc + maintenanceAmount;
      if (d.status === STATUS.PARTIAL) return tAcc + (maintenanceAmount - (d.amountPaid || 0));
      return tAcc;
    }, 0), 0);
  const overallRate = tenements.length * 12 > 0
    ? ((grandPaidSlots / (tenements.length * 12)) * 100).toFixed(1)
    : '0.0';

  // ── Cell interaction ─────────────────────────────────────────────────────
  const handleCellClick = useCallback((tenementNumber, month, status, due) => {
    if (status === STATUS.UNBILLED) return;
    if (status === STATUS.PAID || status === STATUS.PARTIAL) {
      setRevertModal({ tenementNumber, month, year: selectedYear });
    } else {
      // Unpaid → open payment modal with installment info
      const currentInstallments = due?.installments || [];
      const amountPaid = due?.amountPaid || 0;
      setPaymentModal({ tenementNumber, month, year: selectedYear, currentInstallments, amountPaid });
    }
  }, [selectedYear]);

  const confirmPayment = (method, amount, reference) => {
    if (paymentModal) {
      const today = new Date();
      const randomRef = 'TXN' + Math.floor(10000 + Math.random() * 90000);
      addInstallment(
        paymentModal.tenementNumber,
        paymentModal.month,
        {
          amount,
          date: today.toISOString().split('T')[0],
          reference: reference || randomRef,
          method,
        },
        paymentModal.year
      );
      setPaymentModal(null);
    }
  };

  const confirmRevert = () => {
    if (revertModal) {
      revertPayment(revertModal.tenementNumber, revertModal.month, revertModal.year);
      setRevertModal(null);
    }
  };

  const handleCellMouseEnter = useCallback((e, due) => {
    if (due.status !== STATUS.PAID && due.status !== STATUS.PARTIAL) return;
    const installments = due.installments || [];
    if (due.status === STATUS.PARTIAL && installments.length > 0) {
      const lines = installments.map(i => `₹${i.amount} · ${i.method} · ${i.date}`).join('\n');
      setTooltip({
        text: `Partial (₹${due.amountPaid}/${maintenanceAmount})\n${lines}`,
        rect: e.currentTarget.getBoundingClientRect(),
      });
    } else if (due.status === STATUS.PAID) {
      const text = due.method === 'Cash'
        ? `Cleared: ${formatDate(due.dateCleared)}\nMode: ${due.method}`
        : `Cleared: ${formatDate(due.dateCleared)}\nRef: ${due.reference}\nMode: ${due.method}`;
      setTooltip({ text, rect: e.currentTarget.getBoundingClientRect() });
    }
  }, [maintenanceAmount]);

  const handleCellMouseLeave = useCallback(() => setTooltip(null), []);

  // ── Empty state ──────────────────────────────────────────────────────────
  if (tenements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-3">
        <span className="material-symbols-outlined text-5xl text-slate-300">grid_view</span>
        <p className="text-sm font-semibold text-on-surface-variant">No tenements registered yet.</p>
        <p className="text-xs text-on-surface-variant">Add tenements from the All Tenements tab to see the monthly grid.</p>
      </div>
    );
  }

  return (
    <>
      {/* Force Landscape Print Orientation */}
      <style>{`
        @media print {
          @page { size: A4 landscape !important; margin: 10mm; }
        }
      `}</style>
      <div className="space-y-5 animate-fadeIn">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-soft p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
              Monthly Collection Register
              </span>
            </div>
            <h2 className="font-display-lg text-on-surface">
              Payment Matrix <span className="text-primary">{selectedYear}</span>
            </h2>
            <p className="text-xs text-on-surface-variant mt-1">
              Annual maintenance status for all {tenements.length} tenements · FY {selectedYear}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-700 transition-all duration-150 active-scale focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              <span className="material-symbols-outlined text-sm">print</span>
              Print Register
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI Strip ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 print:grid-cols-4 gap-3 sm:gap-4 print:mb-6">
        {[
          {
            label: `YTD Collected (${selectedYear})`,
            value: `₹${(grandCollected / 1000).toFixed(1)}k`,
            sub: `${grandPaidSlots} fully paid slots`,
            icon: 'payments',
            iconBg: 'bg-emerald-50',
            iconColor: 'text-emerald-600',
            valueColor: 'text-emerald-700',
          },
          {
            label: 'Outstanding Amount',
            value: `₹${(grandPendingAmt / 1000).toFixed(1)}k`,
            sub: `${monthStats.reduce((s, m) => s + m.unpaid + m.partial, 0)} unpaid/partial slots`,
            icon: 'hourglass_empty',
            iconBg: 'bg-red-50',
            iconColor: 'text-error',
            valueColor: 'text-error',
          },
          {
            label: 'Collection Rate',
            value: `${overallRate}%`,
            sub: `${grandPaidSlots} of ${tenements.length * 12} slots paid`,
            icon: 'trending_up',
            iconBg: 'bg-blue-50',
            iconColor: 'text-primary',
            valueColor: 'text-primary',
          },
          {
            label: 'Total Tenements',
            value: tenements.length,
            sub: `Maintenance: ₹${maintenanceAmount.toLocaleString('en-IN')}/mo`,
            icon: 'home_work',
            iconBg: 'bg-slate-50',
            iconColor: 'text-slate-600',
            valueColor: 'text-on-surface',
          },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-soft flex items-start gap-3">
            <div className={`w-9 h-9 rounded-lg ${kpi.iconBg} flex items-center justify-center flex-shrink-0`}>
              <span className={`material-symbols-outlined text-[18px] ${kpi.iconColor}`}>{kpi.icon}</span>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider leading-none">{kpi.label}</p>
              <p className={`font-extrabold text-xl mt-1 leading-tight ${kpi.valueColor}`}>{kpi.value}</p>
              <p className="text-[10px] text-on-surface-variant font-medium mt-0.5 truncate">{kpi.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-soft px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 print:hidden">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search unit or owner…"
            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 bg-slate-50 text-on-surface text-xs font-semibold rounded-lg focus:outline-none focus:border-primary focus:bg-white transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider whitespace-nowrap">Sort</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-slate-200 bg-slate-50 text-on-surface text-xs font-bold rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary transition-all"
          >
            <option value="unit">Unit No.</option>
            <option value="name">Owner Name</option>
            <option value="paid">Most Paid</option>
            <option value="unpaid">Most Overdue</option>
          </select>
          <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>
        </div>

        {/* Spacer */}
        <div className="hidden sm:block flex-1" />

        {/* Legend */}
        <div className="flex items-center gap-3 flex-wrap text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-emerald-100 border border-emerald-300 flex-shrink-0" />
            <span className="font-semibold text-on-surface-variant">Paid</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-amber-100 border border-amber-300 flex-shrink-0" />
            <span className="font-semibold text-on-surface-variant">Partial</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-red-100 border border-red-300 flex-shrink-0" />
            <span className="font-semibold text-on-surface-variant">Unpaid</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-slate-100 border border-slate-200 flex-shrink-0" />
            <span className="font-semibold text-on-surface-variant">Unbilled</span>
          </div>
          <span className="text-slate-300">|</span>
          <span className="text-[10px] text-on-surface-variant italic">Click any billed cell to toggle status</span>
        </div>
      </div>

      {/* ── Main Grid ─────────────────────────────────────────────────────── */}
      {sorted.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-soft">
          <span className="material-symbols-outlined text-4xl text-slate-300">search_off</span>
          <p className="text-sm font-semibold text-on-surface-variant mt-2">No tenements match your search.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-soft overflow-hidden print:border-none print:shadow-none print:overflow-visible print:bg-transparent">
          
          {/* Print Header */}
          <div className="hidden print:block text-center mb-6 pb-4 border-b-2 border-black">
            <h1 className="text-2xl font-extrabold text-black">Parthbhoomi CHS</h1>
            <p className="text-sm font-bold text-slate-700 mt-1">Society Maintenance Ledger · FY {selectedYear}</p>
          </div>

          <div className="overflow-x-auto thin-scrollbar print:overflow-visible">
            <table className="border-collapse text-xs w-full min-w-max print:min-w-0 print:text-[10px]">
              <thead>
                {/* Month header */}
                <tr className="bg-slate-50 print:bg-slate-100">
                  <th
                    className="sticky left-0 z-20 print:static print:z-auto bg-slate-50 print:bg-slate-100 border-b border-r border-slate-200 px-2 sm:px-4 py-3 text-left w-[80px] sm:w-auto max-w-[80px] sm:max-w-none print:w-auto print:max-w-none"
                  >
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider overflow-hidden">
                      <span className="material-symbols-outlined text-sm hidden sm:block print:hidden">home</span>
                      <span className="truncate print:whitespace-normal">Unit/Owner</span>
                    </div>
                  </th>

                  {ALL_MONTHS.map((month, idx) => (
                    <MonthHeaderCell
                      key={month}
                      month={month}
                      monthIdx={idx}
                      monthStats={monthStats}
                      selectedYear={selectedYear}
                    />
                  ))}

                  <th
                    className="hidden sm:table-cell print:table-cell sticky right-0 z-20 print:static print:z-auto bg-slate-50 print:bg-slate-100 border-b border-l border-slate-200 px-3 py-3 text-center"
                    style={{ minWidth: '80px' }}
                  >
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">YTD {selectedYear}</span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {sorted.map((tenement, rowIdx) => {
                  // YTD counts scoped to selectedYear only
                  const paidCount   = tenement.dues.filter((d) => d.status === STATUS.PAID && d.year === selectedYear).length;
                  const partialCount = tenement.dues.filter((d) => d.status === STATUS.PARTIAL && d.year === selectedYear).length;
                  const unpaidCount = tenement.dues.filter((d) => d.status === STATUS.UNPAID && d.year === selectedYear).length;
                  const isEven = rowIdx % 2 === 0;

                  return (
                    <tr
                      key={tenement.tenementNumber}
                      className={`group transition-colors duration-100 hover:bg-blue-50/40 ${isEven ? 'bg-white' : 'bg-slate-50/40'}`}
                    >
                      {/* Identity cell */}
                      <td
                        className={`sticky left-0 z-10 print:static print:z-auto border-b border-r border-slate-100 px-2 sm:px-3 py-3 transition-colors duration-100 w-[80px] sm:w-auto max-w-[80px] sm:max-w-none print:max-w-none print:w-auto print:whitespace-nowrap ${isEven ? 'bg-white group-hover:bg-blue-50/40' : 'bg-slate-50/40 group-hover:bg-blue-50/40'}`}
                      >
                        <div className="flex items-center gap-1.5 sm:gap-2.5 overflow-hidden print:overflow-visible">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full text-black flex items-center justify-center font-bold text-[9px] sm:text-xs flex-shrink-0 shadow-md print:shadow-none">
                            {tenement.tenementNumber}
                          </div>
                          <div className="min-w-0 flex justify-between items-center gap-1 sm:gap-1 overflow-hidden print:overflow-visible">
                            <p className="font-bold text-on-surface text-[10px] sm:text-xs truncate max-w-[40px] sm:max-w-[120px] print:whitespace-nowrap print:max-w-none print:overflow-visible">
                              {tenement.ownerName.split(' ')[0]}
                            </p>
                            {(unpaidCount > 0 || partialCount > 0) && (
                              <span className="text-[12px] font-bold text-error leading-tight hidden sm:block">({unpaidCount + partialCount})</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Month cells */}
                      {ALL_MONTHS.map((month) => {
                        const due = tenement.dues.find((d) => d.month === month && d.year === selectedYear);
                        if (!due) {
                          return (
                            <td key={month} className="border-b border-r border-slate-100 px-1 py-1" />
                          );
                        }

                        const isPaid     = due.status === STATUS.PAID;
                        const isPartial  = due.status === STATUS.PARTIAL;
                        const isUnpaid   = due.status === STATUS.UNPAID;
                        const isUnbilled = due.status === STATUS.UNBILLED;
                        // Only highlight as current when viewing the real current year
                        const isCurrent  = month === CURRENT_MONTH && selectedYear === CURRENT_YEAR;

                        const cellClasses = [
                          'border-b border-r px-0.5 py-1 transition-colors duration-100',
                          isCurrent ? 'bg-blue-50/30' : '',
                          isPaid    ? 'border-emerald-100 bg-emerald-20 hover:bg-emerald-100 cursor-pointer'
                          : isPartial ? 'border-amber-100 bg-amber-50 hover:bg-amber-100 cursor-pointer'
                          : isUnpaid  ? 'border-red-100 bg-red-50 hover:bg-red-100 cursor-pointer'
                          : 'border-slate-100',
                        ].join(' ');

                        const innerClasses = [
                          'flex flex-col items-center justify-center gap-0.5 rounded mx-0.5 ',
                          'min-h-[36px] transition-all duration-100',
                        ].join(' ');

                        return (
                          <td key={month} className={cellClasses}>
                            <div
                              role={!isUnbilled ? 'button' : undefined}
                              tabIndex={!isUnbilled ? 0 : undefined}
                              aria-label={`${month} ${selectedYear}: ${due.status} — Unit ${tenement.tenementNumber}`}
                              className={innerClasses}
                              onClick={() => handleCellClick(tenement.tenementNumber, month, due.status, due)}
                              onKeyDown={(e) => e.key === 'Enter' && handleCellClick(tenement.tenementNumber, month, due.status, due)}
                              onMouseEnter={(e) => handleCellMouseEnter(e, due)}
                              onMouseLeave={handleCellMouseLeave}
                            >
                              <CellContent due={due} />
                            </div>
                          </td>
                        );
                      })}

                      {/* YTD column — counts only selectedYear */}
                      <td
                        className={`hidden sm:table-cell print:table-cell sticky right-0 z-10 print:static print:z-auto border-b border-l border-slate-100 px-2 py-2 text-center transition-colors duration-100 ${isEven ? 'bg-white group-hover:bg-blue-50/40' : 'bg-slate-50/40 group-hover:bg-blue-50/40'}`}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span className={`font-extrabold text-sm leading-tight ${
                            paidCount === 12 ? 'text-emerald-600'
                            : paidCount >= 9  ? 'text-green-500'
                            : paidCount >= 6  ? 'text-black/40'
                            : 'text-error'
                          }`}>
                            {paidCount}/12
                          </span>
                          {partialCount > 0 && (
                            <span className="text-[9px] font-bold text-amber-600">{partialCount} partial</span>
                          )}
                          <div className="w-9 h-1 bg-slate-200 rounded-full overflow-hidden print:hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${
                                paidCount === 12 ? 'bg-emerald-500'
                                : paidCount >= 9  ? 'bg-green-400'
                                : paidCount >= 6  ? 'bg-blue-400'
                                : 'bg-red-400'
                              }`}
                              style={{ width: `${(paidCount / 12) * 100}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Footer totals */}
              <tfoot>
                <tr className="bg-slate-800">
                  <td className="sticky left-0 z-20 bg-slate-800 border-t border-slate-700 px-2 sm:px-4 py-3 w-[80px] sm:w-auto max-w-[80px] sm:max-w-none">
                    <div className="flex items-center gap-1.5 text-[9px] sm:text-[13px] font-bold text-slate-300 uppercase tracking-wider truncate">
                      Grand Total
                    </div>
                  </td>
                  {monthStats.map((stats) => (
                    <td
                      key={stats.month}
                      className="border-t border-slate-700 px-1 py-3 text-center"
                    >
                    {stats.collected > 0 && (
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="font-extrabold text-[13px] text-white">
                          ₹{stats.collected.toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}
                    </td>
                  ))}
                  <td className="hidden sm:table-cell print:table-cell sticky right-0 z-20 print:static print:z-auto bg-slate-800 print:bg-slate-200 border-t border-l border-slate-700 print:border-slate-300 px-3 py-3 text-center">
                    <span className="font-extrabold text-sm text-blue-400 print:text-emerald-700">
                      ₹{grandCollected.toLocaleString('en-IN')}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ── Tooltip ──────────────────────────────────────────────────────── */}
      {tooltip && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed z-[200] pointer-events-none px-3 py-2 bg-slate-900 text-white text-[15px] font-semibold rounded-lg shadow-2xl whitespace-pre-line border border-slate-700 animate-fadeIn"
          style={{
            top: tooltip.rect.bottom + 8,
            left: tooltip.rect.left + tooltip.rect.width / 2,
            transform: 'translateX(-50%)',
          }}
        >
          {tooltip.text}
        </div>,
        document.body
      )}

      {/* ── Modals ───────────────────────────────────────────────────────── */}
      <PaymentModal
        state={paymentModal}
        maintenanceAmount={maintenanceAmount}
        onConfirm={confirmPayment}
        onCancel={() => setPaymentModal(null)}
      />
      <RevertConfirmModal
        state={revertModal}
        onConfirm={confirmRevert}
        onCancel={() => setRevertModal(null)}
      />
      </div>
    </>
  );
}
