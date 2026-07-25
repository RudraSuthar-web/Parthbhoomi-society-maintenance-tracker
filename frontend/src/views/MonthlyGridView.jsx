import React, { useContext, useState, useCallback, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { ALL_MONTHS, CURRENT_MONTH, CURRENT_YEAR, formatDate, getBilledMonths } from '../utils/dateUtils';

import GridToolbar      from '../components/grid/GridToolbar';
import GridTable        from '../components/grid/GridTable';
import GridPaymentModal from '../components/grid/GridPaymentModal';
import GridRevertModal  from '../components/grid/GridRevertModal';
import { STATUS }       from '../components/grid/GridCells';

export default function MonthlyGridView() {
  const { tenements, addInstallment, revertPayment, selectedYear, maintenanceAmount } = useContext(AppContext);

  // ── UI state ────────────────────────────────────────────────────────────────
  const [paymentModal, setPaymentModal] = useState(null);
  const [revertModal, setRevertModal]   = useState(null);
  const [tooltip, setTooltip]           = useState(null);
  const [sortBy, setSortBy]             = useState('unit');
  const [search, setSearch]             = useState('');

  // ── Filter + Sort ────────────────────────────────────────────────────────────
  const sorted = useMemo(() => {
    const filtered = tenements.filter(t =>
      String(t.tenementNumber).toLowerCase().includes(search.toLowerCase()) ||
      t.ownerName.toLowerCase().includes(search.toLowerCase())
    );
    return [...filtered].sort((a, b) => {
      if (sortBy === 'unit')   return parseInt(a.tenementNumber) - parseInt(b.tenementNumber);
      if (sortBy === 'name')   return a.ownerName.localeCompare(b.ownerName);
      if (sortBy === 'paid')   return (
        b.dues.filter(d => d.status === STATUS.PAID   && d.year === selectedYear).length -
        a.dues.filter(d => d.status === STATUS.PAID   && d.year === selectedYear).length
      );
      if (sortBy === 'unpaid') return (
        b.dues.filter(d => (d.status === STATUS.UNPAID || d.status === STATUS.PARTIAL) && d.year === selectedYear).length -
        a.dues.filter(d => (d.status === STATUS.UNPAID || d.status === STATUS.PARTIAL) && d.year === selectedYear).length
      );
      return 0;
    });
  }, [tenements, search, sortBy, selectedYear]);

  // ── Per-month aggregates ──────────────────────────────────────────────────────
  const monthStats = useMemo(() =>
    ALL_MONTHS.map(month => ({
      month,
      paid:     tenements.filter(t => t.dues.find(d => d.month === month && d.year === selectedYear)?.status === STATUS.PAID).length,
      partial:  tenements.filter(t => t.dues.find(d => d.month === month && d.year === selectedYear)?.status === STATUS.PARTIAL).length,
      unpaid:   tenements.filter(t => t.dues.find(d => d.month === month && d.year === selectedYear)?.status === STATUS.UNPAID).length,
      total:    tenements.length,
      collected: tenements.reduce((acc, t) => {
        const due = t.dues.find(d => d.month === month && d.year === selectedYear);
        if (!due) return acc;
        if (due.status === STATUS.PAID)    return acc + (due.amountPaid || due.amount || maintenanceAmount);
        if (due.status === STATUS.PARTIAL) return acc + (due.amountPaid || 0);
        return acc;
      }, 0),
    })),
  [tenements, selectedYear, maintenanceAmount]);

  // ── Grand totals ──────────────────────────────────────────────────────────────
  const grandCollected  = monthStats.reduce((s, m) => s + m.collected, 0);
  const grandPaidSlots  = monthStats.reduce((s, m) => s + m.paid, 0);
  const grandPendingAmt = tenements.reduce((acc, t) =>
    acc + t.dues.reduce((tAcc, d) => {
      if (d.year !== selectedYear) return tAcc;
      if (d.status === STATUS.UNPAID)   return tAcc + maintenanceAmount;
      if (d.status === STATUS.PARTIAL)  return tAcc + (maintenanceAmount - (d.amountPaid || 0));
      return tAcc;
    }, 0), 0);
  const overallRate = tenements.length * 12 > 0
    ? ((grandPaidSlots / (tenements.length * 12)) * 100).toFixed(1)
    : '0.0';

  // ── Cell interaction handlers ─────────────────────────────────────────────────
  const handleCellClick = useCallback((tenementNumber, month, status, due) => {
    if (status === STATUS.PAID || status === STATUS.PARTIAL) {
      setRevertModal({ tenementNumber, month, year: selectedYear });
    } else {
      setPaymentModal({
        tenementNumber, month, year: selectedYear,
        currentInstallments: due?.installments || [],
        amountPaid: due?.amountPaid || 0,
      });
    }
  }, [selectedYear]);

  const handleCellMouseEnter = useCallback((e, due) => {
    if (due.status !== STATUS.PAID && due.status !== STATUS.PARTIAL) return;
    const installments = due.installments || [];
    if (due.status === STATUS.PARTIAL && installments.length > 0) {
      const lines = installments.map(i => `₹${i.amount} · ${i.method} · ${i.date}`).join('\n');
      setTooltip({ text: `Partial (₹${due.amountPaid}/${maintenanceAmount})\n${lines}`, rect: e.currentTarget.getBoundingClientRect() });
    } else if (due.status === STATUS.PAID) {
      const text = due.method === 'Cash'
        ? `Cleared: ${formatDate(due.dateCleared)}\nMode: ${due.method}`
        : `Cleared: ${formatDate(due.dateCleared)}\nRef: ${due.reference}\nMode: ${due.method}`;
      setTooltip({ text, rect: e.currentTarget.getBoundingClientRect() });
    }
  }, [maintenanceAmount]);

  const handleCellMouseLeave = useCallback(() => setTooltip(null), []);

  const confirmPayment = (method, amount, reference) => {
    if (!paymentModal) return;
    const today = new Date();
    const randomRef = 'TXN' + Math.floor(10000 + Math.random() * 90000);
    addInstallment(
      paymentModal.tenementNumber,
      paymentModal.month,
      { amount, date: today.toISOString().split('T')[0], reference: reference || randomRef, method },
      paymentModal.year
    );
    setPaymentModal(null);
  };

  const confirmRevert = () => {
    if (!revertModal) return;
    revertPayment(revertModal.tenementNumber, revertModal.month, revertModal.year);
    setRevertModal(null);
  };

  // ── Empty state ───────────────────────────────────────────────────────────────
  if (tenements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-3">
        <span className="material-symbols-outlined text-5xl text-slate-300">grid_view</span>
        <p className="text-sm font-semibold text-on-surface-variant">No tenements registered yet.</p>
        <p className="text-xs text-on-surface-variant">Add tenements from the All Tenements tab to see the monthly grid.</p>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`@media print { @page { size: A4 landscape !important; margin: 10mm; } }`}</style>
      <div className="space-y-5 animate-fadeIn">

        {/* Page header */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-soft p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                Monthly Collection Register
              </span>
              <h2 className="font-display-lg text-on-surface ">
                Payment Matrix <span className="text-primary">{selectedYear}</span>
              </h2>
              <p className="text-xs text-on-surface-variant mt-1">
                Annual maintenance status for all {tenements.length} tenements · FY {selectedYear}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white text-xs font-bold rounded-lg  shadow-lg transition-all duration-150 active-scale focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                Print Register
              </button>
            </div>
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 xl:grid-cols-4 print:grid-cols-4 gap-3 sm:gap-4 print:mb-6">
          {[
            { label: `YTD Collected (${selectedYear})`, value: `₹${(grandCollected / 1000).toFixed(1)}k`, sub: `${grandPaidSlots} fully paid slots`, icon: 'payments', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-700', valueColor: 'text-emerald-700' },
            { label: 'Outstanding Amount', value: `₹${(grandPendingAmt / 1000).toFixed(1)}k`, sub: `${monthStats.reduce((s, m) => s + m.unpaid + m.partial, 0)} unpaid/partial slots`, icon: 'hourglass_empty', iconBg: 'bg-red-50', iconColor: 'text-error', valueColor: 'text-error' },
            { label: 'Collection Rate', value: `${overallRate}%`, sub: `${grandPaidSlots} of ${tenements.length * 12} slots paid`, icon: 'trending_up', iconBg: 'bg-blue-50', iconColor: 'text-primary', valueColor: 'text-primary' },
            { label: 'Total Tenements', value: tenements.length, sub: `Maintenance: ₹${maintenanceAmount.toLocaleString('en-IN')}/mo`, icon: 'home_work', iconBg: 'bg-slate-50', iconColor: 'text-slate-600', valueColor: 'text-on-surface' },
          ].map(kpi => (
            <div key={kpi.label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-soft flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider leading-none">{kpi.label}</p>
                <p className={`font-extrabold text-lg mt-1 leading-tight ${kpi.valueColor}`}>{kpi.value}</p>
                <p className="text-[12px] text-on-surface-variant font-medium mt-0.5 truncate">{kpi.sub}</p>
              </div>
              <span className={`material-symbols-outlined text-[18px] ${kpi.iconColor}`}>{kpi.icon}</span>
            
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <GridToolbar search={search} setSearch={setSearch} sortBy={sortBy} setSortBy={setSortBy} />

        {/* Grid or empty */}
        {sorted.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-soft">
            <span className="material-symbols-outlined text-4xl text-slate-300">search_off</span>
            <p className="text-sm font-semibold text-on-surface-variant mt-2">No tenements match your search.</p>
          </div>
        ) : (
          <GridTable
            sorted={sorted}
            selectedYear={selectedYear}
            maintenanceAmount={maintenanceAmount}
            monthStats={monthStats}
            grandCollected={grandCollected}
            tooltip={tooltip}
            onCellClick={handleCellClick}
            onCellMouseEnter={handleCellMouseEnter}
            onCellMouseLeave={handleCellMouseLeave}
          />
        )}
      </div>

      {/* Modals */}
      <GridPaymentModal
        state={paymentModal}
        maintenanceAmount={maintenanceAmount}
        onConfirm={confirmPayment}
        onCancel={() => setPaymentModal(null)}
      />
      <GridRevertModal
        state={revertModal}
        onConfirm={confirmRevert}
        onCancel={() => setRevertModal(null)}
      />
    </>
  );
}