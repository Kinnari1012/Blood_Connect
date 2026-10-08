import React, { useState } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Droplet, Activity, Calendar, MapPin } from 'lucide-react';
import { Select } from '../../components/ui/Input';

export function DonationHistoryPage() {
  const stats = [
    { label: 'Total Donations', value: '4', icon: Droplet, color: 'text-primary' },
    { label: 'Total Units', value: '4', icon: Activity, color: 'text-green-600' },
    { label: 'Last Donation', value: 'Jan 15, 2026', icon: Calendar, color: 'text-blue-600' },
    { label: 'Next Eligible', value: 'Apr 15, 2026', icon: Calendar, color: 'text-purple-600' },
  ];

  const history = [
    { id: 'DON-9871', date: 'Jan 15, 2026', bg: 'B+', type: 'Whole Blood', hospital: 'Shalby Hospital', location: 'Ahmedabad', units: 1, recipient: 'REQ-1001', status: 'Completed', next: 'Apr 15, 2026' },
    { id: 'DON-8234', date: 'Jul 22, 2025', bg: 'B+', type: 'Whole Blood', hospital: 'Civil Hospital', location: 'Ahmedabad', units: 1, recipient: 'REQ-0842', status: 'Completed', next: 'Oct 22, 2025' },
    { id: 'DON-7123', date: 'Dec 10, 2024', bg: 'B+', type: 'Platelets', hospital: 'Apollo Hospital', location: 'Gandhinagar', units: 1, recipient: 'REQ-0521', status: 'Completed', next: 'Jan 10, 2025' },
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
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-gray-900 text-lg">Past Donations</h3>
          <div className="flex gap-3">
            <Select options={[{value:'All',label:'All Time'}, {value:'2026',label:'2026'}, {value:'2025',label:'2025'}]} />
            <Select options={[{value:'All',label:'All Types'}, {value:'Whole Blood',label:'Whole Blood'}, {value:'Platelets',label:'Platelets'}]} />
          </div>
        </div>
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
              {history.map(h => (
                <tr key={h.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{h.id}</p>
                    <p className="text-xs text-gray-500">{h.date}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs">{h.bg}</span>
                      <span className="font-semibold text-gray-700">{h.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">{h.hospital}</p>
                    <p className="text-xs text-gray-500">{h.location}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">{h.units} Unit(s)</p>
                    <p className="text-xs text-blue-600 hover:underline cursor-pointer">{h.recipient}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-green-100 text-green-800 rounded-md text-[10px] font-black uppercase tracking-wide border border-green-200">
                      {h.status}
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
