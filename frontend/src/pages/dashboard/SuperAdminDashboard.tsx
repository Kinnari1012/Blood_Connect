import React from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Activity, Users, ShieldCheck, Database, Server, Clock, AlertTriangle, UserPlus, Heart, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function SuperAdminDashboard() {
  const navigate = useNavigate();

  const stats = [
    { title: 'Total Admins', value: '12', icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50', link: '/super-admin/admins' },
    { title: 'Active Admins', value: '10', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', link: '/super-admin/admins?tab=active' },
    { title: 'Total Users', value: '1,245', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', link: '/super-admin/users' },
    { title: 'Total Donors', value: '842', icon: Heart, color: 'text-red-600', bg: 'bg-red-50', link: '/super-admin/donors' },
    { title: 'System Alerts', value: '3', icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50', link: '/super-admin/audit' },
    { title: 'Active Sessions', value: '45', icon: Server, color: 'text-indigo-600', bg: 'bg-indigo-50', link: '/super-admin/audit' },
  ];

  return (
    <PageLayout title="Super Admin Control Panel" subtitle="Global overview and system health">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} onClick={() => navigate(stat.link)} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all">
            <div className={`w-14 h-14 rounded-full ${stat.bg} ${stat.color} flex items-center justify-center`}>
               <stat.icon size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-semibold">{stat.title}</p>
              <p className="text-2xl font-black text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-all" onClick={() => navigate('/super-admin/audit')}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2"><Database size={20} className="text-primary" /> System Audit Logs</h3>
            <span className="text-sm text-primary font-bold">View Full Log</span>
          </div>
          <div className="space-y-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex flex-col">
                  <span className="font-bold text-gray-900 text-sm">Security Update</span>
                  <span className="text-xs text-gray-500">Admin privileges modified for Kinnari Patel</span>
                </div>
                <span className="text-xs text-gray-400">10 mins ago</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-all" onClick={() => navigate('/super-admin/admins')}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2"><ShieldCheck size={20} className="text-purple-600" /> Recent Admin Activity</h3>
            <span className="text-sm text-primary font-bold">Manage Admins</span>
          </div>
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold">A</div>
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900 text-sm">Rahul Patel (Admin)</span>
                    <span className="text-xs text-gray-500">Approved Blood Request REQ-001</span>
                  </div>
                </div>
                <span className="text-xs text-gray-400">1 hour ago</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
