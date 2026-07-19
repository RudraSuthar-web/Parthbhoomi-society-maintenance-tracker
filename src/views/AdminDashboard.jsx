import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import ReceiptModal from '../components/ReceiptModal';

export default function AdminDashboard({ currentTab }) {
  const { tenements, notices, togglePaymentStatus, addNotice, deleteNotice, registerTenement } = useContext(AppContext);
  const [selectedTenementNumber, setSelectedTenementNumber] = useState(null);
  
  // Notice Broadcaster form state
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeSeverity, setNoticeSeverity] = useState('info');
  const [noticeSuccessMsg, setNoticeSuccessMsg] = useState('');

  // Admin Register Tenement form state
  const [isAddingTenement, setIsAddingTenement] = useState(false);
  const [newTenementNumber, setNewTenementNumber] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newPassword, setNewPassword] = useState('password');
  const [adminRegError, setAdminRegError] = useState('');
  const [adminRegSuccess, setAdminRegSuccess] = useState('');

  // Payment Method selection modal/popover state
  const [paymentToggleState, setPaymentToggleState] = useState(null); // { tenementNumber, month }

  // Printable receipt overlay state
  const [receiptData, setReceiptData] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Search/Filter state for Tenement directory
  const [searchQuery, setSearchQuery] = useState('');

  const currentMonth = 'July';
  const duesAmount = 1200;

  // Calculators
  const totalTenementsCount = tenements.length;
  
  // July Stats
  const julyPaidTenements = tenements.filter(t => {
    const julyDue = t.dues.find(d => d.month === currentMonth);
    return julyDue?.status === 'Paid';
  });

  const julyUnpaidTenements = tenements.filter(t => {
    const julyDue = t.dues.find(d => d.month === currentMonth);
    return julyDue?.status === 'Unpaid';
  });

  const totalCollectedThisMonth = julyPaidTenements.length * duesAmount;
  const totalPendingThisMonth = julyUnpaidTenements.length * duesAmount;

  // Defaulters for July
  const defaulters = julyUnpaidTenements.map(t => ({
    tenementNumber: t.tenementNumber,
    ownerName: t.ownerName,
    contact: t.contact
  }));

  // Handle notice broadcast submission
  const handleBroadcastNotice = (e) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeContent.trim()) {
      alert('Please fill out notice title and content.');
      return;
    }
    addNotice(noticeTitle, noticeContent, noticeSeverity);
    setNoticeTitle('');
    setNoticeContent('');
    setNoticeSeverity('info');
    setNoticeSuccessMsg('Notice broadcasted successfully!');
    setTimeout(() => setNoticeSuccessMsg(''), 3000);
  };

  // Handle registering new tenement from admin
  const handleAdminRegisterTenement = (e) => {
    e.preventDefault();
    if (!newTenementNumber.trim() || !newContact.trim() || !newPassword) {
      setAdminRegError('All fields are required.');
      return;
    }

    const trimmed = newTenementNumber.trim();
    if (!/^\d+$/.test(trimmed)) {
      setAdminRegError('Tenement number must contain digits only (no characters).');
      return;
    }
    const num = parseInt(trimmed, 10);
    if (num < 1 || num > 60) {
      setAdminRegError('Tenement number must be between 1 and 60.');
      return;
    }

    const result = registerTenement(newTenementNumber, newContact, newPassword);

    if (result.success) {
      setAdminRegSuccess(`Tenement ${newTenementNumber.trim().toUpperCase()} registered successfully!`);
      setAdminRegError('');
      
      setNewTenementNumber('');
      setNewContact('');
      setNewPassword('password');

      setTimeout(() => {
        setIsAddingTenement(false);
        setAdminRegSuccess('');
      }, 2000);
    } else {
      setAdminRegError(result.message);
      setAdminRegSuccess('');
    }
  };

  // Open receipt details
  const openReceipt = (tenement, monthDue) => {
    setReceiptData({
      tenementNumber: tenement.tenementNumber,
      ownerName: tenement.ownerName,
      month: monthDue.month,
      amount: monthDue.amount,
      dateCleared: monthDue.dateCleared,
      reference: monthDue.reference,
      method: monthDue.method
    });
    setIsReceiptOpen(true);
  };

  // Prompt payment method selection before toggling Paid
  const triggerPaymentToggle = (tenementNumber, month, currentStatus) => {
    if (currentStatus === 'Paid') {
      togglePaymentStatus(tenementNumber, month);
    } else {
      setPaymentToggleState({ tenementNumber, month });
    }
  };

  const confirmPaymentToggle = (method) => {
    if (paymentToggleState) {
      togglePaymentStatus(paymentToggleState.tenementNumber, paymentToggleState.month, method);
      setPaymentToggleState(null);
    }
  };

  // Filter tenements by search query
  const filteredTenements = tenements.filter(t => 
    t.tenementNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.ownerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-[#E2E8F0] shadow-soft">
        <h2 className="font-display-lg text-on-surface font-extrabold">Committee Dashboard</h2>
        <p className="text-xs text-on-surface-variant font-medium mt-0.5">Global overview of society maintenance funds for July 2026</p>
      </div>

      {/* Global Financial Health Bento Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Collected */}
        <div className="bg-white p-6 rounded-lg border border-[#E2E8F0] shadow-soft flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Total Collected</span>
            <span className="material-symbols-outlined text-[#4CAF50] bg-success-container p-2 rounded-full">payments</span>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-[#191b23]">₹{totalCollectedThisMonth.toLocaleString('en-IN')}</h3>
            <p className="text-xs text-on-surface-variant font-semibold mt-1">
              July Dues: {julyPaidTenements.length} of {totalTenementsCount} paid ({(julyPaidTenements.length/totalTenementsCount*100).toFixed(0)}%)
            </p>
          </div>
        </div>

        {/* Total Pending */}
        <div className="bg-white p-6 rounded-lg border border-[#E2E8F0] shadow-soft flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Total Pending</span>
            <span className="material-symbols-outlined text-[#ba1a1a] bg-error-container p-2 rounded-full">hourglass_empty</span>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-[#191b23]">₹{totalPendingThisMonth.toLocaleString('en-IN')}</h3>
            <p className="text-xs text-on-surface-variant font-semibold mt-1">
              July Dues: {julyUnpaidTenements.length} tenements outstanding
            </p>
          </div>
        </div>

        {/* Defaulters Widget */}
        <div className="bg-white p-5 rounded-lg border border-[#E2E8F0] shadow-soft flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Defaulters (July)</h3>
            <span className="text-[10px] font-bold bg-[#ffdad6] text-error px-2 py-0.5 rounded-full">{defaulters.length} Unpaid</span>
          </div>
          
          <div className="flex-1 overflow-y-auto max-h-[120px] no-scrollbar space-y-2">
            {defaulters.length === 0 ? (
              <p className="text-xs text-[#4CAF50] font-bold text-center py-4">Perfect record! Zero pending dues.</p>
            ) : (
              defaulters.map((d, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 bg-surface rounded border border-[#E2E8F0] text-xs font-semibold">
                  <div>
                    <span className="font-bold text-on-surface block">Unit {d.tenementNumber}</span>
                    <span className="text-[10px] text-on-surface-variant">{d.ownerName}</span>
                  </div>
                  <a href={`tel:${d.contact}`} className="text-primary hover:text-primary-container p-1 rounded-full hover:bg-surface-container transition-all active-scale">
                    <span className="material-symbols-outlined text-base">call</span>
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick notice board status */}
      <div className="bg-white p-5 rounded-lg border border-[#E2E8F0] shadow-soft space-y-3">
        <h3 className="font-title-lg font-bold text-on-surface">Active Bulletin Board</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-[220px] overflow-y-auto no-scrollbar pt-1">
          {notices.slice(0, 3).map((notice) => (
            <div key={notice.id} className="p-3 bg-surface rounded border border-[#E2E8F0] space-y-1.5">
              <div className="flex justify-between items-center text-[9px] font-bold uppercase text-on-surface-variant">
                <span>{notice.date}</span>
                <span className={`px-1.5 py-0.5 rounded-full ${notice.severity === 'critical' ? 'bg-[#ffdad6] text-error' : notice.severity === 'warning' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>{notice.severity}</span>
              </div>
              <h4 className="font-bold text-xs text-on-surface truncate">{notice.title}</h4>
              <p className="text-[11px] text-on-surface-variant line-clamp-2 leading-relaxed">{notice.content}</p>
            </div>
          ))}
          {notices.length === 0 && (
            <p className="col-span-3 text-xs text-on-surface-variant text-center py-4">No active bulletin notices.</p>
          )}
        </div>
      </div>

    </div>
  );

  const renderTenements = () => (
    <div className="bg-white p-6 rounded-lg border border-[#E2E8F0] shadow-soft space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="font-headline-md text-on-surface font-extrabold">Tenement Directory & Ledger</h2>
          <p className="text-xs text-on-surface-variant font-medium mt-0.5">Toggle payment statuses and view records for all units</p>
        </div>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <span className="material-symbols-outlined absolute left-3 top-2 text-on-surface-variant text-lg">search</span>
            <input
              type="text"
              placeholder="Search unit or owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-60 pl-9 pr-4 py-1.5 border border-outline-variant bg-surface text-on-surface rounded text-xs focus:outline-none focus:border-primary font-semibold"
            />
          </div>
          <button
            onClick={() => {
              setIsAddingTenement(!isAddingTenement);
              setAdminRegError('');
              setAdminRegSuccess('');
            }}
            className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded shadow-soft hover:bg-primary-container flex items-center space-x-1 transition-all duration-200 active-scale"
          >
            <span className="material-symbols-outlined text-sm font-bold">
              {isAddingTenement ? 'close' : 'add'}
            </span>
            <span>{isAddingTenement ? 'Cancel' : 'Add Unit'}</span>
          </button>
        </div>
      </div>

      {/* Tenement Registration Form */}
      {isAddingTenement && (
        <form onSubmit={handleAdminRegisterTenement} className="p-5 bg-surface border border-outline-variant rounded space-y-4 animate-fadeIn">
          <h3 className="font-title-lg font-bold text-on-surface flex items-center space-x-1.5">
            <span className="material-symbols-outlined text-primary">add_home</span>
            <span>Register New Tenement Unit</span>
          </h3>

          {adminRegError && (
            <div className="bg-error-container text-error text-xs font-semibold p-3 rounded border border-transparent">
              {adminRegError}
            </div>
          )}

          {adminRegSuccess && (
            <div className="bg-success-container text-success text-xs font-semibold p-3 rounded border border-transparent">
              {adminRegSuccess}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Tenement Number
              </label>
              <input
                type="text"
                placeholder="e.g. 42 (1-60)"
                value={newTenementNumber}
                onChange={(e) => setNewTenementNumber(e.target.value)}
                className="w-full px-3 py-1.5 border border-outline-variant bg-white text-on-surface rounded text-xs font-semibold focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Contact Number
              </label>
              <input
                type="text"
                placeholder="e.g. +91 99887 76655"
                value={newContact}
                onChange={(e) => setNewContact(e.target.value)}
                className="w-full px-3 py-1.5 border border-outline-variant bg-white text-on-surface rounded text-xs font-semibold focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Unit Password
              </label>
              <input
                type="password"
                placeholder="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-1.5 border border-outline-variant bg-white text-on-surface rounded text-xs font-semibold focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsAddingTenement(false)}
              className="px-4 py-1.5 border border-outline-variant bg-white text-on-surface text-xs font-bold rounded shadow-soft hover:bg-surface-container transition-all duration-200 active-scale"
            >
              Close
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded shadow-soft hover:bg-primary-container transition-all duration-200 active-scale"
            >
              Create Tenement
            </button>
          </div>
        </form>
      )}

      {/* Tenements List */}
      <div className="space-y-4">
        {filteredTenements.map((tenement) => {
          const isSelected = selectedTenementNumber === tenement.tenementNumber;
          const julyDue = tenement.dues.find(d => d.month === currentMonth);
          const totalPaidCount = tenement.dues.filter(d => d.status === 'Paid').length;
          
          return (
            <div
              key={tenement.tenementNumber}
              className={`border border-[#E2E8F0] rounded overflow-hidden transition-all duration-200 ${
                isSelected ? 'ring-1 ring-primary shadow-sm bg-white' : 'bg-surface hover:bg-surface-container'
              }`}
            >
              {/* Row Summary / Header */}
              <div
                onClick={() => setSelectedTenementNumber(isSelected ? null : tenement.tenementNumber)}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
              >
                {/* Info block */}
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    {tenement.tenementNumber}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-on-surface">{tenement.ownerName}</h4>
                    <p className="text-[11px] text-on-surface-variant font-semibold">{tenement.contact}</p>
                  </div>
                </div>

                {/* Status & Toggle block */}
                <div className="flex items-center justify-between sm:justify-end space-x-6">
                  {/* Ledger summary */}
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block">Dues Status (July)</span>
                    {julyDue?.status === 'Paid' ? (
                      <span className="text-[11px] font-bold text-success flex items-center mt-0.5">
                        <span className="material-symbols-outlined text-xs mr-0.5 font-bold">check_circle</span> Paid
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-error flex items-center mt-0.5">
                        <span className="material-symbols-outlined text-xs mr-0.5 font-bold">error</span> Unpaid
                      </span>
                    )}
                  </div>

                  <div className="text-left sm:text-right hidden sm:block">
                    <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block">Dues Ledger</span>
                    <span className="text-xs font-bold text-primary">{totalPaidCount} / 12 Months Paid</span>
                  </div>

                  <span className="material-symbols-outlined text-on-surface-variant transform transition-transform duration-300">
                    {isSelected ? 'expand_less' : 'expand_more'}
                  </span>
                </div>
              </div>

              {/* Expanded details: 12-Month Grid */}
              {isSelected && (
                <div className="p-4 bg-white border-t border-[#E2E8F0] space-y-4 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <p className="text-xs text-on-surface-variant font-semibold">
                      Click status badge to toggle payment between <span className="text-success font-bold">Paid</span> and <span className="text-error font-bold">Unpaid</span>.
                    </p>
                    <div className="text-xs font-semibold bg-surface-container px-3 py-1.5 rounded">
                      <span className="text-on-surface">Yearly Progress:</span> <span className="text-primary font-bold">{totalPaidCount} / 12 Months</span>
                    </div>
                  </div>

                  {/* 12-month calendar ledger */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                    {tenement.dues.map((due) => {
                      const isMonthPaid = due.status === 'Paid';
                      const isMonthUnpaid = due.status === 'Unpaid';
                      const isMonthUnbilled = due.status === 'Unbilled';

                      return (
                        <div
                          key={due.month}
                          className={`p-3 rounded border flex flex-col justify-between space-y-3 transition-all ${
                            isMonthPaid 
                              ? 'bg-success-container bg-opacity-30 border-[#d3f5d5]' 
                              : isMonthUnpaid 
                                ? 'bg-error-container bg-opacity-30 border-[#ffdad6]' 
                                : 'bg-surface border-[#E2E8F0]'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <span className="text-[11px] font-bold text-on-surface leading-tight">{due.month}</span>
                            <span className="text-[10px] text-on-surface-variant font-mono font-semibold">₹{due.amount}</span>
                          </div>

                          <div className="flex flex-col space-y-1">
                            {/* Toggle Button */}
                            <button
                              onClick={() => triggerPaymentToggle(tenement.tenementNumber, due.month, due.status)}
                              className={`w-full py-1 text-[10px] font-bold rounded shadow-sm text-center border uppercase transition-all duration-200 active-scale ${
                                isMonthPaid
                                  ? 'bg-[#4CAF50] border-transparent text-white hover:bg-opacity-95'
                                  : isMonthUnpaid
                                    ? 'bg-[#ba1a1a] border-transparent text-white hover:bg-opacity-95'
                                    : 'bg-white border-outline-variant text-on-surface hover:bg-surface-container-high'
                              }`}
                            >
                              {due.status}
                            </button>

                            {/* View Receipt option for paid months */}
                            {isMonthPaid && (
                              <button
                                onClick={() => openReceipt(tenement, due)}
                                className="text-[9px] text-primary font-bold hover:underline text-left mt-0.5 flex items-center"
                              >
                                <span className="material-symbols-outlined text-[10px] mr-0.5">receipt_long</span>
                                Receipt
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderNoticeBroadcaster = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Notice Form */}
      <div className="lg:col-span-1 bg-white p-6 rounded-lg border border-[#E2E8F0] shadow-soft space-y-4 h-fit">
        <div>
          <h2 className="font-headline-md text-on-surface font-extrabold">Broadcast Notice</h2>
          <p className="text-xs text-on-surface-variant font-medium mt-0.5">Draft a society-wide notification</p>
        </div>

        {noticeSuccessMsg && (
          <div className="bg-success-container text-success text-xs font-semibold p-3 rounded flex items-center space-x-2">
            <span className="material-symbols-outlined text-sm font-bold">check_circle</span>
            <span>{noticeSuccessMsg}</span>
          </div>
        )}

        <form onSubmit={handleBroadcastNotice} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Notice Title
            </label>
            <input
              type="text"
              placeholder="e.g. Water Supply Shutdown"
              value={noticeTitle}
              onChange={(e) => setNoticeTitle(e.target.value)}
              className="w-full px-3.5 py-2 border border-outline-variant bg-surface text-on-surface rounded text-xs font-semibold focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Notice Details
            </label>
            <textarea
              rows="4"
              placeholder="Write the full announcement..."
              value={noticeContent}
              onChange={(e) => setNoticeContent(e.target.value)}
              className="w-full px-3.5 py-2 border border-outline-variant bg-surface text-on-surface rounded text-xs font-semibold focus:outline-none focus:border-primary resize-none"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Severity Level
            </label>
            <select
              value={noticeSeverity}
              onChange={(e) => setNoticeSeverity(e.target.value)}
              className="w-full px-3.5 py-2 border border-outline-variant bg-surface text-on-surface rounded text-xs font-bold focus:outline-none focus:border-primary"
            >
              <option value="info">Info (Blue)</option>
              <option value="warning">Warning (Amber)</option>
              <option value="critical">Critical (Red)</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-primary text-white text-xs font-bold rounded shadow-soft hover:bg-primary-container flex items-center justify-center space-x-1.5 transition-all duration-200 active-scale"
          >
            <span className="material-symbols-outlined text-sm font-bold">campaign</span>
            <span>Publish Notice</span>
          </button>
        </form>
      </div>

      {/* Active Broadcasts list */}
      <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-[#E2E8F0] shadow-soft space-y-4">
        <div>
          <h2 className="font-headline-md text-on-surface font-extrabold">Active Announcements</h2>
          <p className="text-xs text-on-surface-variant font-medium mt-0.5">Manage live bulletins broadcasted to residents</p>
        </div>

        <div className="space-y-3 max-h-[460px] overflow-y-auto no-scrollbar pr-1">
          {notices.length === 0 ? (
            <p className="text-xs text-on-surface-variant text-center py-8">No notices broadcasted yet.</p>
          ) : (
            notices.map((notice) => {
              let badgeColor = 'bg-blue-50 text-primary border-blue-200';
              if (notice.severity === 'critical') badgeColor = 'bg-red-50 text-error border-[#ffdad6]';
              else if (notice.severity === 'warning') badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';

              return (
                <div
                  key={notice.id}
                  className="p-4 bg-surface border border-[#E2E8F0] rounded flex justify-between items-start gap-4 hover:bg-surface-container transition-all"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-on-surface-variant font-bold">{notice.date}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.2 rounded-full border uppercase ${badgeColor}`}>{notice.severity}</span>
                    </div>
                    <h4 className="font-bold text-xs text-on-surface leading-tight truncate">{notice.title}</h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed font-semibold">{notice.content}</p>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this notice?')) {
                        deleteNotice(notice.id);
                      }
                    }}
                    className="p-1 text-on-surface-variant hover:text-error hover:bg-error-container hover:bg-opacity-40 rounded transition-all active-scale"
                    title="Delete Notice"
                  >
                    <span className="material-symbols-outlined text-sm font-bold">delete</span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );

  return (
    <>
      {currentTab === 'overview' && renderOverview()}
      {currentTab === 'tenements' && renderTenements()}
      {currentTab === 'notices' && renderNoticeBroadcaster()}

      {/* Payment Method Selector Modal */}
      {paymentToggleState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="bg-white rounded border border-[#E2E8F0] shadow-soft max-w-sm w-full p-5 space-y-4">
            <h3 className="font-bold text-sm text-on-surface flex items-center space-x-1.5">
              <span className="material-symbols-outlined text-primary text-xl">payments</span>
              <span>Confirm Payment Receipt</span>
            </h3>
            
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Verify receipt of <span className="font-bold text-on-surface">₹1,200</span> for <span className="font-bold text-on-surface">{paymentToggleState.month}</span> from Unit <span className="font-bold text-primary">{paymentToggleState.tenementNumber}</span>. Select clear mode:
            </p>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => confirmPaymentToggle('Cheque')}
                className="py-2 border border-outline-variant bg-surface hover:bg-surface-container text-[11px] font-bold text-on-surface rounded shadow-soft transition-all active-scale"
              >
                Cheque
              </button>
              <button
                onClick={() => confirmPaymentToggle('Cash')}
                className="py-2 border border-outline-variant bg-surface hover:bg-surface-container text-[11px] font-bold text-on-surface rounded shadow-soft transition-all active-scale"
              >
                Cash
              </button>
              <button
                onClick={() => confirmPaymentToggle('Bank Transfer')}
                className="py-2 border border-outline-variant bg-surface hover:bg-surface-container text-[11px] font-bold text-on-surface rounded shadow-soft transition-all active-scale"
              >
                Bank Transfer
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPaymentToggleState(null)}
                className="px-4 py-1.5 text-xs font-bold text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded transition-all active-scale"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Receipt Overlay */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        receiptData={receiptData}
      />
    </>
  );
}
