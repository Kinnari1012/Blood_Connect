import React, { useState } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { BarChart2, TrendingUp, Users, Droplet, Download, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../../services/api';
import toast from 'react-hot-toast';

export function ReportsPage() {
  const [isExporting, setIsExporting] = useState(false);

  const { data: overviewData, isLoading: overviewLoading } = useQuery({
    queryKey: ['reports-overview'],
    queryFn: async () => {
      const res = await analyticsApi.getOverview();
      return res.data?.data || {};
    },
  });

  const { data: bloodGroupsData } = useQuery({
    queryKey: ['reports-blood-groups'],
    queryFn: async () => {
      const res = await analyticsApi.getBloodGroups();
      return res.data?.data || [];
    },
  });

  const { data: citiesData } = useQuery({
    queryKey: ['reports-cities'],
    queryFn: async () => {
      const res = await analyticsApi.getCities();
      return res.data?.data || [];
    },
  });

  const o = overviewData || {};
  const bloodGroups = Array.isArray(bloodGroupsData) ? bloodGroupsData : [];
  const cities = Array.isArray(citiesData) ? citiesData : [];

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      const csv = [
        'Metric,Value',
        `Total Registered Donors,${o.totalDonors ?? 0}`,
        `Available Donors,${o.availableDonors ?? 0}`,
        `Total Users,${o.totalUsers ?? 0}`,
        `Active Blood Requests,${o.activeRequests ?? 0}`,
        `Completed Donations,${o.completedRequests ?? 0}`,
        `Emergency Requests,${o.emergencyRequests ?? 0}`,
        '',
        'Blood Group,Count',
        ...bloodGroups.map((g: any) => `"${g.bloodGroup}",${g.count}`),
        '',
        'City,Donors Count',
        ...cities.map((c: any) => `"${c.city}",${c.count}`),
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `lifelink_analytics_report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Analytics report downloaded successfully!');
    }, 1000);
  };

  const totalDonors = o.totalDonors ?? 0;
  const completedDonations = o.completedRequests ?? 0;
  const requestsHandled = (o.activeRequests ?? 0) + completedDonations;
  const fulfillmentRate = requestsHandled > 0 ? ((completedDonations / requestsHandled) * 100).toFixed(1) : '95.0';

  const maxBgCount = Math.max(...bloodGroups.map((b: any) => b.count || 0), 1);

  return (
    <PageLayout
      title="Reports & Analytics"
      subtitle="Real-time platform metrics, donor distribution, and regional trends"
      actions={
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:opacity-90 flex items-center gap-2 focus:outline-none disabled:opacity-70 transition-all shadow-sm"
        >
          <Download size={16} /> {isExporting ? 'Generating Report...' : 'Download Full Report'}
        </button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <Users size={24} />
          </div>
          <h3 className="text-3xl font-black text-gray-900 mb-1">
            {overviewLoading ? '...' : totalDonors.toLocaleString()}
          </h3>
          <p className="text-sm text-gray-500 font-medium">Registered Donors</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
            <Droplet size={24} />
          </div>
          <h3 className="text-3xl font-black text-gray-900 mb-1">
            {overviewLoading ? '...' : completedDonations.toLocaleString()}
          </h3>
          <p className="text-sm text-gray-500 font-medium">Successful Donations</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
            <BarChart2 size={24} />
          </div>
          <h3 className="text-3xl font-black text-gray-900 mb-1">
            {overviewLoading ? '...' : requestsHandled.toLocaleString()}
          </h3>
          <p className="text-sm text-gray-500 font-medium">Blood Requests Handled</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-4">
            <TrendingUp size={24} />
          </div>
          <h3 className="text-3xl font-black text-gray-900 mb-1">
            {overviewLoading ? '...' : `${fulfillmentRate}%`}
          </h3>
          <p className="text-sm text-gray-500 font-medium">Fulfillment Rate</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blood Group Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col min-h-96">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Droplet size={18} className="text-primary"/> Blood Group Distribution
          </h3>
          {bloodGroups.length === 0 ? (
            <div className="flex-1 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-gray-400 p-6">
              <BarChart2 size={36} className="text-gray-300 mb-2" />
              <p className="text-sm font-medium">No blood group records available</p>
            </div>
          ) : (
            <div className="space-y-3.5 flex-1 py-2">
              {bloodGroups.map((b: any) => {
                const pct = Math.round(((b.count || 0) / maxBgCount) * 100);
                return (
                  <div key={b.bloodGroup}>
                    <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                      <span>{b.bloodGroup}</span>
                      <span className="text-gray-500">{b.count} donors ({pct}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(pct, 5)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Regional City Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col min-h-96">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-600"/> Top Active Regions
          </h3>
          {cities.length === 0 ? (
            <div className="flex-1 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-gray-400 p-6">
              <TrendingUp size={36} className="text-gray-300 mb-2" />
              <p className="text-sm font-medium">No regional city data available</p>
            </div>
          ) : (
            <div className="space-y-3.5 flex-1 py-2">
              {cities.map((c: any) => {
                const maxCity = cities[0]?.count || 1;
                const pct = Math.round(((c.count || 0) / maxCity) * 100);
                return (
                  <div key={c.city}>
                    <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                      <span>{c.city}</span>
                      <span className="text-gray-500">{c.count} registered donors</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(pct, 8)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
