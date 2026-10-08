import React, { useState } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { MapPin, Download } from 'lucide-react';

const mockLocations = [
  { city: 'Ahmedabad', donors: 8540, requests: 320, donations: 1250, status: 'Excellent' },
  { city: 'Surat', donors: 6200, requests: 280, donations: 980, status: 'Good' },
  { city: 'Vadodara', donors: 4100, requests: 190, donations: 650, status: 'Good' },
  { city: 'Rajkot', donors: 3500, requests: 210, donations: 540, status: 'Moderate' },
  { city: 'Bhavnagar', donors: 1200, requests: 95, donations: 180, status: 'Needs Improvement' },
  { city: 'Jamnagar', donors: 950, requests: 110, donations: 140, status: 'Critical' },
];

export function LocationsPage() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert('Location metrics exported successfully!');
    }, 1000);
  };

  return (
    <PageLayout title="Service Locations" subtitle="Overview of operational cities and availability">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
           <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><MapPin size={20} className="text-primary"/> Regional Overview</h2>
           <button onClick={handleExport} disabled={isExporting} className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 flex items-center gap-2 focus:outline-none disabled:opacity-50 transition-colors">
             <Download size={16} /> {isExporting ? 'Exporting...' : 'Export'}
           </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
              <tr>
                <th className="px-6 py-4 font-medium">City / Area</th>
                <th className="px-6 py-4 font-medium">Active Donors</th>
                <th className="px-6 py-4 font-medium">Total Requests (MTD)</th>
                <th className="px-6 py-4 font-medium">Total Donations (MTD)</th>
                <th className="px-6 py-4 font-medium">Availability Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockLocations.map(l => (
                <tr key={l.city} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">{l.city}</td>
                  <td className="px-6 py-4 text-gray-700">{l.donors.toLocaleString()}</td>
                  <td className="px-6 py-4 text-gray-700">{l.requests.toLocaleString()}</td>
                  <td className="px-6 py-4 text-gray-700">{l.donations.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded w-fit ${l.status === 'Excellent' ? 'bg-green-100 text-green-800' : l.status === 'Good' ? 'bg-blue-100 text-blue-800' : l.status === 'Moderate' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'}`}>
                      {l.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageLayout>
  );
}
