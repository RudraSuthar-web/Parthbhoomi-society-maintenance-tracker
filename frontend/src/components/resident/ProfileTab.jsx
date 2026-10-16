import React, { useState, useContext } from 'react';
import AlertBanner from '../ui/AlertBanner';
import SOCIETY_CONFIG from '../../config/societyConfig';
import { AppContext } from '../../context/AppContext';
import { 
  Building2, 
  User, 
  Phone, 
  ShieldCheck, 
  Lock, 
  Check, 
  RotateCcw, 
  BadgeCheck,
  HelpCircle,
  KeyRound,
  Eye,
  EyeOff,
  ChevronDown,
  ShieldAlert
} from 'lucide-react';

/**
 * ProfileTab — Profile & Account Security for Residents & Admins.
 * Allows updating contact details (for residents) and changing password (for both).
 */
export default function ProfileTab({
  tenementData,
  profileName = '', setProfileName,
  profileContact = '', setProfileContact,
  profileSuccess = '', profileError = '',
  onSave,
}) {
  const { user, changePassword } = useContext(AppContext);
  const isAdmin = user?.role === 'admin';

  // Responsive Collapsible States (for smaller devices, default collapsed or expanded based on role/needs)
  const [isProfileOpen, setIsProfileOpen] = useState(true);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  // Profile Details State
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);

  // Password Change State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdError, setPwdError] = useState('');

  // Check if profile form has unsaved edits
  const initialName = tenementData?.ownerName || (isAdmin ? (user?.name || 'Administrator') : '');
  const initialContact = tenementData?.contact || '';
  const hasChanges = (profileName.trim() !== initialName.trim()) || (profileContact.trim() !== initialContact.trim());

  const handleResetProfile = () => {
    if (setProfileName) setProfileName(initialName);
    if (setProfileContact) setProfileContact(initialContact);
  };

  const handleProfileSubmit = async (e) => {
    if (!onSave) return;
    setIsSubmittingProfile(true);
    await onSave(e);
    setIsSubmittingProfile(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwdSuccess('');
    setPwdError('');

    if (!oldPassword.trim()) {
      setPwdError('Please enter your current password.');
      return;
    }
    if (!newPassword.trim()) {
      setPwdError('Please enter your new password.');
      return;
    }
    if (newPassword.length < 4) {
      setPwdError('New password must be at least 4 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError('New password and confirmation do not match.');
      return;
    }
    if (oldPassword === newPassword) {
      setPwdError('New password cannot be identical to current password.');
      return;
    }

    setPwdLoading(true);
    const res = await changePassword(oldPassword, newPassword);
    setPwdLoading(false);

    if (res.success) {
      setPwdSuccess('Password changed successfully! Keep it safe.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwdSuccess(''), 4000);
    } else {
      setPwdError(res.message || 'Failed to change password.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn pb-12">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-on-surface dark:text-zinc-100 tracking-tight">
            {isAdmin ? 'Administrator Profile' : 'Resident Profile'}
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant dark:text-zinc-400 mt-0.5">
            {isAdmin 
              ? 'Manage administrator credentials and account security settings.' 
              : 'Manage your personal contact details, verified tenement membership, and password.'}
          </p>
        </div>
      </div>

      {/* ── 2-COLUMN LAYOUT ON LARGE SCREENS ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Identity & Membership Details (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Identity Hero Card */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-soft overflow-hidden transition-colors">
            {/* Clean Header */}
            <div className="relative bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800 p-6 overflow-hidden">
              <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-slate-50 dark:bg-white/5 blur-2xl pointer-events-none" />
              <Building2 className="absolute right-3 bottom-1 w-24 h-24 text-slate-200/50 dark:text-white/5 pointer-events-none select-none stroke-[0.8]" />

              <div className="relative z-10 flex items-center gap-4">
                {/* Avatar Badge */}
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center font-extrabold text-2xl text-on-surface dark:text-zinc-100 shadow-sm">
                    {isAdmin ? 'A' : (tenementData?.tenementNumber || user?.username)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900 flex items-center justify-center shadow-xs" title="Verified Account">
                    <Check className="w-3 h-3 text-white stroke-[3]" />
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-base sm:text-lg font-extrabold text-on-surface dark:text-zinc-100 leading-tight truncate">
                      {isAdmin ? (user?.name || 'Administrator') : (tenementData?.ownerName || 'Resident Member')}
                    </h2>
                    <BadgeCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" title="Verified Account" />
                  </div>
                  <p className="text-xs text-on-surface-variant dark:text-zinc-400 font-medium mt-0.5">
                    {isAdmin ? 'System Administrator' : `Unit ${tenementData?.tenementNumber || user?.username}`} · {SOCIETY_CONFIG.name}
                  </p>
                  <p className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 mt-1">
                    {isAdmin 
                      ? 'Username: ' + user?.username 
                      : (tenementData?.contact ? `+91 ${tenementData.contact.replace(/^(\+91|91)/, '')}` : 'No phone linked')}
                  </p>
                </div>
              </div>
            </div>

            {/* Meta Strip List */}
            <div className="p-5 divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <span className="font-bold text-on-surface-variant dark:text-zinc-400 uppercase tracking-wider text-[11px]">
                  {isAdmin ? 'Admin ID' : 'Unit Number'}
                </span>
                <span className="font-extrabold font-mono text-on-surface dark:text-zinc-100">
                  {isAdmin ? user?.username : `Unit #${tenementData?.tenementNumber || user?.username}`}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="font-bold text-on-surface-variant dark:text-zinc-400 uppercase tracking-wider text-[11px]">Society Wing</span>
                <span className="font-semibold text-on-surface dark:text-zinc-200">
                  {SOCIETY_CONFIG.shortName} Residential
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="font-bold text-on-surface-variant dark:text-zinc-400 uppercase tracking-wider text-[11px]">Account Role</span>
                <span className="inline-flex items-center gap-1 font-bold text-primary dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {isAdmin ? 'Administrator' : 'Resident Member'}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="font-bold text-on-surface-variant dark:text-zinc-400 uppercase tracking-wider text-[11px]">Society Code</span>
                <span className="font-bold font-mono text-on-surface dark:text-zinc-200">
                  {SOCIETY_CONFIG.code || 'CHS'}
                </span>
              </div>
            </div>
          </div>

          {/* Guidance Card */}
          <div className="bg-slate-50/80 dark:bg-zinc-900/60 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 flex items-center justify-center flex-shrink-0 text-primary dark:text-zinc-300">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-on-surface dark:text-zinc-200">
                {isAdmin ? 'Password & Credentials Policy' : 'Need to update ownership?'}
              </h4>
              <p className="text-[11px] font-mono sm:text-xs text-on-surface-variant dark:text-zinc-400 mt-0.5 leading-relaxed">
                {isAdmin 
                  ? 'Use strong, unique passwords for administrator accounts'
                  : 'Unit reassignments or tenant changeovers require society committee approval. Please connect with the administrator desk.'}
              </p>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Edit Forms (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Form 1: Edit Contact Details (Residents Only) */}
          {!isAdmin && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-soft overflow-hidden transition-colors">
              {/* Header with mobile collapse toggle */}
              <button
                type="button"
                onClick={() => setIsProfileOpen(prev => !prev)}
                className="w-full p-6 sm:p-7 text-left flex items-start justify-between gap-4  cursor-pointer lg:cursor-default"
                aria-expanded={isProfileOpen}
              >
                <div>
                  <h3 className="font-headline-md text-base sm:text-lg text-on-surface dark:text-zinc-100 font-extrabold flex items-center gap-2">
                    <User className="w-4 h-4 text-primary dark:text-zinc-300" />
                    Edit Profile Details
                  </h3>
                  <p className="text-xs hidden lg:block  sm:text-sm text-on-surface-variant dark:text-zinc-400 mt-1">
                    Update your registered resident name and primary phone number.
                  </p>
                </div>

                {/* Mobile Expand / Collapse Arrow (hidden on desktop where it's always expanded) */}
                <div className="lg:hidden p-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {/* Collapsible Body on mobile, always visible on lg */}
              <div className={`p-6 sm:p-7 pt-0 sm:pt-0 space-y-6 border-t border-slate-100 dark:border-zinc-800/80 mt-0 ${isProfileOpen ? 'block' : 'hidden lg:block'}`}>
                <div className="pt-4">
                  <AlertBanner type="success" message={profileSuccess} />
                  <AlertBanner type="error"   message={profileError} />
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-5">
                  {/* Tenement Number (Locked) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-on-surface-variant dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                        Tenement Number
                      </label>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Admin locked
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        readOnly
                        value={`Unit ${tenementData?.tenementNumber || ''} — ${SOCIETY_CONFIG.name}`}
                        className="w-full pl-3.5 pr-10 py-2.5 border border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-800/50 text-slate-500 dark:text-zinc-400 rounded-xl text-xs sm:text-sm font-mono font-medium cursor-not-allowed outline-none select-none"
                      />
                      <Lock className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Resident Full Name */}
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                        Resident Full Name
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={profileName}
                        onChange={e => setProfileName && setProfileName(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-on-surface dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:border-primary dark:focus:border-white focus:ring-2 focus:ring-primary/10 dark:focus:ring-white/10 transition-all"
                        placeholder="e.g. Desai Siddhraj"
                      />
                    </div>
                  </div>

                  {/* Contact Number */}
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                        Primary Contact Number
                      </span>
                    </label>
                    <div className="relative flex">
                      <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/80 text-xs font-mono font-bold text-slate-500 dark:text-zinc-400 select-none">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={profileContact.replace(/^(\+91|91)/, '').replace(/\D/g, '')}
                        onChange={e => setProfileContact && setProfileContact(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-on-surface dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 rounded-r-xl text-xs sm:text-sm font-mono font-semibold focus:outline-none focus:border-primary dark:focus:border-white focus:ring-2 focus:ring-primary/10 dark:focus:ring-white/10 transition-all"
                        placeholder="8780807216"
                      />
                    </div>
                    <p className="text-[10px] text-on-surface-variant dark:text-zinc-500 mt-1 font-mono">
                      Used for SMS notifications, payment receipt dispatch, and emergency notices.
                    </p>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2.5">
                    {hasChanges && (
                      <button
                        type="button"
                        onClick={handleResetProfile}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-on-surface-variant dark:text-zinc-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all active:scale-95 flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset
                      </button>
                    )}

                    <button
                      type="submit"
                      disabled={!hasChanges || isSubmittingProfile}
                      className="px-6 py-2.5 bg-primary dark:bg-white text-white dark:text-zinc-950 text-xs sm:text-sm font-bold rounded-xl shadow-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSubmittingProfile ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Form 2: Change Password (For Both Resident and Admin) */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-soft overflow-hidden transition-colors">  
            {/* Header with mobile collapse toggle */}
            <button
              type="button"
              onClick={() => setIsPasswordOpen(prev => !prev)}
              className="w-full p-6 sm:p-7 text-left flex items-start justify-between gap-4  cursor-pointer lg:cursor-default"
              aria-expanded={isPasswordOpen}
            >
              <div>
                <h3 className="font-headline-md text-base sm:text-lg text-on-surface dark:text-zinc-100 font-extrabold flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-primary dark:text-zinc-300" />
                  Change Password
                </h3>
                <p className="text-xs sm:text-sm hidden lg:block text-on-surface-variant dark:text-zinc-400 mt-1">
                  Update your login password. You will need your current password to confirm this change.
                </p>
              </div>

              {/* Mobile Expand / Collapse Arrow (hidden on desktop where it's always expanded) */}
              <div className="lg:hidden p-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isPasswordOpen ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {/* Collapsible Body on mobile, always visible on lg */}
            <div className={`p-6 sm:p-7 pt-0 sm:pt-0 space-y-6 border-t border-slate-100 dark:border-zinc-800/80 mt-0 ${isPasswordOpen ? 'block' : 'hidden lg:block'}`}>
              <div className="pt-4">
                <AlertBanner type="success" message={pwdSuccess} />
                <AlertBanner type="error"   message={pwdError} />
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-[11px] font-bold text-on-surface-variant dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showOldPassword ? "text" : "password"}
                      value={oldPassword}
                      onChange={e => {
                        setOldPassword(e.target.value);
                        if (pwdError) setPwdError('');
                      }}
                      className="w-full pl-3.5 pr-10 py-2.5 border border-slate-200 font-mono dark:border-zinc-700 bg-white dark:bg-zinc-800 text-on-surface dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-primary dark:focus:border-white focus:ring-2 focus:ring-primary/10 dark:focus:ring-white/10 transition-all"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors"
                    >
                      {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={e => {
                          setNewPassword(e.target.value);
                          if (pwdError) setPwdError('');
                        }}
                        className="w-full pl-3.5 pr-10 py-2.5 border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-on-surface dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:border-primary dark:focus:border-white focus:ring-2 focus:ring-primary/10 dark:focus:ring-white/10 transition-all"
                        placeholder="At least 4 char."
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={e => {
                          setConfirmPassword(e.target.value);
                          if (pwdError) setPwdError('');
                        }}
                        className="w-full pl-3.5 pr-10 py-2.5 border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-on-surface dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:border-primary dark:focus:border-white focus:ring-2 focus:ring-primary/10 dark:focus:ring-white/10 transition-all"
                        placeholder="Repeat new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Password Requirement Hint */}
                <p className="text-[11px] text-on-surface-variant dark:text-zinc-500 font-mono">
                  Hint: Passwords must be at least 4 characters long. Make sure to keep your password secure.
                </p>

                {/* Password Submit Action */}
                <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex justify-end">
                  <button
                    type="submit"
                    disabled={pwdLoading}
                    className="px-6 py-2.5 bg-primary dark:bg-white text-white dark:text-zinc-950 text-xs sm:text-sm font-bold rounded-xl shadow-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {pwdLoading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>Update Password</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}



