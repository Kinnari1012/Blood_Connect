import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants';
import { useTranslation } from 'react-i18next';

export function ForgotPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      setCountdown(30);
    }, 1500);
  };

  const handleResend = () => {
    if (countdown === 0) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setCountdown(30);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden min-h-[500px]">
        {/* Left Side: Branding */}
        <div className="w-full md:w-1/2 bg-gradient-primary text-white p-10 flex flex-col justify-center items-center text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_white_0%,_transparent_100%)] mix-blend-overlay"></div>
          <img src="/logo.jpg" alt="BloodConnect Logo" className="w-24 h-24 rounded-full border-4 border-white/20 mb-6 shadow-xl relative z-10" />
          <h1 className="text-3xl font-black mb-2 relative z-10">BloodConnect</h1>
          <p className="text-white/80 font-semibold mb-6 tracking-wide text-sm relative z-10">Connecting Donors. Saving Lives.</p>
          <div className="w-12 h-1 bg-white/30 rounded-full mb-6 relative z-10"></div>
          <p className="text-lg font-medium text-white/90 italic max-w-xs relative z-10">“Every connection can help save a life.”</p>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 p-10 lg:p-12 flex flex-col justify-center relative">
          <h2 className="text-3xl font-black text-gray-900 mb-3">Forgot your password?</h2>
          
          {!isSuccess ? (
            <>
              <p className="text-gray-500 mb-8 font-medium">Enter your registered email address and we’ll help you reset your password.</p>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className={`w-full h-12 bg-gray-50 border ${error ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all`}
                  />
                  {error && <p className="text-red-500 text-xs font-semibold mt-2">{error}</p>}
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary/90 hover:shadow-xl transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            </>
          ) : (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
               <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
               </div>
               <h3 className="text-xl font-bold text-gray-900">Reset link sent successfully.</h3>
               <p className="text-gray-500 font-medium">We’ve sent password reset instructions to your email address: <span className="font-bold text-gray-900">{email}</span></p>
               <button onClick={() => navigate(ROUTES.RESET_PASSWORD)} className="w-full h-12 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center">
                  Proceed to Reset Password
               </button>
               <div className="text-center pt-2">
                 <button onClick={handleResend} disabled={countdown > 0} className={`text-sm font-semibold ${countdown > 0 ? 'text-gray-400' : 'text-primary hover:underline'}`}>
                   {countdown > 0 ? `Resend available in ${countdown}s` : 'Resend Email'}
                 </button>
               </div>
            </div>
          )}

          <div className="mt-8 text-center">
             <button onClick={() => navigate(ROUTES.LOGIN)} className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
               Back to Login
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
