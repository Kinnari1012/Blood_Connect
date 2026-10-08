const fs = require('fs');

const requestsContent = `import React from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Eye, Edit2, AlertCircle } from 'lucide-react';
import { BLOOD_GROUP_DISPLAY } from '../../constants';

const mockRequests = [
  { id: 'REQ-501', patient: 'Rahul Sharma', bg: 'B_POS', units: 2, hospital: 'Apollo Hospital', location: 'Navrangpura, Ahmedabad', date: 'Oct 06, 2026', urgency: 'Critical', status: 'Pending' },
  { id: 'REQ-502', patient: 'Priya Desai', bg: 'A_NEG', units: 1, hospital: 'Zydus Hospital', location: 'Thaltej, Ahmedabad', date: 'Oct 05, 2026', urgency: 'High', status: 'In Progress' },
  { id: 'REQ-503', patient: 'Amit Patel', bg: 'O_POS', units: 3, hospital: 'Kiran Hospital', location: 'Katargam, Surat', date: 'Oct 04, 2026', urgency: 'Normal', status: 'Fulfilled' },
  { id: 'REQ-504', patient: 'Sanjay Kumar', bg: 'AB_POS', units: 1, hospital: 'Sterling Hospital', location: 'Race Course, Rajkot', date: 'Oct 03, 2026', urgency: 'High', status: 'Pending' },
];

export function BloodRequestsPage() {
  return (
    <PageLayout title="Blood Requests" subtitle="Track and manage patient blood requests">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
           <h2 className="text-lg font-bold text-gray-900">Active & Past Requests</h2>
           <button className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:opacity-90">Create Request</button>
        </div>
        <div className="overflow-x-auto">
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
              {mockRequests.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{r.id}</td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900 mb-1">{r.patient}</p>
                    <div className="flex items-center gap-2">
                       <span className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded text-xs font-bold">{BLOOD_GROUP_DISPLAY[r.bg] || r.bg}</span>
                       <span className="text-xs text-gray-500 font-medium">{r.units} Units</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-900 font-medium">{r.hospital}</p>
                    <p className="text-xs text-gray-500">{r.location}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-900">{r.date}</p>
                    <p className={\`text-xs font-bold mt-0.5 \${r.urgency === 'Critical' ? 'text-red-600 flex items-center gap-1' : r.urgency === 'High' ? 'text-orange-500' : 'text-gray-500'}\`}>
                       {r.urgency === 'Critical' && <AlertCircle size={10} />}
                       {r.urgency}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={\`text-[10px] uppercase font-bold px-2 py-1 rounded w-fit \${r.status === 'Fulfilled' ? 'bg-green-100 text-green-800' : r.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}\`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-gray-400 hover:text-primary mx-2 transition-colors"><Eye size={16} /></button>
                    <button className="text-gray-400 hover:text-primary mx-2 transition-colors"><Edit2 size={16} /></button>
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
`;

const donationsContent = `import React from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Droplet, FileText } from 'lucide-react';
import { BLOOD_GROUP_DISPLAY } from '../../constants';

const mockDonations = [
  { id: 'DON-901', donor: 'Aarav Patel', bg: 'O_POS', date: 'Oct 05, 2026', location: 'Red Cross Society, Ahmedabad', units: 1, status: 'Completed' },
  { id: 'DON-902', donor: 'Meera Singh', bg: 'A_POS', date: 'Oct 04, 2026', location: 'Civil Hospital Blood Bank', units: 1, status: 'Completed' },
  { id: 'DON-903', donor: 'Rahul Mehta', bg: 'B_NEG', date: 'Oct 03, 2026', location: 'Apollo Hospital', units: 1, status: 'Completed' },
  { id: 'DON-904', donor: 'Pooja Desai', bg: 'AB_POS', date: 'Oct 02, 2026', location: 'Prathama Blood Centre', units: 2, status: 'Completed' },
];

export function BloodDonationsPage() {
  return (
    <PageLayout title="Blood Donations" subtitle="Log and monitor blood donation records">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
           <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Droplet size={20} className="text-primary"/> Donation Log</h2>
           <button className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:opacity-90">Log Donation</button>
        </div>
        <div className="overflow-x-auto">
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
              {mockDonations.map(d => (
                <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{d.id}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">{d.donor}</td>
                  <td className="px-6 py-4">
                     <span className="bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded text-xs font-bold">{BLOOD_GROUP_DISPLAY[d.bg] || d.bg}</span>
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
                    <button className="text-gray-400 hover:text-primary mx-2 transition-colors" title="Download Certificate"><FileText size={16} /></button>
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
`;

const groupsContent = `import React from 'react';
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
               <span className={\`text-[10px] uppercase font-bold px-2 py-1 rounded \${g.status === 'Sufficient' ? 'bg-green-100 text-green-800' : g.status === 'Low' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800 animate-pulse'}\`}>
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
`;

fs.writeFileSync('src/pages/shared/BloodRequestsPage.tsx', requestsContent);
fs.writeFileSync('src/pages/shared/BloodDonationsPage.tsx', donationsContent);
fs.writeFileSync('src/pages/shared/BloodGroupsPage.tsx', groupsContent);
console.log('Pages generated 2');
