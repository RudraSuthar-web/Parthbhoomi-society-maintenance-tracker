import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';

export default function Login({ navigate }) {
  const { login, registerTenement, user } = useContext(AppContext);
  
  // Tab toggle state: 'signin' or 'register'
  const [activeTab, setActiveTab] = useState('signin');
  
  // Sign In state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Register state
  const [regUnit, setRegUnit] = useState('');
  const [regContact, setRegContact] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If user is already logged in, redirect immediately
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('overview');
      } else {
        navigate('dashboard');
      }
    }
  }, [user, navigate]);

  const handleSignIn = (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMsg('Please enter both Tenement/Admin ID and password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    setTimeout(() => {
      const result = login(username, password);
      setIsSubmitting(false);
      if (result.success) {
        if (result.user.role === 'admin') {
          navigate('overview');
        } else {
          navigate('dashboard');
        }
      } else {
        setErrorMsg(result.message);
      }
    }, 400);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!regUnit.trim() || !regContact.trim() || !regPassword || !regConfirmPassword) {
      setErrorMsg('Please fill in all the registration fields.');
      return;
    }

    // Format check (1-60 digits only)
    const trimmed = regUnit.trim();
    if (!/^\d+$/.test(trimmed)) {
      setErrorMsg('Tenement number must contain digits only (no characters).');
      return;
    }
    const num = parseInt(trimmed, 10);
    if (num < 1 || num > 60) {
      setErrorMsg('Tenement number must be between 1 and 60.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    setTimeout(() => {
      const result = registerTenement(regUnit, regContact, regPassword);
      setIsSubmitting(false);
      
      if (result.success) {
        setSuccessMsg('Registration successful! Logging you in...');
        
        // Clear inputs
        setRegUnit('');
        setRegContact('');
        setRegPassword('');
        setRegConfirmPassword('');
        
        setTimeout(() => {
          navigate('dashboard');
        }, 1000);
      } else {
        setErrorMsg(result.message);
      }
    }, 500);
  };

  const setDemoCredentials = (u, p) => {
    setActiveTab('signin');
    setUsername(u);
    setPassword(p);
    setErrorMsg('');
    setSuccessMsg('');
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center items-center p-4">
      {/* Brand logo container */}
      <div className="flex flex-col items-center mb-6 text-center max-w-sm">
        <div className="w-16 h-16 rounded-lg bg-primary text-white flex items-center justify-center mb-3 shadow-soft">
          <span className="material-symbols-outlined text-4xl">domain</span>
        </div>
        <h1 className="font-display-lg text-on-surface font-extrabold tracking-tight m-0 leading-none">
          Parthbhoomi
        </h1>
        <p className="font-body-md text-on-surface-variant font-medium mt-1">
          Society Maintenance Ledger & Record Tracker
        </p>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-soft max-w-md w-full overflow-hidden">
        {/* Toggle tabs */}
        <div className="flex border-b border-[#E2E8F0] bg-surface-container bg-opacity-40">
          <button
            onClick={() => {
              setActiveTab('signin');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-wider text-center transition-all ${
              activeTab === 'signin'
                ? 'bg-white border-b-2 border-primary text-primary'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high bg-opacity-20'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-wider text-center transition-all ${
              activeTab === 'register'
                ? 'bg-white border-b-2 border-primary text-primary'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high bg-opacity-20'
            }`}
          >
            Register Unit
          </button>
        </div>

        <div className="p-6 space-y-6">
          {errorMsg && (
            <div className="bg-error-container text-error text-xs font-semibold p-3.5 rounded border border-transparent flex items-start space-x-2">
              <span className="material-symbols-outlined text-base mt-0.5">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-success-container text-success text-xs font-semibold p-3.5 rounded border border-transparent flex items-start space-x-2">
              <span className="material-symbols-outlined text-base mt-0.5">check_circle</span>
              <span>{successMsg}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {activeTab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Tenement Number / Admin ID
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-lg">
                    key
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. 42 or ADMIN-01"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-outline-variant bg-surface text-on-surface rounded text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-lg">
                    lock
                  </span>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-outline-variant bg-surface text-on-surface rounded text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-primary text-white rounded text-sm font-bold shadow-soft hover:bg-primary-container flex items-center justify-center space-x-1.5 transition-all duration-200 active-scale disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSubmitting ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <span>Sign In Securely</span>
                    <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* REGISTER TENEMENT FORM */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                  Tenement Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 42 (Number between 1-60)"
                  value={regUnit}
                  onChange={(e) => setRegUnit(e.target.value)}
                  className="w-full px-3.5 py-2 border border-outline-variant bg-surface text-on-surface rounded text-xs font-semibold focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                  Contact Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. +91 99887 76655"
                  value={regContact}
                  onChange={(e) => setRegContact(e.target.value)}
                  className="w-full px-3.5 py-2 border border-outline-variant bg-surface text-on-surface rounded text-xs font-semibold focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-3.5 py-2 border border-outline-variant bg-surface text-on-surface rounded text-xs font-semibold focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2 border border-outline-variant bg-surface text-on-surface rounded text-xs font-semibold focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-primary text-white rounded text-sm font-bold shadow-soft hover:bg-primary-container flex items-center justify-center space-x-1.5 transition-all duration-200 active-scale disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Registering Unit...</span>
                ) : (
                  <>
                    <span>Register and Sign In</span>
                    <span className="material-symbols-outlined text-sm font-bold">app_registration</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Demo profiles help drawer */}
          <div className="pt-4 border-t border-[#E2E8F0] space-y-2">
            <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
              Demo Presets for Testing:
            </p>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => setDemoCredentials('42', 'password')}
                className="flex items-center justify-between text-left p-2.5 bg-surface hover:bg-surface-container-high rounded border border-[#E2E8F0] text-xs font-semibold text-on-surface transition-all active-scale"
              >
                <div className="flex items-center space-x-2">
                  <span className="material-symbols-outlined text-sm text-error">warning</span>
                  <div>
                    <p className="font-bold text-on-surface">Unit 42 (Rohan)</p>
                    <p className="text-[10px] text-on-surface-variant">Resident (Unpaid State)</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-outline-variant">Use Preset</span>
              </button>

              <button
                onClick={() => setDemoCredentials('ADMIN-01', 'password')}
                className="flex items-center justify-between text-left p-2.5 bg-surface hover:bg-surface-container-high rounded border border-[#E2E8F0] text-xs font-semibold text-on-surface transition-all active-scale"
              >
                <div className="flex items-center space-x-2">
                  <span className="material-symbols-outlined text-sm text-primary">shield_person</span>
                  <div>
                    <p className="font-bold text-on-surface">ADMIN-01 (Treasurer)</p>
                    <p className="text-[10px] text-on-surface-variant">Admin Dashboard</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-outline-variant">Use Preset</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Notice info */}
      <p className="text-[11px] text-on-surface-variant font-medium mt-6 max-w-xs text-center leading-relaxed">
        * No real payment information or gateway details are used. Default demo password is "<span className="font-bold font-mono">password</span>".
      </p>
    </div>
  );
}
