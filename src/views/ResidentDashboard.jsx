import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import ReceiptModal from '../components/ReceiptModal';

export default function ResidentDashboard({ currentTab }) {
  const { user, tenements, notices, updateProfile } = useContext(AppContext);
  
  // Find current resident tenement data first
  const tenementData = tenements.find(t => t.tenementNumber === user?.username);

  // States
  const [expandedLedgerIndex, setExpandedLedgerIndex] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Profile editing state
  const [profileName, setProfileName] = useState('');
  const [profileContact, setProfileContact] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Sync profile editing fields with tenementData once loaded/updated
  useEffect(() => {
    if (tenementData) {
      setProfileName(tenementData.ownerName || '');
      setProfileContact(tenementData.contact || '');
    }
  }, [tenementData]);

  if (!user || user.role !== 'resident') return null;

  if (!tenementData) {
    return (
      <div className="p-6 text-center text-error bg-error-container rounded">
        Tenement records not found for ID: {user.username}
      </div>
    );
  }

  // Monthly stats
  const currentMonth = "July";
  const currentMonthDue = tenementData.dues.find(d => d.month === currentMonth);
  const totalDuesPaid = tenementData.dues.filter(d => d.status === 'Paid').length;
  const isCurrentMonthPaid = currentMonthDue?.status === 'Paid';

  // Toggle ledger accordion row
  const toggleRow = (index) => {
    setExpandedLedgerIndex(expandedLedgerIndex === index ? null : index);
  };

  // Open receipt details
  const openReceipt = (monthDue) => {
    setSelectedReceipt({
      tenementNumber: tenementData.tenementNumber,
      ownerName: tenementData.ownerName,
      month: monthDue.month,
      amount: monthDue.amount,
      dateCleared: monthDue.dateCleared,
      reference: monthDue.reference,
      method: monthDue.method
    });
    setIsReceiptOpen(true);
  };

  // Save updated profile
  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!profileName.trim() || !profileContact.trim()) {
      setProfileError('Name and contact number are required.');
      setProfileSuccess('');
      return;
    }
    const result = updateProfile(profileName, profileContact);
    if (result.success) {
      setProfileSuccess('Profile updated successfully!');
      setProfileError('');
      setTimeout(() => setProfileSuccess(''), 3000);
    } else {
      setProfileError(result.message);
      setProfileSuccess('');
    }
  };

  const renderDashboardView = () => (
    <div className="space-y-6">
      
      {/* Hello Resident Banner */}
      <div className="flex justify-between items-center bg-white p-6 rounded-lg border border-[#E2E8F0] shadow-soft">
        <div>
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Welcome back</p>
          <h2 className="font-display-lg text-on-surface font-extrabold mt-1">Hello, {tenementData.ownerName}</h2>
          <p className="text-sm text-on-surface-variant font-medium mt-0.5">Resident, Tenement {tenementData.tenementNumber}</p>
        </div>
        <div className="hidden sm:flex w-14 h-14 rounded-full bg-primary-container text-white items-center justify-center font-extrabold text-xl shadow-soft">
          {tenementData.tenementNumber}
        </div>
      </div>

      {/* Dues Aggregator Banner */}
      {isCurrentMonthPaid ? (
        <div className="bg-success-container text-[#191b23] p-5 rounded-lg border border-transparent flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-soft">
          <div className="flex items-start space-x-3.5">
            <span className="material-symbols-outlined text-success text-3xl font-bold mt-0.5">check_circle</span>
            <div>
              <h3 className="font-title-lg font-bold text-on-surface">Maintenance Paid</h3>
              <p className="text-xs text-on-surface-variant font-semibold mt-1">
                Your dues for {currentMonth} 2026 are fully cleared. Thank you for your timely contribution!
              </p>
            </div>
          </div>
          <div>
            <button
              onClick={() => openReceipt(currentMonthDue)}
              className="px-4 py-2 bg-white text-on-surface border border-outline-variant hover:bg-surface-container-high rounded text-xs font-bold shadow-soft flex items-center space-x-1.5 transition-all duration-200 active-scale"
            >
              <span className="material-symbols-outlined text-sm font-bold">receipt_long</span>
              <span>View Receipt</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-error-container text-[#ba1a1a] p-5 rounded-lg border border-transparent flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-soft">
          <div className="flex items-start space-x-3.5">
            <span className="material-symbols-outlined text-error text-3xl font-bold mt-0.5">error</span>
            <div>
              <h3 className="font-title-lg font-bold text-on-surface">Maintenance Unpaid</h3>
              <p className="text-xs text-on-surface-variant font-semibold mt-1 leading-relaxed">
                Pending amount: <span className="font-bold text-error">₹{currentMonthDue?.amount || 1200}</span> for {currentMonth} 2026. 
                <br />
                <span className="font-medium">No online payment gateway is integrated. Please clear dues with the society treasurer via Cheque, Cash, or Bank Transfer.</span>
              </p>
            </div>
          </div>
          <div>
            <div className="px-4 py-2 bg-white border border-[#ffdad6] text-error font-extrabold text-sm rounded shadow-soft text-center sm:text-right">
              Pending: ₹{currentMonthDue?.amount || 1200}
            </div>
          </div>
        </div>
      )}

      {/* Yearly Progress Rail */}
      <div className="bg-white p-6 rounded-lg border border-[#E2E8F0] shadow-soft">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-title-lg font-bold text-on-surface">2026 Summary</h3>
          <span className="text-xs font-bold bg-surface-container text-primary px-3 py-1 rounded-full">
            {totalDuesPaid} / 12 Months Paid
          </span>
        </div>
        
        {/* Progress Timeline Rail */}
        <div className="space-y-4">
          <div className="h-4 bg-surface rounded-full overflow-hidden flex border border-[#E2E8F0] p-0.5">
            {tenementData.dues.map((due, idx) => {
              let color = 'bg-slate-200'; // Unbilled
              if (due.status === 'Paid') color = 'bg-success';
              else if (due.status === 'Unpaid') color = 'bg-error';

              return (
                <div
                  key={idx}
                  title={`${due.month}: ${due.status}`}
                  className={`h-full flex-1 transition-all duration-300 first:rounded-l-full last:rounded-r-full border-r border-white border-opacity-40 last:border-r-0 ${color}`}
                ></div>
              );
            })}
          </div>
          
          {/* Labels */}
          <div className="flex justify-between text-[10px] text-on-surface-variant font-bold px-1 uppercase tracking-wider">
            <span>Jan 2026</span>
            <span>Jun</span>
            <span>Dec 2026</span>
          </div>

          {/* Legend */}
          <div className="flex items-center space-x-4 pt-1 justify-center text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 bg-success rounded-full"></span>
              <span className="font-semibold text-on-surface-variant">Paid</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 bg-error rounded-full"></span>
              <span className="font-semibold text-on-surface-variant">Unpaid</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 bg-slate-300 rounded-full"></span>
              <span className="font-semibold text-on-surface-variant">Future (Unbilled)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Short Ledger & Brief Bulletins */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ledger Sneak Peek */}
        <div className="bg-white p-5 rounded-lg border border-[#E2E8F0] shadow-soft space-y-4">
          <h3 className="font-title-lg font-bold text-on-surface">Recent Dues</h3>
          <div className="space-y-3">
            {tenementData.dues.slice(0, 7).map((due, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-surface hover:bg-surface-container rounded border border-[#E2E8F0] transition-all"
              >
                <div className="flex items-center space-x-3">
                  <span className={`w-2.5 h-2.5 rounded-full ${due.status === 'Paid' ? 'bg-success' : due.status === 'Unpaid' ? 'bg-error' : 'bg-slate-300'}`}></span>
                  <div>
                    <p className="text-xs font-bold text-on-surface">{due.month} 2026</p>
                    <p className="text-[10px] text-on-surface-variant font-semibold">₹{due.amount}</p>
                  </div>
                </div>
                <div>
                  {due.status === 'Paid' ? (
                    <button
                      onClick={() => openReceipt(due)}
                      className="px-2.5 py-1 text-[10px] font-bold bg-white text-primary border border-outline-variant hover:bg-primary hover:text-white rounded shadow-soft transition-all active-scale"
                    >
                      Receipt
                    </button>
                  ) : due.status === 'Unpaid' ? (
                    <span className="text-[10px] font-bold text-error bg-error-container px-2 py-1 rounded">Unpaid</span>
                  ) : (
                    <span className="text-[10px] font-bold text-on-surface-variant bg-surface-container-high px-2 py-1 rounded">Future</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notices Board */}
        <div className="bg-white p-5 rounded-lg border border-[#E2E8F0] shadow-soft space-y-4">
          <h3 className="font-title-lg font-bold text-on-surface">Bulletin board</h3>
          <div className="space-y-3.5 max-h-[300px] overflow-y-auto no-scrollbar">
            {notices.length === 0 ? (
              <p className="text-xs text-on-surface-variant text-center py-4">No new announcements from the committee.</p>
            ) : (
              notices.map((notice) => {
                let badgeColor = 'bg-blue-100 text-blue-800 border-blue-200';
                if (notice.severity === 'critical') badgeColor = 'bg-red-100 text-red-800 border-red-200';
                else if (notice.severity === 'warning') badgeColor = 'bg-amber-100 text-amber-800 border-amber-200';

                return (
                  <div
                    key={notice.id}
                    className="p-3.5 bg-surface border-l-4 rounded-r border-[#E2E8F0] space-y-1.5 transition-all"
                    style={{
                      borderLeftColor: notice.severity === 'critical' ? '#ba1a1a' : notice.severity === 'warning' ? '#f59e0b' : '#004ac6'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                        {notice.date}
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                        {notice.severity}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-on-surface leading-snug">{notice.title}</h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed font-medium">{notice.content}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

    </div>
  );

  const renderLedgerView = () => (
    <div className="bg-white p-6 rounded-lg border border-[#E2E8F0] shadow-soft space-y-4">
      <div>
        <h2 className="font-headline-md text-on-surface font-extrabold">Detailed Ledger</h2>
        <p className="text-xs text-on-surface-variant font-medium mt-0.5">Chronological record of maintenance contributions for 2026</p>
      </div>

      <div className="space-y-3">
        {tenementData.dues.map((due, idx) => {
          const isExpanded = expandedLedgerIndex === idx;
          const isPaid = due.status === 'Paid';
          const isUnpaid = due.status === 'Unpaid';
          const isUnbilled = due.status === 'Unbilled';

          let borderColor = 'border-l-slate-300';
          if (isPaid) borderColor = 'border-l-success';
          else if (isUnpaid) borderColor = 'border-l-error';

          return (
            <div
              key={idx}
              className={`border border-[#E2E8F0] border-l-4 rounded bg-surface hover:bg-surface-container transition-all ${borderColor}`}
            >
              {/* Header Accordion Click Area */}
              <div
                onClick={() => !isUnbilled && toggleRow(idx)}
                className={`p-4 flex items-center justify-between ${isUnbilled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer select-none'}`}
              >
                <div className="flex items-center space-x-3">
                  <span className="material-symbols-outlined text-xl text-on-surface-variant">
                    {isPaid ? 'check_circle' : isUnpaid ? 'error' : 'schedule'}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-on-surface">{due.month} 2026</h4>
                    <p className="text-xs text-on-surface-variant font-semibold">Amount: ₹{due.amount}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {isPaid ? (
                    <span className="text-[10px] font-bold bg-success-container text-success px-2.5 py-1 rounded-full">Paid</span>
                  ) : isUnpaid ? (
                    <span className="text-[10px] font-bold bg-error-container text-error px-2.5 py-1 rounded-full">Unpaid</span>
                  ) : (
                    <span className="text-[10px] font-bold bg-surface-container-high text-on-surface-variant px-2.5 py-1 rounded-full">Unbilled</span>
                  )}

                  {!isUnbilled && (
                    <span
                      className={`material-symbols-outlined text-on-surface-variant transform transition-transform duration-300 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    >
                      expand_more
                    </span>
                  )}
                </div>
              </div>

              {/* Accordion Expanded Content */}
              {isExpanded && !isUnbilled && (
                <div className="px-4 pb-4 pt-2 border-t border-[#E2E8F0] bg-white text-xs text-on-surface-variant font-semibold space-y-3">
                  {isPaid ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p><span className="text-on-surface font-bold">Cleared Date:</span> {new Date(due.dateCleared).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}</p>
                        <p><span className="text-on-surface font-bold">Reference ID:</span> <span className="font-mono">{due.reference}</span></p>
                        <p><span className="text-on-surface font-bold">Payment Method:</span> {due.method}</p>
                      </div>
                      <div className="flex items-end sm:justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openReceipt(due);
                          }}
                          className="px-4 py-2 bg-primary text-white text-xs font-bold rounded shadow-soft hover:bg-primary-container flex items-center space-x-1.5 transition-all duration-200 active-scale"
                        >
                          <span className="material-symbols-outlined text-sm">receipt_long</span>
                          <span>Download Receipt</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p><span className="text-error font-bold">Payment Status:</span> Overdue / Outstanding</p>
                      <p><span className="text-on-surface font-bold">Instructions:</span> Please submit cash or cheque of <span className="text-on-surface font-bold">₹1,200</span> to the treasurer's desk. To ensure clean records, kindly obtain physical receipts or wait for dashboard sync.</p>
                      <p className="text-[10px] text-error font-bold bg-error-container p-2 rounded">
                        * Electronic gateways are not configured. Online digital payments are offline-verified.
                      </p>
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

  const renderBulletinsView = () => (
    <div className="bg-white p-6 rounded-lg border border-[#E2E8F0] shadow-soft space-y-6">
      <div>
        <h2 className="font-headline-md text-on-surface font-extrabold">Society Bulletin Board</h2>
        <p className="text-xs text-on-surface-variant font-medium mt-0.5">Important announcements from the Management Committee</p>
      </div>

      <div className="space-y-4">
        {notices.length === 0 ? (
          <p className="text-sm text-on-surface-variant text-center py-8">No notices published yet.</p>
        ) : (
          notices.map((notice) => {
            let headerBg = 'border-l-primary';
            let iconName = 'info';
            let iconColor = 'text-primary';
            let badgeStyle = 'bg-blue-50 text-primary border-blue-200';

            if (notice.severity === 'critical') {
              headerBg = 'border-l-error';
              iconName = 'warning';
              iconColor = 'text-error';
              badgeStyle = 'bg-error-container text-error border-[#ffdad6]';
            } else if (notice.severity === 'warning') {
              headerBg = 'border-l-amber-500';
              iconName = 'error';
              iconColor = 'text-amber-600';
              badgeStyle = 'bg-amber-50 text-amber-800 border-amber-200';
            }

            return (
              <div
                key={notice.id}
                className={`p-5 bg-surface border-l-4 rounded border-[#E2E8F0] space-y-3 shadow-sm ${headerBg}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`material-symbols-outlined ${iconColor}`}>
                      {iconName}
                    </span>
                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                      {notice.date}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${badgeStyle}`}>
                    {notice.severity}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-title-lg font-bold text-on-surface leading-tight">
                    {notice.title}
                  </h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed font-medium pt-1 whitespace-pre-wrap">
                    {notice.content}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  const renderProfileView = () => (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg border border-[#E2E8F0] shadow-soft space-y-6">
      <div>
        <h2 className="font-headline-md text-on-surface font-extrabold">My Profile</h2>
        <p className="text-xs text-on-surface-variant font-medium mt-0.5">Manage your resident name and contact details</p>
      </div>

      {profileSuccess && (
        <div className="bg-success-container text-success text-xs font-semibold p-3.5 rounded border border-transparent flex items-center space-x-2">
          <span className="material-symbols-outlined text-sm font-bold">check_circle</span>
          <span>{profileSuccess}</span>
        </div>
      )}

      {profileError && (
        <div className="bg-error-container text-error text-xs font-semibold p-3.5 rounded border border-transparent flex items-start space-x-2">
          <span className="material-symbols-outlined text-sm font-bold mt-0.5">error</span>
          <span>{profileError}</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
            Tenement Number (Read-only)
          </label>
          <input
            type="text"
            readOnly
            value={tenementData?.tenementNumber || ''}
            className="w-full px-3.5 py-2 border border-outline-variant bg-surface-container text-on-surface-variant rounded text-xs font-bold cursor-not-allowed outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
            Resident Full Name
          </label>
          <input
            type="text"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            className="w-full px-3.5 py-2 border border-outline-variant bg-white text-on-surface rounded text-xs font-semibold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="e.g. Nilesh Kadam"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
            Contact Number
          </label>
          <input
            type="text"
            value={profileContact}
            onChange={(e) => setProfileContact(e.target.value)}
            className="w-full px-3.5 py-2 border border-outline-variant bg-white text-on-surface rounded text-xs font-semibold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="e.g. +91 99887 76655"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-primary text-white text-xs font-bold rounded shadow-soft hover:bg-primary-container flex items-center justify-center space-x-1.5 transition-all duration-200 active-scale"
        >
          <span className="material-symbols-outlined text-sm font-bold">save</span>
          <span>Save Changes</span>
        </button>
      </form>
    </div>
  );

  return (
    <>
      {currentTab === 'dashboard' && renderDashboardView()}
      {currentTab === 'ledger' && renderLedgerView()}
      {currentTab === 'notices' && renderBulletinsView()}
      {currentTab === 'profile' && renderProfileView()}

      {/* Printable receipt modal overlay */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        receiptData={selectedReceipt}
      />
    </>
  );
}
