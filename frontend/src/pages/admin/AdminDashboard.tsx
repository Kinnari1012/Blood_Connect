import React from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Activity, Users, Droplet, CheckCircle, Clock, AlertCircle, TrendingUp, XCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function AdminDashboard() {
  const navigate = useNavigate();

  const stats = [
    { title: 'Total Users', value: '1,245', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', link: '/admin/users' },
    { title: 'Total Donors', value: '842', icon: Droplet, color: 'text-red-600', bg: 'bg-red-50', link: '/admin/donors' },
    { title: 'Available Donors', value: '310', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', link: '/admin/donors?tab=available' },
    { title: 'Pending Requests', value: '45', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', link: '/admin/requests?tab=pending' },
    { title: 'Accepted Requests', value: '12', icon: CheckCircle, color: 'text-indigo-600', bg: 'bg-indigo-50', link: '/admin/requests?tab=accepted' },
    { title: 'Rejected Requests', value: '4', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', link: '/admin/requests?tab=rejected' },
    { title: 'Completed Donations', value: '890', icon: Activity, color: 'text-green-600', bg: 'bg-green-50', link: '/admin/requests?tab=completed' },
    { title: 'Active Users', value: '1,100', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', link: '/admin/users?tab=active' },
  ];

  return (
    <PageLayout title="Admin Dashboard" subtitle="Overview of platform activities and statistics">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} onClick={() => navigate(stat.link)} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-md hover:border-gray-200 transition-all">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-all" onClick={() => navigate('/admin/requests')}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900 text-lg">Recent Blood Requests</h3>
            <span className="text-sm text-primary font-bold">View All</span>
          </div>
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs">O+</div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Rahul Patel (Emergency)</p>
                    <p className="text-xs text-gray-500">Shalby Hospital • Ahmedabad</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">Pending</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-all" onClick={() => navigate('/admin/users')}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900 text-lg">Recent Registrations</h3>
            <span className="text-sm text-primary font-bold">View All</span>
          </div>
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">U</div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">New User Registered</p>
                    <p className="text-xs text-gray-500">user@example.com • +91 9876543210</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500 font-medium">Just now</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
