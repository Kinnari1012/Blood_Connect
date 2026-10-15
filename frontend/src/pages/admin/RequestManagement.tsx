import React, { useState } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Search, Eye, Check, X, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { requestApi } from '../../services/api';
import { Modal } from '../../components/ui/Modal';
import { BLOOD_GROUP_DISPLAY } from '../../constants';

export function RequestManagement() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'all';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [search, setSearch] = useState('');
  const [selectedReq, setSelectedReq] = useState<any | null>(null);

  const qc = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-requests', activeTab, search],
    queryFn: async () => {
      const res = await requestApi.getAllRequests({
        status: activeTab,
        search: search.trim() || undefined,
      });
      return res.data;
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async (id: string) => {
      return await requestApi.approve(id);
    },
    onSuccess: () => {
      toast.success('Request verified & approved successfully!');
      qc.invalidateQueries({ queryKey: ['admin-requests'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to verify request');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      return await requestApi.reject(id, reason);
    },
    onSuccess: () => {
      toast.success('Request rejected.');
      qc.invalidateQueries({ queryKey: ['admin-requests'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to reject request');
    },
  });

  const handleVerify = (id: string) => {
    if (window.confirm('Are you sure you want to approve this blood request and trigger donor matching?')) {
      verifyMutation.mutate(id);
    }
  };

  const handleReject = (id: string) => {
    const reason = window.prompt('Enter rejection reason (min 10 characters):');
    if (!reason || reason.trim().length < 10) {
      toast.error('Rejection reason must be at least 10 characters long.');
      return;
    }
    rejectMutation.mutate({ id, reason });
  };

  const requests = data?.data || [];

  return (
    <PageLayout title="Blood Requests" subtitle="Monitor, verify, and manage all blood requests across the platform">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden min-h-[600px] flex flex-col">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="flex gap-2 p-1 bg-gray-200/50 rounded-xl w-full md:w-auto overflow-x-auto hide-scrollbar">
            {['all', 'pending', 'accepted', 'rejected', 'fulfilled', 'cancelled'].map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-4 py-2.5 rounded-lg text-sm font-bold transition-all capitalize whitespace-nowrap ${
                  activeTab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search requests..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="flex-1 overflow-x-auto p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-16 text-gray-400">
              <Loader2 className="animate-spin text-primary mb-3" size={32} />
              <p className="text-sm font-medium">Loading live blood requests...</p>
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-red-600">
              <AlertCircle className="mx-auto mb-2" size={32} />
              <p className="font-semibold">Failed to load requests from server.</p>
              <button onClick={() => refetch()} className="mt-3 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold">Retry</button>
            </div>
          ) : requests.length === 0 ? (
            <div className="p-16 text-center text-gray-400">
              <p className="text-base font-semibold text-gray-700">No requests found</p>
              <p className="text-xs text-gray-400 mt-1">Try switching tabs or adjusting search filter</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white border-b border-gray-100 text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-bold">Req ID</th>
                  <th className="px-6 py-4 font-bold">Requester / Patient</th>
                  <th className="px-6 py-4 font-bold">Blood / Hospital</th>
                  <th className="px-6 py-4 font-bold">Units / Urgency</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {requests.map((r: any) => {
                  const reqId = r.requestId || `REQ-${(r._id || r.id).slice(-4).toUpperCase()}`;
                  const isPending = r.status === 'Pending Verification' || r.status?.toLowerCase().includes('pending');
                  const isFulfilled = r.status === 'Fulfilled' || r.status === 'Completed';

                  return (
                    <tr key={r._id || r.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900 font-mono text-xs">{reqId}</td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{r.reqName || r.createdBy?.firstName || 'Requester'}</p>
                        <p className="text-xs text-gray-500">Patient: {r.patient || r.patientName}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-red-600">{BLOOD_GROUP_DISPLAY[r.bg || r.bloodGroup] || r.bloodGroup || r.bg}</p>
                        <p className="text-xs text-gray-500">{r.hospital} • {r.city || ''}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-800">{r.units || r.unitsRequired} Unit(s)</span>
                        <p className={`text-xs font-bold ${r.urgency === 'Critical' ? 'text-red-600' : r.urgency === 'Urgent' ? 'text-orange-600' : 'text-gray-500'}`}>{r.urgency || 'Normal'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
                          isPending ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                          r.status === 'Searching Donors' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          isFulfilled ? 'bg-green-50 text-green-700 border-green-200' :
                          'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedReq(r)}
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye size={16}/>
                          </button>
                          {isPending && (
                            <>
                              <button
                                onClick={() => handleVerify(r._id || r.id)}
                                disabled={verifyMutation.isPending}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Approve Request"
                              >
                                <ShieldCheck size={16}/>
                              </button>
                              <button
                                onClick={() => handleReject(r._id || r.id)}
                                disabled={rejectMutation.isPending}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Reject Request"
                              >
                                <X size={16}/>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {selectedReq && (
        <Modal
          isOpen={!!selectedReq}
          onClose={() => setSelectedReq(null)}
          title={`Request Details - ${selectedReq.requestId || selectedReq.id}`}
        >
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="text-xs text-gray-400 font-semibold">PATIENT NAME</p>
                <p className="font-bold text-gray-900">{selectedReq.patient || selectedReq.patientName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold">BLOOD GROUP</p>
                <p className="font-bold text-red-600">{BLOOD_GROUP_DISPLAY[selectedReq.bloodGroup || selectedReq.bg] || selectedReq.bloodGroup || selectedReq.bg}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold">UNITS REQUIRED</p>
                <p className="font-bold text-gray-900">{selectedReq.units || selectedReq.unitsRequired} Units</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold">URGENCY</p>
                <p className="font-bold text-gray-900">{selectedReq.urgency || 'Normal'}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 font-semibold">HOSPITAL & LOCATION</p>
              <p className="font-bold text-gray-900">{selectedReq.hospital}</p>
              <p className="text-xs text-gray-500">{selectedReq.address || selectedReq.location || ''} {selectedReq.city ? `• ${selectedReq.city}` : ''}</p>
            </div>

            <div>
              <p className="text-xs text-gray-400 font-semibold">CONTACT PERSON</p>
              <p className="font-medium text-gray-800">{selectedReq.contactName || selectedReq.reqName || 'N/A'} ({selectedReq.contactPhone || selectedReq.phone || 'N/A'})</p>
            </div>

            {selectedReq.notes && (
              <div>
                <p className="text-xs text-gray-400 font-semibold">CLINICAL NOTES</p>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">{selectedReq.notes}</p>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                onClick={() => setSelectedReq(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </PageLayout>
  );
}
