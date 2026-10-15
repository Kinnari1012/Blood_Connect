import React, { useState } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Eye, Edit2, AlertCircle, Search, Filter, X, MapPin, Navigation, Loader2 } from 'lucide-react';
import { MapModal } from '../../components/common/MapModal';
import { openGoogleMapsDirections, buildAddressQuery } from '../../utils/mapUtils';
import { BLOOD_GROUP_DISPLAY } from '../../constants';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { requestApi } from '../../services/api';

export function BloodRequestsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedMapLocation, setSelectedMapLocation] = useState<{ name: string; address: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create'|'edit'|'view'>('create');
  const [formData, setFormData] = useState({
    id: '',
    patient: '',
    bg: 'O_POS',
    units: 1,
    hospital: '',
    location: '',
    urgency: 'Normal',
    status: 'Pending Verification',
    date: '',
    contactName: '',
    contactPhone: '',
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['blood-requests', search],
    queryFn: async () => {
      const res = await requestApi.getAllRequests({ search: search.trim() || undefined });
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      return await requestApi.create({
        patientName: payload.patient,
        bloodGroup: payload.bg,
        unitsRequired: payload.units,
        hospital: payload.hospital,
        address: payload.location,
        city: payload.location ? payload.location.split(',').pop()?.trim() || 'Ahmedabad' : 'Ahmedabad',
        urgency: payload.urgency === 'Critical' ? 'Critical' : payload.urgency === 'High' ? 'Urgent' : 'Normal',
        contactName: payload.contactName || payload.patient,
        contactPhone: payload.contactPhone || '+91 98765 43210',
      });
    },
    onSuccess: () => {
      toast.success('Blood Request created successfully!');
      qc.invalidateQueries({ queryKey: ['blood-requests'] });
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create request');
    },
  });

  const rawRequests = data?.data || [];
  const requests = rawRequests.map((r: any) => ({
    id: r.requestId || `REQ-${(r._id || r.id).slice(-4).toUpperCase()}`,
    _id: r._id || r.id,
    patient: r.patient || r.patientName,
    bg: r.bg || r.bloodGroup,
    units: r.units || r.unitsRequired,
    hospital: r.hospital,
    location: r.address || r.location || (r.city ? `${r.city}` : 'Gujarat'),
    date: r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Recently',
    urgency: r.urgency || 'Normal',
    status: r.status || 'Pending Verification',
    contactName: r.contactName,
    contactPhone: r.contactPhone,
  }));

  const handleCreate = () => {
    setModalMode('create');
    setFormData({
      id: '',
      patient: '',
      bg: 'O_POS',
      units: 1,
      hospital: '',
      location: '',
      urgency: 'Normal',
      status: 'Pending Verification',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      contactName: '',
      contactPhone: '',
    });
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
      createMutation.mutate(formData);
    } else {
      toast.success('Blood request updated');
      setIsModalOpen(false);
    }
  };

  return (
    <PageLayout title="Blood Requests" subtitle="Track, create, and manage patient blood requests">
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
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-colors focus:outline-none"
            >
              + Create Request
            </button>
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-16 text-gray-400">
              <Loader2 className="animate-spin text-primary mb-3" size={32} />
              <p className="text-sm font-medium">Fetching real-time blood requests...</p>
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-red-600">
              <AlertCircle className="mx-auto mb-2" size={32} />
              <p className="font-semibold">Unable to fetch blood requests</p>
              <button onClick={() => refetch()} className="mt-3 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg text-xs font-bold">Retry</button>
            </div>
          ) : requests.length === 0 ? (
            <div className="p-16 text-center text-gray-400">
              <p className="text-base font-semibold text-gray-700">No blood requests found</p>
              <p className="text-xs text-gray-400 mt-1">Click "+ Create Request" above to submit a new requirement</p>
            </div>
          ) : (
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
                {requests.map((r: any) => (
                  <tr key={r._id || r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 font-mono text-xs">{r.id}</td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900 mb-1">{r.patient}</p>
                      <div className="flex items-center gap-2">
                        <span className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded text-xs font-bold">
                          {BLOOD_GROUP_DISPLAY[r.bg as keyof typeof BLOOD_GROUP_DISPLAY] || r.bg}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">{r.units} Unit(s)</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <p className="text-gray-900 font-medium">{r.hospital}</p>
                        <button
                          type="button"
                          onClick={() => setSelectedMapLocation({ name: r.hospital, address: `${r.hospital}, ${r.location}` })}
                          className="text-gray-400 hover:text-primary transition-colors p-0.5 rounded"
                          title="View on Map"
                        >
                          <MapPin size={13} />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">{r.location}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900">{r.date}</p>
                      <p className={`text-xs font-bold mt-0.5 ${r.urgency === 'Critical' ? 'text-red-600 flex items-center gap-1' : r.urgency === 'Urgent' || r.urgency === 'High' ? 'text-orange-500' : 'text-gray-500'}`}>
                        {r.urgency === 'Critical' && <AlertCircle size={10} />}
                        {r.urgency}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded w-fit ${
                        r.status === 'Fulfilled' ? 'bg-green-100 text-green-800' :
                        r.status === 'Searching Donors' || r.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        type="button"
                        onClick={() => openGoogleMapsDirections(buildAddressQuery(r.hospital, r.location))} 
                        className="text-gray-400 hover:text-primary mx-1.5 transition-colors focus:outline-none" 
                        title="Open Turn-by-Turn GPS in Google Maps"
                      >
                        <Navigation size={15} />
                      </button>
                      <button onClick={() => handleView(r)} className="text-gray-400 hover:text-primary mx-1.5 transition-colors focus:outline-none" title="View Details">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => handleEdit(r)} className="text-gray-400 hover:text-primary mx-1.5 transition-colors focus:outline-none" title="Edit Request">
                        <Edit2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
                  <input
                    readOnly={modalMode === 'view'}
                    required
                    type="text"
                    value={formData.patient}
                    onChange={e => setFormData({...formData, patient: e.target.value})}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Blood Group *</label>
                  <select
                    disabled={modalMode === 'view'}
                    value={formData.bg}
                    onChange={e => setFormData({...formData, bg: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1"
                  >
                    {Object.keys(BLOOD_GROUP_DISPLAY).map(key => (
                      <option key={key} value={key}>{BLOOD_GROUP_DISPLAY[key as keyof typeof BLOOD_GROUP_DISPLAY]}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Units Required *</label>
                  <input
                    readOnly={modalMode === 'view'}
                    required
                    type="number"
                    min="1"
                    value={formData.units}
                    onChange={e => setFormData({...formData, units: parseInt(e.target.value) || 1})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Urgency</label>
                  <select
                    disabled={modalMode === 'view'}
                    value={formData.urgency}
                    onChange={e => setFormData({...formData, urgency: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">Urgent</option>
                    <option value="Critical">Critical (Immediate)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Hospital *</label>
                <input
                  readOnly={modalMode === 'view'}
                  required
                  type="text"
                  placeholder="e.g. Apollo Hospital"
                  value={formData.hospital}
                  onChange={e => setFormData({...formData, hospital: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Location / Area</label>
                  <input
                    readOnly={modalMode === 'view'}
                    type="text"
                    placeholder="e.g. Bhat, Gandhinagar"
                    value={formData.location}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Phone</label>
                  <input
                    readOnly={modalMode === 'view'}
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={formData.contactPhone}
                    onChange={e => setFormData({...formData, contactPhone: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1"
                  />
                </div>
              </div>
              <div className="pt-4 flex items-center justify-between gap-3">
                {modalMode === 'view' ? (
                  <button
                    type="button"
                    onClick={() => openGoogleMapsDirections(buildAddressQuery(formData.hospital, formData.location))}
                    className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-primary text-sm font-bold rounded-lg border border-red-200 flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Navigation size={15} />
                    <span>Open in Maps / GPS</span>
                  </button>
                ) : <div />}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50"
                  >
                    {modalMode === 'view' ? 'Close' : 'Cancel'}
                  </button>
                  {modalMode !== 'view' && (
                    <button
                      type="submit"
                      disabled={createMutation.isPending}
                      className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50"
                    >
                      {createMutation.isPending ? 'Submitting...' : modalMode === 'create' ? 'Create Request' : 'Save Changes'}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <MapModal
        isOpen={!!selectedMapLocation}
        onClose={() => setSelectedMapLocation(null)}
        title="Hospital Location & Directions"
        name={selectedMapLocation?.name}
        address={selectedMapLocation?.address || ''}
      />
    </PageLayout>
  );
}
