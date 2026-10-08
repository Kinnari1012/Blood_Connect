const fs = require('fs');

const locationsContent = `import React from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { MapPin } from 'lucide-react';

const mockLocations = [
  { city: 'Ahmedabad', donors: 8540, requests: 320, donations: 1250, status: 'Excellent' },
  { city: 'Surat', donors: 6200, requests: 280, donations: 980, status: 'Good' },
  { city: 'Vadodara', donors: 4100, requests: 190, donations: 650, status: 'Good' },
  { city: 'Rajkot', donors: 3500, requests: 210, donations: 540, status: 'Moderate' },
  { city: 'Bhavnagar', donors: 1200, requests: 95, donations: 180, status: 'Needs Improvement' },
  { city: 'Jamnagar', donors: 950, requests: 110, donations: 140, status: 'Critical' },
];

export function LocationsPage() {
  return (
    <PageLayout title="Service Locations" subtitle="Overview of operational cities and availability">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
           <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><MapPin size={20} className="text-primary"/> Regional Overview</h2>
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
                    <span className={\`text-[10px] uppercase font-bold px-2 py-1 rounded w-fit \${l.status === 'Excellent' ? 'bg-green-100 text-green-800' : l.status === 'Good' ? 'bg-blue-100 text-blue-800' : l.status === 'Moderate' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'}\`}>
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
`;

const reportsContent = `import React from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { BarChart2, TrendingUp, Users, Droplet } from 'lucide-react';

export function ReportsPage() {
  return (
    <PageLayout title="Reports & Analytics" subtitle="Platform metrics and performance trends">
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4"><Users size={24} /></div>
            <h3 className="text-3xl font-black text-gray-900 mb-1">24,590</h3>
            <p className="text-sm text-gray-500 font-medium">Total Registered Donors</p>
         </div>
         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4"><Droplet size={24} /></div>
            <h3 className="text-3xl font-black text-gray-900 mb-1">8,240</h3>
            <p className="text-sm text-gray-500 font-medium">Successful Donations</p>
         </div>
         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mb-4"><BarChart2 size={24} /></div>
            <h3 className="text-3xl font-black text-gray-900 mb-1">9,105</h3>
            <p className="text-sm text-gray-500 font-medium">Blood Requests Handled</p>
         </div>
         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-4"><TrendingUp size={24} /></div>
            <h3 className="text-3xl font-black text-gray-900 mb-1">92.4%</h3>
            <p className="text-sm text-gray-500 font-medium">Fulfillment Rate</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-96 flex flex-col">
           <h3 className="font-bold text-gray-900 mb-4">Donation vs Request Trends (YTD)</h3>
           <div className="flex-1 bg-gray-50 rounded border border-gray-100 flex items-center justify-center text-gray-400">
             [ Chart: Donation vs Request Trends ]
           </div>
         </div>
         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-96 flex flex-col">
           <h3 className="font-bold text-gray-900 mb-4">Blood Group Distribution</h3>
           <div className="flex-1 bg-gray-50 rounded border border-gray-100 flex items-center justify-center text-gray-400">
             [ Chart: Pie chart of blood groups ]
           </div>
         </div>
      </div>
    </PageLayout>
  );
}
`;

