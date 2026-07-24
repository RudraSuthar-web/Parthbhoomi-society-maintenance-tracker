import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';

import DashboardTab from '../components/resident/DashboardTab';
import LedgerTab    from '../components/resident/LedgerTab';
import BulletinsTab from '../components/resident/BulletinsTab';
import ProfileTab   from '../components/resident/ProfileTab';
import ReceiptModal from '../components/ReceiptModal';
import DrivePreviewModal from '../components/DrivePreviewModel';
import ExpensesTab from '../components/resident/ExpensesTab';

import { ALL_MONTHS, getBilledMonths } from '../utils/dateUtils';

export default function ResidentDashboard({ currentTab, setCurrentTab }) {
  const {
    user, tenements, notices, updateProfile,
    selectedYear, selectedMonth,
    maintenanceAmount, expenses,
  } = useContext(AppContext);

  const tenementData = tenements.find(t => t.tenementNumber === user?.username);

  // ── Ledger accordion ────────────────────────────────────────────────────────
  const [expandedIdx, setExpandedIdx] = useState(null);

  // ── Receipt ─────────────────────────────────────────────────────────────────
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen]     = useState(false);

  // Drive Bill Preview State
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isDriveOpen, setIsDriveOpen] = useState(false);

  // ── Profile ─────────────────────────────────────────────────────────────────
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

  // ── Computed stats ───────────────────────────────────────────────────────────
  const yearDues = tenementData.dues
    .filter(d => d.year === selectedYear)
    .sort((a, b) => ALL_MONTHS.indexOf(a.month) - ALL_MONTHS.indexOf(b.month));
  const currentDue       = yearDues.find(d => d.month === selectedMonth);
  const totalPaid        = yearDues.filter(d => d.status === 'Paid').length;
  const totalPartial     = yearDues.filter(d => d.status === 'Partial').length;
  const totalUnpaid      = yearDues.filter(d => d.status === 'Unpaid').length;
  const isCurrentPaid    = currentDue?.status === 'Paid';
  const isCurrentPartial = currentDue?.status === 'Partial';

  const yearlyAmountPaid = yearDues.reduce((acc, d) => {
    if (d.status === 'Paid' || d.status === 'Partial') return acc + (d.amountPaid || d.amount || 0);
    return acc;
  }, 0);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const openReceipt = monthDue => {
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

  const handleSaveProfile = e => {
    e.preventDefault();
    const trimmedName    = profileName.trim();
    const trimmedContact = profileContact.trim();
    if (!trimmedName || !trimmedContact) {
      setProfileError('Name and contact number are required.'); setProfileSuccess(''); return;
    }
    if (trimmedContact.length < 10) {
      setProfileError('Please enter a valid contact number.'); setProfileSuccess(''); return;
    }
    const result = updateProfile(trimmedName, trimmedContact);
    if (result.success) {
      setProfileSuccess('Profile updated successfully!'); setProfileError('');
      setTimeout(() => setProfileSuccess(''), 3000);
    } else {
      setProfileError(result.message); setProfileSuccess('');
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      {currentTab === 'dashboard' && (
        <DashboardTab
          tenementData={tenementData}
          selectedMonth={selectedMonth} selectedYear={selectedYear}
          currentDue={currentDue} yearDues={yearDues}
          totalPaid={totalPaid} totalUnpaid={totalUnpaid} totalPartial={totalPartial}
          isCurrentPaid={isCurrentPaid} isCurrentPartial={isCurrentPartial}
          yearlyAmountPaid={yearlyAmountPaid} maintenanceAmount={maintenanceAmount}
          notices={notices}
          onOpenReceipt={openReceipt}
          onSwitchToLedger={setCurrentTab}
        />
      )}

      {currentTab === 'ledger' && (
        <LedgerTab
          tenementData={tenementData}
          selectedYear={selectedYear} selectedMonth={selectedMonth}
          yearDues={yearDues} yearlyAmountPaid={yearlyAmountPaid}
          maintenanceAmount={maintenanceAmount}
          expandedIdx={expandedIdx} setExpandedIdx={setExpandedIdx}
          onOpenReceipt={openReceipt}
        />
      )}

      {currentTab === 'notices' && <BulletinsTab notices={notices} />}

      {currentTab === 'expenses' && (
        <ExpensesTab
          expenses={expenses}
          selectedYear={selectedYear}
          onViewBill={(exp) => {
            setSelectedExpense(exp);
            setIsDriveOpen(true);
          }}
        />
      )}

      {currentTab === 'profile' && (
        <ProfileTab
          tenementData={tenementData}
          profileName={profileName} setProfileName={setProfileName}
          profileContact={profileContact} setProfileContact={setProfileContact}
          profileSuccess={profileSuccess} profileError={profileError}
          onSave={handleSaveProfile}
        />
      )}

      <DrivePreviewModal
        isOpen={isDriveOpen}
        onClose={() => setIsDriveOpen(false)}
        expense={selectedExpense}
      />

      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        receiptData={selectedReceipt}
      />
    </>
  );
}
