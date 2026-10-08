const fs = require('fs');
const path = require('path');

const write = (file, content) => {
  const fullPath = path.join(__dirname, 'src', file);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n');
  console.log(`Updated ${file}`);
};

const myReqContent = `
import React, { useState, useEffect } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Search, Plus, Activity, Edit2, AlertCircle, XCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export function MyRequestsPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<any[]>(() => {
    const saved = localStorage.getItem('my_requests');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'BC-REQ-001', patient: 'Rahul Patel', bg: 'B_POS', units: 2, hospital: 'Shalby Hospital', location: 'Ahmedabad', date: 'Oct 08, 2026', reqDate: 'Oct 07, 2026', urgency: 'Emergency', status: 'Pending' },
      { id: 'BC-REQ-002', patient: 'Rajesh Kumar', bg: 'O_POS', units: 1, hospital: 'Sunshine Hospital', location: 'Surat', date: 'Oct 09, 2026', reqDate: 'Oct 06, 2026', urgency: 'High', status: 'Accepted', donor: 'Amit Shah' },
      { id: 'BC-REQ-003', patient: 'Vikram Singh', bg: 'A_POS', units: 2, hospital: 'Haria Hospital', location: 'Vapi', date: 'Oct 05, 2026', reqDate: 'Oct 01, 2026', urgency: 'Normal', status: 'Completed' },
      { id: 'BC-REQ-004', patient: 'Neha Sharma', bg: 'AB_POS', units: 1, hospital: 'Sterling Hospital', location: 'Vadodara', date: 'Oct 10, 2026', reqDate: 'Oct 08, 2026', urgency: 'Emergency', status: 'Rejected' },
      { id: 'BC-REQ-005', patient: 'Priya Patel', bg: 'O_NEG', units: 3, hospital: 'Civil Hospital', location: 'Valsad', date: 'Oct 12, 2026', reqDate: 'Oct 07, 2026', urgency: 'Critical', status: 'Cancelled' },
    ];
  });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    localStorage.setItem('my_requests', JSON.stringify(requests));
  }, [requests]);

  const handleAction = (id: string, action: string) => {
    if (window.confirm(\`Are you sure you want to \${action} this request?\`)) {
      setRequests(requests.map(r => {
        if (r.id === id) {
          return { ...r, status: action === 'Cancel' ? 'Cancelled' : 'Completed' };
        }
        return r;
      }));
      toast.success(\`Request \${action === 'Cancel' ? 'cancelled' : 'marked as completed'}.\`);
    }
  };

  const filtered = requests.filter(r => {
    const matchesSearch = r.patient.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Accepted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'Rejected': 
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'Draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <PageLayout title="My Requests" subtitle="Manage blood requests you have created">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search patient or ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
              {['All', 'Draft', 'Pending', 'Accepted', 'Completed', 'Rejected', 'Cancelled'].map(s => (
                <button 
                  key={s} 
                  onClick={() => setStatusFilter(s)}
                  className={\`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap \${statusFilter === s ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}\`}
                >
                  {s}
                </button>
              ))}
            </div>
            <button 
              onClick={() => navigate('/requests/create')}
              className="px-4 py-2.5 bg-primary text-white font-bold rounded-xl whitespace-nowrap hover:bg-primary-dark transition-colors flex items-center gap-2"
            >
              <Plus size={16} /> Create Request
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <AlertCircle size={48} className="text-gray-300 mb-4" />
              <p className="text-lg font-semibold">No requests found</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white border-b border-gray-200 text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Req ID & Date</th>
                  <th className="px-6 py-4 font-semibold">Patient & Blood Group</th>
                  <th className="px-6 py-4 font-semibold">Hospital & Location</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(req => (
                  <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{req.id}</p>
                      <p className="text-xs text-gray-500">Req: {req.reqDate}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black border border-primary/20 shrink-0">
                          {req.bg.replace('_POS', '+').replace('_NEG', '-')}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{req.patient}</p>
                          <p className="text-xs text-gray-500 font-semibold">{req.units} Units • {req.urgency}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{req.hospital}</p>
                      <p className="text-xs text-gray-500">{req.date} • {req.location}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-1">
                        <span className={\`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wide border \${getStatusColor(req.status)}\`}>
                          {req.status}
                        </span>
                        {req.donor && req.status === 'Accepted' && (
                          <span className="text-xs text-gray-600 font-semibold bg-gray-100 px-2 py-0.5 rounded-md mt-1">
                            Donor: {req.donor}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors" title="View Details">
                          <Activity size={14} />
                        </button>
                        {(req.status === 'Pending' || req.status === 'Draft') && (
                          <button className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors" title="Edit Request">
                            <Edit2 size={14} />
                          </button>
                        )}
                        {(req.status === 'Pending' || req.status === 'Draft') && (
                          <button onClick={() => handleAction(req.id, 'Cancel')} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors" title="Cancel Request">
                            <XCircle size={14} />
                          </button>
                        )}
                        {(req.status === 'Accepted') && (
                          <button onClick={() => handleAction(req.id, 'Complete')} className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition-colors" title="Mark as Completed">
                            <CheckCircle size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
`;
write('pages/user/MyRequestsPage.tsx', myReqContent);

