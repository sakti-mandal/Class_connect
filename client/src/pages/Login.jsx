import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useAuth, isPhoneNumber, normalizePhone } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

// Default demo OTP
const DEMO_OTP = '123456';

export function Login() {
  const { login, loading } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const [role, setRole] = useState('student');
  const [credential, setCredential] = useState('alex.rivera@university.edu');
  const [password, setPassword] = useState('password123');
  const [loginMode, setLoginMode] = useState('password'); // 'password' | 'otp'
  const [errorMessage, setErrorMessage] = useState('');

  // Phone-OTP state
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);

  const credIsPhone = isPhoneNumber(credential);

  // Role tab switch
  const handleRoleTabChange = selectedRole => {
    setRole(selectedRole);
    setOtpSent(false);
    setOtp('');
    setOtpError('');
    setErrorMessage('');
    if (selectedRole === 'student') setCredential('alex.rivera@university.edu');
    else if (selectedRole === 'faculty') setCredential('sarah.chen@university.edu');
    else if (selectedRole === 'admin') setCredential('robert.sterling@university.edu');
  };

  // Trigger Send OTP
  const handleSendOtp = () => {
    setOtpError('');
    const cleanDigits = normalizePhone(credential);
    if (!cleanDigits || cleanDigits.length < 7) {
      setOtpError('Please enter a valid mobile number (min. 7 digits).');
      return;
    }

    setSendingOtp(true);
    setTimeout(() => {
      // Generate realistic 6-digit OTP
      const code = '123456';
      setGeneratedOtp(code);
      setSendingOtp(false);
      setOtpSent(true);
      setOtpCountdown(30);
      setOtp(code); // Pre-fill or make ready
      addToast(`OTP generated: ${code} (Auto-filled for demo convenience)`, 'info');
    }, 600);
  };

  // Resend Countdown
  useEffect(() => {
    if (otpCountdown <= 0) return;
    const timer = setTimeout(() => setOtpCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [otpCountdown]);

  // Handle Password Submit (Works with Email OR Phone Number)
  const handlePasswordSubmit = async e => {
    e.preventDefault();
    setErrorMessage('');

    if (!credential.trim()) {
      setErrorMessage('Please enter your Email ID or Phone number.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    const res = await login(credential.trim(), password, role);
    if (res.success) {
      addToast(`Welcome back, ${res.user.name}!`, 'success');
      if (res.user.role === 'faculty') navigate('/faculty');
      else if (res.user.role === 'admin') navigate('/admin');
      else navigate('/');
    } else {
      setErrorMessage(res.error || 'Invalid credentials. Please verify your details.');
    }
  };

  // Handle OTP Submit (Accepts any 6 digits or generated OTP)
  const handleOtpSubmit = async e => {
    e.preventDefault();
    setOtpError('');

    const trimmedOtp = otp.trim();
    if (!trimmedOtp || trimmedOtp.length < 4) {
      setOtpError('Please enter the verification OTP code.');
      return;
    }

    // OTP verification succeeds with generatedOtp, DEMO_OTP, or any 6-digit test
    const isValidOtp = trimmedOtp === generatedOtp || trimmedOtp === DEMO_OTP || /^\d{6}$/.test(trimmedOtp);

    if (!isValidOtp) {
      setOtpError(`Invalid OTP. Enter the 6-digit code (${DEMO_OTP}).`);
      return;
    }

    const res = await login(credential.trim(), 'demo', role, true);
    if (res.success) {
      addToast(`Phone verified successfully! Welcome, ${res.user.name}.`, 'success');
      if (res.user.role === 'faculty') navigate('/faculty');
      else if (res.user.role === 'admin') navigate('/admin');
      else navigate('/');
    } else {
      setOtpError(res.error || 'Failed to sign in with phone.');
    }
  };

  // 1-Click Fast Demo Login
  const quickLogin = async (cred, roleVal, path) => {
    setRole(roleVal);
    setCredential(cred);
    const res = await login(cred, 'demo', roleVal);
    if (res.success) {
      addToast(`Logged in as ${res.user.name} (${roleVal})`, 'success');
      navigate(path);
    }
  };

  return (
    <div className="w-full flex items-center justify-center py-6 px-4">
      <div className="max-w-md w-full space-y-5">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 items-center justify-center text-white mx-auto font-bold mb-1 shadow-xl shadow-brand-500/25">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Sign In to ClassConnect
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Access with your <strong>Email ID</strong> or <strong>Phone Number</strong>
          </p>
        </div>

        {/* Auth Glassmorphism Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-7 shadow-2xl border border-white/60 dark:border-slate-800/80 space-y-4">
          {/* Role selector tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-100/90 dark:bg-slate-800/90 text-xs">
            {[
              { key: 'student', label: '🎓 Student' },
              { key: 'faculty', label: '👨‍🏫 Faculty' },
              { key: 'admin', label: '🛡️ Admin' },
            ].map(r => (
              <button
                key={r.key}
                type="button"
                onClick={() => handleRoleTabChange(r.key)}
                className={`py-2 rounded-xl font-medium transition text-xs ${
                  role === r.key
                    ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-md font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Login Mode Toggle: Password vs Phone OTP */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100/60 dark:bg-slate-800/60 text-xs">
            <button
              type="button"
              onClick={() => setLoginMode('password')}
              className={`py-1.5 rounded-lg font-semibold text-center transition ${
                loginMode === 'password'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              🔑 Password Login
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMode('otp');
                if (!credIsPhone) setCredential('9876543210');
              }}
              className={`py-1.5 rounded-lg font-semibold text-center transition ${
                loginMode === 'otp'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              📱 Phone OTP Login
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs">
              {errorMessage}
            </div>
          )}

          {/* MODE 1: PASSWORD LOGIN (Supports Email OR Phone Number) */}
          {loginMode === 'password' ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  {credIsPhone ? (
                    <Phone className="w-3.5 h-3.5 text-brand-500" />
                  ) : (
                    <Mail className="w-3.5 h-3.5 text-brand-500" />
                  )}
                  Email ID or Mobile Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={credential}
                    onChange={e => setCredential(e.target.value)}
                    placeholder="e.g. student@college.edu or 9876543210"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Enter the email or phone number you signed up with
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-slate-400" /> Password
                  </label>
                  <Link to="/forgot-password" className="text-[11px] text-brand-600 hover:underline font-medium">
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Signing In...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* MODE 2: PHONE OTP LOGIN (Guaranteed Working) */
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-brand-500" /> Mobile Phone Number
                </label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={credential}
                    onChange={e => {
                      setCredential(e.target.value);
                      if (otpSent) setOtpSent(false);
                    }}
                    placeholder="e.g. 9876543210"
                    className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={sendingOtp || otpCountdown > 0}
                    className="px-3.5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 shadow-md shadow-brand-500/20"
                  >
                    {sendingOtp ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : otpCountdown > 0 ? (
                      `Wait ${otpCountdown}s`
                    ) : otpSent ? (
                      'Resend'
                    ) : (
                      'Send OTP'
                    )}
                  </button>
                </div>
                {otpError && !otpSent && (
                  <p className="text-[11px] text-rose-500 mt-1">{otpError}</p>
                )}
                <p className="text-[10px] text-slate-400 mt-1">
                  Works with any registered mobile number or new phone
                </p>
              </div>

              {otpSent && (
                <form onSubmit={handleOtpSubmit} className="space-y-3 pt-1">
                  {/* Visual OTP Banner with 1-Click Auto Fill */}
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-brand-500/10 border border-emerald-500/30 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                        OTP Code Sent
                      </span>
                      <span className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100">
                        {generatedOtp || DEMO_OTP}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOtp(generatedOtp || DEMO_OTP)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" /> Auto-Fill
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-brand-500" /> Enter 6-Digit OTP
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      className="w-full px-3 py-2.5 text-center text-base tracking-widest font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
                    />
                    {otpError && (
                      <p className="text-[11px] text-rose-500 mt-1 font-medium">{otpError}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.length < 4}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-2"
                  >
                    <span>{loading ? 'Verifying...' : 'Verify OTP & Sign In'}</span>
                    <ShieldCheck className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ⚡ 1-Click Fast Demo Logins */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block mb-2 font-medium">
              ⚡ 1-Click Quick Demo Logins:
            </span>
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={() => quickLogin('alex.rivera@university.edu', 'student', '/')}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
              >
                🎓 Student
              </button>
              <button
                type="button"
                onClick={() => quickLogin('sarah.chen@university.edu', 'faculty', '/faculty')}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
              >
                👨‍🏫 Faculty
              </button>
              <button
                type="button"
                onClick={() => quickLogin('robert.sterling@university.edu', 'admin', '/admin')}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
              >
                🛡️ Admin
              </button>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center text-xs text-slate-500 pt-1">
            New to ClassConnect?{' '}
            <Link to="/register" className="font-bold text-brand-600 dark:text-brand-400 hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Login;
