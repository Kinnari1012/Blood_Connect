import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './store/AuthContext';
import { ThemeProvider } from './store/ThemeContext';
import { ROUTES } from './constants';
import './i18n';

// Pages
import { SplashScreen } from './pages/public/SplashScreen';
import { Onboarding } from './pages/public/Onboarding';
import { Login } from './pages/public/Login';
import { ForgotPassword } from './pages/public/ForgotPassword';
import { ResetPassword } from './pages/public/ResetPassword';
import { Register } from './pages/public/Register';
import { Home } from './pages/public/Home';
import { FindDonorsPage } from './pages/user/FindDonorsPage';
import { DonorRegistration } from './pages/donor/DonorRegistration';
import { DonorDashboard } from './pages/donor/DonorDashboard';
import { DonationHistoryPage } from './pages/user/DonationHistoryPage';
import { BloodRequestForm } from './pages/seeker/BloodRequestForm';
import { RequestDetails } from './pages/seeker/RequestDetails';
import { MyRequestsPage } from './pages/user/MyRequestsPage';
import { IncomingRequestsPage } from './pages/user/IncomingRequestsPage';
import { NotificationsPage } from './pages/shared/NotificationsPage';
import { ProfilePage } from './pages/shared/ProfilePage';
import { UsersPage } from './pages/shared/UsersPage';
import { DonorsPage } from './pages/shared/DonorsPage';
import { BloodRequestsPage } from './pages/shared/BloodRequestsPage';
import { BloodDonationsPage } from './pages/shared/BloodDonationsPage';
import { BloodGroupsPage } from './pages/shared/BloodGroupsPage';
import { LocationsPage } from './pages/shared/LocationsPage';
import { ReportsPage } from './pages/shared/ReportsPage';
import { Settings } from './pages/shared/Settings';
import { AdminManagement } from './pages/admin/AdminManagement';
import { AuditLogs } from './pages/admin/AuditLogs';
import { ThemeManagement } from './pages/admin/ThemeManagement';
import { UserManagement } from './pages/admin/UserManagement';
import { RequestManagement } from './pages/admin/RequestManagement';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { SecuritySettings } from './pages/admin/SecuritySettings';
import { SuperAdminDashboard } from './pages/dashboard/SuperAdminDashboard';
import { PrivacyPolicy, TermsAndConditions, HelpSupport } from './pages/shared/StaticPages';
import { PageLoader } from './components/ui/Alert';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

// Route guards
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;
  return <>{children}</>;
}

