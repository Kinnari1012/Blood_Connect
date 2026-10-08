import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Bell, User, LayoutDashboard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../store/AuthContext';
import { ROUTES } from '../../constants';

export function BottomNav() {
  const { t } = useTranslation();
  const location = useLocation();
  const { isDonor, isSeeker, isAdmin } = useAuth();

  const items = [
    { path: ROUTES.HOME, icon: Home, label: t('nav.home') },
    { path: ROUTES.FIND_BLOOD, icon: Search, label: t('nav.findBlood') },
    {
      path: isDonor ? ROUTES.DONOR_DASHBOARD
          : isSeeker ? ROUTES.USER_DASHBOARD
          : isAdmin ? ROUTES.ADMIN_DASHBOARD
          : ROUTES.HOME,
      icon: LayoutDashboard,
      label: t('nav.dashboard'),
    },
    { path: ROUTES.NOTIFICATIONS, icon: Bell, label: t('nav.notifications') },
    { path: ROUTES.PROFILE, icon: User, label: t('nav.profile') },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[100] lg:hidden safe-area-pb"
      style={{
        background: 'white',
        borderTop: '1px solid #E0E0E0',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
      }}
      aria-label="Mobile navigation"
    >
      <div className="flex items-stretch" style={{ height: 64 }}>
        {items.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path || location.pathname.startsWith(path + '/');
          return (
            <Link
              key={path}
              to={path}
              aria-current={active ? 'page' : undefined}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 min-w-0 relative transition-colors focus:outline-none"
              style={{ color: active ? '#C62828' : '#9E9E9E' }}
            >
              {/* Active pill indicator */}
              {active && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full"
                  style={{ width: 24, height: 3, background: '#C62828' }}
                />
              )}
              <Icon
                size={20}
                strokeWidth={active ? 2.5 : 1.8}
              />
              <span className="text-xs font-medium truncate max-w-full px-1" style={{ fontSize: 10 }}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
