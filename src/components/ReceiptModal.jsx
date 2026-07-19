import React from 'react';

export default function ReceiptModal({ isOpen, onClose, receiptData }) {
  if (!isOpen || !receiptData) return null;

  const { tenementNumber, ownerName, month, amount, dateCleared, reference, method } = receiptData;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-40 backdrop-blur-sm print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-soft max-w-md w-full overflow-hidden flex flex-col relative print:border-0 print:shadow-none print:max-w-full print:w-full print:static">
        
        {/* Close Button for screens (hidden in print) */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container-high transition-all active-scale print:hidden"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {/* Modal Header */}
        <div className="bg-primary text-white p-6 text-center border-b border-[#E2E8F0] print:text-black print:bg-white print:border-b-2 print:border-black print:px-0">
          <span className="material-symbols-outlined text-4xl mb-1 print:hidden">
            verified
          </span>
          <h2 className="text-xl font-bold tracking-tight">
            Parthbhoomi CHS
          </h2>
          <p className="text-xs text-blue-100 print:text-black print:text-sm font-medium mt-1">
            Sector 12, Plot 42, Kharghar, Navi Mumbai - 410210
          </p>
        </div>

        {/* Receipt Content */}
        <div className="p-6 flex-1 space-y-4 text-sm print:px-0">
          <div className="text-center pb-2 border-b border-dashed border-outline-variant">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Maintenance Receipt
            </span>
            <h3 className="text-lg font-bold text-on-surface mt-1">
              ₹{amount.toLocaleString('en-IN')}
            </h3>
            <p className="text-xs text-success font-semibold flex items-center justify-center mt-1">
              <span className="material-symbols-outlined text-sm mr-1 font-bold">check_circle</span>
              Payment Fully Cleared
            </p>
          </div>

          <div className="grid grid-cols-2 gap-y-3 gap-x-2 pt-2">
            <div>
              <span className="text-xs text-on-surface-variant block">Tenement No</span>
              <span className="font-semibold text-on-surface text-sm">{tenementNumber}</span>
            </div>
            <div>
              <span className="text-xs text-on-surface-variant block">Resident Name</span>
              <span className="font-semibold text-on-surface text-sm truncate block">{ownerName}</span>
            </div>
            <div>
              <span className="text-xs text-on-surface-variant block">Dues Month</span>
              <span className="font-semibold text-on-surface text-sm">{month} 2026</span>
            </div>
            <div>
              <span className="text-xs text-on-surface-variant block">Cleared Date</span>
              <span className="font-semibold text-on-surface text-sm">
                {dateCleared ? new Date(dateCleared).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                }) : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-xs text-on-surface-variant block">Receipt/Txn ID</span>
              <span className="font-mono font-semibold text-primary print:text-black text-xs uppercase">{reference}</span>
            </div>
            <div>
              <span className="text-xs text-on-surface-variant block">Payment Mode</span>
              <span className="font-semibold text-on-surface text-sm">{method || 'Cheque/Cash'}</span>
            </div>
          </div>

          {/* Watermark/Declaration */}
          <div className="mt-6 pt-4 border-t border-[#E2E8F0] text-center space-y-2">
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              This receipt is electronically generated upon manual validation of receiving cash/cheque by the Parthbhoomi Society Management Committee.
            </p>
            <div className="flex justify-between items-end pt-4">
              <div className="text-left">
                <p className="text-[10px] text-on-surface-variant">Signature of Payee</p>
                <div className="h-6 w-20 border-b border-outline-variant"></div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-on-surface-variant">Authorized Signatory</p>
                <p className="text-xs font-bold text-primary font-mono select-none">PARTHBHOOMI_CHS</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons (hidden in print) */}
        <div className="bg-surface-container p-4 border-t border-[#E2E8F0] flex space-x-3 justify-end print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-outline-variant bg-white text-on-surface text-xs font-bold rounded shadow-soft hover:bg-surface-container-high transition-all duration-200 active-scale"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-primary text-white text-xs font-bold rounded shadow-soft hover:bg-primary-container flex items-center space-x-1.5 transition-all duration-200 active-scale"
          >
            <span className="material-symbols-outlined text-sm">print</span>
            <span>Print Receipt</span>
          </button>
        </div>

      </div>
    </div>
  );
}
