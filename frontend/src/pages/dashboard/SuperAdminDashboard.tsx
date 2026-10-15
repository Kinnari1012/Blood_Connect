import React from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Activity, Users, ShieldCheck, Database, Server, Clock, AlertTriangle, UserPlus, Heart, CheckCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi, auditApi, adminApi } from '../../services/api';

export function SuperAdminDashboard() {
  const navigate = useNavigate();

  const { data: overviewData, isLoading: overviewLoading } = useQuery({
    queryKey: ['superadmin-overview'],
    queryFn: async () => {
      const res = await analyticsApi.getOverview();
      return res.data?.data || {};
    },
  });

  const { data: adminsData, isLoading: adminsLoading } = useQuery({
    queryKey: ['superadmin-admins'],
    queryFn: async () => {
      const res = await adminApi.getAdmins();
      return res.data?.data || [];
    },
  });

  const { data: auditLogsData, isLoading: auditLoading } = useQuery({
    queryKey: ['superadmin-recent-audit'],
    queryFn: async () => {
      const res = await auditApi.getLogs({ limit: 5 });
      return res.data?.data || [];
    },
  });

  const o = overviewData || {};
  const admins: any[] = Array.isArray(adminsData) ? adminsData : [];
  const activeAdminsCount = admins.filter(a => a.status === 'ACTIVE').length;
  const auditLogs: any[] = Array.isArray(auditLogsData) ? auditLogsData : [];

  const stats = [
    { title: 'Total Admins', value: admins.length || o.totalAdmins || 0, icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50', link: '/super-admin/admins' },
    { title: 'Active Admins', value: activeAdminsCount, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', link: '/super-admin/admins?tab=active' },
    { title: 'Total Users', value: o.totalUsers ?? 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', link: '/super-admin/users' },
    { title: 'Total Donors', value: o.totalDonors ?? 0, icon: Heart, color: 'text-red-600', bg: 'bg-red-50', link: '/super-admin/donors' },
    { title: 'Emergency Requests', value: o.emergencyRequests ?? 0, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50', link: '/admin/requests?tab=critical' },
    { title: 'Completed Donations', value: o.completedRequests ?? 0, icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-50', link: '/admin/requests?tab=fulfilled' },
  ];

  return (
    <PageLayout title="Super Admin Control Panel" subtitle="Global overview, active staff, and system security health">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} onClick={() => navigate(stat.link)} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all">
            <div className={`w-14 h-14 rounded-full ${stat.bg} ${stat.color} flex items-center justify-center`}>
               <stat.icon size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-semibold">{stat.title}</p>
              <p className="text-2xl font-black text-gray-900">
                {overviewLoading || adminsLoading ? '...' : typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Real Audit Logs */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-all flex flex-col" onClick={() => navigate('/super-admin/audit')}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2"><Database size={20} className="text-primary" /> Live System Audit Logs</h3>
            <span className="text-sm text-primary font-bold">View Full Log →</span>
          </div>
          <div className="space-y-4 flex-1">
            {auditLoading ? (
              <div className="p-8 text-center text-gray-400">
                <Loader2 className="animate-spin mx-auto mb-2 text-primary" size={24} />
                <p className="text-xs">Loading audit events...</p>
              </div>
            ) : auditLogs.length === 0 ? (
              <p className="text-center text-gray-400 py-8 text-sm">No audit logs recorded yet</p>
            ) : (
              auditLogs.slice(0, 5).map((log: any) => {
                const dateStr = log.createdAt ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently';
                const action = (typeof log.action === 'string' ? log.action : 'SECURITY_EVENT').replace(/_/g, ' ');
                const actorName =
                  log.admin ||
                  (typeof log.performedById === 'object' && log.performedById !== null
                    ? `${log.performedById.firstName || ''} ${log.performedById.lastName || ''}`.trim() || log.performedById.email || 'Admin Staff'
                    : typeof log.performedById === 'string'
                    ? log.performedById
                    : log.performedBy?.fullName || 'Admin System');

                return (
                  <div key={log._id || log.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100/70 transition-colors">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900 text-sm">{action}</span>
                      <span className="text-xs text-gray-500">Performed by {String(actorName)}</span>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">{dateStr}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Real Admin Accounts & Activity */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-all flex flex-col" onClick={() => navigate('/super-admin/admins')}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2"><ShieldCheck size={20} className="text-purple-600" /> Platform Admin Staff</h3>
            <span className="text-sm text-primary font-bold">Manage Admins →</span>
          </div>
          <div className="space-y-4 flex-1">
            {adminsLoading ? (
              <div className="p-8 text-center text-gray-400">
                <Loader2 className="animate-spin mx-auto mb-2 text-primary" size={24} />
                <p className="text-xs">Loading admin staff...</p>
              </div>
            ) : admins.length === 0 ? (
              <p className="text-center text-gray-400 py-8 text-sm">No administrators found</p>
            ) : (
              admins.slice(0, 5).map((admin: any) => {
                const fullName = admin.fullName || `${admin.firstName || ''} ${admin.lastName || ''}`.trim() || 'Admin';
                const initial = fullName.charAt(0).toUpperCase() || 'A';
                const role = admin.role || 'ADMIN';
                const isSuper = role === 'SUPER_ADMIN';

                return (
                  <div key={admin._id || admin.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100/70 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${isSuper ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-700'} rounded-full flex items-center justify-center font-bold`}>
                        {initial}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 text-sm">{fullName}</span>
                        <span className="text-xs text-gray-500">{admin.email} • {isSuper ? 'Super Admin' : 'Admin'}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${admin.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-300'}`}>
                      {admin.status || 'ACTIVE'}
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
