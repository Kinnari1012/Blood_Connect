import React from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { BLOOD_GROUP_DISPLAY } from '../../constants';
import { Droplet, Activity } from 'lucide-react';

const mockGroups = [
  { bg: 'A_POS', donors: 1250, units: 85, requests: 12, status: 'Sufficient' },
  { bg: 'O_POS', donors: 2100, units: 140, requests: 25, status: 'Sufficient' },
  { bg: 'B_POS', donors: 1800, units: 110, requests: 18, status: 'Sufficient' },
  { bg: 'AB_POS', donors: 450, units: 30, requests: 8, status: 'Low' },
  { bg: 'A_NEG', donors: 250, units: 15, requests: 5, status: 'Critical' },
  { bg: 'O_NEG', donors: 300, units: 18, requests: 10, status: 'Critical' },
  { bg: 'B_NEG', donors: 280, units: 20, requests: 6, status: 'Low' },
  { bg: 'AB_NEG', donors: 120, units: 8, requests: 2, status: 'Critical' },
];

export function BloodGroupsPage() {
  return (
    <PageLayout title="Blood Group Inventory" subtitle="Current inventory and availability by blood group">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockGroups.map(g => (
          <div key={g.bg} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
            <div className="flex justify-between items-start mb-4">
               <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-black border-2 border-primary/20 shadow-inner">
                 {BLOOD_GROUP_DISPLAY[g.bg]}
               </div>
               <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${g.status === 'Sufficient' ? 'bg-green-100 text-green-800' : g.status === 'Low' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800 animate-pulse'}`}>
                 {g.status}
               </span>
            </div>
            
            <div className="space-y-3 mt-auto">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Available Units</span>
                <span className="font-bold text-gray-900">{g.units}</span>
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
    </PageLayout>
  );
}
