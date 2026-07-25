import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { formatDate } from '../utils/dateUtils';

export default function ReceiptModal({ isOpen, onClose, receiptData }) {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('receipt-printing');
    } else {
      document.body.classList.remove('receipt-printing');
    }
    return () => document.body.classList.remove('receipt-printing');
  }, [isOpen]);

  if (!isOpen || !receiptData) return null;

  const { tenementNumber, ownerName, month, year, amount, dateCleared, reference, method } = receiptData;

  const handlePrint = () => window.print();

  // ESC key to close
  const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };

  const modalContent = (
    <>
      <style>{`
        @media print {
          @page { size: A4 portrait !important; margin: 10mm; }
        }
      `}</style>
      <div
        role="dialog"
      aria-modal="true"
      aria-label="Payment Receipt"
      onKeyDown={handleKeyDown}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm print:p-0 print:bg-transparent print:static print:flex print:items-start print:justify-center print:pt-10"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden flex flex-col relative animate-scaleIn print:shadow-none print:w-[180mm] print:max-w-none print:border-2 print:border-slate-200" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>

        {/* Close button */}
        <button
          onClick={onClose}
          autoFocus
          className="absolute top-4 right-4 w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-all active-scale print:hidden focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Close receipt"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {/* Header */}
        <div className="bg-primary/90 text-white px-6 pt-8 pb-6 text-center">
          <span className="material-symbols-outlined text-5xl mb-2 print:hidden">verified</span>
          <h2 className="text-xl font-extrabold tracking-tight">
            Parthbhoomi CHS
          </h2>
          <p className="text-xs text-blue-200 mt-1 font-medium">
            Society Maintenance Receipt · FY {year || ''}
          </p>
        </div>

        {/* Receipt body */}
        <div className="p-6 flex-1 space-y-5 print:px-2">

          {/* Amount hero */}
          <div className="text-center pb-4 border-b border-dashed border-slate-200">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Amount Received</p>
            <p className="text-4xl font-extrabold text-on-surface mt-1 tracking-tight">
              ₹{(amount || 0).toLocaleString('en-IN')}
            </p>
            <div className="flex items-center justify-center gap-1.5 mt-2">
              <span className="material-symbols-outlined text-emerald-500 text-base">verified</span>
              <span className="text-xs text-emerald-600 font-bold">Payment Fully Cleared</span>
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-y-4 gap-x-4">
            {[
              { label: 'Tenement No.',   value: `Unit ${tenementNumber}` },
              { label: 'Resident Name',  value: ownerName },
              { label: 'For Month',      value: `${month} ${year || ''}`.trim() },
              { label: 'Cleared Date',   value: formatDate(dateCleared) },
              { label: 'Transaction ID', value: reference || 'N/A', mono: true, highlight: true },
              { label: 'Payment Mode',   value: method || 'Cheque / Cash' },
            ].map(({ label, value, mono, highlight }) => (
              <div key={label}>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{label}</p>
                <p className={`font-semibold text-sm mt-0.5 ${mono ? 'font-mono' : ''} ${highlight ? 'text-primary' : 'text-on-surface'}`}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Declaration + signatures */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <p className="text-[11px] text-on-surface-variant leading-relaxed text-center">
              This receipt is electronically generated upon manual validation by the{' '}
              Parthbhoomi Society Management Committee. No online gateway is involved.
            </p>
            <div className="flex justify-between items-end pt-2">
              <div>
                <div className="h-6 w-24 border-b border-slate-300 mb-1" />
                <p className="text-[10px] text-on-surface-variant">Signature of Payee</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-extrabold text-primary font-mono select-none">
                  PARTHBHOOMI_CHS
                </p>
                <p className="text-[10px] text-on-surface-variant">Authorized Signatory</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-3 print:hidden">
          <p className="text-[10px] text-on-surface-variant font-medium">
            Ref: <span className="font-mono font-bold text-primary">{reference}</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 bg-white text-on-surface text-xs font-bold rounded-xl hover:bg-slate-50 transition-all active-scale focus:outline-none"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-primary/80 text-white text-xs font-bold rounded-xl shadow-soft hover:bg-primary flex items-center gap-1.5 transition-all active-scale focus:outline-none"
            >
              <span className="material-symbols-outlined text-sm">print</span>
              Print
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
}
