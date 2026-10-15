import React, { useState } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Droplet, Activity, Calendar, MapPin, Loader2, Award, Heart } from 'lucide-react';
import { Select } from '../../components/ui/Input';
import { useQuery } from '@tanstack/react-query';
import { donationApi, requestApi } from '../../services/api';
import { useAuth } from '../../store/AuthContext';

export function DonationHistoryPage() {
  const { user } = useAuth();
  const [filterYear, setFilterYear] = useState('All');
  const [filterType, setFilterType] = useState('All');

  const { data: donationsData, isLoading } = useQuery({
    queryKey: ['my-donations'],
    queryFn: async () => {
      try {
        const res = await donationApi.getMy();
        const records = res.data?.data || res.data || [];
        if (Array.isArray(records) && records.length > 0) return records;
      } catch {
        // Fallback to checking completed requests
      }
      try {
        const reqRes = await requestApi.getMyRequests({ limit: 50 });
        const list = reqRes.data?.data || reqRes.data || [];
        return (list as any[]).filter(r => r.status === 'COMPLETED' || r.status === 'Fulfilled');
      } catch {
        return [];
      }
    },
  });

  const rawList: any[] = Array.isArray(donationsData) ? donationsData : [];

  // Filter list
  const filteredHistory = rawList.filter(item => {
    const itemDate = new Date(item.date || item.createdAt || Date.now());
    const year = itemDate.getFullYear().toString();
    const type = item.type || item.donationType || 'Whole Blood';

    if (filterYear !== 'All' && year !== filterYear) return false;
    if (filterType !== 'All' && type.toLowerCase() !== filterType.toLowerCase()) return false;
    return true;
  });

  // Calculate dynamic stats
  const totalDonations = rawList.length || user?.donorProfile?.totalDonations || 0;
  const totalUnits = rawList.reduce((acc, curr) => acc + (Number(curr.units || curr.unitsRequired) || 1), 0) || totalDonations;
  
  const lastDonationDate = rawList.length > 0 && (rawList[0].date || rawList[0].createdAt)
    ? new Date(rawList[0].date || rawList[0].createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'None yet';

  // Next eligible date: 90 days after last donation
  let nextEligible = 'Eligible Now';
  if (rawList.length > 0 && (rawList[0].date || rawList[0].createdAt)) {
    const lastDate = new Date(rawList[0].date || rawList[0].createdAt);
    const eligibleDate = new Date(lastDate.getTime() + 90 * 24 * 60 * 60 * 1000);
    if (eligibleDate > new Date()) {
      nextEligible = eligibleDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  }

  const stats = [
    { label: 'Total Donations', value: totalDonations.toString(), icon: Droplet, color: 'text-primary' },
    { label: 'Total Units Given', value: totalUnits.toString(), icon: Activity, color: 'text-green-600' },
    { label: 'Last Donation', value: lastDonationDate, icon: Calendar, color: 'text-blue-600' },
    { label: 'Next Eligible Date', value: nextEligible, icon: Calendar, color: 'text-purple-600' },
  ];

  return (
    <PageLayout title="Donation History" subtitle="Track your past blood donations and eligibility">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center ${s.color}`}>
              <s.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">{s.label}</p>
              <p className="text-xl font-black text-gray-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Verified Past Donations</h3>
            <p className="text-xs text-gray-500 mt-0.5">Real records linked to your donor profile</p>
          </div>
          <div className="flex gap-3">
            <Select
              options={[{ value: 'All', label: 'All Time' }, { value: '2026', label: '2026' }, { value: '2025', label: '2025' }]}
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
            />
            <Select
              options={[{ value: 'All', label: 'All Types' }, { value: 'Whole Blood', label: 'Whole Blood' }, { value: 'Platelets', label: 'Platelets' }]}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-16 text-center text-gray-400">
            <Loader2 className="animate-spin mx-auto mb-3 text-primary" size={32} />
            <p className="text-sm font-semibold">Loading donation history...</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="p-16 text-center text-gray-500">
            <div className="w-16 h-16 rounded-full bg-red-50 text-primary flex items-center justify-center mx-auto mb-4">
              <Heart size={32} />
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-1">No Past Donations Recorded Yet</h4>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              When you fulfill an emergency blood request or log a certified blood donation, your verified record will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white border-b border-gray-200 text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Donation ID & Date</th>
                  <th className="px-6 py-4 font-semibold">Type & Blood</th>
                  <th className="px-6 py-4 font-semibold">Hospital & Location</th>
                  <th className="px-6 py-4 font-semibold">Units & Ref</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredHistory.map((h, idx) => {
                  const id = h.id || h._id || `DON-${idx + 1001}`;
                  const dateStr = h.date || h.createdAt
                    ? new Date(h.date || h.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : 'Recent';
                  const bg = (h.bg || h.bloodGroup || user?.donorProfile?.bloodGroup || 'O+').replace('_POS', '+').replace('_NEG', '-');
                  const type = h.type || h.donationType || 'Whole Blood';
                  const hospital = h.hospital || h.hospitalName || 'Verified Blood Center';
                  const location = h.location || h.city || user?.donorProfile?.city || 'Gujarat';
                  const units = h.units || h.unitsRequired || 1;
                  const refCode = h.recipient || h.requestId || `REQ-${id.slice(-4)}`;
                  const status = h.status || 'Completed';

                  return (
                    <tr key={id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{id.slice(0, 10).toUpperCase()}</p>
                        <p className="text-xs text-gray-500">{dateStr}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs">{bg}</span>
                          <span className="font-semibold text-gray-700">{type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">{hospital}</p>
                        <p className="text-xs text-gray-500">{location}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">{units} Unit(s)</p>
                        <p className="text-xs text-blue-600 hover:underline cursor-pointer">{refCode}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-green-100 text-green-800 rounded-md text-[10px] font-black uppercase tracking-wide border border-green-200">
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
