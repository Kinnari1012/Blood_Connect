import React from 'react';
import { useAuth } from '../../store/AuthContext';
import { UserDashboard } from '../dashboard/UserDashboard';
import { DonorDashboard } from '../donor/DonorDashboard';
import { AdminDashboard } from '../dashboard/AdminDashboard';
import { SuperAdminDashboard } from '../dashboard/SuperAdminDashboard';
import { LandingPage } from './LandingPage';

export function Home() {
  const { user, isAuthenticated, isDonor } = useAuth();

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  if (user?.role === 'SUPER_ADMIN') {
    return <SuperAdminDashboard />;
  }
  if (user?.role === 'ADMIN') {
    return <AdminDashboard />;
  }
  if (isDonor) {
    return <DonorDashboard />;
  }
  return <UserDashboard />;
}

export default Home;
