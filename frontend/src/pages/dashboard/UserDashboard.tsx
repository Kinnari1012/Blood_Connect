import React from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Activity, Droplet, Clock, Heart, Users, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { useAuth } from '../../store/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { requestApi, notificationApi, donationApi } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: myRequestsData } = useQuery({
    queryKey: ['user-my-requests'],
    queryFn: async () => {
      const res = await requestApi.getMyRequests({ limit: 10 });
      return res.data?.data || res.data || [];
    },
  });

  const { data: notificationsData } = useQuery({
    queryKey: ['user-recent-notifications'],
    queryFn: async () => {
      const res = await notificationApi.getAll({ limit: 4 });
      return res.data?.data || res.data || [];
    },
  });

  const myRequests: any[] = Array.isArray(myRequestsData) ? myRequestsData : [];
  const activeRequests = myRequests.filter(r => r.status !== 'Fulfilled' && r.status !== 'Cancelled' && r.status !== 'COMPLETED');
  const notifications: any[] = Array.isArray(notificationsData) ? notificationsData : [];

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Welcome back, {user?.fullName || 'User'}</h1>
            <p className="text-sm text-gray-500 mt-1">Here is your real-time blood connect overview and activity</p>
          </div>
          <button
            onClick={() => navigate('/requests/new')}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-sm shadow-sm transition-all shadow-primary/20"
          >
            <Plus size={18} /> Request Blood
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center border-2 border-red-100 shrink-0">
              <Droplet size={28} />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-semibold">Blood Group</p>
              <p className="text-xl font-black text-gray-900">{user?.donorProfile?.bloodGroup?.replace('_POS', '+')?.replace('_NEG', '-') || user?.bloodGroup || 'O+'}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/donation-history')}>
            <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border-2 border-blue-100 shrink-0">
              <Activity size={28} />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-semibold">Total Donations</p>
              <p className="text-xl font-black text-gray-900">{user?.donorProfile?.totalDonations || 0}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/requests')}>
            <div className="w-14 h-14 rounded-full bg-green-50 text-green-600 flex items-center justify-center border-2 border-green-100 shrink-0">
              <Heart size={28} />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-semibold">Active Requests</p>
              <p className="text-xl font-black text-gray-900">{activeRequests.length}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center border-2 border-purple-100 shrink-0">
              <Users size={28} />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-semibold">Profile Status</p>
              <p className="text-xl font-black text-gray-900">{user?.status || 'Active'}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Live Recent Activity / Notifications */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <Clock size={18} className="text-primary" /> Live Updates & Alerts
              </h3>
              <button onClick={() => navigate('/notifications')} className="text-xs text-primary font-bold hover:underline">
                View All
              </button>
            </div>

            <div className="space-y-3">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <CheckCircle size={32} className="mx-auto text-green-500 mb-2 opacity-80" />
                  <p className="text-sm font-semibold text-gray-700">All caught up!</p>
                  <p className="text-xs text-gray-400 mt-0.5">Real-time alerts on your requests will appear here</p>
                </div>
              ) : (
                notifications.slice(0, 4).map((n: any) => (
                  <div key={n.id || n._id} className="flex gap-4 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Droplet size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{n.title || n.message}</p>
                      {n.body && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{n.body}</p>}
                      <p className="text-[10px] text-gray-400 mt-1">
                        {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Contact and Location Profile */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-4">Account & Medical Info</h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100 text-sm">
                  <span className="text-gray-500">Full Name</span>
                  <span className="font-semibold text-gray-900">{user?.fullName || 'User'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 text-sm">
                  <span className="text-gray-500">Email Address</span>
                  <span className="font-semibold text-gray-900">{user?.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 text-sm">
                  <span className="text-gray-500">Mobile Number</span>
                  <span className="font-semibold text-gray-900">{user?.phone || user?.mobile || 'Not Verified'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 text-sm">
                  <span className="text-gray-500">City & State</span>
                  <span className="font-semibold text-gray-900">{user?.donorProfile?.city || user?.city || 'Gujarat, India'}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/settings')}
              className="mt-6 w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-800 text-sm font-bold rounded-xl border border-gray-200 transition-colors"
            >
              Manage Account Settings →
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
