import React from 'react';

export default function DrivePreviewModal({ isOpen, onClose, expense }) {
  if (!isOpen || !expense) return null;

  const { description, amount, date, category, driveLink, billData } = expense;

  // Render a mock PDF invoice/bill if no custom file was uploaded
  const renderSimulatedDocument = () => {
    return (
      <div className="bg-white border border-[#E2E8F0] rounded p-6 shadow-sm max-w-sm mx-auto my-4 text-xs font-sans text-[#434655] select-none">
        {/* Header */}
        <div className="border-b border-outline-variant pb-3 mb-4 text-center">
          <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider">OFFICIAL INVOICE</h4>
          <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">Parthbhoomi Society Expense Records</p>
        </div>

        {/* Invoice details */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span className="font-bold text-on-surface">Invoice ID:</span>
            <span className="font-mono">INV-EXP-{expense.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold text-on-surface">Date:</span>
            <span>{date}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold text-on-surface">Category:</span>
            <span>{category}</span>
          </div>
        </div>

        {/* Bill table */}
        <table className="w-full border-collapse mb-4 text-left">
          <thead>
            <tr className="border-b border-outline-variant">
              <th className="pb-1 font-bold text-on-surface">Description</th>
              <th className="pb-1 text-right font-bold text-on-surface">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2 pr-2 font-medium">{description}</td>
              <td className="py-2 text-right font-semibold">₹{amount.toLocaleString('en-IN')}</td>
            </tr>
            <tr className="border-t border-double border-outline-variant font-bold text-on-surface">
              <td className="pt-2">Total Amount</td>
              <td className="pt-2 text-right">₹{amount.toLocaleString('en-IN')}</td>
            </tr>
          </tbody>
        </table>

        {/* Watermark Stamp */}
        <div className="border border-dashed border-success rounded p-2 text-center text-success uppercase tracking-widest font-extrabold text-[10px] transform -rotate-3 my-2 bg-success bg-opacity-5">
          ✓ Google Drive Stored
        </div>

        <p className="text-[9px] text-on-surface-variant text-center mt-4 leading-relaxed border-t border-[#E2E8F0] pt-2">
          This bill has been archived to the Society's Google Drive at {driveLink.substring(0, 30)}...
        </p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="bg-[#1e1e1e] rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col h-[85vh] text-white">
        
        {/* Google Drive styled top bar */}
        <div className="bg-[#2d2d2d] px-4 py-3 flex items-center justify-between border-b border-[#3d3d3d]">
          {/* File logo & Name */}
          <div className="flex items-center space-x-3.5 min-w-0">
            <span className="material-symbols-outlined text-amber-500 text-2xl" title="Stored in Google Drive">
              add_to_drive
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-bold truncate leading-tight">
                {description.replace(/\s+/g, '_').toLowerCase()}_bill.{billData ? 'jpg' : 'pdf'}
              </h3>
              <p className="text-[10px] text-gray-400 font-semibold flex items-center mt-0.5">
                <span className="material-symbols-outlined text-xs mr-0.5 text-blue-400">cloud_done</span>
                <span>Google Drive Preview</span>
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-3">
            <a
              href={driveLink}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 hover:bg-[#3d3d3d] rounded-full transition-all active-scale text-gray-300 hover:text-white flex items-center justify-center"
              title="Open in Google Drive"
            >
              <span className="material-symbols-outlined text-lg">open_in_new</span>
            </a>
            <button
              onClick={() => window.print()}
              className="p-1.5 hover:bg-[#3d3d3d] rounded-full transition-all active-scale text-gray-300 hover:text-white flex items-center justify-center"
              title="Print"
            >
              <span className="material-symbols-outlined text-lg">print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-[#3d3d3d] rounded-full transition-all active-scale text-gray-300 hover:text-white flex items-center justify-center"
              title="Close Preview"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 p-6 overflow-y-auto bg-[#181818] flex items-center justify-center">
          {billData ? (
            /* Uploaded Image bill */
            <div className="max-w-full max-h-full flex items-center justify-center">
              <img
                src={billData}
                alt="Uploaded Receipt"
                className="max-h-[60vh] max-w-full rounded border border-[#3d3d3d] shadow-lg object-contain bg-white"
              />
            </div>
          ) : (
            /* Simulated PDF bill */
            <div className="w-full">
              {renderSimulatedDocument()}
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="bg-[#2d2d2d] px-4 py-2 border-t border-[#3d3d3d] flex flex-col sm:flex-row sm:justify-between text-[11px] text-gray-400 gap-1.5">
          <span>Date Cleared: <strong>{date}</strong></span>
          <span>Category: <strong>{category}</strong></span>
          <span>Amount: <strong className="text-white">₹{amount.toLocaleString('en-IN')}</strong></span>
        </div>

      </div>
    </div>
  );
}