function AdminRoute({ children, permission }: { children: React.ReactNode; permission?: string }) {
  const { isAdmin, hasPermission, loading, isAuthenticated } = useAuth();
  if (loading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;
  if (!isAdmin) return <Navigate to={ROUTES.HOME} replace />;
  if (permission && !hasPermission(permission)) return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
  return <>{children}</>;
}

function SuperAdminRoute({ children }: { children: React.ReactNode }) {
  const { isSuperAdmin, loading, isAuthenticated } = useAuth();
  if (loading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;
  if (!isSuperAdmin) return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
  return <>{children}</>;
}

function DonorRoute({ children }: { children: React.ReactNode }) {
  const { isDonor, loading, isAuthenticated } = useAuth();
  if (loading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;
  if (!isDonor) return <Navigate to={ROUTES.HOME} replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<SplashScreen />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/register" element={<Register />} />

      {/* Main Dashboard & Sidebar Distinct Routes */}
      <Route path="/user/dashboard" element={<PrivateRoute><Home /></PrivateRoute>} />
      <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
      <Route path="/admin/donors" element={<AdminRoute><UserManagement /></AdminRoute>} />
      <Route path="/admin/requests" element={<AdminRoute><RequestManagement /></AdminRoute>} />
      <Route path="/admin/reports" element={<AdminRoute><ReportsPage /></AdminRoute>} />
      <Route path="/super-admin/dashboard" element={<SuperAdminRoute><SuperAdminDashboard /></SuperAdminRoute>} />
      <Route path="/super-admin/admins" element={<SuperAdminRoute><AdminManagement /></SuperAdminRoute>} />
      <Route path="/super-admin/users" element={<SuperAdminRoute><UserManagement /></SuperAdminRoute>} />
      <Route path="/super-admin/donors" element={<SuperAdminRoute><UserManagement /></SuperAdminRoute>} />
      <Route path="/super-admin/requests" element={<SuperAdminRoute><RequestManagement /></SuperAdminRoute>} />
      <Route path="/super-admin/reports" element={<SuperAdminRoute><ReportsPage /></SuperAdminRoute>} />
      <Route path="/super-admin/settings" element={<SuperAdminRoute><Settings /></SuperAdminRoute>} />
      <Route path="/super-admin/security" element={<SuperAdminRoute><SecuritySettings /></SuperAdminRoute>} />
      <Route path="/super-admin/admin-management" element={<SuperAdminRoute><AdminManagement /></SuperAdminRoute>} />
      <Route path="/super-admin/audit" element={<SuperAdminRoute><AuditLogs /></SuperAdminRoute>} />
      
      {/* Fallback legacy dashboard redirects to specific role dashboard based on auth */}
      <Route path="/dashboard" element={
        <PrivateRoute>
          {React.createElement(() => {
            const { user } = useAuth();
            if (user?.role === 'SUPER_ADMIN') return <Navigate to={ROUTES.SUPER_ADMIN_DASHBOARD} replace />;
            if (user?.role === 'ADMIN') return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
            return <Navigate to={ROUTES.USER_DASHBOARD} replace />;
          })}
        </PrivateRoute>
      } />
      <Route path="/users" element={<PrivateRoute><UsersPage /></PrivateRoute>} />
      <Route path="/donors" element={<PrivateRoute><DonorsPage /></PrivateRoute>} />
      <Route path="/blood-requests" element={<PrivateRoute><BloodRequestsPage /></PrivateRoute>} />
      <Route path="/blood-donations" element={<PrivateRoute><BloodDonationsPage /></PrivateRoute>} />
      <Route path="/blood-groups" element={<PrivateRoute><BloodGroupsPage /></PrivateRoute>} />
      <Route path="/locations" element={<PrivateRoute><LocationsPage /></PrivateRoute>} />
      <Route path="/reports" element={<PrivateRoute><ReportsPage /></PrivateRoute>} />
      <Route path="/notifications" element={<PrivateRoute><NotificationsPage /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
      <Route path="/donation-history" element={<PrivateRoute><DonationHistoryPage /></PrivateRoute>} />

      {/* Other routes */}
      <Route path="/find-blood" element={<PrivateRoute><FindDonorsPage /></PrivateRoute>} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsAndConditions />} />
      <Route path="/help" element={<HelpSupport />} />
      <Route path="/requests/create" element={<PrivateRoute><BloodRequestForm /></PrivateRoute>} />
      <Route path="/requests/emergency" element={<PrivateRoute><BloodRequestForm isEmergency={true} /></PrivateRoute>} />
      <Route path="/requests/my" element={<PrivateRoute><MyRequestsPage /></PrivateRoute>} />
      <Route path="/requests/incoming" element={<PrivateRoute><IncomingRequestsPage /></PrivateRoute>} />
      <Route path="/requests/:id" element={<PrivateRoute><RequestDetails /></PrivateRoute>} />

      {/* Settings / Theme aliases */}
      <Route path="/super-admin/settings" element={<SuperAdminRoute><Settings /></SuperAdminRoute>} />
      <Route path="/super-admin/theme" element={<SuperAdminRoute><ThemeManagement /></SuperAdminRoute>} />
      <Route path="/admin/matching" element={<AdminRoute><DonorsPage /></AdminRoute>} />

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Toaster position="top-center" />
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
