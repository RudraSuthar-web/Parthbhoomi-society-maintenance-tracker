import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { CURRENT_YEAR } from '../utils/dateUtils';

export default function Login({ navigate }) {
  const { login, registerTenement, user } = useContext(AppContext);

  const [activeTab, setActiveTab]   = useState('signin');

  // Sign In
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showSignInPw, setShowSignInPw] = useState(false);

  // Register
  const [regUnit, setRegUnit]                       = useState('');
  const [regName, setRegName]                       = useState('');
  const [regContact, setRegContact]                 = useState('');
  const [regPassword, setRegPassword]               = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPw, setShowRegPw]                   = useState(false);
  const [showRegConfirmPw, setShowRegConfirmPw]     = useState(false);

  const [errorMsg, setErrorMsg]     = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? 'overview' : 'dashboard');
    }
  }, [user, navigate]);

  const clearMessages = () => { setErrorMsg(''); setSuccessMsg(''); };

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMsg('Please enter both Tenement/Admin ID and password.');
      return;
    }
    setIsSubmitting(true);
    clearMessages();

    try {
      const result = await login(username, password);
      setIsSubmitting(false);
      if (result && result.success) {
        navigate(result.user.role === 'admin' ? 'overview' : 'dashboard');
      } else {
        setErrorMsg(result?.message || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg('Login request failed. Please check backend connection.');
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!regUnit.trim() || !regName.trim() || !regContact.trim() || !regPassword || !regConfirmPassword) {
      setErrorMsg('Please fill in all registration fields.');
      return;
    }
    const trimmed = regUnit.trim();
    if (!/^\d+$/.test(trimmed)) {
      setErrorMsg('Tenement number must be numeric only (e.g. 42).');
      return;
    }
    const num = parseInt(trimmed, 10);
    if (num < 1 || num > 60) {
      setErrorMsg('Tenement number must be between 1 and 60.');
      return;
    }
    if (regContact.trim().length < 10) {
      setErrorMsg('Please enter a valid contact number (min. 10 digits).');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    clearMessages();

    setTimeout(() => {
      const result = registerTenement(regUnit, regName, regContact, regPassword);
      setIsSubmitting(false);
      if (result.success) {
        setSuccessMsg('Registration successful! Signing you in…');
        setTimeout(() => navigate('dashboard'), 900);
      } else {
        setErrorMsg(result.message);
      }
    }, 400);
  };

  const setDemoCredentials = (u, p) => {
    setActiveTab('signin');
    setUsername(u);
    setPassword(p);
    clearMessages();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex flex-col justify-center items-center p-4">
      
      {/* Brand */}
      <div className="flex flex-col items-center mb-7 text-center">
        
        <h1 className="font-display-lg text-on-surface font-extrabold tracking-tight leading-none">
          Parthbhoomi
        </h1>
        <p className="text-sm text-on-surface-variant font-medium mt-2">
          Co-operative Housing Society · Maintenance Tracker
        </p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden">

       

        <div className="p-6 space-y-5">
          {/* Error / Success alerts */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-error text-xs font-semibold p-3.5 rounded-xl flex items-start gap-2 animate-fadeIn">
              <span className="material-symbols-outlined text-base mt-0.5 flex-shrink-0">error</span>
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold p-3.5 rounded-xl flex items-start gap-2 animate-fadeIn">
              <span className="material-symbols-outlined text-base mt-0.5 flex-shrink-0">check_circle</span>
              <span>{successMsg}</span>
            </div>
          )}

          {/* ── SIGN IN FORM ── */}
          {activeTab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4 animate-fadeIn" noValidate>
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Tenement Number / Admin ID
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">badge</span>
                  <input
                    type="text"
                    autoComplete="username"
                    placeholder="tenement no."
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setErrorMsg(''); }}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 bg-slate-50 text-on-surface rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary/20 transition-all font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">lock</span>
                  <input
                    type={showSignInPw ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrorMsg(''); }}
                    className="w-full pl-10 pr-10 py-2.5 border border-slate-200 bg-slate-50 text-on-surface rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary/20 transition-all font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignInPw(!showSignInPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                    tabIndex={-1}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showSignInPw ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-soft hover:bg-primary-container flex items-center justify-center gap-2 transition-all active-scale disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign In Securely
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ── REGISTER FORM ──
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4 animate-fadeIn" noValidate>
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Resident Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rohan Mehta"
                  value={regName}
                  onChange={(e) => { setRegName(e.target.value); setErrorMsg(''); }}
                  className="w-full px-3.5 py-2.5 border border-slate-200 bg-slate-50 text-on-surface rounded-xl text-xs font-semibold focus:outline-none focus:border-primary focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Tenement Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 42 (1–60)"
                    value={regUnit}
                    onChange={(e) => { setRegUnit(e.target.value); setErrorMsg(''); }}
                    className="w-full px-3.5 py-2.5 border border-slate-200 bg-slate-50 text-on-surface rounded-xl text-xs font-semibold focus:outline-none focus:border-primary focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Contact Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 99887 76655"
                    value={regContact}
                    onChange={(e) => { setRegContact(e.target.value); setErrorMsg(''); }}
                    className="w-full px-3.5 py-2.5 border border-slate-200 bg-slate-50 text-on-surface rounded-xl text-xs font-semibold focus:outline-none focus:border-primary focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPw ? 'text' : 'password'}
                      placeholder="Min. 6 characters"
                      autoComplete="new-password"
                      value={regPassword}
                      onChange={(e) => { setRegPassword(e.target.value); setErrorMsg(''); }}
                      className="w-full pl-3.5 pr-9 py-2.5 border border-slate-200 bg-slate-50 text-on-surface rounded-xl text-xs font-semibold focus:outline-none focus:border-primary focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPw(!showRegPw)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                      tabIndex={-1}
                    >
                      <span className="material-symbols-outlined text-base">{showRegPw ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Confirm Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showRegConfirmPw ? 'text' : 'password'}
                      placeholder="Repeat password"
                      autoComplete="new-password"
                      value={regConfirmPassword}
                      onChange={(e) => { setRegConfirmPassword(e.target.value); setErrorMsg(''); }}
                      className={`w-full pl-3.5 pr-9 py-2.5 border rounded-xl text-xs font-semibold focus:outline-none focus:bg-white transition-all ${
                        regConfirmPassword && regPassword !== regConfirmPassword
                          ? 'border-red-300 bg-red-50 focus:border-red-400'
                          : 'border-slate-200 bg-slate-50 focus:border-primary'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegConfirmPw(!showRegConfirmPw)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                      tabIndex={-1}
                    >
                      <span className="material-symbols-outlined text-base">{showRegConfirmPw ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                  {regConfirmPassword && regPassword !== regConfirmPassword && (
                    <p className="text-[10px] text-error font-semibold mt-1">Passwords don't match</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-soft hover:bg-primary-container flex items-center justify-center gap-2 transition-all active-scale disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Registering Unit…
                  </>
                ) : (
                  <>
                    Register & Sign In
                    <span className="material-symbols-outlined text-sm">app_registration</span>
                  </>
                )}
              </button>
            </form>
          )} */}

        
        </div>
      </div>

      {/* Footer */}
      <p className="text-[15px] text-slate-400 mt-5">© {CURRENT_YEAR} Parthbhoomi CHS · All rights reserved</p>
    </div>
  );
}
