import React, { useState, useEffect } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Edit2, Trash2, Heart, Search, Filter, Download, X } from 'lucide-react';
import { BLOOD_GROUP_DISPLAY } from '../../constants';
import toast from 'react-hot-toast';

const initialDonors = [
  { id: 'DNR-1021', name: 'Vikash Mehta', bg: 'O_POS', phone: '+91 98980 11223', location: 'Maninagar, Ahmedabad', lastDonation: 'Aug 12, 2026', eligibility: 'Eligible', status: 'Available' },
  { id: 'DNR-1022', name: 'Riya Shah', bg: 'A_NEG', phone: '+91 99000 22334', location: 'Adajan, Surat', lastDonation: 'Sep 25, 2026', eligibility: 'Not Eligible (Recent)', status: 'Unavailable' },
  { id: 'DNR-1023', name: 'Amit Patel', bg: 'B_POS', phone: '+91 91234 56780', location: 'Navrangpura, Ahmedabad', lastDonation: 'Jan 15, 2026', eligibility: 'Eligible', status: 'Available' },
  { id: 'DNR-1024', name: 'Pooja Desai', bg: 'AB_POS', phone: '+91 98765 43210', location: 'Alkapuri, Vadodara', lastDonation: 'May 20, 2026', eligibility: 'Eligible', status: 'Available' },
  { id: 'DNR-1025', name: 'Rahul Verma', bg: 'O_NEG', phone: '+91 99887 76655', location: 'Vesu, Surat', lastDonation: 'Oct 01, 2026', eligibility: 'Not Eligible (Recent)', status: 'Unavailable' },
  { id: 'DNR-1026', name: 'Neha Gupta', bg: 'A_POS', phone: '+91 90123 45678', location: 'Kalawad Road, Rajkot', lastDonation: 'N/A', eligibility: 'Eligible', status: 'Available' },
  { id: 'DNR-1027', name: 'Karan Joshi', bg: 'B_NEG', phone: '+91 98222 33444', location: 'Bopal, Ahmedabad', lastDonation: 'Jul 10, 2026', eligibility: 'Eligible', status: 'Available' },
  { id: 'DNR-1028', name: 'Sneha Reddy', bg: 'O_POS', phone: '+91 93444 55666', location: 'Sama, Vadodara', lastDonation: 'N/A', eligibility: 'Eligible', status: 'Available' },
];

export function DonorsPage() {
  const [donors, setDonors] = useState(() => {
    const saved = localStorage.getItem('mock_donors');
    return saved ? JSON.parse(saved) : initialDonors;
  });
  const [search, setSearch] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add'|'edit'>('add');
  
  const [formData, setFormData] = useState({ id: '', name: '', bg: 'O_POS', phone: '', location: '', eligibility: 'Eligible', status: 'Available', lastDonation: 'N/A' });

  useEffect(() => {
    localStorage.setItem('mock_donors', JSON.stringify(donors));
  }, [donors]);

  const filtered = donors.filter((d: any) => d.name.toLowerCase().includes(search.toLowerCase()) || d.id.toLowerCase().includes(search.toLowerCase()));

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      toast.success('Donor records exported successfully!');
    }, 1000);
  };

  const handleDelete = (id: string) => {
    if(window.confirm('Are you sure you want to delete this donor?')) {
      setDonors(donors.filter((d: any) => d.id !== id));
      toast.success('Donor deleted.');
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setFormData({ id: '', name: '', bg: 'O_POS', phone: '', location: '', eligibility: 'Eligible', status: 'Available', lastDonation: 'N/A' });
    setIsModalOpen(true);
  };

  const openEditModal = (donor: any) => {
    setModalMode('edit');
    setFormData(donor);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast.error('Name and Phone are required.');
      return;
    }
    if (modalMode === 'add') {
      const newDonor = {
        ...formData,
        id: `DNR-10${donors.length + 30}`,
      };
      setDonors([newDonor, ...donors]);
      toast.success('Donor created successfully');
    } else {
      setDonors(donors.map((d: any) => d.id === formData.id ? { ...d, ...formData } : d));
      toast.success('Donor updated successfully');
    }
    setIsModalOpen(false);
  };

  return (
    <PageLayout title="Donor Directory" subtitle="Manage registered blood donors and their eligibility">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px] flex flex-col">
        <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
           <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Heart size={20} className="text-primary"/> Registered Donors</h2>
           <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
             <div className="relative flex-1 sm:w-64">
               <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
               <input 
                 type="text" 
                 placeholder="Search donors..." 
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
               />
             </div>
             <button onClick={handleExport} disabled={isExporting} className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 flex items-center gap-2 focus:outline-none disabled:opacity-50 transition-colors">
               <Download size={16} /> {isExporting ? 'Exporting...' : 'Export'}
             </button>
             <button onClick={openAddModal} className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary transition-colors">Add Donor</button>
           </div>
        </div>
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
              <tr>
                <th className="px-6 py-4 font-medium">Donor ID</th>
                <th className="px-6 py-4 font-medium">Name & Blood Group</th>
                <th className="px-6 py-4 font-medium">Location</th>
                <th className="px-6 py-4 font-medium">Last Donation</th>
                <th className="px-6 py-4 font-medium">Eligibility</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((d: any) => (
                <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{d.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center font-bold border border-primary/20">
                        {BLOOD_GROUP_DISPLAY[d.bg as keyof typeof BLOOD_GROUP_DISPLAY] || d.bg}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{d.name}</p>
                        <p className="text-xs text-gray-500">{d.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{d.location}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{d.lastDonation}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={`text-xs font-semibold ${d.eligibility.includes('Not') ? 'text-red-600' : 'text-green-600'}`}>
                        {d.eligibility}
                      </span>
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded w-fit ${d.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {d.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openEditModal(d)} className="text-gray-400 hover:text-primary mx-2 transition-colors focus:outline-none"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(d.id)} className="text-gray-400 hover:text-red-600 mx-2 transition-colors focus:outline-none"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                   <td colSpan={6} className="text-center py-12 text-gray-500">No donors found matching your search.</td>
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
              <h3 className="text-lg font-bold text-gray-900">{modalMode === 'add' ? 'Add New Donor' : 'Edit Donor'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Blood Group *</label>
                  <select value={formData.bg} onChange={e => setFormData({...formData, bg: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1">
                    {Object.keys(BLOOD_GROUP_DISPLAY).map(key => (
                      <option key={key} value={key}>{BLOOD_GROUP_DISPLAY[key as keyof typeof BLOOD_GROUP_DISPLAY]}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number *</label>
                <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Location</label>
                <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Eligibility</label>
                  <select value={formData.eligibility} onChange={e => setFormData({...formData, eligibility: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1">
                    <option value="Eligible">Eligible</option>
                    <option value="Not Eligible (Recent)">Not Eligible (Recent)</option>
                    <option value="Not Eligible (Health)">Not Eligible (Health)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1">
                    <option value="Available">Available</option>
                    <option value="Unavailable">Unavailable</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90">{modalMode === 'add' ? 'Save Donor' : 'Update Donor'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
