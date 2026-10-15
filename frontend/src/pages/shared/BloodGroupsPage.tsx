import React from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { BLOOD_GROUP_DISPLAY, BLOOD_GROUPS } from '../../constants';
import { Droplet, Activity, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi, requestApi } from '../../services/api';

export function BloodGroupsPage() {
  const { data: bgData, isLoading } = useQuery({
    queryKey: ['blood-groups-analytics'],
    queryFn: async () => {
      const res = await analyticsApi.getBloodGroups();
      return res.data?.data || [];
    },
  });

  const { data: requestsData } = useQuery({
    queryKey: ['all-requests-stats'],
    queryFn: async () => {
      const res = await requestApi.getAllRequests();
      return res.data?.data || [];
    },
  });

  const liveCounts: Record<string, number> = {};
  if (Array.isArray(bgData)) {
    for (const item of bgData) {
      if (item.bloodGroup) {
        liveCounts[item.bloodGroup] = item.count;
      }
    }
  }

  const liveRequestsCounts: Record<string, number> = {};
  if (Array.isArray(requestsData)) {
    for (const r of requestsData) {
      const bg = r.bg || r.bloodGroup;
      if (bg) {
        liveRequestsCounts[bg] = (liveRequestsCounts[bg] || 0) + 1;
      }
    }
  }

  const groups = (BLOOD_GROUPS as readonly string[]).map((bgKey) => {
    const donors = liveCounts[bgKey] ?? liveCounts[bgKey.replace('_POS', '+').replace('_NEG', '-')] ?? 0;
    const reqs = liveRequestsCounts[bgKey] ?? liveRequestsCounts[bgKey.replace('_POS', '+').replace('_NEG', '-')] ?? 0;
    const estimatedUnits = Math.max(donors * 2, 2);

    let status = 'Sufficient';
    if (donors <= 1) status = 'Critical';
    else if (donors <= 3) status = 'Low';

    return {
      bg: bgKey,
      donors,
      units: estimatedUnits,
      requests: reqs,
      status,
    };
  });

  return (
    <PageLayout title="Blood Group Inventory" subtitle="Real-time inventory, registered donor availability, and active requirements by blood group">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-16 text-gray-400">
          <Loader2 className="animate-spin text-primary mb-3" size={32} />
          <p className="text-sm font-medium">Fetching blood group metrics...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {groups.map(g => (
            <div key={g.bg} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-black border-2 border-primary/20 shadow-inner">
                  {BLOOD_GROUP_DISPLAY[g.bg as keyof typeof BLOOD_GROUP_DISPLAY] || g.bg}
                </div>
                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${
                  g.status === 'Sufficient' ? 'bg-green-100 text-green-800' :
                  g.status === 'Low' ? 'bg-orange-100 text-orange-800' :
                  'bg-red-100 text-red-800 animate-pulse'
                }`}>
                  {g.status}
                </span>
              </div>
              
              <div className="space-y-3 mt-auto">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Available Units (Est.)</span>
                  <span className="font-bold text-gray-900">{g.units} Units</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Registered Donors</span>
                  <span className="font-bold text-gray-900">{g.donors}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-t border-gray-100 pt-3">
                  <span className="text-gray-500 flex items-center gap-1.5"><Activity size={14} className="text-primary" /> Active Requests</span>
                  <span className="font-bold text-primary">{g.requests}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
