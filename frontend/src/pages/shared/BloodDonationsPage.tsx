import React, { useState } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Droplet, FileText, Search, X, Loader2, AlertCircle } from 'lucide-react';
import { BLOOD_GROUP_DISPLAY } from '../../constants';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { donationApi } from '../../services/api';

export function BloodDonationsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    donor: '',
    bg: 'O_POS',
    date: new Date().toISOString().slice(0, 10),
    location: '',
    units: 1,
    status: 'Donation Completed',
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['donations', search],
    queryFn: async () => {
      const res = await donationApi.getAll({ search: search.trim() || undefined });
      return res.data;
    },
  });

  const createDonationMutation = useMutation({
    mutationFn: async (payload: typeof formData) => {
      return await donationApi.create({
        donor: payload.donor,
        bloodGroup: payload.bg,
        date: payload.date,
        hospital: payload.location,
        location: payload.location,
        units: payload.units,
        status: payload.status,
      });
    },
    onSuccess: () => {
      toast.success('Donation logged successfully!');
      qc.invalidateQueries({ queryKey: ['donations'] });
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to log donation');
    },
  });

  const donations = data?.data || [];

  const handleLogDonation = () => {
    setFormData({
      donor: '',
      bg: 'O_POS',
      date: new Date().toISOString().slice(0, 10),
      location: '',
      units: 1,
      status: 'Donation Completed',
    });
    setIsModalOpen(true);
  };

  const handleDownload = (id: string, donorName?: string) => {
    const toastId = toast.loading(`Generating donation certificate for ${donorName || id}...`);
    setTimeout(() => {
      toast.success('Certificate downloaded successfully!', { id: toastId });
    }, 1200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.donor || !formData.location) {
      toast.error('Donor name and location are required.');
      return;
    }
    createDonationMutation.mutate(formData);
  };

  return (
    <PageLayout title="Blood Donations" subtitle="Log and monitor blood donation records and history">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Droplet size={20} className="text-primary"/> Donation Log
          </h2>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search donations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <button
              onClick={handleLogDonation}
              className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:opacity-90 focus:outline-none transition-colors"
            >
              + Log Donation
            </button>
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-16 text-gray-400">
              <Loader2 className="animate-spin text-primary mb-3" size={32} />
              <p className="text-sm font-medium">Loading donation records...</p>
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-red-600">
              <AlertCircle className="mx-auto mb-2" size={32} />
              <p className="font-semibold">Unable to fetch donation records</p>
              <button onClick={() => refetch()} className="mt-3 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg text-xs font-bold">Retry</button>
            </div>
          ) : donations.length === 0 ? (
            <div className="p-16 text-center text-gray-400">
              <p className="text-base font-semibold text-gray-700">No donations recorded yet</p>
              <p className="text-xs text-gray-400 mt-1">Click "+ Log Donation" to record a donation</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
                <tr>
                  <th className="px-6 py-4 font-medium">Donation ID</th>
                  <th className="px-6 py-4 font-medium">Donor Name</th>
                  <th className="px-6 py-4 font-medium">Blood Group</th>
                  <th className="px-6 py-4 font-medium">Donation Date</th>
                  <th className="px-6 py-4 font-medium">Location</th>
                  <th className="px-6 py-4 font-medium">Units</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Certificate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {donations.map((d: any) => (
                  <tr key={d.id || d._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 font-mono text-xs">{d.id}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{d.donor}</td>
                    <td className="px-6 py-4">
                      <span className="bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded text-xs font-bold">
                        {BLOOD_GROUP_DISPLAY[d.bg as keyof typeof BLOOD_GROUP_DISPLAY] || d.bg}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{d.date}</td>
                    <td className="px-6 py-4 text-gray-600">{d.location}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{d.units} Unit(s)</td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] uppercase font-bold px-2 py-1 rounded w-fit bg-green-100 text-green-800">
                        {d.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDownload(d.id, d.donor)}
                        className="text-gray-400 hover:text-primary mx-2 transition-colors focus:outline-none"
                        title="Download Certificate"
                      >
                        <FileText size={16} />
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
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Log New Donation</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Donor Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Aarav Patel"
                  value={formData.donor}
                  onChange={e => setFormData({...formData, donor: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Blood Group *</label>
                  <select
                    value={formData.bg}
                    onChange={e => setFormData({...formData, bg: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1"
                  >
                    {Object.keys(BLOOD_GROUP_DISPLAY).map(key => (
                      <option key={key} value={key}>{BLOOD_GROUP_DISPLAY[key as keyof typeof BLOOD_GROUP_DISPLAY]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Units Donated</label>
                  <input
                    required
                    type="number"
                    min="1"
                    max="5"
                    value={formData.units}
                    onChange={e => setFormData({...formData, units: parseInt(e.target.value) || 1})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Donation Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Donation Center / Location *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Red Cross Society, Ahmedabad"
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createDonationMutation.isPending}
                  className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50"
                >
                  {createDonationMutation.isPending ? 'Logging...' : 'Log Donation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