const notificationsContent = `import React from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Bell, Heart, AlertCircle, Info, Settings } from 'lucide-react';

const mockNotifications = [
  { id: 1, type: 'urgent', title: 'Emergency Blood Request', message: 'Urgent requirement for O- blood at Apollo Hospital.', time: '10 minutes ago', read: false },
  { id: 2, type: 'success', title: 'Donation Successful', message: 'Thank you for your recent blood donation. Your certificate is ready.', time: '2 hours ago', read: false },
  { id: 3, type: 'info', title: 'Profile Updated', message: 'Your profile information was updated successfully.', time: '1 day ago', read: true },
  { id: 4, type: 'urgent', title: 'Low Inventory Alert', message: 'A- blood stock is running critically low in Ahmedabad region.', time: '2 days ago', read: true },
  { id: 5, type: 'system', title: 'System Maintenance', message: 'Scheduled maintenance this Sunday at 2:00 AM IST.', time: '3 days ago', read: true },
];

export function NotificationsPage() {
  return (
    <PageLayout title="Notifications" subtitle="View alerts and system messages">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden max-w-4xl mx-auto">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
           <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">All Notifications</h2>
           <button className="text-sm font-semibold text-primary hover:underline">Mark all as read</button>
        </div>
        <div className="divide-y divide-gray-100">
          {mockNotifications.map(n => (
            <div key={n.id} className={\`p-5 flex gap-4 transition-colors \${!n.read ? 'bg-primary/5' : 'hover:bg-gray-50'}\`}>
               <div className={\`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 \${
                 n.type === 'urgent' ? 'bg-red-100 text-red-600' : 
                 n.type === 'success' ? 'bg-green-100 text-green-600' :
                 n.type === 'system' ? 'bg-gray-100 text-gray-600' :
                 'bg-blue-100 text-blue-600'
               }\`}>
                 {n.type === 'urgent' && <AlertCircle size={20} />}
                 {n.type === 'success' && <Heart size={20} />}
                 {n.type === 'system' && <Settings size={20} />}
                 {n.type === 'info' && <Info size={20} />}
               </div>
               <div className="flex-1">
                 <div className="flex justify-between items-start mb-1">
                   <h4 className={\`text-sm font-bold \${!n.read ? 'text-gray-900' : 'text-gray-700'}\`}>{n.title}</h4>
                   <span className="text-xs text-gray-500 whitespace-nowrap ml-4">{n.time}</span>
                 </div>
                 <p className={\`text-sm \${!n.read ? 'text-gray-800' : 'text-gray-500'}\`}>{n.message}</p>
               </div>
               {!n.read && <div className="w-2.5 h-2.5 bg-primary rounded-full mt-1"></div>}
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
`;

const profileContent = `import React from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { useAuth } from '../../store/AuthContext';
import { User, Mail, Phone, MapPin, Calendar, Shield } from 'lucide-react';

export function ProfilePage() {
  const { user, isAdmin, isSuperAdmin, isDonor } = useAuth();
  
  const roleLabel = isAdmin 
    ? (isSuperAdmin ? 'Super Admin' : 'Admin')
    : isDonor ? 'Donor'
    : 'User';

  return (
    <PageLayout title="My Profile" subtitle="Manage your personal information and security">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="h-32 bg-gradient-primary"></div>
          <div className="px-8 pb-8 relative">
            <div className="absolute -top-16 w-32 h-32 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden flex items-center justify-center text-4xl font-black text-primary bg-primary/10">
              {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            
            <div className="mt-20 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-gray-900">{user?.fullName || 'Guest User'}</h1>
                <p className="text-gray-500 flex items-center gap-2 mt-1">
                  <Shield size={16} className={isSuperAdmin ? 'text-red-500' : isAdmin ? 'text-purple-500' : 'text-primary'} />
                  <span className="font-semibold text-gray-700">{roleLabel}</span>
                </p>
              </div>
              <div className="flex gap-3">
                <button className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50">Change Password</button>
                <button className="px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90">Edit Profile</button>
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Personal Information</h3>
            
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <Mail className="text-gray-400 mt-0.5" size={18} />
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email Address</p>
                  <p className="font-medium text-gray-900 mt-0.5">{user?.email || 'user@example.com'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="text-gray-400 mt-0.5" size={18} />
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone Number</p>
                  <p className="font-medium text-gray-900 mt-0.5">+91 98765 43210</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="text-gray-400 mt-0.5" size={18} />
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Location & Address</p>
                  <p className="font-medium text-gray-900 mt-0.5">Navrangpura, Ahmedabad, Gujarat</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Account Overview</h3>
            
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <Calendar className="text-gray-400 mt-0.5" size={18} />
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined Date</p>
                  <p className="font-medium text-gray-900 mt-0.5">September 15, 2026</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-[18px] flex justify-center mt-0.5"><div className="w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white shadow-sm ring-1 ring-green-500/20"></div></div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Account Status</p>
                  <p className="font-medium text-green-700 mt-0.5">Active</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="text-gray-400 mt-0.5" size={18} />
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Last Login</p>
                  <p className="font-medium text-gray-900 mt-0.5">Today, 10:42 AM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </PageLayout>
  );
}
`;

fs.writeFileSync('src/pages/shared/LocationsPage.tsx', locationsContent);
fs.writeFileSync('src/pages/shared/ReportsPage.tsx', reportsContent);
fs.writeFileSync('src/pages/shared/NotificationsPage.tsx', notificationsContent);
fs.writeFileSync('src/pages/shared/ProfilePage.tsx', profileContent);
console.log('Pages generated 3');