const incomingReqContent = `
import React, { useState, useEffect } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Check, X, AlertCircle, MapPin, Phone, Calendar, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export function IncomingRequestsPage() {
  const [requests, setRequests] = useState<any[]>(() => {
    const saved = localStorage.getItem('incoming_requests');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'BC-IN-001', requester: 'Neha Patel', patient: 'Riya Patel', bg: 'B_POS', units: 2, location: 'Shalby Hospital', address: 'Ahmedabad', phone: '+91 9876543210', reqDate: 'Oct 07, 2026', date: 'Oct 08, 2026', urgency: 'Emergency', status: 'Pending', distance: '3 km' },
      { id: 'BC-IN-002', requester: 'Jay Shah', patient: 'Aarav Shah', bg: 'O_POS', units: 1, location: 'Sunshine Hospital', address: 'Surat', phone: '+91 9988776655', reqDate: 'Oct 06, 2026', date: 'Oct 09, 2026', urgency: 'High', status: 'Accepted', distance: '12 km' },
      { id: 'BC-IN-003', requester: 'Priya Desai', patient: 'Karan Desai', bg: 'A_POS', units: 2, location: 'Sterling Hospital', address: 'Vadodara', phone: '+91 9123456789', reqDate: 'Oct 08, 2026', date: 'Oct 10, 2026', urgency: 'Emergency', status: 'Rejected', distance: '5 km' },
      { id: 'BC-IN-004', requester: 'Manoj Tiwari', patient: 'Suresh Tiwari', bg: 'AB_POS', units: 1, location: 'Civil Hospital', address: 'Rajkot', phone: '+91 9234567890', reqDate: 'Oct 01, 2026', date: 'Oct 05, 2026', urgency: 'Normal', status: 'Completed', distance: '8 km' },
    ];
  });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    localStorage.setItem('incoming_requests', JSON.stringify(requests));
  }, [requests]);

  const handleAction = (id: string, newStatus: string) => {
    let reason = '';
    if (newStatus === 'Rejected') {
      const confirmReason = window.prompt(\`Optional: Provide a reason for rejecting this request:\`);
      if (confirmReason === null) return; // cancelled prompt
      reason = confirmReason;
    } else {
      if (!window.confirm(\`Are you sure you want to \${newStatus.toLowerCase()} this request?\`)) return;
    }

    setRequests(requests.map(r => r.id === id ? { ...r, status: newStatus } : r));
    
    // Sync with my_requests dummy connected flow
    const savedMyReqs = localStorage.getItem('my_requests');
    if (savedMyReqs) {
      const myReqs = JSON.parse(savedMyReqs);
      const updatedMyReqs = myReqs.map((r: any) => r.id === id ? { ...r, status: newStatus, donor: newStatus === 'Accepted' ? 'Current User' : r.donor } : r);
      localStorage.setItem('my_requests', JSON.stringify(updatedMyReqs));
    }
    
    toast.success(\`Request \${newStatus.toLowerCase()} successfully.\`);
    toast(\`Notification sent to Requester: Your blood donation request has been \${newStatus.toLowerCase()}.\`, { icon: '🔔' });
  };

  const filtered = requests.filter(r => {
    const matchesSearch = r.requester.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <PageLayout title="Incoming Requests" subtitle="Blood donation requests matched with your profile">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by ID or Name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
            {['All', 'Pending', 'Accepted', 'Rejected', 'Completed'].map(s => (
              <button 
                key={s} 
                onClick={() => setStatusFilter(s)}
                className={\`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap \${statusFilter === s ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}\`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 flex-1 overflow-auto bg-gray-50/30">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <AlertCircle size={48} className="text-gray-300 mb-4" />
              <p className="text-lg font-semibold">No requests found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filtered.map(req => (
                <div key={req.id} className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-primary/30 hover:shadow-md transition-all relative overflow-hidden">
                  <div className={\`absolute top-0 right-0 px-4 py-1 text-[10px] font-black uppercase rounded-bl-xl \${
                    req.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                    req.status === 'Accepted' ? 'bg-blue-100 text-blue-800' : 
                    req.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                    'bg-red-100 text-red-800'}\`}>
                    {req.status}
                  </div>
                  
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <p className="text-xs font-bold text-gray-400 mb-1">{req.id} • Req: {req.reqDate}</p>
                      <h3 className="text-lg font-black text-gray-900">{req.requester}</h3>
                      <p className="text-sm font-semibold text-gray-600 mt-1">Patient: {req.patient}</p>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 mt-2">
                      <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-black border-2 border-red-100 text-xl">
                        {req.bg.replace('_POS', '+').replace('_NEG', '-')}
                      </div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase">{req.units} {req.units === 1 ? 'Unit' : 'Units'}</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <AlertCircle size={16} className="text-gray-400" />
                      <div><span className="font-semibold text-gray-900">Urgency:</span> {req.urgency}</div>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Calendar size={16} className="text-gray-400" />
                      <div><span className="font-semibold text-gray-900">Required:</span> {req.date}</div>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-gray-600">
                      <MapPin size={16} className="text-gray-400 mt-0.5" />
                      <div>
                        <span className="font-semibold text-gray-900">{req.location} <span className="text-primary text-xs ml-1 font-bold">({req.distance})</span></span>
                        <p className="text-xs text-gray-500 mt-0.5">{req.address}</p>
                      </div>
                    </div>
                  </div>

                  {req.status === 'Pending' && (
                    <div className="flex items-center gap-3 pt-2">
                      <button 
                        onClick={() => handleAction(req.id, 'Accepted')}
                        className="flex-1 py-3 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Check size={18} /> Accept Request
                      </button>
                      <button 
                        onClick={() => handleAction(req.id, 'Rejected')}
                        className="flex-1 py-3 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 border border-red-100"
                      >
                        <X size={18} /> Reject
                      </button>
                    </div>
                  )}
                  {req.status !== 'Pending' && (
                    <div className="pt-2">
                      <div className={\`p-3 rounded-xl text-sm font-bold text-center \${req.status === 'Accepted' || req.status === 'Completed' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}\`}>
                        You have {req.status.toLowerCase()} this request.
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
`;
write('pages/user/IncomingRequestsPage.tsx', incomingReqContent);
