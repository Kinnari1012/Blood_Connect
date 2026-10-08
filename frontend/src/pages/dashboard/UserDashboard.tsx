import React from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Activity, Droplet, Clock, Heart, Users } from 'lucide-react';
import { useAuth } from '../../store/AuthContext';

export function UserDashboard() {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Welcome back, {user?.fullName || 'User'}</h1>
        <p className="text-sm text-gray-500 mt-1">Here is your quick overview and recent activity</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center border-2 border-red-100">
             <Droplet size={28} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-semibold">Blood Group</p>
            <p className="text-xl font-black text-gray-900">{user?.donorProfile?.bloodGroup?.replace('_POS', '+')?.replace('_NEG', '-') || 'O+'}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border-2 border-blue-100">
             <Activity size={28} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-semibold">Total Donations</p>
            <p className="text-xl font-black text-gray-900">{user?.donorProfile?.totalDonations || 0}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-green-50 text-green-600 flex items-center justify-center border-2 border-green-100">
             <Heart size={28} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-semibold">Active Requests</p>
            <p className="text-xl font-black text-gray-900">1</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center border-2 border-purple-100">
             <Users size={28} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-semibold">Profile Status</p>
            <p className="text-xl font-black text-gray-900">{user?.status || 'Active'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2"><Clock size={18} className="text-gray-400" /> Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Droplet size={18} />
              </div>
              <div>
                <p className="font-semibold text-gray-900">You updated your profile information.</p>
                <p className="text-sm text-gray-500 mt-1">Just now</p>
              </div>
            </div>
            <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Activity size={18} />
              </div>
              <div>
                <p className="font-semibold text-gray-900">You logged in from Ahmedabad.</p>
                <p className="text-sm text-gray-500 mt-1">Today, 10:00 AM</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
           <h3 className="font-bold text-gray-900 text-lg mb-4">Contact Information</h3>
           <div className="space-y-3">
             <div className="flex justify-between py-2 border-b border-gray-100">
               <span className="text-gray-500">Email Address</span>
               <span className="font-semibold text-gray-900">{user?.email}</span>
             </div>
             <div className="flex justify-between py-2 border-b border-gray-100">
               <span className="text-gray-500">Mobile Number</span>
               <span className="font-semibold text-gray-900">{user?.mobile}</span>
             </div>
             <div className="flex justify-between py-2 border-b border-gray-100">
               <span className="text-gray-500">City</span>
               <span className="font-semibold text-gray-900">{user?.donorProfile?.city || 'Not Specified'}</span>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
