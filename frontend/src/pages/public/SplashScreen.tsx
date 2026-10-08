import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { ROUTES } from '../../constants';

export function SplashScreen() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        navigate(ROUTES.HOME);
      } else if (!localStorage.getItem('bc_onboarded')) {
        navigate(ROUTES.ONBOARDING);
      } else {
        navigate(ROUTES.LOGIN);
      }
    }, 2400);
    return () => clearTimeout(timer);
  }, [loading, isAuthenticated, navigate]);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{ background: 'linear-gradient(150deg, #C62828 0%, #8E0000 100%)' }}
    >
      {/* Background decoration circles */}
      <div
        className="absolute top-0 left-0 w-64 h-64 rounded-full opacity-10"
        style={{ background: 'white', transform: 'translate(-30%, -30%)' }}
      />
      <div
        className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-10"
        style={{ background: 'white', transform: 'translate(30%, 30%)' }}
      />

      {/* Logo card */}
      <div className="relative z-10 flex flex-col items-center gap-6 animate-bc-fade-in">
        {/* Logo circle */}
        <div
          className="w-28 h-28 rounded-3xl flex items-center justify-center overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)' }}
        >
          <img src="/logo.jpg" alt="BloodConnect Logo" className="w-full h-full object-cover animate-heart-beat" />
        </div>

        {/* App name */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">BloodConnect</h1>
          <p className="text-red-200 text-sm mt-2 font-medium tracking-wide">Connecting Donors. Saving Lives.</p>
        </div>

        {/* Animated dots */}
        <div className="flex gap-2 mt-2" aria-hidden="true">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-white animate-bc-pulse"
              style={{ animationDelay: `${i * 0.25}s` }}
            />
          ))}
        </div>
      </div>

      {/* Bottom tagline */}
      <p className="absolute bottom-10 text-red-300 text-xs font-medium tracking-widest uppercase">
        Save a Life Today
      </p>
    </div>
  );
}
