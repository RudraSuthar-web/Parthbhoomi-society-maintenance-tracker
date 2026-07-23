import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import ReceiptModal from '../components/ReceiptModal';
import DrivePreviewModal from '../components/DrivePreviewModal';
import { DUES_AMOUNT, formatDate } from '../utils/dateUtils';

export default function ResidentDashboard({ currentTab }) {
  const {
    user, tenements, notices, updateProfile,
    selectedYear, selectedMonth,
    maintenanceAmount, expenses,
  } = useContext(AppContext);

  const tenementData = tenements.find(t => t.tenementNumber === user?.username);

  const [expandedIdx, setExpandedIdx]     = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Drive Bill Preview State
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isDriveOpen, setIsDriveOpen] = useState(false);

  const [profileName, setProfileName]       = useState('');
  const [profileContact, setProfileContact] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError]     = useState('');

  useEffect(() => {
    if (tenementData) {
      setProfileName(tenementData.ownerName || '');
      setProfileContact(tenementData.contact || '');
    }
  }, [tenementData]);

  if (!user || user.role !== 'resident') return null;

  if (!tenementData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <span className="material-symbols-outlined text-5xl text-error">error_outline</span>
        <p className="text-sm font-bold text-error">Tenement record not found for Unit {user.username}</p>
        <p className="text-xs text-on-surface-variant">Contact the society administrator to register your unit.</p>
      </div>
    );
  }

  // ── Computed stats scoped to selectedYear ────────────────────────────────
  const yearDues       = tenementData.dues.filter(d => d.year === selectedYear);
  const currentDue     = yearDues.find(d => d.month === selectedMonth);
  const totalPaid      = yearDues.filter(d => d.status === 'Paid').length;
  const totalPartial   = yearDues.filter(d => d.status === 'Partial').length;
  const totalUnpaid    = yearDues.filter(d => d.status === 'Unpaid').length;
  const isCurrentPaid  = currentDue?.status === 'Paid';
  const isCurrentPartial = currentDue?.status === 'Partial';

  // YTD amount = sum of amountPaid across paid + partial months in selected year
  const yearlyAmountPaid = yearDues.reduce((acc, d) => {
    if (d.status === 'Paid' || d.status === 'Partial') return acc + (d.amountPaid || d.amount || 0);
    return acc;
  }, 0);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const openReceipt = (monthDue) => {
    setSelectedReceipt({
      tenementNumber: tenementData.tenementNumber,
      ownerName:      tenementData.ownerName,
      month:          monthDue.month,
      year:           monthDue.year || selectedYear,
      amount:         monthDue.amountPaid || monthDue.amount,
      dateCleared:    monthDue.dateCleared,
      reference:      monthDue.reference,
      method:         monthDue.method,
    });
    setIsReceiptOpen(true);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const trimmedName    = profileName.trim();
    const trimmedContact = profileContact.trim();
    if (!trimmedName || !trimmedContact) {
      setProfileError('Name and contact number are required.');
      setProfileSuccess('');
      return;
    }
    if (trimmedContact.length < 10) {
      setProfileError('Please enter a valid contact number.');
      setProfileSuccess('');
      return;
    }
    const result = updateProfile(trimmedName, trimmedContact);
    if (result.success) {
      setProfileSuccess('Profile updated successfully!');
      setProfileError('');
      setTimeout(() => setProfileSuccess(''), 3000);
    } else {
      setProfileError(result.message);
      setProfileSuccess('');
    }
  };

  // ── Dashboard Tab ────────────────────────────────────────────────────────
  const renderDashboardView = () => (
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

      {/* Current month dues status */}
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
            onClick={() => openReceipt(currentDue)}
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
              {/* Mini progress */}
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
              <p className="text-md text-red-600 font-medium mt-0.5 leading-relaxed">
                Amount due: <span className="font-bold text-[20px]">₹{(currentDue?.amount ?? maintenanceAmount).toLocaleString('en-IN')}</span>.<br />
                Please clear with the treasurer via Cheque, Cash, or Bank Transfer.
              </p>
            </div>
          </div>
          <div className="px-4 py-2 bg-white border border-red-300 text-error font-extrabold text-md rounded-lg shadow-sm text-center whitespace-nowrap">
            Due: ₹{(currentDue?.amount ?? maintenanceAmount).toLocaleString('en-IN')}
          </div>
        </div>
      )}

      {/* KPIs — scoped to selectedYear */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: 'Months Paid', value: totalPaid, sub: `of 12 in ${selectedYear}`, icon: 'verified', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Months Pending', value: totalUnpaid + totalPartial, sub: 'require attention', icon: 'hourglass_empty', color: 'text-error', bg: 'bg-red-50' },
          { label: 'Amount Paid', value: `₹${(yearlyAmountPaid / 1000).toFixed(1)}k`, sub: `year ${selectedYear} to date`, icon: 'payments', color: 'text-primary', bg: 'bg-blue-50' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-soft">
            <div className={`w-8 h-8 rounded-lg ${kpi.bg} flex items-center justify-center mb-2`}>
              <span className={`material-symbols-outlined text-[18px] ${kpi.color}`}>{kpi.icon}</span>
            </div>
            <p className="font-extrabold text-xl text-on-surface">{kpi.value}</p>
            <p className="text-[14px] font-bold text-on-surface-variant uppercase tracking-wider mt-0.5">{kpi.label}</p>
            <p className="text-[13px] text-on-surface-variant mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Yearly progress bar — scoped to selectedYear */}
      <div className="flex flex-col bg-white border border-slate-200 gap-3 rounded-xl shadow-soft p-5 ">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-title-lg font-bold text-on-surface">{selectedYear} Payment Timeline</h3>
          <span className="text-sm font-bold text-primary bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
            {totalPaid}/12 Paid
          </span>
        </div>
        <div className="h-5 bg-slate-100 rounded-full overflow-hidden flex p-0.5 gap-0.5 border border-slate-200">
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

      {/* Grid: mini ledger + bulletin */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Mini ledger — scoped to selectedYear */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-soft p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-title-lg font-bold text-on-surface">Recent Dues</h3>
            <span className="text-[15px] text-on-surface-variant font-semibold">Jan – Jul {selectedYear}</span>
          </div>
          <div className="space-y-2">
            {yearDues.slice(0, 7).map((due, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between px-3 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-100 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                     due.status === 'Partial' ? 'bg-amber-400'
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
                      onClick={() => openReceipt(due)}
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
            ) : (
              notices.map((notice) => {
                return (
                  <div
                    key={notice.id}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200 transition-all space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-bold uppercase text-on-surface-variant">{notice.date}</span>
                    </div>
                    <h4 className="font-bold text-md text-on-surface leading-snug">{notice.title}</h4>
                    <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-2">{notice.content}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // ── Ledger Tab — scoped to selectedYear ──────────────────────────────────
  const renderLedgerView = () => (
    <div className="bg-white border border-slate-200 rounded-xl shadow-soft p-5 sm:p-6 space-y-5 animate-fadeIn">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-headline-md text-on-surface font-extrabold">Transaction Ledger</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Maintenance record for FY {selectedYear} — Unit {tenementData.tenementNumber}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">YTD Paid ({selectedYear})</p>
          <p className="text-lg font-extrabold text-primary">₹{yearlyAmountPaid.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="space-y-2">
        {yearDues.map((due, idx) => {
          const isExpanded = expandedIdx === idx;
          const isPaid     = due.status === 'Paid';
          const isPartial  = due.status === 'Partial';
          const isUnpaid   = due.status === 'Unpaid';
          const isUnbilled = due.status === 'Unbilled';
          const isCurrent  = due.month === selectedMonth;
          const installments = due.installments || [];

          return (
            <div
              key={idx}
              className={`border-l-4 border rounded-xl overflow-hidden transition-all duration-200 ${
                isPaid    ? 'border-l-emerald-500 border-slate-200 bg-white'
                : isPartial ? 'border-l-amber-400 border-slate-200 bg-white'
                : isUnpaid ? 'border-l-error border-slate-200 bg-white'
                :            'border-l-slate-200 border-slate-200 bg-slate-50/50'
              } ${isCurrent ? 'ring-1 ring-primary/20' : ''}`}
            >
              <div
                role={!isUnbilled ? 'button' : undefined}
                tabIndex={!isUnbilled ? 0 : undefined}
                onClick={() => !isUnbilled && setExpandedIdx(isExpanded ? null : idx)}
                onKeyDown={(e) => !isUnbilled && e.key === 'Enter' && setExpandedIdx(isExpanded ? null : idx)}
                className={`px-4 py-3.5 flex items-center justify-between ${
                  isUnbilled ? 'cursor-default opacity-60' : 'cursor-pointer select-none hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined text-xl ${
                    isPaid    ? 'text-emerald-500'
                    : isPartial ? 'text-amber-500'
                    : isUnpaid ? 'text-error'
                    :            'text-slate-300'
                  }`}>
                    {isPaid ? 'verified' : isPartial ? 'pending' : isUnpaid ? 'cancel' : 'schedule'}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-on-surface">{due.month} {selectedYear}</h4>
                      {isCurrent && (
                        <span className="text-[9px] font-bold text-primary bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-full uppercase">Current</span>
                      )}
                    </div>
                    <p className="text-[11px] text-on-surface-variant font-semibold">
                      {isPaid
                        ? `₹${(due.amountPaid || due.amount).toLocaleString('en-IN')} · ${due.method}`
                        : isPartial
                        ? `₹${(due.amountPaid || 0).toLocaleString('en-IN')} paid of ₹${maintenanceAmount.toLocaleString('en-IN')}`
                        : `₹${(due.amount || maintenanceAmount).toLocaleString('en-IN')}`
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    isPaid    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : isPartial ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : isUnpaid ? 'bg-red-50 text-error border border-red-200'
                    :            'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    {due.status}
                  </span>
                  {!isUnbilled && (
                    <span className={`material-symbols-outlined text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                      expand_more
                    </span>
                  )}
                </div>
              </div>

              {isExpanded && !isUnbilled && (
                <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50/50 animate-fadeIn">
                  {(isPaid || isPartial) ? (
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                      <div className="space-y-3 w-full">
                        {/* Installments history */}
                        {installments.length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                              Payment History ({installments.length} installment{installments.length !== 1 ? 's' : ''})
                            </p>
                            <div className="space-y-1.5">
                              {installments.map((inst, i) => (
                                <div key={i} className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs">
                                  <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-emerald-500 text-sm">verified</span>
                                    <span className="font-semibold text-on-surface">{formatDate(inst.date)}</span>
                                    <span className="text-on-surface-variant">· {inst.method}</span>
                                    {inst.reference && <span className="font-mono text-primary text-[10px]">{inst.reference}</span>}
                                  </div>
                                  <span className="font-bold text-emerald-700">+₹{inst.amount.toLocaleString('en-IN')}</span>
                                </div>
                              ))}
                            </div>
                            {isPartial && (
                              <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex justify-between text-xs font-bold">
                                <span className="text-amber-700">Remaining balance</span>
                                <span className="text-error">₹{(maintenanceAmount - (due.amountPaid || 0)).toLocaleString('en-IN')}</span>
                              </div>
                            )}
                          </div>
                        )}
                        {isPaid && (
                          <button
                            onClick={(e) => { e.stopPropagation(); openReceipt(due); }}
                            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg shadow-soft hover:bg-primary-container transition-all active-scale whitespace-nowrap"
                          >
                            Download Receipt
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 text-xs">
                      <p className="text-on-surface-variant leading-relaxed">
                        <span className="font-bold text-error">Overdue:</span> Please submit{' '}
                        <span className="font-bold text-on-surface">₹{(due.amount || maintenanceAmount).toLocaleString('en-IN')}</span> to the
                        society treasurer's desk. Accepted modes: Cheque, Cash, or Bank Transfer (NEFT/UPI on request).
                      </p>
                      <div className="bg-red-50 border border-red-200 text-error p-2.5 rounded-lg font-semibold">
                        ⚠️ No online payment gateway is integrated. Payments are offline-verified by the committee.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── Notices Tab ──────────────────────────────────────────────────────────
  const renderBulletinsView = () => (
    <div className="bg-white border border-slate-200 rounded-xl shadow-soft p-5 sm:p-6 space-y-5 animate-fadeIn">
      <div>
        <h2 className="font-headline-md text-on-surface font-extrabold">Society Bulletin Board</h2>
        <p className="text-xs text-on-surface-variant mt-0.5">
          Important announcements from the Management Committee
        </p>
      </div>

      {notices.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-3">
          <span className="material-symbols-outlined text-5xl text-slate-300">notifications_none</span>
          <p className="text-sm font-semibold text-on-surface-variant">No notices published yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => {
            return (
              <div
                key={notice.id}
                className="p-5 bg-slate-50 border rounded-xl border-slate-200 space-y-3 hover:bg-white transition-all"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-on-surface-variant">{notice.date}</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-md text-on-surface">{notice.title}</h3>
                  <p className="text-md text-on-surface-variant leading-relaxed font-medium mt-1 whitespace-pre-wrap">{notice.content}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // ── Profile Tab ──────────────────────────────────────────────────────────
  const renderProfileView = () => (
    <div className="max-w-lg mx-auto space-y-5 animate-fadeIn">
      {/* Profile card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-soft p-5 sm:p-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center font-extrabold text-2xl flex-shrink-0 shadow-soft">
          {tenementData.tenementNumber}
        </div>
        <div>
          <h2 className="font-bold text-lg text-on-surface">{tenementData.ownerName}</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">Unit {tenementData.tenementNumber} · Parthbhoomi CHS</p>
          <p className="text-xs text-on-surface-variant">{tenementData.contact}</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-soft p-5 sm:p-6 space-y-5">
        <div>
          <h3 className="font-headline-md text-on-surface font-extrabold">Edit Profile</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">Update your resident name and contact details</p>
        </div>

        {profileSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold p-3.5 rounded-lg flex items-center gap-2 animate-fadeIn">
            <span className="material-symbols-outlined text-sm">verified</span>
            {profileSuccess}
          </div>
        )}
        {profileError && (
          <div className="bg-red-50 border border-red-200 text-error text-xs font-semibold p-3.5 rounded-lg flex items-start gap-2 animate-fadeIn">
            <span className="material-symbols-outlined text-sm mt-0.5">error</span>
            {profileError}
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Tenement Number <span className="text-slate-300">(read-only)</span>
            </label>
            <input
              type="text"
              readOnly
              value={tenementData?.tenementNumber || ''}
              className="w-full px-3.5 py-2.5 border border-slate-200 bg-slate-50 text-on-surface-variant rounded-lg text-xs font-bold cursor-not-allowed outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Resident Full Name
            </label>
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 bg-white text-on-surface rounded-lg text-xs font-semibold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
              placeholder="e.g. Nilesh Kadam"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Contact Number
            </label>
            <input
              type="tel"
              value={profileContact}
              onChange={(e) => setProfileContact(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 bg-white text-on-surface rounded-lg text-xs font-semibold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
              placeholder="+91 99887 76655"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-primary text-white text-xs font-bold rounded-lg shadow-soft hover:bg-primary-container flex items-center justify-center gap-1.5 transition-all active-scale"
          >
            <span className="material-symbols-outlined text-sm">save</span>
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );

  const renderExpensesView = () => {
    const periodExpenses = expenses.filter(e => e.date.startsWith(selectedYear.toString()));
    const totalSpent = periodExpenses.reduce((s, e) => s + e.amount, 0);

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg border border-[#E2E8F0] shadow-soft">
          <h2 className="font-display-lg text-on-surface font-extrabold">Society Expenses Tracker</h2>
          <p className="text-xs text-on-surface-variant font-medium mt-0.5">Overview of expenditures for {selectedYear}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border border-[#E2E8F0] shadow-soft flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Total Expenditures ({selectedYear})</span>
              <span className="material-symbols-outlined text-primary bg-surface-container p-2 rounded-full">account_balance_wallet</span>
            </div>
            <div>
              <h3 className="text-3xl font-extrabold text-[#191b23]">₹{totalSpent.toLocaleString('en-IN')}</h3>
              <p className="text-xs text-on-surface-variant font-semibold mt-1">
                Spent across {periodExpenses.length} verified transactions
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-[#E2E8F0] shadow-soft flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Recent Expense</span>
              <span className="material-symbols-outlined text-[#4CAF50] bg-success-container p-2 rounded-full">receipt</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-on-surface truncate">{periodExpenses[0]?.description || 'No expenses recorded'}</h3>
              <p className="text-xs text-on-surface-variant font-semibold mt-1">
                {periodExpenses[0] ? `₹${periodExpenses[0].amount.toLocaleString('en-IN')} on ${periodExpenses[0].date}` : ''}
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-[#E2E8F0] shadow-soft flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Storage Sync</span>
              <span className="material-symbols-outlined text-amber-500 bg-amber-50 p-2 rounded-full">add_to_drive</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-on-surface">Google Drive Archived</h3>
              <p className="text-xs text-on-surface-variant font-semibold mt-1">
                All bills are secure in Google Drive
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-[#E2E8F0] shadow-soft space-y-4">
          <h3 className="font-title-lg font-bold text-on-surface">Expense Log</h3>

          {periodExpenses.length === 0 ? (
            <p className="text-xs text-on-surface-variant text-center py-6">No expenses recorded for this period.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-semibold">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-on-surface-variant uppercase tracking-wider">
                    <th className="pb-3 pr-2">Date</th>
                    <th className="pb-3 pr-2">Category</th>
                    <th className="pb-3 pr-2">Description</th>
                    <th className="pb-3 pr-2 text-right">Amount</th>
                    <th className="pb-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {periodExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 pr-2 font-medium">{exp.date}</td>
                      <td className="py-3.5 pr-2">
                        <span className="bg-slate-100 text-on-surface px-2 py-0.5 rounded-full border border-slate-200 uppercase text-[9px] font-bold">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-3.5 pr-2 font-bold text-on-surface">{exp.description}</td>
                      <td className="py-3.5 pr-2 text-right font-bold text-on-surface">₹{exp.amount.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 text-center">
                        <button
                          onClick={() => {
                            setSelectedExpense(exp);
                            setIsDriveOpen(true);
                          }}
                          className="px-3 py-1.5 border border-outline-variant bg-white hover:bg-surface-container-high rounded text-[10px] font-bold shadow-soft flex items-center justify-center space-x-1 mx-auto transition-all duration-200 active-scale"
                        >
                          <span className="material-symbols-outlined text-[14px] text-amber-500 font-bold">
                            add_to_drive
                          </span>
                          <span>View Bill</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {currentTab === 'dashboard' && renderDashboardView()}
      {currentTab === 'ledger'    && renderLedgerView()}
      {currentTab === 'notices'   && renderBulletinsView()}
      {currentTab === 'expenses'  && renderExpensesView()}
      {currentTab === 'profile'   && renderProfileView()}

      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        receiptData={selectedReceipt}
      />

      <DrivePreviewModal
        isOpen={isDriveOpen}
        onClose={() => setIsDriveOpen(false)}
        expense={selectedExpense}
      />
    </>
  );
}
