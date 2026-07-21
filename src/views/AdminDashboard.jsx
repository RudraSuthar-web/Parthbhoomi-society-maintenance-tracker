import React, { useContext, useState, useCallback } from 'react';
import { AppContext } from '../context/AppContext';
import ReceiptModal from '../components/ReceiptModal';
import TenementModal from '../components/TenementModal';
import MonthlyGridView from './MonthlyGridView';
import { DUES_AMOUNT } from '../utils/dateUtils';

export default function AdminDashboard({ currentTab }) {
  const {
    tenements, notices, addInstallment, revertPayment, togglePaymentStatus,
    addNotice, deleteNotice, registerTenement,
    selectedYear, selectedMonth,
    maintenanceAmount, setMaintenanceAmount,
  } = useContext(AppContext);

  // ── Modal state ────────────────────────────────────────────────────────────
  const [activeTenementNum, setActiveTenementNum] = useState(null);
  const activeTenement = tenements.find(t => t.tenementNumber === activeTenementNum) ?? null;
  const openTenement = useCallback((num) => setActiveTenementNum(num), []);
  const closeTenement = useCallback(() => setActiveTenementNum(null), []);

  // Notice Broadcaster
  const [isPublishNoticeOpen, setIsPublishNoticeOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeSuccessMsg, setNoticeSuccessMsg] = useState('');

  // Admin Register Tenement
  const [isAddingTenement, setIsAddingTenement] = useState(false);
  const [newTenementNumber, setNewTenementNumber] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [adminRegError, setAdminRegError] = useState('');
  const [adminRegSuccess, setAdminRegSuccess] = useState('');

  // Installment payment modal state
  const [paymentToggleState, setPaymentToggleState] = useState(null); // { tenementNumber, month, year, currentInstallments, amountPaid }
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentReference, setPaymentReference] = useState('');

  // Receipt modal
  const [receiptData, setReceiptData] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Settings
  const [settingsAmount, setSettingsAmount] = useState(String(maintenanceAmount));
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsError, setSettingsError] = useState('');

  // Tenement search
  const [searchQuery, setSearchQuery] = useState('');

  // ── Computed stats ──────────────────────────────────────────────────────────
  const totalTenementsCount = tenements.length;

  const currentMonthPaid = tenements.filter(t =>
    t.dues.find(d => d.month === selectedMonth && d.year === selectedYear)?.status === 'Paid'
  );
  const currentMonthUnpaid = tenements.filter(t => {
    const s = t.dues.find(d => d.month === selectedMonth && d.year === selectedYear)?.status;
    return s === 'Unpaid' || s === 'Partial';
  });

  const totalCollectedThisMonth = currentMonthPaid.reduce((acc, t) =>
    acc + (t.dues.find(d => d.month === selectedMonth && d.year === selectedYear)?.amountPaid || maintenanceAmount), 0);
  // Also add partial amounts
  const totalPartialThisMonth = tenements.reduce((acc, t) => {
    const due = t.dues.find(d => d.month === selectedMonth && d.year === selectedYear);
    if (due?.status === 'Partial') return acc + (due.amountPaid || 0);
    return acc;
  }, 0);
  const totalCollectedDisplay = totalCollectedThisMonth + totalPartialThisMonth;

  const totalPendingThisMonth = currentMonthUnpaid.reduce((acc, t) => {
    const due = t.dues.find(d => d.month === selectedMonth && d.year === selectedYear);
    const remaining = maintenanceAmount - (due?.amountPaid || 0);
    return acc + remaining;
  }, 0);

  const collectionRate = totalTenementsCount > 0
    ? ((currentMonthPaid.length / totalTenementsCount) * 100).toFixed(0)
    : '0';

  const defaulterTenements = currentMonthUnpaid;

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSaveSettings = (e) => {
    e.preventDefault();
    const val = Number(settingsAmount);
    if (!val || val < 1) {
      setSettingsError('Please enter a valid amount greater than 0.');
      return;
    }
    setMaintenanceAmount(val);
    setSettingsSuccess(`Maintenance amount updated to ₹${val.toLocaleString('en-IN')}!`);
    setSettingsError('');
    setTimeout(() => setSettingsSuccess(''), 3000);
  };

  const handleBroadcastNotice = (e) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeContent.trim()) return;
    addNotice(noticeTitle, noticeContent);
    setNoticeTitle('');
    setNoticeContent('');
    setNoticeSuccessMsg('Notice broadcasted successfully!');
    setTimeout(() => {
      setNoticeSuccessMsg('');
      setIsPublishNoticeOpen(false);
    }, 2000);
  };

  const handleAdminRegisterTenement = (e) => {
    e.preventDefault();
    if (!newTenementNumber.trim() || !newContact.trim() || !newPassword) {
      setAdminRegError('All fields are required.');
      return;
    }
    const trimmed = newTenementNumber.trim();
    if (!/^\d+$/.test(trimmed)) {
      setAdminRegError('Tenement number must contain digits only.');
      return;
    }
    const num = parseInt(trimmed, 10);
    if (num < 1 || num > 60) {
      setAdminRegError('Tenement number must be between 1 and 60.');
      return;
    }
    const result = registerTenement(newTenementNumber, newContact, newPassword);
    if (result.success) {
      setAdminRegSuccess(`Tenement ${trimmed} registered successfully!`);
      setAdminRegError('');
      setNewTenementNumber('');
      setNewContact('');
      setNewPassword('');
      setTimeout(() => { setIsAddingTenement(false); setAdminRegSuccess(''); }, 2000);
    } else {
      setAdminRegError(result.message);
      setAdminRegSuccess('');
    }
  };

  const openReceipt = useCallback((tenement, monthDue) => {
    setReceiptData({
      tenementNumber: tenement.tenementNumber,
      ownerName: tenement.ownerName,
      month: monthDue.month,
      year: monthDue.year || selectedYear,
      amount: monthDue.amountPaid || monthDue.amount,
      dateCleared: monthDue.dateCleared,
      reference: monthDue.reference,
      method: monthDue.method,
    });
    setIsReceiptOpen(true);
  }, [selectedYear]);

  // Called from TenementModal cells
  const handleTogglePayment = useCallback((tenementNumber, month, currentStatus, year) => {
    const resolvedYear = year || selectedYear;
    if (currentStatus === 'Paid' || currentStatus === 'Partial') {
      if (window.confirm(`Revert ${month} for Unit ${tenementNumber} to Unpaid? This will clear all installments.`)) {
        revertPayment(tenementNumber, month, resolvedYear);
      }
    } else if (currentStatus === 'Unpaid') {
      const tenement = tenements.find(t => t.tenementNumber === tenementNumber);
      const due = tenement?.dues.find(d => d.month === month && d.year === resolvedYear);
      const currentInstallments = due?.installments || [];
      const amountPaid = due?.amountPaid || 0;
      setPaymentAmount(String(maintenanceAmount - amountPaid));
      setPaymentReference('');
      setPaymentToggleState({ tenementNumber, month, year: resolvedYear, currentInstallments, amountPaid });
    }
  }, [revertPayment, tenements, selectedYear, maintenanceAmount]);

  const confirmPaymentToggle = (method) => {
    if (!paymentToggleState) return;
    const amount = Number(paymentAmount);
    if (!amount || amount <= 0) return;
    const today = new Date();
    const randomRef = 'TXN' + Math.floor(10000 + Math.random() * 90000);
    addInstallment(
      paymentToggleState.tenementNumber,
      paymentToggleState.month,
      {
        amount,
        date: today.toISOString().split('T')[0],
        reference: paymentReference || randomRef,
        method,
      },
      paymentToggleState.year
    );
    setPaymentToggleState(null);
    setPaymentAmount('');
    setPaymentReference('');
  };

  const filteredTenements = tenements
    .filter(t =>
      t.tenementNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.ownerName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => parseInt(a.tenementNumber) - parseInt(b.tenementNumber));

  // ── Overview Tab ────────────────────────────────────────────────────────────
  const renderOverview = () => (
    <div className="space-y-6 animate-fadeIn">

      {/* Page header */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-soft p-5 sm:p-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display-lg text-on-surface">Society Overview</h2>
          <p className="text-xs text-on-surface-variant mt-1">
            Maintenance fund summary for{' '}
            <span className="font-bold text-on-surface">{selectedMonth} {selectedYear}</span>
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg flex-shrink-0">
          <span className="material-symbols-outlined text-primary text-sm">calendar_today</span>
          <span className="text-xs font-bold text-primary">{selectedMonth} {selectedYear}</span>
        </div>
      </div>

      {/* Settings — Maintenance Amount */}
      <div className="bg-white border border-amber-200 rounded-xl shadow-soft p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-amber-600 text-[18px]">tune</span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-on-surface">Global Maintenance Amount</h3>
              <p className="text-xs text-on-surface-variant">Currently: <span className="font-bold text-amber-700">₹{maintenanceAmount.toLocaleString('en-IN')}</span> / month</p>
            </div>
          </div>
          <form onSubmit={handleSaveSettings} className="flex items-center gap-2">
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-on-surface-variant">₹</span>
              <input
                type="number"
                value={settingsAmount}
                onChange={(e) => setSettingsAmount(e.target.value)}
                className="pl-6 pr-3 py-2 border border-slate-200 bg-white text-on-surface rounded-lg text-xs font-semibold focus:outline-none focus:border-amber-400 transition-all w-28"
                min="1"
                placeholder="1200"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 text-white text-xs font-bold rounded-lg hover:bg-amber-600 transition-all active-scale"
            >
              Update
            </button>
          </form>
        </div>
        {settingsSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold p-2.5 rounded-lg flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">verified</span>
            {settingsSuccess}
          </div>
        )}
        {settingsError && (
          <div className="bg-red-50 border border-red-200 text-error text-xs font-semibold p-2.5 rounded-lg flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">error</span>
            {settingsError}
          </div>
        )}
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Collected */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-soft p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold text-on-surface-variant uppercase tracking-wider">
              {selectedMonth} Collection
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-emerald-600 text-[18px]">payments</span>
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-on-surface tracking-tight">
              ₹{totalCollectedDisplay.toLocaleString('en-IN')}
            </h3>
            <div className="mt-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-on-surface-variant font-semibold">
                  {currentMonthPaid.length}/{totalTenementsCount} fully paid
                </span>
                <span className="text-xs font-bold text-emerald-600">{collectionRate}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                  style={{ width: `${collectionRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Outstanding */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-soft p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold text-on-surface-variant uppercase tracking-wider">
              Outstanding Dues
            </span>
            <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-error text-[18px]">hourglass_empty</span>
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-error tracking-tight">
              ₹{totalPendingThisMonth.toLocaleString('en-IN')}
            </h3>
            <p className="text-sm text-on-surface-variant font-semibold mt-2">
              <span className="font-bold text-on-surface">{currentMonthUnpaid.length}</span>{' '}
              tenement{currentMonthUnpaid.length !== 1 ? 's' : ''} yet to fully pay for {selectedMonth}
            </p>
          </div>
        </div>
      </div>

      {/* ── Defaulters Grid ── */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-soft ">
        {defaulterTenements.length === 0 ?
          (<div className="flex items-center bg-emerald-500 rounded-xl p-3 justify-between">
            <div className="flex gap-2 items-center">
              <span className="material-symbols-outlined text-white">verified</span>
              <h3 className="font-title-lg font-bold text-white">
                All {totalTenementsCount} tenements have paid</h3></div>
            <h3 className="font-title-lg font-bold text-white"> {selectedMonth} - {selectedYear} </h3>

          </div>) : (<div className="flex items-center bg-error rounded-t-xl p-3 justify-between">

            <h3 className="font-title-lg font-bold text-white"><span className="font-bold text-on-surface text-white text-[20px]">{defaulterTenements.length}</span> Unpaid / Partial</h3>
            <h3 className="font-title-lg font-bold text-white"> {selectedMonth} - {selectedYear} </h3>

          </div>)}

        {defaulterTenements.length != 0 && (
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-3 p-6">
            {defaulterTenements.map((t) => {
              const due = t.dues.find(d => d.month === selectedMonth && d.year === selectedYear);
              const isPartial = due?.status === 'Partial';
              return (
                <button
                  key={t.tenementNumber}
                  onClick={() => openTenement(t.tenementNumber)}
                  className={`
                    group relative aspect-square flex flex-col items-center justify-center
                    border-2 rounded-2xl
                    active:scale-95 transition-all duration-150 cursor-pointer
                    focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${isPartial
                      ? 'bg-amber-50 border-amber-300 hover:bg-amber-100 hover:border-amber-500 focus:ring-amber-400'
                      : 'bg-red-50 border-red-200 hover:bg-red-100 hover:border-error hover:shadow-lg hover:shadow-red-100 focus:ring-error'
                    }
                  `}
                  aria-label={`Unit ${t.tenementNumber} — ${t.ownerName} — ${due?.status}`}
                  title={`${t.ownerName} · ${due?.status} · Tap to view`}
                >
                  <span className={`text-2xl sm:text-3xl font-extrabold leading-none ${isPartial ? 'text-amber-700' : 'text-error'}`}>
                    {t.tenementNumber}
                  </span>
                  {isPartial && (
                    <span className="text-[8px] font-bold text-amber-600 uppercase">Partial</span>
                  )}
                  <span className="
                    absolute bottom-0 left-0 right-0 bg-black/50 text-white
                    text-[15px] font-bold text-center py-1 rounded-b-xl
                    opacity-0 group-hover:opacity-100 transition-opacity duration-150
                    truncate px-1
                  ">
                    {t.ownerName.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Bulletin preview */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-soft p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-title-lg font-bold text-on-surface">Active Bulletin Board</h3>
          <span className="text-[12px] font-bold text-on-surface-variant bg-slate-50 border border-slate-200 rounded-full px-2.5 py-0.5">
            {notices.length} notice{notices.length !== 1 ? 's' : ''}
          </span>
        </div>
        {notices.length === 0 ? (
          <p className="text-sm text-on-surface-variant text-center py-6">No active notices published.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {notices.slice(0, 3).map((notice) => {
              return (
                <div key={notice.id} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] font-bold uppercase text-on-surface-variant">{notice.date}</span>
                  </div>
                  <h4 className="font-bold text-[15px] text-on-surface leading-tight truncate">{notice.title}</h4>
                  <p className="text-[13px] text-on-surface-variant line-clamp-2 leading-relaxed">{notice.content}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  // ── Tenements Tab ───────────────────────────────────────────────────────────
  const renderTenements = () => (
    <div className="bg-white border border-slate-200 rounded-xl shadow-soft p-5 sm:p-6 space-y-5 animate-fadeIn">

      {/* Header + controls */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="font-headline-md text-on-surface font-extrabold">Tenement Directory</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Tap any unit to view full ledger & manage payments · {selectedMonth} {selectedYear}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">search</span>
            <input
              type="text"
              placeholder="Search unit or owner…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
          <button
            onClick={() => { setIsAddingTenement(!isAddingTenement); setAdminRegError(''); setAdminRegSuccess(''); }}
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
          onSubmit={handleAdminRegisterTenement}
          className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 animate-fadeIn"
        >
          <h3 className="font-semibold text-sm text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">add_home</span>
            Register New Tenement Unit
          </h3>
          {adminRegError && (
            <div className="bg-red-50 border border-red-200 text-error text-xs font-semibold p-3 rounded-lg flex items-start gap-2">
              <span className="material-symbols-outlined text-sm mt-0.5">error</span>
              {adminRegError}
            </div>
          )}
          {adminRegSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold p-3 rounded-lg flex items-start gap-2">
              <span className="material-symbols-outlined text-sm mt-0.5">verified</span>
              {adminRegSuccess}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: 'Tenement Number', placeholder: 'e.g. 42 (1–60)', value: newTenementNumber, setter: setNewTenementNumber, type: 'text' },
              { label: 'Contact Number', placeholder: '+91 99887 76655', value: newContact, setter: setNewContact, type: 'text' },
              { label: 'Unit Password', placeholder: 'Min. 6 characters', value: newPassword, setter: setNewPassword, type: 'password' },
            ].map(({ label, placeholder, value, setter, type }) => (
              <div key={label}>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">{label}</label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 bg-white text-on-surface rounded-lg text-xs font-semibold focus:outline-none focus:border-primary transition-all"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsAddingTenement(false)} className="px-4 py-1.5 border border-slate-200 bg-white text-on-surface text-xs font-bold rounded-lg hover:bg-slate-50 transition-all active-scale">Cancel</button>
            <button type="submit" className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-lg shadow-soft hover:bg-primary-container transition-all active-scale">Create Tenement</button>
          </div>
        </form>
      )}

      {/* Result count */}
      {searchQuery && (
        <p className="text-xs text-on-surface-variant">
          Showing <span className="font-bold text-on-surface">{filteredTenements.length}</span> of {tenements.length} tenements
        </p>
      )}

      {/* Tenement grid */}
      {filteredTenements.length === 0 ? (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-4xl text-slate-300">search_off</span>
          <p className="text-sm text-on-surface-variant mt-2">No tenements match your search.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTenements.map((tenement) => {
            const currentDue = tenement.dues.find(d => d.month === selectedMonth && d.year === selectedYear);
            const paidCount = tenement.dues.filter(d => d.status === 'Paid' && d.year === selectedYear).length;
            const unpaidCount = tenement.dues.filter(d => (d.status === 'Unpaid' || d.status === 'Partial') && d.year === selectedYear).length;
            const isPaid = currentDue?.status === 'Paid';
            const isUnpaid = currentDue?.status === 'Unpaid';
            const isPartial = currentDue?.status === 'Partial';

            return (
              <button
                key={tenement.tenementNumber}
                onClick={() => openTenement(tenement.tenementNumber)}
                className={`
                  group w-full flex items-center justify-between p-4 rounded-xl border
                  transition-all duration-150 active:scale-[0.98]
                  hover:shadow-md hover:-translate-y-0.5
                  focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1
                  ${isUnpaid
                    ? 'bg-red-50 border-red-200 hover:border-red-300'
                    : isPartial
                    ? 'bg-amber-50 border-amber-200 hover:border-amber-300'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                  }
                `}
                aria-label={`Unit ${tenement.tenementNumber} — ${tenement.ownerName}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm flex-shrink-0 shadow-sm ${
                    isUnpaid ? 'bg-error text-white'
                    : isPartial ? 'bg-amber-500 text-white'
                    : 'bg-primary text-white'
                  }`}>
                    {tenement.tenementNumber}
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-bold text-on-surface">{tenement.ownerName}</h4>
                    <p className="text-[11px] text-on-surface-variant">{tenement.contact}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:gap-6">
                  {/* Current month badge */}
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block">{selectedMonth}</span>
                    <span className={`text-[11px] font-bold flex items-center justify-end gap-0.5 mt-0.5 ${isPaid ? 'text-emerald-600' : isPartial ? 'text-amber-600' : isUnpaid ? 'text-error' : 'text-slate-500'}`}>
                      <span className="material-symbols-outlined text-xs">
                        {isPaid ? 'verified' : isPartial ? 'pending' : isUnpaid ? 'cancel' : 'schedule'}
                      </span>
                      {currentDue?.status ?? 'N/A'}
                      {isPartial && currentDue && (
                        <span className="text-[9px] ml-1">(₹{(currentDue.amountPaid || 0).toLocaleString('en-IN')}/₹{maintenanceAmount.toLocaleString('en-IN')})</span>
                      )}
                    </span>
                  </div>

                  {/* Yearly progress */}
                  <div className="text-right hidden md:block">
                    <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block">Year {selectedYear}</span>
                    <span className={`text-xs font-bold ${paidCount === 12 ? 'text-emerald-600' : 'text-primary'}`}>{paidCount}/12 paid</span>
                    {unpaidCount > 0 && (
                      <span className="text-[10px] font-bold text-error block">{unpaidCount} overdue</span>
                    )}
                  </div>

                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors duration-150">
                    arrow_forward
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  // ── Notice Broadcaster Tab ──────────────────────────────────────────────────
  const renderNoticeBroadcaster = () => (
    <div className="bg-white border border-slate-200 rounded-xl shadow-soft p-5 sm:p-6 space-y-5 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="font-headline-md text-on-surface font-extrabold">Active Announcements</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">Manage live bulletins broadcasted to residents</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold bg-slate-50 border border-slate-200 text-on-surface-variant px-2.5 py-1 rounded-full">{notices.length} total</span>
          <button
            onClick={() => setIsPublishNoticeOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg shadow-soft hover:bg-primary-container transition-all active-scale"
          >
            <span className="material-symbols-outlined text-sm">campaign</span>
            Publish Notice
          </button>
        </div>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto thin-scrollbar pr-1">
        {notices.length === 0 ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-4xl text-slate-300">campaign</span>
            <p className="text-sm text-on-surface-variant mt-2 font-medium">No notices published yet.</p>
          </div>
        ) : notices.map((notice) => {
          return (
            <div
              key={notice.id}
              className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-start gap-4 hover:bg-white hover:border-slate-300 transition-all cursor-pointer group"
              onClick={() => setSelectedNotice(notice)}
            >
              <div className="flex gap-3 flex-1 min-w-0">
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] text-on-surface-variant font-bold">{notice.date}</span>
                  </div>
                  <h4 className="font-bold text-xs text-on-surface leading-tight group-hover:text-primary transition-colors">{notice.title}</h4>
                  <p className="text-[11px] sm:text-xs text-on-surface-variant leading-relaxed font-medium line-clamp-2">{notice.content}</p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Delete this notice?')) deleteNotice(notice.id);
                }}
                className="p-1.5 text-slate-400 hover:text-error hover:bg-red-50 rounded-lg transition-all active-scale flex-shrink-0"
                title="Delete Notice"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      {currentTab === 'overview' && renderOverview()}
      {currentTab === 'tenements' && renderTenements()}
      {currentTab === 'monthly-grid' && <MonthlyGridView />}
      {currentTab === 'notices' && renderNoticeBroadcaster()}

      {/* ── Tenement Detail Modal ── */}
      {activeTenement && (
        <TenementModal
          tenement={activeTenement}
          onClose={closeTenement}
          onTogglePayment={handleTogglePayment}
          onOpenReceipt={openReceipt}
        />
      )}

      {/* ── Installment Payment Modal ── */}
      {paymentToggleState && (() => {
        const remaining = maintenanceAmount - (paymentToggleState.amountPaid || 0);
        const existingInstallments = paymentToggleState.currentInstallments || [];
        return (
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setPaymentToggleState(null)}
          >
            <div
              className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 space-y-5 animate-scaleIn"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary text-xl">payments</span>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-on-surface">Add Payment Installment</h3>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                    Unit <span className="font-bold text-primary">{paymentToggleState.tenementNumber}</span> ·{' '}
                    <span className="font-bold text-on-surface">{paymentToggleState.month} {paymentToggleState.year}</span>
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-on-surface-variant">Amount required</span>
                  <span className="text-on-surface">₹{maintenanceAmount.toLocaleString('en-IN')}</span>
                </div>
                {existingInstallments.length > 0 && (
                  <>
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-on-surface-variant">Already paid ({existingInstallments.length} installment{existingInstallments.length !== 1 ? 's' : ''})</span>
                      <span className="text-emerald-600">₹{(paymentToggleState.amountPaid || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-on-surface-variant">Remaining balance</span>
                      <span className="text-error">₹{remaining.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${Math.min(100, ((paymentToggleState.amountPaid || 0) / maintenanceAmount) * 100)}%` }}
                      />
                    </div>
                    {/* Installment history */}
                    <div className="space-y-1 pt-1 border-t border-slate-200 mt-1">
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Previous installments</p>
                      {existingInstallments.map((inst, i) => (
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
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
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
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder="Optional"
                    className="w-full px-3 py-2 border border-slate-200 bg-white text-on-surface rounded-lg text-xs font-semibold focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Select payment mode</p>
                <div className="grid grid-cols-3 gap-2">
                  {['Cheque', 'Cash', 'Bank Transfer'].map(method => (
                    <button
                      key={method}
                      onClick={() => confirmPaymentToggle(method)}
                      disabled={!paymentAmount || Number(paymentAmount) <= 0}
                      className="py-3 border border-slate-200 bg-slate-50 hover:bg-primary hover:text-white hover:border-primary text-[11px] font-bold text-on-surface rounded-xl transition-all active-scale disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end">
                <button onClick={() => setPaymentToggleState(null)} className="px-4 py-2 text-xs font-semibold text-on-surface-variant hover:bg-slate-100 rounded-lg transition-all active-scale">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── View Notice Modal ── */}
      {selectedNotice && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedNotice(null)}
        >
          <div
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-scaleIn"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] text-on-surface-variant font-bold">{selectedNotice.date}</span>
                </div>
                <h2 className="font-headline-md text-on-surface font-extrabold pr-4">{selectedNotice.title}</h2>
              </div>
              <button onClick={() => setSelectedNotice(null)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all active-scale flex-shrink-0">
                <span className="material-symbols-outlined text-slate-500 text-sm">close</span>
              </button>
            </div>
            <div className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-100">
              {selectedNotice.content}
            </div>
          </div>
        </div>
      )}

      {/* ── Publish Notice Modal ── */}
      {isPublishNoticeOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsPublishNoticeOpen(false)}
        >
          <div
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-scaleIn"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-headline-md text-on-surface font-extrabold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">campaign</span>
                  Broadcast Notice
                </h2>
                <p className="text-xs text-on-surface-variant mt-0.5">Draft a society-wide notification</p>
              </div>
              <button onClick={() => setIsPublishNoticeOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all active-scale">
                <span className="material-symbols-outlined text-slate-500 text-sm">close</span>
              </button>
            </div>

            {noticeSuccessMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold p-3 rounded-lg flex items-center gap-2 animate-fadeIn">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                {noticeSuccessMsg}
              </div>
            )}

            <form onSubmit={handleBroadcastNotice} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Notice Title</label>
                <input type="text" placeholder="e.g. Water Supply Shutdown" value={noticeTitle} onChange={(e) => setNoticeTitle(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 bg-slate-50 text-on-surface rounded-lg text-xs font-semibold focus:outline-none focus:border-primary focus:bg-white transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Notice Details</label>
                <textarea rows={4} placeholder="Write the full announcement…" value={noticeContent} onChange={(e) => setNoticeContent(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 bg-slate-50 text-on-surface rounded-lg text-xs font-semibold focus:outline-none focus:border-primary focus:bg-white transition-all resize-none" />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 mt-2">
                <button type="button" onClick={() => setIsPublishNoticeOpen(false)} className="px-4 py-2 text-xs font-semibold text-on-surface-variant hover:bg-slate-100 rounded-lg transition-all active-scale">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg shadow-soft hover:bg-primary-container flex items-center justify-center gap-1.5 transition-all active-scale">
                  <span className="material-symbols-outlined text-sm">campaign</span>
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Receipt Modal ── */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        receiptData={receiptData}
      />
    </>
  );
}
