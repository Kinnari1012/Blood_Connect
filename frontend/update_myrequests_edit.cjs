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
import { Search, Plus, Activity, Edit2, AlertCircle, XCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input, Select } from '../../components/ui/Input';
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
  
  const [editingRequest, setEditingRequest] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    localStorage.setItem('my_requests', JSON.stringify(requests));
  }, [requests]);

  const handleAction = (id: string, action: string) => {
    if (window.confirm(\`Are you sure you want to \${action.toLowerCase()} this request?\`)) {
      setRequests(requests.map(r => {
        if (r.id === id) {
          return { ...r, status: action === 'Cancel' ? 'Cancelled' : 'Completed' };
        }
        return r;
      }));
      toast.success(\`Request \${action === 'Cancel' ? 'cancelled' : 'marked as completed'}.\`);
    }
  };

  const startEdit = (req: any) => {
    setEditingRequest({ ...req });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setRequests(requests.map(r => r.id === editingRequest.id ? editingRequest : r));
      setIsSubmitting(false);
      setEditingRequest(null);
      toast.success('Request updated successfully');
    }, 800);
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
      
      {editingRequest && (
        <div className="fixed inset-0 bg-gray-900/50 z-[900] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full my-8 p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">Edit Blood Request ({editingRequest.id})</h2>
            
            <form onSubmit={handleEditSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input label="Patient Name" required value={editingRequest.patient} onChange={e => setEditingRequest({...editingRequest, patient: e.target.value})} />
                <Select label="Blood Group Required" required value={editingRequest.bg} onChange={e => setEditingRequest({...editingRequest, bg: e.target.value})} options={[
                  {value:'A_POS',label:'A+'},{value:'B_POS',label:'B+'},{value:'O_POS',label:'O+'},{value:'AB_POS',label:'AB+'},
                  {value:'A_NEG',label:'A-'},{value:'B_NEG',label:'B-'},{value:'O_NEG',label:'O-'},{value:'AB_NEG',label:'AB-'}
                ]} />
                <Input label="Required Units" type="number" required value={editingRequest.units} onChange={e => setEditingRequest({...editingRequest, units: Number(e.target.value)})} />
                <Select label="Urgency" required value={editingRequest.urgency} onChange={e => setEditingRequest({...editingRequest, urgency: e.target.value})} options={[
                  {value:'Normal',label:'Normal'},{value:'Urgent',label:'Urgent'},{value:'Emergency',label:'Emergency'}
                ]} />
                <Input label="Hospital Name" required value={editingRequest.hospital} onChange={e => setEditingRequest({...editingRequest, hospital: e.target.value})} />
                <Input label="City" required value={editingRequest.location} onChange={e => setEditingRequest({...editingRequest, location: e.target.value})} />
              </div>
              
              <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={() => setEditingRequest(null)} disabled={isSubmitting} className="px-5 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-lg text-sm hover:bg-gray-200 transition-colors disabled:opacity-50">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 bg-primary text-white font-bold rounded-lg text-sm hover:bg-primary-dark transition-colors flex items-center gap-2 disabled:opacity-70">
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                        {(req.status === 'Pending' || req.status === 'Draft') && (
                          <button onClick={() => startEdit(req)} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors" title="Edit Request">
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
