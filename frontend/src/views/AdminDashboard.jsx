import React, { useContext, useState, useCallback } from 'react';
import { AppContext } from '../context/AppContext';

import OverviewTab            from '../components/admin/OverviewTab';
import TenementsTab           from '../components/admin/TenementsTab';
import NoticeBroadcasterTab   from '../components/admin/NoticeBroadcasterTab';
import PaymentInstallmentModal from '../components/admin/PaymentInstallmentModal';
import PublishNoticeModal      from '../components/admin/PublishNoticeModal';
import TenementModal           from '../components/TenementModal';
import ReceiptModal            from '../components/ReceiptModal';
import MonthlyGridView         from './MonthlyGridView';
import DrivePreviewModal       from '../components/DrivePreviewModel';
import DeleteTenementModal     from '../components/admin/DeleteTenementModal';
import ExpensesTab             from '../components/admin/ExpensesTab';
import AddExpenseModal         from '../components/admin/AddExpenseModal';

export default function AdminDashboard({ currentTab }) {
  const {
    tenements, notices, addInstallment, revertPayment,
    addNotice, deleteNotice, registerTenement, deleteTenement,
    selectedYear, selectedMonth,
    maintenanceAmount, setMaintenanceAmount,
    expenses, addExpense, deleteExpense,

  } = useContext(AppContext);

  // ── Tenement modal ──────────────────────────────────────────────────────────
  const [activeTenementNum, setActiveTenementNum] = useState(null);
  const activeTenement = tenements.find(t => t.tenementNumber === activeTenementNum) ?? null;
  const openTenement  = useCallback(num => setActiveTenementNum(num), []);
  const closeTenement = useCallback(() => setActiveTenementNum(null), []);

  // ── Notice broadcaster ──────────────────────────────────────────────────────
  const [isPublishNoticeOpen, setIsPublishNoticeOpen] = useState(false);
  const [selectedNotice, setSelectedNotice]           = useState(null);
  const [noticeTitle, setNoticeTitle]                 = useState('');
  const [noticeContent, setNoticeContent]             = useState('');
  const [noticeSuccessMsg, setNoticeSuccessMsg]       = useState('');

  // ── Register / Delete tenement ───────────────────────────────────────────────
  const [isAddingTenement, setIsAddingTenement]   = useState(false);
  const [newTenementNumber, setNewTenementNumber] = useState('');
  const [newName, setNewName]                     = useState('');
  const [newContact, setNewContact]               = useState('');
  const [newPassword, setNewPassword]             = useState('');
  const [adminRegError, setAdminRegError]         = useState('');
  const [adminRegSuccess, setAdminRegSuccess]     = useState('');
  const [tenementToDelete, setTenementToDelete]   = useState(null);

  // Expenses Tab State & Form
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [expCategory, setExpCategory] = useState('Maintenance');
  const [expDescription, setExpDescription] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expDate, setExpDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [expBillData, setExpBillData] = useState(null);
  const [expFileName, setExpFileName] = useState('');
  const [uploadingToDrive, setUploadingToDrive] = useState(false);
  const [expSuccess, setExpSuccess] = useState('');
  const [expError, setExpError] = useState('');

  // Bill preview modal
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isDriveOpen, setIsDriveOpen] = useState(false);

    const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setExpFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setExpBillData(reader.result); // base64 string
      };
      reader.readAsDataURL(file);
    } else {
      setExpBillData(null);
      setExpFileName('');
    }
  };

  const handleSaveExpense = (e) => {
    e.preventDefault();
    if (!expDescription.trim() || !expAmount || !expDate) {
      setExpError('All fields (Description, Amount, Date) are required.');
      return;
    }

    setUploadingToDrive(true);
    setExpSuccess('');
    setExpError('');

    setTimeout(() => {
      const result = addExpense(expCategory, expDescription, expAmount, expDate, expBillData);
      setUploadingToDrive(false);
      if (result.success) {
        setExpSuccess('✓ Expense recorded and synced to Google Drive successfully!');
        setExpDescription('');
        setExpAmount('');
        setExpFileName('');
        setExpBillData(null);
        const fileInput = document.getElementById('expense-file-input');
        if (fileInput) fileInput.value = '';
        setTimeout(() => {
          setExpSuccess('');
          setIsAddExpenseOpen(false);
        }, 1500);
      } else {
        setExpError('Failed to record expense. Please try again.');
      }
    }, 850);
  };

  const handleConfirmDeleteTenement = () => {
    if (tenementToDelete) {
      deleteTenement(tenementToDelete.tenementNumber);
      if (activeTenementNum === tenementToDelete.tenementNumber) {
        setActiveTenementNum(null);
      }
      setTenementToDelete(null);
    }
  };

  // ── Payment installment ─────────────────────────────────────────────────────
  const [paymentToggleState, setPaymentToggleState] = useState(null);
  const [paymentAmount, setPaymentAmount]           = useState('');
  const [paymentReference, setPaymentReference]     = useState('');

  // ── Receipt ─────────────────────────────────────────────────────────────────
  const [receiptData, setReceiptData]   = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // ── Settings ────────────────────────────────────────────────────────────────
  const [settingsAmount, setSettingsAmount]   = useState(String(maintenanceAmount));
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsError, setSettingsError]     = useState('');

  // ── Search ──────────────────────────────────────────────────────────────────
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
  const totalPartialThisMonth = tenements.reduce((acc, t) => {
    const due = t.dues.find(d => d.month === selectedMonth && d.year === selectedYear);
    if (due?.status === 'Partial') return acc + (due.amountPaid || 0);
    return acc;
  }, 0);
  const totalCollectedDisplay = totalCollectedThisMonth + totalPartialThisMonth;

  const totalPendingThisMonth = currentMonthUnpaid.reduce((acc, t) => {
    const due = t.dues.find(d => d.month === selectedMonth && d.year === selectedYear);
    return acc + maintenanceAmount - (due?.amountPaid || 0);
  }, 0);

  const collectionRate = totalTenementsCount > 0
    ? ((currentMonthPaid.length / totalTenementsCount) * 100).toFixed(0)
    : '0';

  const statusRankMap = { Unpaid: 0, Partial: 1, Unbilled: 2, Paid: 3 };
  const getStatusRank = t => {
    const due = t.dues.find(d => d.month === selectedMonth && d.year === selectedYear);
    return statusRankMap[due?.status] ?? 4;
  };

  const filteredTenements = tenements
    .filter(t =>
      t.tenementNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.ownerName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const diff = getStatusRank(a) - getStatusRank(b);
      return diff !== 0 ? diff : parseInt(a.tenementNumber, 10) - parseInt(b.tenementNumber, 10);
    });

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleSaveSettings = e => {
    e.preventDefault();
    const val = Number(settingsAmount);
    if (!val || val < 1) { setSettingsError('Please enter a valid amount greater than 0.'); return; }
    setMaintenanceAmount(val);
    setSettingsSuccess(`Maintenance amount updated to ₹${val.toLocaleString('en-IN')}!`);
    setSettingsError('');
    setTimeout(() => setSettingsSuccess(''), 3000);
  };

  const handleBroadcastNotice = e => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeContent.trim()) return;
    addNotice(noticeTitle, noticeContent);
    setNoticeTitle(''); setNoticeContent('');
    setNoticeSuccessMsg('Notice broadcasted successfully!');
    setTimeout(() => { setNoticeSuccessMsg(''); setIsPublishNoticeOpen(false); }, 2000);
  };

  const handleAdminRegisterTenement = e => {
    e.preventDefault();
    if (!newTenementNumber.trim() || !newContact.trim() || !newPassword) {
      setAdminRegError('All fields are required.'); return;
    }
    const trimmed = newTenementNumber.trim();
    if (!/^\d+$/.test(trimmed)) { setAdminRegError('Tenement number must contain digits only.'); return; }
    const num = parseInt(trimmed, 10);
    if (num < 1 || num > 60) { setAdminRegError('Tenement number must be between 1 and 60.'); return; }
    const result = registerTenement(newTenementNumber, newName, newContact, newPassword);
    if (result.success) {
      setAdminRegSuccess(`Tenement ${trimmed} registered successfully!`);
      setAdminRegError('');
      setNewTenementNumber(''); setNewName(''); setNewContact(''); setNewPassword('');
      setTimeout(() => { setIsAddingTenement(false); setAdminRegSuccess(''); }, 2000);
    } else {
      setAdminRegError(result.message); setAdminRegSuccess('');
    }
  };

  const openReceipt = useCallback((tenement, monthDue) => {
    setReceiptData({
      tenementNumber: tenement.tenementNumber,
      ownerName:      tenement.ownerName,
      month:          monthDue.month,
      year:           monthDue.year || selectedYear,
      amount:         monthDue.amountPaid || monthDue.amount,
      dateCleared:    monthDue.dateCleared,
      reference:      monthDue.reference,
      method:         monthDue.method,
    });
    setIsReceiptOpen(true);
  }, [selectedYear]);

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

  const confirmPaymentToggle = method => {
    if (!paymentToggleState) return;
    const amount = Number(paymentAmount);
    if (!amount || amount <= 0) return;
    const today = new Date();
    const randomRef = 'TXN' + Math.floor(10000 + Math.random() * 90000);
    addInstallment(
      paymentToggleState.tenementNumber,
      paymentToggleState.month,
      { amount, date: today.toISOString().split('T')[0], reference: paymentReference || randomRef, method },
      paymentToggleState.year
    );
    setPaymentToggleState(null);
    setPaymentAmount('');
    setPaymentReference('');
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  const activeTab = currentTab || 'overview';

  return (
    <>
      {(activeTab === 'overview' || !['tenements', 'monthly-grid', 'notices', 'expenses'].includes(activeTab)) && (
        <OverviewTab
          selectedMonth={selectedMonth} selectedYear={selectedYear}
          totalTenementsCount={totalTenementsCount}
          currentMonthPaid={currentMonthPaid} currentMonthUnpaid={currentMonthUnpaid}
          totalCollectedDisplay={totalCollectedDisplay} totalPendingThisMonth={totalPendingThisMonth}
          collectionRate={collectionRate}
          defaulterTenements={currentMonthUnpaid}
          notices={notices}
          maintenanceAmount={maintenanceAmount}
          settingsAmount={settingsAmount} setSettingsAmount={setSettingsAmount}
          settingsSuccess={settingsSuccess} settingsError={settingsError}
          onSaveSettings={handleSaveSettings}
          onOpenTenement={openTenement}
        />
      )}

      {activeTab === 'tenements' && (
        <TenementsTab
          tenements={tenements} filteredTenements={filteredTenements}
          selectedMonth={selectedMonth} selectedYear={selectedYear}
          maintenanceAmount={maintenanceAmount}
          searchQuery={searchQuery} setSearchQuery={setSearchQuery}
          isAddingTenement={isAddingTenement} setIsAddingTenement={setIsAddingTenement}
          newTenementNumber={newTenementNumber} setNewTenementNumber={setNewTenementNumber}
          newName={newName} setNewName={setNewName}
          newContact={newContact} setNewContact={setNewContact}
          newPassword={newPassword} setNewPassword={setNewPassword}
          adminRegError={adminRegError} adminRegSuccess={adminRegSuccess}
          onRegisterTenement={handleAdminRegisterTenement}
          onOpenTenement={openTenement}
          onDeleteTenement={setTenementToDelete}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteTenementModal
        tenement={tenementToDelete}
        onConfirm={handleConfirmDeleteTenement}
        onCancel={() => setTenementToDelete(null)}
      />

      {activeTab === 'monthly-grid' && <MonthlyGridView />}

      {activeTab === 'notices' && (
        <NoticeBroadcasterTab
          notices={notices}
          selectedNotice={selectedNotice} setSelectedNotice={setSelectedNotice}
          onDelete={id => { if (window.confirm('Delete this notice?')) deleteNotice(id); }}
          onOpenPublish={() => setIsPublishNoticeOpen(true)}
        />
      )}

      {activeTab === 'expenses' && (
        <ExpensesTab
          expenses={expenses}
          selectedYear={selectedYear}
          onOpenAddExpense={() => setIsAddExpenseOpen(true)}
          onViewBill={(exp) => {
            setSelectedExpense(exp);
            setIsDriveOpen(true);
          }}
          onDeleteExpense={(exp) => {
            if (window.confirm(`Are you sure you want to delete "${exp.description}"?`)) {
              deleteExpense(exp.id);
            }
          }}
        />
      )}

      <DrivePreviewModal
        isOpen={isDriveOpen}
        onClose={() => setIsDriveOpen(false)}
        expense={selectedExpense}
      />

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      {isAddExpenseOpen && (
        <AddExpenseModal
          expCategory={expCategory} setExpCategory={setExpCategory}
          expDescription={expDescription} setExpDescription={setExpDescription}
          expAmount={expAmount} setExpAmount={setExpAmount}
          expDate={expDate} setExpDate={setExpDate}
          expFileName={expFileName}
          uploadingToDrive={uploadingToDrive}
          expSuccess={expSuccess} expError={expError}
          handleFileChange={handleFileChange}
          handleSaveExpense={handleSaveExpense}
          onClose={() => setIsAddExpenseOpen(false)}
        />
      )}

      {activeTenement && (
        <TenementModal
          tenement={activeTenement}
          onClose={closeTenement}
          onTogglePayment={handleTogglePayment}
          onOpenReceipt={openReceipt}
        />
      )}
      

      {paymentToggleState && (
        <PaymentInstallmentModal
          paymentToggleState={paymentToggleState}
          maintenanceAmount={maintenanceAmount}
          paymentAmount={paymentAmount} setPaymentAmount={setPaymentAmount}
          paymentReference={paymentReference} setPaymentReference={setPaymentReference}
          onConfirm={confirmPaymentToggle}
          onClose={() => setPaymentToggleState(null)}
        />
      )}

      {isPublishNoticeOpen && (
        <PublishNoticeModal
          noticeTitle={noticeTitle} setNoticeTitle={setNoticeTitle}
          noticeContent={noticeContent} setNoticeContent={setNoticeContent}
          noticeSuccessMsg={noticeSuccessMsg}
          onSubmit={handleBroadcastNotice}
          onClose={() => setIsPublishNoticeOpen(false)}
        />
      )}

      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        receiptData={receiptData}
      />
    </>
  );
}
