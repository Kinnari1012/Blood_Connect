import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { requestApi, donorApi } from '../../services/api';
import { BloodRequest } from '../../types';
import { ROUTES } from '../../constants';
import { Activity, AlertCircle, Users, ClipboardList, Clock, ChevronRight, ShieldCheck, MapPin, Droplet, Heart, Check, X } from 'lucide-react';
import { BloodGroupBadge, StatusBadge } from '../../components/ui/Badge';
import { StatCard } from '../../components/dashboard/StatCard';
import toast from 'react-hot-toast';

export function AdminDashboard() {
  const { t } = useTranslation();

  const { data: pendingRequests = [], refetch: refetchRequests } = useQuery({
    queryKey: ['admin', 'requests', 'pending'],
    queryFn: async () => {
      const res = await requestApi.getAllRequests({ status: 'PENDING_VERIFICATION', limit: 5 });
      return res.data?.data || [];
    }
  });

  const { data: emergencyRequests = [] } = useQuery({
    queryKey: ['admin', 'requests', 'emergency'],
    queryFn: async () => {
      const res = await requestApi.getAllRequests({ isEmergency: true, limit: 5 });
      return res.data?.data || [];
    }
  });
  
  const handleApprove = async (id: string) => {
    try {
      await requestApi.approve(id);
      toast.success('Request approved successfully');
      refetchRequests();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const reason = window.prompt("Enter rejection reason:");
      if (!reason) return;
      await requestApi.reject(id, reason);
      toast.success('Request rejected');
      refetchRequests();
    } catch (err: any) {
      toast.error('Failed to reject');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Operations</h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">Manage blood requests, donors, and daily operations.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/requests/emergency" className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg font-bold text-sm hover:bg-red-100 transition-colors flex items-center gap-2">
            <AlertCircle size={16} /> Emergency Board
          </Link>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to={ROUTES.BLOOD_REQUESTS}><StatCard title="Total Requests" value="342" icon={Activity} trend="Lifetime" variant="default" /></Link>
        <Link to={ROUTES.BLOOD_REQUESTS}><StatCard title="Pending Verifications" value={pendingRequests.length} icon={ShieldCheck} trend="Requires action" variant="warning" /></Link>
        <Link to="/requests/emergency"><StatCard title="Emergency Requests" value={emergencyRequests.length} icon={AlertCircle} trend="Critical" variant="emergency" /></Link>
        <Link to={ROUTES.DONORS}><StatCard title="Available Donors" value="142" icon={Users} trend="Ready to donate" variant="success" /></Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Admin Request Workflow */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between bg-white">
            <h2 className="font-bold text-gray-900 flex items-center gap-2 text-lg"><ShieldCheck size={20} className="text-warning" /> Pending Blood Requests</h2>
            <Link to={ROUTES.BLOOD_REQUESTS} className="text-sm font-bold text-primary flex items-center hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-colors">View All <ChevronRight size={16} /></Link>
          </div>
          <div className="p-0 flex-1 overflow-auto bg-gray-50/30">
            {pendingRequests.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {pendingRequests.map((req: BloodRequest) => (
                  <div key={req.id} className="p-5 bg-white hover:bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
                    <div>
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className="font-bold text-gray-900 text-base">{req.patientName}</span>
                        {req.isEmergency && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 uppercase tracking-wider">Emergency</span>}
                        <span className="text-xs font-medium text-gray-500">#{req.id?.substring(0,6).toUpperCase()}</span>
                      </div>
                      <div className="text-sm text-gray-600 flex flex-wrap items-center gap-4">
                        <BloodGroupBadge group={req.bloodGroup} />
                        <span className="flex items-center gap-1"><MapPin size={14} className="text-gray-400" /> {req.hospitalCity || req.hospitalName}</span>
                        <span className="flex items-center gap-1 font-semibold"><Droplet size={14} className="text-primary" /> {req.unitsRequired} Units</span>
                        <span className="flex items-center gap-1 text-xs text-gray-400"><Clock size={12} /> {new Date(req.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Link to={`/requests/${req.id}`} className="px-3 py-2 bg-gray-100 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-200 transition-colors">View</Link>
                      <button onClick={() => handleApprove(req.id)} className="px-3 py-2 bg-green-50 text-green-700 text-sm font-bold rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1"><Check size={16}/> Approve</button>
                      <button onClick={() => handleReject(req.id)} className="px-3 py-2 bg-red-50 text-red-700 text-sm font-bold rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1"><X size={16}/> Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-green-500 mb-4 shadow-sm border border-green-100"><ShieldCheck size={32} /></div>
                <h3 className="text-gray-900 font-bold text-lg">All caught up!</h3>
                <p className="text-sm text-gray-500 mt-1 max-w-xs">There are no blood requests pending verification at this time.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Emergency Section */}
          <div className="bg-white rounded-2xl border border-red-100 shadow-[0_4px_20px_-4px_rgba(211,47,47,0.1)] flex flex-col overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-red-50/30">
              <h2 className="font-bold text-red-700 flex items-center gap-2"><AlertCircle size={18} /> Emergency Board</h2>
            </div>
            <div className="p-0 flex-1 overflow-auto max-h-80">
              {emergencyRequests.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {emergencyRequests.map((req: BloodRequest) => (
                    <div key={req.id} className="p-4 bg-white hover:bg-red-50/50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-gray-900">{req.patientName}</span>
                        <BloodGroupBadge group={req.bloodGroup} size="sm" />
                      </div>
                      <div className="text-xs text-gray-600 mb-3 flex flex-col gap-1">
                        <span className="flex items-center gap-1"><MapPin size={12}/> {req.hospitalName}</span>
                        <span className="flex items-center gap-1 text-red-600 font-bold"><Droplet size={12}/> {req.unitsRequired} Units Required NOW</span>
                      </div>
                      <Link to={`/requests/${req.id}`} className="block w-full text-center py-2 bg-red-100 text-red-700 text-xs font-bold rounded-lg hover:bg-red-200 transition-colors">Take Action</Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 text-sm font-medium">No active emergencies</div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 flex items-center gap-2"><Activity size={18} className="text-gray-400"/> Recent Activity</h2>
            </div>
            <div className="p-5 flex-1 overflow-auto bg-gray-50/30">
               <div className="space-y-5">
                  <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 shadow-sm border border-green-200"><ShieldCheck size={14} /></div>
                    <div>
                      <p className="text-sm text-gray-900 font-medium">Request <span className="font-bold">#REQ-892</span> was approved.</p>
                      <p className="text-xs text-gray-500 mt-1">10 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm border border-blue-200"><Users size={14} /></div>
                    <div>
                      <p className="text-sm text-gray-900 font-medium">Donor matched for <span className="font-bold">#REQ-891</span>.</p>
                      <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm border border-purple-200"><ClipboardList size={14} /></div>
                    <div>
                      <p className="text-sm text-gray-900 font-medium">Donation <span className="font-bold">#DON-22</span> completed.</p>
                      <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
