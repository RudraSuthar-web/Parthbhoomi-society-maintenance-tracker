import React, { useState, useContext, useEffect } from 'react';
import { 
  Building2, 
  AlertCircle, 
  CheckCircle2, 
  IdCard, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight 
} from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { CURRENT_YEAR } from '../utils/dateUtils';
import SOCIETY_CONFIG from '../config/societyConfig';
import ThemeToggle from '../components/ui/ThemeToggle';

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
      setErrorMsg(err.message || 'Login request failed. Please check backend connection.');
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
    if (num < 1 || num > SOCIETY_CONFIG.maxTenements) {
      setErrorMsg(`Tenement number must be between 1 and ${SOCIETY_CONFIG.maxTenements}.`);
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
    <div className="h-[100dvh] w-full bg-zinc-950 flex flex-col lg:flex-row overflow-hidden font-sans select-none">
      
      {/* ── LEFT HERO PANEL: Compact on Mobile, Full-Height on Desktop ── */}
      <div className="w-full lg:w-7/12 relative bg-zinc-900 text-white flex-shrink-0 lg:flex-1 h-[340px]  lg:h-full flex flex-col justify-between p-5 sm:p-6 lg:p-14 overflow-hidden border-b lg:border-b-0 lg:border-r border-zinc-800/80">
        {/* High-res background building grid image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-100 hover:scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1920&q=80')`
          }}
        />
        {/* Modern dark architectural overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/75 to-zinc-900/40" />
        <div className="absolute inset-0 bg-zinc-950/30 backdrop-blur-[0.5px]" />

       
        {/* Top brand identity */}
        <div className="relative z-10 flex hidden lg:block items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="h-8 w-8 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-lg">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <span className="text-[13px] sm:text-[15px] font-mono font-semibold tracking-widest uppercase text-blue-300 block leading-tight">
                Society Portal
              </span>
              <p className="text-lg  lg:text-lg font-black text-white leading-tight truncate max-w-[200px] sm:max-w-none">
                {SOCIETY_CONFIG.name}
              </p>
            </div>
          </div>

          
        </div>

        {/* Hero headline & feature showcase (Desktop only to prevent mobile scrolling) */}
        <div className="relative z-10  max-w-xl py-8 lg:py-0 my-auto">
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Society Maintenance & Accounts
          </h1>
          <p className="text-sm sm:text-base hidden lg:block text-zinc-300 mt-3 sm:mt-4 font-normal leading-relaxed">
            Transparent annual dues ledger, instant verification, expense audits, and official digital receipts built for society members and committees.
          </p>

          {/* Quick Pillars */}
          <div className="grid grid-cols-3  gap-4 sm:gap-6 mt-8 pt-6 border-t border-white/15">
            <div>
              <p className="text-[11px] text-zinc-400 font-mono uppercase tracking-wider">Ledger</p>
              <p className="text-[13px] lg:text-sm font-bold text-white mt-1">Real-time Dues</p>
            </div>
            <div>
              <p className="text-[11px] text-zinc-400 font-mono uppercase tracking-wider">Receipts</p>
              <p className="text-[13px] lg:text-sm font-bold text-white mt-1">Digital Sign</p>
            </div>
            <div>
              <p className="text-[11px] text-zinc-400 font-mono uppercase tracking-wider">Audits</p>
              <p className="text-[13px] lg:text-sm font-bold text-white mt-1">Clear Bills</p>
            </div>
          </div>
        </div>

        {/* Hero footer tag */}
        <div className="relative z-10 hidden lg:flex items-center justify-between text-xs text-zinc-400 font-mono pt-4">
          <span>{SOCIETY_CONFIG.subtitle}</span>
        </div>
      </div>

      {/* ── RIGHT PANEL: Compact, Zero-Scroll Form Container ── */}
      <div className="w-full lg:w-5/12 bg-white dark:bg-zinc-900 border-l border-transparent dark:border-zinc-800 flex flex-col justify-between p-4 sm:p-8 lg:p-14 flex-1 min-h-0 overflow-y-auto no-scrollbar transition-colors duration-200">
        <div className="max-w-md w-full mx-auto my-auto space-y-8 sm:space-y-8 lg:space-y-5">
          
          {/* Header with ThemeToggle */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl lg:text-xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Welcome back
              </h2>
              <p className="text-sm lg:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Please enter your tenement unit number or admin ID.
              </p>
            </div>
           
          </div>

          {/* Error / Success alerts */}
          {errorMsg && (
            <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-xs font-medium p-2.5 sm:p-3 rounded-xl flex items-start gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <span className="leading-snug">{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-xs font-semibold p-2.5 sm:p-3 rounded-xl flex items-start gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleSignIn} className="space-y-6 lg:space-y-3" noValidate>
            <div>
              <label className="block text-sm lg:text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                Tenement Number / Admin ID
              </label>
              <div className="relative">
                <IdCard className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                <input
                  type="text"
                  autoComplete="username"
                  placeholder={`e.g. 42 (1–${SOCIETY_CONFIG.maxTenements}) or ADMIN-01`}
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setErrorMsg(''); }}
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3.5 border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 hover:bg-zinc-50/80 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400 focus:bg-white dark:focus:bg-zinc-800 focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-white/10 transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm lg:text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                <input
                  type={showSignInPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrorMsg(''); }}
                  className="w-full pl-10 pr-10 py-2.5 sm:py-3.5 border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 hover:bg-zinc-50/80 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400 focus:bg-white dark:focus:bg-zinc-800 focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-white/10 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowSignInPw(!showSignInPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1 transition-colors"
                  tabIndex={-1}
                  aria-label="Toggle password visibility"
                >
                  {showSignInPw ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 sm:py-3.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 rounded-xl text-sm lg:text-xs font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none mt-1 sm:mt-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Authenticating…
                </>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <span>---&gt;</span>
                </>
              )}
            </button>
          </form>

        </div>

        {/* Footer */}
        <div className="max-w-md w-full mx-auto pt-2 sm:pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[10px] sm:text-[11px] text-zinc-400 dark:text-zinc-500 flex-shrink-0">
          <p>© {CURRENT_YEAR} {SOCIETY_CONFIG.shortName}</p>
          <p className="font-mono">Secure Society Portal</p>
        </div>
      </div>

    </div>
  );
}
