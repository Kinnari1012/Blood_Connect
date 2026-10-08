import React, { useState, useEffect } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Eye, Edit2, AlertCircle, Search, Filter, X } from 'lucide-react';
import { BLOOD_GROUP_DISPLAY } from '../../constants';
import toast from 'react-hot-toast';

const initialRequests = [
  { id: 'REQ-501', patient: 'Rahul Sharma', bg: 'B_POS', units: 2, hospital: 'Apollo Hospital', location: 'Navrangpura, Ahmedabad', date: 'Oct 06, 2026', urgency: 'Critical', status: 'Pending' },
  { id: 'REQ-502', patient: 'Priya Desai', bg: 'A_NEG', units: 1, hospital: 'Zydus Hospital', location: 'Thaltej, Ahmedabad', date: 'Oct 05, 2026', urgency: 'High', status: 'In Progress' },
  { id: 'REQ-503', patient: 'Anjali Verma', bg: 'O_POS', units: 3, hospital: 'Kiran Hospital', location: 'Katargam, Surat', date: 'Oct 07, 2026', urgency: 'Critical', status: 'Pending' },
  { id: 'REQ-504', patient: 'Vikram Singh', bg: 'AB_POS', units: 1, hospital: 'Sterling Hospital', location: 'Race Course, Vadodara', date: 'Oct 04, 2026', urgency: 'Normal', status: 'Fulfilled' },
  { id: 'REQ-505', patient: 'Nisha Patel', bg: 'O_NEG', units: 2, hospital: 'Civil Hospital', location: 'Asarwa, Ahmedabad', date: 'Oct 06, 2026', urgency: 'High', status: 'Pending' },
  { id: 'REQ-506', patient: 'Suresh Kumar', bg: 'B_NEG', units: 1, hospital: 'Wockhardt Hospital', location: 'Kalawad Road, Rajkot', date: 'Oct 02, 2026', urgency: 'Normal', status: 'Fulfilled' },
  { id: 'REQ-507', patient: 'Meghna Shah', bg: 'A_POS', units: 4, hospital: 'CIMS Hospital', location: 'Science City, Ahmedabad', date: 'Oct 07, 2026', urgency: 'Critical', status: 'Pending' },
  { id: 'REQ-508', patient: 'Rajiv Malhotra', bg: 'O_POS', units: 2, hospital: 'Mahavir Hospital', location: 'Athwa, Surat', date: 'Oct 01, 2026', urgency: 'Normal', status: 'Cancelled' },
];

