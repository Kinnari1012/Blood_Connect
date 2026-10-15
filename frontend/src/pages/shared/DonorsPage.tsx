import React, { useState } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Heart, Search, Download, CheckCircle, XCircle, Droplet, Phone, Mail, MapPin } from 'lucide-react';
import { BLOOD_GROUP_DISPLAY } from '../../constants';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/api';
import { LoadingSpinner } from '../../components/ui/Alert';

export function DonorsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const { data: donorsData, isLoading } = useQuery({
    queryKey: ['admin', 'donors', search],
    queryFn: () => adminApi.getDonors({ search }).then(r => r.data),
  });

  const donors = donorsData?.data || [];

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminApi.updateUserStatus(id, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'donors'] });
      toast.success('Donor status updated');
    },
    onError: () => toast.error('Failed to update status'),
  });

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      const csvContent = 'data:text/csv;charset=utf-8,' + 
        ['Name,Email,Phone,Blood Group,City,Availability,Status',
          ...donors.map((d: any) => `"${d.fullName || (d.firstName + ' ' + d.lastName)}","${d.email}","${d.phone || ''}","${d.bloodGroup || ''}","${d.city || ''}","${d.availability ? 'Available' : 'Unavailable'}","${d.status}"`)
        ].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `donors_directory_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Donor records exported successfully!');
    }, 500);
  };

  return (
    <PageLayout title="Donor Directory" subtitle="Manage registered blood donors, medical eligibility, and donation availability">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px] flex flex-col">
        <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Heart size={20} className="text-primary"/> Registered Donors
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Showing verified blood donors active in the network</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search donors by name, email, phone..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <button 
              onClick={handleExport} 
              disabled={isExporting || donors.length === 0} 
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 flex items-center gap-2 focus:outline-none disabled:opacity-50 transition-colors"
            >
              <Download size={16} /> {isExporting ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
        </div>

        {isLoading ? (
          <LoadingSpinner className="py-20" />
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
                <tr>
                  <th className="px-6 py-4 font-semibold">Donor Details</th>
                  <th className="px-6 py-4 font-semibold">Blood Group</th>
                  <th className="px-6 py-4 font-semibold">Contact</th>
                  <th className="px-6 py-4 font-semibold">Location</th>
                  <th className="px-6 py-4 font-semibold">Availability</th>
                  <th className="px-6 py-4 font-semibold">Total Donations</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {donors.map((d: any) => {
                  const donorName = d.fullName || `${d.firstName || ''} ${d.lastName || ''}`.trim() || 'Anonymous Donor';
                  const bgDisplay = d.bloodGroup ? (BLOOD_GROUP_DISPLAY[d.bloodGroup as keyof typeof BLOOD_GROUP_DISPLAY] || d.bloodGroup.replace('_POS', '+').replace('_NEG', '-')) : '—';
                  const isAvailable = d.availability === true || d.availability === 'true';

                  return (
                    <tr key={d.id || d._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-bold text-sm border border-red-100 flex-shrink-0">
                            {d.firstName?.charAt(0)?.toUpperCase() || 'D'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{donorName}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1"><Mail size={12} /> {d.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 font-extrabold text-sm px-2.5 py-1 rounded-lg bg-red-100 text-red-800 border border-red-200">
                          <Droplet size={14} className="fill-red-600 text-red-600" />
                          {bgDisplay}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        <span className="flex items-center gap-1.5 text-xs font-medium">
                          <Phone size={12} className="text-gray-400" />
                          {d.phone || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        <span className="flex items-center gap-1 text-xs">
                          <MapPin size={12} className="text-gray-400" />
                          {d.city || d.location || 'Not Specified'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                          {isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-900 px-2 py-0.5 rounded bg-gray-100 text-xs">
                          {d.totalDonations || 0} donations
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          d.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {d.status || 'ACTIVE'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => updateStatus.mutate({
                            id: d.id || d._id,
                            status: d.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE'
                          })}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors focus:outline-none ${
                            d.status === 'ACTIVE'
                              ? 'text-red-700 bg-red-50 hover:bg-red-100'
                              : 'text-green-700 bg-green-50 hover:bg-green-100'
                          }`}
                        >
                          {d.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {donors.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-16 text-gray-500">
                      <Heart size={36} className="mx-auto text-gray-300 mb-2" />
                      <p className="font-semibold text-gray-700">No registered donors found</p>
                      <p className="text-xs text-gray-400 mt-1">Try searching with a different name, blood group, or city.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
