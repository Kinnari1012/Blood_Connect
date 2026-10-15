import React from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Activity, Users, Droplet, CheckCircle, Clock, AlertCircle, TrendingUp, XCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi, requestApi, adminApi } from '../../services/api';
import { BLOOD_GROUP_DISPLAY } from '../../constants';

export function AdminDashboard() {
  const navigate = useNavigate();

  const { data: overviewData, isLoading: overviewLoading } = useQuery({
    queryKey: ['admin-overview'],
    queryFn: async () => {
      const res = await analyticsApi.getOverview();
      return res.data?.data || {};
    },
  });

  const { data: requestsData, isLoading: requestsLoading } = useQuery({
    queryKey: ['admin-recent-requests'],
    queryFn: async () => {
      const res = await requestApi.getAllRequests({ limit: 4 });
      return res.data?.data || [];
    },
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-recent-users'],
    queryFn: async () => {
      const res = await adminApi.getUsers({ limit: 4 });
      return res.data?.data || [];
    },
  });

  const o = overviewData || {};

  const stats = [
    { title: 'Total Users', value: o.totalUsers ?? 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', link: '/admin/users' },
    { title: 'Total Donors', value: o.totalDonors ?? 0, icon: Droplet, color: 'text-red-600', bg: 'bg-red-50', link: '/admin/donors' },
    { title: 'Available Donors', value: o.availableDonors ?? 0, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', link: '/admin/donors?tab=available' },
    { title: 'Active Requests', value: o.activeRequests ?? 0, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', link: '/admin/requests?tab=pending' },
    { title: 'Emergency Requests', value: o.emergencyRequests ?? 0, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', link: '/admin/requests?tab=critical' },
    { title: 'Completed Donations', value: o.completedRequests ?? 0, icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-50', link: '/admin/requests?tab=fulfilled' },
    { title: 'Platform Admins', value: o.totalAdmins ?? 0, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', link: '/super-admin/admins' },
    { title: 'System Status', value: '100% Operational', icon: CheckCircle, color: 'text-teal-600', bg: 'bg-teal-50', link: '/super-admin/audit' },
  ];

  const recentRequests = Array.isArray(requestsData) ? requestsData.slice(0, 4) : [];
  const recentUsers = Array.isArray(usersData) ? usersData.slice(0, 4) : [];

  return (
    <PageLayout title="Admin Dashboard" subtitle="Real-time overview of platform activities, donors, and live blood requests">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            onClick={() => navigate(stat.link)}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-md hover:border-gray-200 transition-all"
          >
            <div className={`w-14 h-14 rounded-full ${stat.bg} ${stat.color} flex items-center justify-center flex-shrink-0`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{stat.title}</p>
              <p className="text-2xl font-black text-gray-900 mt-0.5">
                {overviewLoading ? '...' : typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Blood Requests */}
        <div
          className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900 text-lg">Live Blood Requests</h3>
            <button
              onClick={() => navigate('/admin/requests')}
              className="text-sm text-primary font-bold hover:underline"
            >
              View All →
            </button>
          </div>
          <div className="space-y-4 flex-1">
            {requestsLoading ? (
              <div className="p-8 text-center text-gray-400">
                <Loader2 className="animate-spin mx-auto mb-2 text-primary" size={24} />
                <p className="text-xs">Loading live requests...</p>
              </div>
            ) : recentRequests.length === 0 ? (
              <p className="text-center text-gray-400 py-8 text-sm">No recent requests recorded</p>
            ) : (
              recentRequests.map((r: any) => {
                const bg = r.bg || r.bloodGroup || 'O+';
                const status = r.status || 'Pending';
                const isPending = status.toLowerCase().includes('pending');
                const isFulfilled = status.toLowerCase().includes('fulfilled');

                return (
                  <div
                    key={r._id || r.id}
                    onClick={() => navigate('/admin/requests')}
                    className="flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100/70 rounded-xl cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {BLOOD_GROUP_DISPLAY[bg as keyof typeof BLOOD_GROUP_DISPLAY] || bg}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">
                          {r.patient || r.patientName} {r.urgency === 'Critical' ? '(Emergency)' : ''}
                        </p>
                        <p className="text-xs text-gray-500">
                          {r.hospital} • {r.city || 'Gujarat'}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        isPending ? 'bg-yellow-100 text-yellow-700' :
                        isFulfilled ? 'bg-green-100 text-green-700' :
                        'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Registrations */}
        <div
          className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900 text-lg">Recent Users & Donors</h3>
            <button
              onClick={() => navigate('/admin/users')}
              className="text-sm text-primary font-bold hover:underline"
            >
              View All →
            </button>
          </div>
          <div className="space-y-4 flex-1">
            {usersLoading ? (
              <div className="p-8 text-center text-gray-400">
                <Loader2 className="animate-spin mx-auto mb-2 text-primary" size={24} />
                <p className="text-xs">Loading registered users...</p>
              </div>
            ) : recentUsers.length === 0 ? (
              <p className="text-center text-gray-400 py-8 text-sm">No registered users found</p>
            ) : (
              recentUsers.map((u: any) => {
                const name = u.fullName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'New User';
                const initial = (u.firstName?.[0] || 'U').toUpperCase();

                return (
                  <div
                    key={u._id || u.id}
                    onClick={() => navigate('/admin/users')}
                    className="flex justify-between items-center p-3 sm:p-4 bg-gray-50 hover:bg-gray-100/70 rounded-xl cursor-pointer transition-colors gap-3 overflow-hidden"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold flex-shrink-0">
                        {initial}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-gray-900 text-sm truncate">{name}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {u.email} • {u.bloodGroup || u.role}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2 sm:px-2.5 py-1 bg-white border border-gray-200 text-gray-600 rounded-lg shrink-0">
                      {u.role || 'USER'}
                    </span>
                  </div>

                );
              })
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