export function BloodRequestsPage() {
  const [requests, setRequests] = useState(() => {
    const saved = localStorage.getItem('mock_requests');
    return saved ? JSON.parse(saved) : initialRequests;
  });
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create'|'edit'|'view'>('create');
  const [formData, setFormData] = useState({ id: '', patient: '', bg: 'O_POS', units: 1, hospital: '', location: '', urgency: 'Normal', status: 'Pending', date: '' });

  useEffect(() => {
    localStorage.setItem('mock_requests', JSON.stringify(requests));
  }, [requests]);

  const filtered = requests.filter((r: any) => r.patient.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = () => {
    setModalMode('create');
    setFormData({ id: '', patient: '', bg: 'O_POS', units: 1, hospital: '', location: '', urgency: 'Normal', status: 'Pending', date: new Date().toLocaleDateString('en-US', {month: 'short', day: '2-digit', year: 'numeric'}) });
    setIsModalOpen(true);
  };

  const handleView = (r: any) => {
    setModalMode('view');
    setFormData(r);
    setIsModalOpen(true);
  };

  const handleEdit = (r: any) => {
    setModalMode('edit');
    setFormData(r);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patient || !formData.hospital) {
      toast.error('Patient Name and Hospital are required.');
      return;
    }
    if (modalMode === 'create') {
      const newRequest = {
        ...formData,
        id: `REQ-5${requests.length + 10}`,
      };
      setRequests([newRequest, ...requests]);
      toast.success('Blood Request created successfully');
    } else if (modalMode === 'edit') {
      setRequests(requests.map((r: any) => r.id === formData.id ? { ...r, ...formData } : r));
      toast.success('Blood Request updated successfully');
    }
    setIsModalOpen(false);
  };

  return (
    <PageLayout title="Blood Requests" subtitle="Track and manage patient blood requests">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
           <h2 className="text-lg font-bold text-gray-900">Active & Past Requests</h2>
           <div className="flex items-center gap-3 w-full sm:w-auto">
             <div className="relative flex-1 sm:w-64">
               <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
               <input 
                 type="text" 
                 placeholder="Search requests..." 
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
               />
             </div>
             <button onClick={handleCreate} className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-colors focus:outline-none">Create Request</button>
           </div>
        </div>
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
              <tr>
                <th className="px-6 py-4 font-medium">Req ID</th>
                <th className="px-6 py-4 font-medium">Patient Details</th>
                <th className="px-6 py-4 font-medium">Hospital & Location</th>
                <th className="px-6 py-4 font-medium">Date & Urgency</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((r: any) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{r.id}</td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900 mb-1">{r.patient}</p>
                    <div className="flex items-center gap-2">
                       <span className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded text-xs font-bold">{BLOOD_GROUP_DISPLAY[r.bg as keyof typeof BLOOD_GROUP_DISPLAY] || r.bg}</span>
                       <span className="text-xs text-gray-500 font-medium">{r.units} Units</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-900 font-medium">{r.hospital}</p>
                    <p className="text-xs text-gray-500">{r.location}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-900">{r.date}</p>
                    <p className={`text-xs font-bold mt-0.5 ${r.urgency === 'Critical' ? 'text-red-600 flex items-center gap-1' : r.urgency === 'High' ? 'text-orange-500' : 'text-gray-500'}`}>
                       {r.urgency === 'Critical' && <AlertCircle size={10} />}
                       {r.urgency}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded w-fit ${r.status === 'Fulfilled' ? 'bg-green-100 text-green-800' : r.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleView(r)} className="text-gray-400 hover:text-primary mx-2 transition-colors focus:outline-none"><Eye size={16} /></button>
                    <button onClick={() => handleEdit(r)} className="text-gray-400 hover:text-primary mx-2 transition-colors focus:outline-none"><Edit2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                   <td colSpan={6} className="text-center py-12 text-gray-500">No blood requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {modalMode === 'create' ? 'Create Blood Request' : modalMode === 'edit' ? 'Edit Request' : 'View Request Details'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Patient Name *</label>
                  <input readOnly={modalMode === 'view'} required type="text" value={formData.patient} onChange={e => setFormData({...formData, patient: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Blood Group *</label>
                  <select disabled={modalMode === 'view'} value={formData.bg} onChange={e => setFormData({...formData, bg: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1">
                    {Object.keys(BLOOD_GROUP_DISPLAY).map(key => (
                      <option key={key} value={key}>{BLOOD_GROUP_DISPLAY[key as keyof typeof BLOOD_GROUP_DISPLAY]}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Units Required *</label>
                  <input readOnly={modalMode === 'view'} required type="number" min="1" value={formData.units} onChange={e => setFormData({...formData, units: parseInt(e.target.value)})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Urgency</label>
                  <select disabled={modalMode === 'view'} value={formData.urgency} onChange={e => setFormData({...formData, urgency: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1">
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Hospital *</label>
                <input readOnly={modalMode === 'view'} required type="text" value={formData.hospital} onChange={e => setFormData({...formData, hospital: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Location / Area</label>
                  <input readOnly={modalMode === 'view'} type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                  <select disabled={modalMode === 'view'} value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1">
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Fulfilled">Fulfilled</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50">{modalMode === 'view' ? 'Close' : 'Cancel'}</button>
                {modalMode !== 'view' && (
                  <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90">{modalMode === 'create' ? 'Create Request' : 'Save Changes'}</button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
