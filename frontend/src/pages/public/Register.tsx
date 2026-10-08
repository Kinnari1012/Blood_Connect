import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../store/AuthContext';
import { ROUTES } from '../../constants';

const schema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Enter a valid 10-15 digit number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
type FormData = z.infer<typeof schema>;

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
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">{icon}</div>
        <input
          type={type}
          placeholder={placeholder}
          className={`w-full h-12 pl-10 ${rightEl ? 'pr-12' : 'pr-4'} rounded-xl border bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all ${
            error ? 'border-red-400 focus:ring-red-100 focus:border-red-400' : 'border-gray-200 focus:ring-red-100 focus:border-[#C62828]'
          }`}
          {...rest}
        />
        {rightEl && <div className="absolute inset-y-0 right-0 pr-3 flex items-center">{rightEl}</div>}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function Register() {
  const { t } = useTranslation();
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [apiError, setApiError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
  });

  const onSubmit = async (data: FormData) => {
    setApiError('');
    try {
      await authRegister({ ...data, language: localStorage.getItem('BloodConnect_lang') || 'en' });
      navigate(ROUTES.HOME);
    } catch (err: any) {
      setApiError(err?.response?.data?.error?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      <div
        className="h-32 flex flex-col items-center justify-center gap-1"
        style={{ background: 'linear-gradient(150deg, #C62828 0%, #8E0000 100%)' }}
      >
        <h1 className="text-xl font-bold text-white">Create Account</h1>
        <p className="text-red-200 text-sm">Join the BloodConnect community</p>
      </div>

      <div className="flex-1 px-4 -mt-4 pb-10 overflow-y-auto">
        <div className="max-w-sm mx-auto bg-white rounded-3xl shadow-xl p-6">
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
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="First Name"
                placeholder="John"
                error={errors.firstName?.message}
                icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>}
                {...register('firstName')}
              />
              <Field
                label="Last Name"
                placeholder="Doe"
                error={errors.lastName?.message}
                icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>}
                {...register('lastName')}
              />
            </div>
            <Field
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email?.message}
              icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="m2 7 10 7 10-7"/></svg>}
              {...register('email')}
            />
            <Field
              label="Mobile Number"
              type="tel"
              placeholder="+91 9999999999"
              error={errors.phone?.message}
              icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="5" y="2" width="14" height="20" rx="3"/><circle cx="12" cy="17" r="1"/></svg>}
              {...register('phone')}
            />
            <Field
              label="Password"
              type={showPw ? 'text' : 'password'}
              placeholder="Min 8 characters"
              autoComplete="new-password"
              error={errors.password?.message}
              icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
              rightEl={
                <button type="button" onClick={() => setShowPw(v => !v)} className="text-gray-400 hover:text-gray-600 p-1 focus:outline-none">
                  {showPw ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              }
              {...register('password')}
            />
            <Field
              label="Confirm Password"
              type={showPw ? 'text' : 'password'}
              placeholder="Repeat password"
              error={errors.confirmPassword?.message}
              icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
              {...register('confirmPassword')}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl font-bold text-white text-base transition-all duration-150 disabled:opacity-60 focus:outline-none focus:ring-4 focus:ring-red-200 active:scale-[0.98] mt-2"
              style={{ background: 'linear-gradient(135deg, #C62828 0%, #8E0000 100%)', boxShadow: '0 4px 16px rgba(198,40,40,0.30)' }}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </div>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to={ROUTES.LOGIN} className="text-[#C62828] font-bold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
