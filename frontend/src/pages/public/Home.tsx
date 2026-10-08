import React from 'react';
import { useAuth } from '../../store/AuthContext';
import { PageLayout } from '../../components/layout/PageLayout';
import { UserDashboard } from '../dashboard/UserDashboard';
import { AdminDashboard } from '../dashboard/AdminDashboard';
import { SuperAdminDashboard } from '../dashboard/SuperAdminDashboard';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants';
import { useTranslation } from 'react-i18next';

export function Home() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();

  if (!isAuthenticated) {
    return (
      <PageLayout showNav={false}>
        <div className="flex items-center justify-center h-full min-h-[60vh]">
          <Link to={ROUTES.LOGIN} className="px-6 py-3 bg-primary text-white rounded-lg font-bold">
            {t('auth.signIn')} to Access Dashboard
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {user?.role === 'SUPER_ADMIN' ? (
        <SuperAdminDashboard />
      ) : user?.role === 'ADMIN' ? (
        <AdminDashboard />
      ) : (
        <UserDashboard />
      )}
    </PageLayout>
  );
}
