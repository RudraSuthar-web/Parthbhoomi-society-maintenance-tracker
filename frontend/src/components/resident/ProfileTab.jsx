import React from 'react';
import AlertBanner from '../ui/AlertBanner';

/**
 * ProfileTab — Resident "My Profile" tab.
 * Displays profile card and edit form.
 */
export default function ProfileTab({
  tenementData,
  profileName, setProfileName,
  profileContact, setProfileContact,
  profileSuccess, profileError,
  onSave,
}) {
  return (
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

      {/* Edit form */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-soft p-5 sm:p-6 space-y-5">
        <div>
          <h3 className="font-headline-md text-on-surface font-extrabold">Edit Profile</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">Update your resident name and contact details</p>
        </div>

        <AlertBanner type="success" message={profileSuccess} />
        <AlertBanner type="error"   message={profileError} />

        <form onSubmit={onSave} className="space-y-4">
          {/* Tenement Number — read only */}
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

          {/* Name */}
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Resident Full Name
            </label>
            <input
              type="text"
              value={profileName}
              onChange={e => setProfileName(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 bg-white text-on-surface rounded-lg text-xs font-semibold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
              placeholder="e.g. Nilesh Kadam"
            />
          </div>

          {/* Contact */}
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Contact Number
            </label>
            <input
              type="tel"
              value={profileContact}
              onChange={e => setProfileContact(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 bg-white text-on-surface rounded-lg text-xs font-semibold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
              placeholder="+91 99887 76655"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-primary text-white text-xs font-bold rounded-lg shadow-soft hover:bg-primary-container flex items-center justify-center gap-1.5 transition-all active-scale"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
