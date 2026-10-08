import React, { useState } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Search, Eye, Check, X, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';

export function RequestManagement() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'all';
  const [activeTab, setActiveTab] = useState(initialTab);

  const reqs = [
    { id: 'REQ-001', reqName: 'Kinnari', patient: 'Rahul', bg: 'B+', hospital: 'Shalby', status: 'Pending Verification' },
    { id: 'REQ-002', reqName: 'Amit', patient: 'Rajesh', bg: 'O+', hospital: 'Civil', status: 'Pending' },
    { id: 'REQ-003', reqName: 'Vikram', patient: 'Neha', bg: 'A-', hospital: 'Sterling', status: 'Accepted' },
    { id: 'REQ-004', reqName: 'Priya', patient: 'Kavita', bg: 'AB+', hospital: 'Apollo', status: 'Rejected' },
    { id: 'REQ-005', reqName: 'Suresh', patient: 'Ramesh', bg: 'O-', hospital: 'Haria', status: 'Completed' },
  ];

  const handleVerify = (id: string) => toast.success(`Request ${id} verified by Admin!`);
  const handleReject = (id: string) => {
    const reason = window.prompt("Enter rejection reason:");
    if (reason) toast.success(`Request ${id} rejected. Reason: ${reason}`);
  };

  const filtered = reqs.filter(r => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending' && !r.status.includes('Pending')) return false;
    return r.status.toLowerCase() === activeTab.toLowerCase();
  });

  return (
    <PageLayout title="Blood Requests" subtitle="Monitor and manage all blood requests across the platform">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden min-h-[600px] flex flex-col">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="flex gap-2 p-1 bg-gray-200/50 rounded-xl w-full md:w-auto overflow-x-auto hide-scrollbar">
            {['all', 'pending', 'accepted', 'rejected', 'completed', 'cancelled'].map(t => (
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
            <input type="text" placeholder="Search requests..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>

        <div className="flex-1 overflow-x-auto p-0">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white border-b border-gray-100 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-bold">Req ID</th>
                <th className="px-6 py-4 font-bold">Requester / Patient</th>
                <th className="px-6 py-4 font-bold">Blood / Hospital</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">{r.id}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">Req: {r.reqName}</p>
                    <p className="text-xs text-gray-500">Pat: {r.patient}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-red-600">{r.bg}</p>
                    <p className="text-xs text-gray-500">{r.hospital}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
                      r.status.includes('Pending') ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                      r.status === 'Accepted' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      r.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' :
                      'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"><Eye size={16}/></button>
                      {r.status === 'Pending Verification' && (
                        <>
                          <button onClick={() => handleVerify(r.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Verify Request"><ShieldCheck size={16}/></button>
                          <button onClick={() => handleReject(r.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Reject Request"><X size={16}/></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageLayout>
  );
}
