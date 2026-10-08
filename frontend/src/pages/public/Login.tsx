import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../store/AuthContext';
import { ROUTES } from '../../constants';

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type FormData = z.infer<typeof schema>;

// ─── Inline Input ──────────────────────────────────────────────────────────────
function Field({
  label, error, type = 'text', placeholder, icon, rightEl, ...rest
}: {
  label: string; error?: string; type?: string; placeholder?: string;
  icon: React.ReactNode; rightEl?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
          {icon}
        </div>
        <input
          type={type}
          placeholder={placeholder}
          className={`w-full h-12 pl-10 pr-${rightEl ? '12' : '4'} rounded-xl border bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all ${
            error ? 'border-red-400 focus:ring-red-100 focus:border-red-400' : 'border-gray-200 focus:ring-red-100 focus:border-[#C62828]'
          }`}
          {...rest}
        />
        {rightEl && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">{rightEl}</div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [apiError, setApiError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
  });

  const onSubmit = async (data: FormData) => {
    setApiError('');
    try {
      const user = await login(data.email, data.password);
      if (user.role === 'SUPER_ADMIN') {
        navigate(ROUTES.SUPER_ADMIN_DASHBOARD);
      } else if (user.role === 'ADMIN') {
        navigate(ROUTES.ADMIN_DASHBOARD);
      } else {
        navigate(ROUTES.USER_DASHBOARD);
      }
    } catch (err: any) {
      setApiError(err?.response?.data?.error?.message || err?.response?.data?.message || 'Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      {/* Top brand bar */}
      <div
        className="h-40 flex flex-col items-center justify-center gap-2 flex-shrink-0 bg-gradient-primary"
      >
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden" style={{ background: 'rgba(255,255,255,0.15)' }}>
          <img src="/logo.jpg" alt="BloodConnect Logo" className="w-full h-full object-cover" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">BloodConnect</h1>
          <p className="text-red-200 text-xs mt-0.5">Connecting Donors. Saving Lives.</p>
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 flex flex-col items-center px-4 -mt-5 pb-8">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-3xl shadow-xl p-7">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Welcome back</h2>
            <p className="text-sm text-gray-500 mb-6">Sign in to your account</p>

            {apiError && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 flex-shrink-0">
                  <circle cx="8" cy="8" r="7" stroke="#C62828" strokeWidth="1.5"/>
                  <path d="M8 5v4M8 11v.5" stroke="#C62828" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              <Field
                label="Email address"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                error={errors.email?.message}
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="2" y="4" width="20" height="16" rx="3"/><path d="m2 7 10 7 10-7"/>
                  </svg>
                }
                {...register('email')}
              />
              <Field
                label="Password"
                type={showPw ? 'text' : 'password'}
                placeholder="Your password"
                autoComplete="current-password"
                error={errors.password?.message}
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                }
                rightEl={
                  <button type="button" onClick={() => setShowPw(v => !v)} className="text-gray-400 hover:text-gray-600 focus:outline-none p-1">
                    {showPw ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                }
                {...register('password')}
              />

              <div className="flex justify-end">
                <Link to={ROUTES.FORGOT_PASSWORD} className="text-sm text-[#C62828] hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-13 py-3.5 rounded-xl font-bold text-white text-base transition-all duration-150 disabled:opacity-60 focus:outline-none focus:ring-4 focus:ring-primary/20 active:scale-[0.98] bg-gradient-primary shadow-card"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Signing in…
                  </span>
                ) : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400 font-medium">OR</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <p className="text-center text-sm text-gray-500 mt-5">
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
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl p-3 text-center shadow-sm border border-gray-100">
                <p className="text-lg font-bold" style={{ color: '#C62828' }}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
