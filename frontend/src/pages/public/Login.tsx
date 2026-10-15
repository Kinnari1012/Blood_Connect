import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../store/AuthContext';
import { ROUTES } from '../../constants';

export function Login() {
  const { t } = useTranslation();
  const { login, sendOtp } = useAuth();
  const navigate = useNavigate();

  const [authMethod, setAuthMethod] = useState<'PASSWORD' | 'OTP'>('PASSWORD');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  const [showPw, setShowPw] = useState(false);
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setApiError('');
    setApiSuccess('');
    const clean = identifier.trim();
    if (!clean) {
      setApiError('Please enter your email address or mobile number first');
      return;
    }

    try {
      setSendingOtp(true);
      const res = await sendOtp(clean);
      setOtpSent(true);
      setResendTimer(30);
      setApiSuccess(res?.message || 'Verification code sent to your registered email/phone');
      if (res?.devOtp || res?.data?.devOtp) {
        setDevOtpHint(res?.devOtp || res?.data?.devOtp);
      }
    } catch (err: any) {
      setApiError(err?.response?.data?.error?.message || err?.response?.data?.message || err?.message || 'Failed to send OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    setApiSuccess('');

    const cleanId = identifier.trim();
    if (!cleanId) {
      setApiError('Please enter your email address or mobile number');
      return;
    }

    if (authMethod === 'PASSWORD' && !password) {
      setApiError('Please enter your password');
      return;
    }

    if (authMethod === 'OTP' && !otp.trim()) {
      setApiError('Please enter the 6-digit OTP code');
      return;
    }

    try {
      setIsSubmitting(true);
      const secret = authMethod === 'PASSWORD' ? password : otp.trim();
      const isOtp = authMethod === 'OTP';

      const user = await login(cleanId, secret, isOtp);
      if (user.role === 'SUPER_ADMIN') {
        navigate(ROUTES.SUPER_ADMIN_DASHBOARD);
      } else if (user.role === 'ADMIN') {
        navigate(ROUTES.ADMIN_DASHBOARD);
      } else {
        navigate(ROUTES.USER_DASHBOARD);
      }
    } catch (err: any) {
      setApiError(
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Invalid credentials. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      {/* Top brand bar */}
      <div className="h-36 flex flex-col items-center justify-center gap-2 flex-shrink-0 bg-gradient-primary">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden bg-white/20 shadow-inner">
          <img src="/logo.jpg" alt="LifeLink Logo" className="w-full h-full object-cover" />
        </div>
        <div className="text-center">
          <h1 className="text-xl font-bold text-white">LifeLink</h1>
          <p className="text-red-200 text-xs mt-0.5">Connecting Donors. Saving Lives.</p>
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 flex flex-col items-center px-4 -mt-4 pb-8">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-7">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Welcome back</h2>
            <p className="text-sm text-gray-500 mb-5">Sign in to your account</p>

            {/* Error Message */}
            {apiError && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 flex-shrink-0">
                  <circle cx="8" cy="8" r="7" stroke="#C62828" strokeWidth="1.5"/>
                  <path d="M8 5v4M8 11v.5" stroke="#C62828" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span className="flex-1 text-xs">{apiError}</span>
              </div>
            )}

            {/* Success Message */}
            {apiSuccess && (
              <div className="flex items-start gap-2.5 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-4">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" className="mt-0.5 flex-shrink-0">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <span className="flex-1 text-xs">{apiSuccess}</span>
              </div>
            )}

            {/* Auth Method Tabs */}
            <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
              <button
                type="button"
                onClick={() => { setAuthMethod('PASSWORD'); setApiError(''); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  authMethod === 'PASSWORD' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Password Login
              </button>
              <button
                type="button"
                onClick={() => { setAuthMethod('OTP'); setApiError(''); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  authMethod === 'OTP' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                OTP Verification
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Identifier Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email or Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="2" y="4" width="20" height="16" rx="3"/><path d="m2 7 10 7 10-7"/>
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => { setIdentifier(e.target.value); setDevOtpHint(null); }}
                    placeholder="you@example.com or 9876543210"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#C62828] transition-all"
                  />
                </div>
              </div>

              {/* Password Method */}
              {authMethod === 'PASSWORD' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </div>
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Your password"
                      className="w-full h-11 pl-10 pr-12 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#C62828] transition-all"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        onClick={() => setShowPw((v) => !v)}
                        className="text-gray-400 hover:text-gray-600 focus:outline-none p-1"
                      >
                        {showPw ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-end mt-2">
                    <Link to={ROUTES.FORGOT_PASSWORD} className="text-xs text-[#C62828] hover:underline font-medium">
                      Forgot password?
                    </Link>
                  </div>
                </div>
              ) : (
                /* OTP Method */
                <div className="space-y-3">
                  {!otpSent ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-center">
                      <p className="text-xs text-gray-600 mb-3">
                        We'll send a 6-digit OTP to your registered email or mobile number.
                      </p>
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={sendingOtp}
                        className="w-full py-2 bg-white border border-[#C62828] text-[#C62828] hover:bg-red-50 text-xs font-bold rounded-lg transition-all"
                      >
                        {sendingOtp ? 'Sending OTP...' : 'Send Verification OTP'}
                      </button>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">6-Digit OTP</label>
                      <input
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter 6-digit code"
                        className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-center tracking-widest text-base font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#C62828] transition-all"
                      />

                      {devOtpHint && (
                        <div className="mt-2 text-xs bg-blue-50 text-blue-700 p-2 rounded-lg border border-blue-200 text-center">
                          Testing Code: <span className="font-bold tracking-wider">{devOtpHint}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center mt-2 text-xs">
                        {resendTimer > 0 ? (
                          <span className="text-gray-400">Resend in {resendTimer}s</span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={sendingOtp}
                            className="text-[#C62828] font-bold hover:underline"
                          >
                            Resend OTP
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}



              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting || (authMethod === 'OTP' && !otpSent)}
                className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all duration-150 disabled:opacity-50 focus:outline-none focus:ring-4 focus:ring-primary/20 active:scale-[0.98] bg-gradient-primary shadow-card cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Signing in…
                  </span>
                ) : authMethod === 'OTP' && !otpSent ? (
                  'Request OTP to Continue'
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="mt-5 flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400 font-medium">OR</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <p className="text-center text-sm text-gray-500 mt-4">
              Don't have an account?{' '}
              <Link to={ROUTES.REGISTER} className="text-[#C62828] font-bold hover:underline">
                Create account
              </Link>
            </p>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { value: '50K+', label: 'Donors' },
              { value: '10K+', label: 'Lives Saved' },
              { value: '200+', label: 'Cities' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl p-2.5 text-center shadow-sm border border-gray-100">
                <p className="text-base font-bold text-[#C62828]">{s.value}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
