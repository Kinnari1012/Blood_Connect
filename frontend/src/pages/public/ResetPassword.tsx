import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants';

export function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const getStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = getStrength(password);
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong', 'Strong'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-green-600'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      setError('Password does not meet all requirements.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1500);
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
          <h2 className="text-3xl font-black text-gray-900 mb-3">Reset Password</h2>
          
          {!isSuccess ? (
            <>
              <p className="text-gray-500 mb-8 font-medium">Create a strong new password for your account.</p>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">New Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                  {password.length > 0 && (
                    <div className="mt-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-gray-500">Password Strength:</span>
                        <span className={`text-xs font-bold ${strengthColors[Math.min(strength, 4)]?.replace('bg-', 'text-')}`}>{strengthLabels[Math.min(strength, 4)]}</span>
                      </div>
                      <div className="flex gap-1 h-1.5">
                        {[0,1,2,3,4].map(idx => (
                          <div key={idx} className={`flex-1 rounded-full ${idx < strength ? strengthColors[Math.min(strength, 4)] : 'bg-gray-200'}`}></div>
                        ))}
                      </div>
                    </div>
                  )}
                  <ul className="mt-3 space-y-1 text-xs text-gray-500">
                     <li className="flex items-center gap-1"><span className={password.length >= 8 ? 'text-green-500' : ''}>• 8+ characters</span></li>
                     <li className="flex items-center gap-1"><span className={/[A-Z]/.test(password) ? 'text-green-500' : ''}>• Uppercase letter</span></li>
                     <li className="flex items-center gap-1"><span className={/[a-z]/.test(password) ? 'text-green-500' : ''}>• Lowercase letter</span></li>
                     <li className="flex items-center gap-1"><span className={/[0-9]/.test(password) ? 'text-green-500' : ''}>• Number</span></li>
                     <li className="flex items-center gap-1"><span className={/[^A-Za-z0-9]/.test(password) ? 'text-green-500' : ''}>• Special character</span></li>
                  </ul>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                  {error && <p className="text-red-500 text-xs font-semibold mt-2">{error}</p>}
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary/90 hover:shadow-xl transition-all disabled:opacity-70 flex items-center justify-center gap-2 mt-2"
                >
                  {isLoading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </>
          ) : (
            <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-300 py-10">
               <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                 <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
               </div>
               <h3 className="text-2xl font-black text-gray-900">Password Updated Successfully</h3>
               <p className="text-gray-500 font-medium pb-4">Your account is secure. You can now login with your new password.</p>
               <button onClick={() => navigate(ROUTES.LOGIN)} className="w-full h-12 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center">
                  Go to Login
               </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
