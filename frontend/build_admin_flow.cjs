const fs = require('fs');
const path = require('path');

const write = (file, content) => {
  const fullPath = path.join(__dirname, 'src', file);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n');
  console.log(`Updated ${file}`);
};

const adminDashboardContent = `
import React from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Activity, Users, Droplet, CheckCircle, Clock, AlertCircle, TrendingUp, XCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function AdminDashboard() {
  const navigate = useNavigate();

  const stats = [
    { title: 'Total Users', value: '1,245', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', link: '/admin/users' },
    { title: 'Total Donors', value: '842', icon: Droplet, color: 'text-red-600', bg: 'bg-red-50', link: '/admin/donors' },
    { title: 'Available Donors', value: '310', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', link: '/admin/donors?tab=available' },
    { title: 'Pending Requests', value: '45', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', link: '/admin/requests?tab=pending' },
    { title: 'Accepted Requests', value: '12', icon: CheckCircle, color: 'text-indigo-600', bg: 'bg-indigo-50', link: '/admin/requests?tab=accepted' },
    { title: 'Rejected Requests', value: '4', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', link: '/admin/requests?tab=rejected' },
    { title: 'Completed Donations', value: '890', icon: Activity, color: 'text-green-600', bg: 'bg-green-50', link: '/admin/requests?tab=completed' },
    { title: 'Active Users', value: '1,100', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', link: '/admin/users?tab=active' },
  ];

  return (
    <PageLayout title="Admin Dashboard" subtitle="Overview of platform activities and statistics">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} onClick={() => navigate(stat.link)} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-md hover:border-gray-200 transition-all">
            <div className={\`w-14 h-14 rounded-full \${stat.bg} \${stat.color} flex items-center justify-center\`}>
               <stat.icon size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-semibold">{stat.title}</p>
              <p className="text-2xl font-black text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-all" onClick={() => navigate('/admin/requests')}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900 text-lg">Recent Blood Requests</h3>
            <span className="text-sm text-primary font-bold">View All</span>
          </div>
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs">O+</div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Rahul Patel (Emergency)</p>
                    <p className="text-xs text-gray-500">Shalby Hospital • Ahmedabad</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">Pending</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-all" onClick={() => navigate('/admin/users')}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900 text-lg">Recent Registrations</h3>
            <span className="text-sm text-primary font-bold">View All</span>
          </div>
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">U</div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">New User Registered</p>
                    <p className="text-xs text-gray-500">user@example.com • +91 9876543210</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500 font-medium">Just now</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
`;
write('pages/admin/AdminDashboard.tsx', adminDashboardContent);

const userManagementContent = `
import React, { useState } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Search, Filter, Edit2, Shield, UserX, CheckCircle, SearchX } from 'lucide-react';
import { Input, Select } from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';

export function UserManagement() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'all';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [search, setSearch] = useState('');

  const users = [
    { id: 'USR-001', name: 'Rahul Patel', email: 'rahul@example.com', mobile: '9876543210', bg: 'B+', city: 'Ahmedabad', date: 'Oct 01, 2026', status: 'Active' },
    { id: 'USR-002', name: 'Amit Shah', email: 'amit@example.com', mobile: '9876543211', bg: 'O+', city: 'Surat', date: 'Oct 02, 2026', status: 'Inactive' },
    { id: 'USR-003', name: 'Kinnari Patel', email: 'kinnari@example.com', mobile: '9876543212', bg: 'A+', city: 'Vadodara', date: 'Oct 03, 2026', status: 'Active' },
  ];

  const handleAction = (id: string, action: string) => {
    toast.success(\`User \${id} \${action} successfully!\`);
  };

  const filtered = users.filter(u => {
    if (activeTab === 'active' && u.status !== 'Active') return false;
    if (activeTab === 'inactive' && u.status !== 'Inactive') return false;
    return u.name.toLowerCase().includes(search.toLowerCase()) || u.id.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <PageLayout title="User Management" subtitle="Manage and monitor platform users">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden min-h-[600px] flex flex-col">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="flex gap-2 p-1 bg-gray-200/50 rounded-xl w-full md:w-auto overflow-x-auto hide-scrollbar">
            {['all', 'active', 'inactive'].map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={\`px-6 py-2.5 rounded-lg text-sm font-bold transition-all capitalize whitespace-nowrap \${
                  activeTab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'
                }\`}
              >
                {t} Users
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Search users by name or ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-gray-500">
               <SearchX size={48} className="text-gray-300 mb-4" />
               <p className="text-lg font-bold">No users found</p>
               <p className="text-sm">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white border-b border-gray-100 text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-bold">User</th>
                  <th className="px-6 py-4 font-bold">Contact</th>
                  <th className="px-6 py-4 font-bold">Blood Group</th>
                  <th className="px-6 py-4 font-bold">Location</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((u, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold border border-primary/20">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{u.name}</p>
                          <p className="text-xs text-gray-500">{u.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900 font-medium">{u.email}</p>
                      <p className="text-xs text-gray-500">{u.mobile}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-red-50 text-red-700 font-bold text-xs rounded-md border border-red-100">{u.bg}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{u.city}</td>
                    <td className="px-6 py-4">
                      <span className={\`px-2.5 py-1 rounded-md text-xs font-bold \${u.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}\`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleAction(u.id, 'edited')} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16}/></button>
                        {u.status === 'Active' ? (
                          <button onClick={() => handleAction(u.id, 'deactivated')} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><UserX size={16}/></button>
                        ) : (
                          <button onClick={() => handleAction(u.id, 'activated')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"><CheckCircle size={16}/></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
`;
write('pages/admin/UserManagement.tsx', userManagementContent);

const requestManagementContent = `
import React, { useState } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Search, Eye, Check, X, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';

export function RequestManagement() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'all';
  const [activeTab, setActiveTab] = useState(initialTab);

  const reqs = [
    { id: 'REQ-001', reqName: 'Kinnari', patient: 'Rahul', bg: 'B+', hospital: 'Shalby', status: 'Pending Verification' },
    { id: 'REQ-002', reqName: 'Amit', patient: 'Rajesh', bg: 'O+', hospital: 'Civil', status: 'Pending' },
    { id: 'REQ-003', reqName: 'Vikram', patient: 'Neha', bg: 'A-', hospital: 'Sterling', status: 'Accepted' },
    { id: 'REQ-004', reqName: 'Priya', patient: 'Kavita', bg: 'AB+', hospital: 'Apollo', status: 'Rejected' },
    { id: 'REQ-005', reqName: 'Suresh', patient: 'Ramesh', bg: 'O-', hospital: 'Haria', status: 'Completed' },
  ];

  const handleVerify = (id: string) => toast.success(\`Request \${id} verified by Admin!\`);
  const handleReject = (id: string) => {
    const reason = window.prompt("Enter rejection reason:");
    if (reason) toast.success(\`Request \${id} rejected. Reason: \${reason}\`);
  };

  const filtered = reqs.filter(r => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending' && !r.status.includes('Pending')) return false;
    return r.status.toLowerCase() === activeTab.toLowerCase();
  });

  return (
    <PageLayout title="Blood Requests" subtitle="Monitor and manage all blood requests across the platform">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden min-h-[600px] flex flex-col">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="flex gap-2 p-1 bg-gray-200/50 rounded-xl w-full md:w-auto overflow-x-auto hide-scrollbar">
            {['all', 'pending', 'accepted', 'rejected', 'completed', 'cancelled'].map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={\`px-4 py-2.5 rounded-lg text-sm font-bold transition-all capitalize whitespace-nowrap \${
                  activeTab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'
                }\`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Search requests..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>

        <div className="flex-1 overflow-x-auto p-0">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white border-b border-gray-100 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-bold">Req ID</th>
                <th className="px-6 py-4 font-bold">Requester / Patient</th>
                <th className="px-6 py-4 font-bold">Blood / Hospital</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">{r.id}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">Req: {r.reqName}</p>
                    <p className="text-xs text-gray-500">Pat: {r.patient}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-red-600">{r.bg}</p>
                    <p className="text-xs text-gray-500">{r.hospital}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={\`px-2.5 py-1 rounded-md text-xs font-bold border \${
                      r.status.includes('Pending') ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                      r.status === 'Accepted' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      r.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' :
                      'bg-red-50 text-red-700 border-red-200'
                    }\`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"><Eye size={16}/></button>
                      {r.status === 'Pending Verification' && (
                        <>
                          <button onClick={() => handleVerify(r.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Verify Request"><ShieldCheck size={16}/></button>
                          <button onClick={() => handleReject(r.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Reject Request"><X size={16}/></button>
                        </>
                      )}
                    </div>
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
write('pages/admin/RequestManagement.tsx', requestManagementContent);

const appContent = fs.readFileSync(path.join(__dirname, 'src', 'App.tsx'), 'utf-8');
const newAppContent = appContent
  .replace("import { AdminDashboard } from './pages/dashboard/AdminDashboard';", "import { AdminDashboard } from './pages/admin/AdminDashboard';")
  .replace("import { ThemeManagement } from './pages/admin/ThemeManagement';", "import { ThemeManagement } from './pages/admin/ThemeManagement';\nimport { UserManagement } from './pages/admin/UserManagement';\nimport { RequestManagement } from './pages/admin/RequestManagement';\nimport { ReportsPage } from './pages/shared/ReportsPage';")
  .replace("<Route path=\"/admin/dashboard\" element={<AdminRoute><Home /></AdminRoute>} />", "<Route path=\"/admin/dashboard\" element={<AdminRoute><AdminDashboard /></AdminRoute>} />\n      <Route path=\"/admin/users\" element={<AdminRoute><UserManagement /></AdminRoute>} />\n      <Route path=\"/admin/donors\" element={<AdminRoute><UserManagement /></AdminRoute>} />\n      <Route path=\"/admin/requests\" element={<AdminRoute><RequestManagement /></AdminRoute>} />\n      <Route path=\"/admin/reports\" element={<AdminRoute><ReportsPage /></AdminRoute>} />");

fs.writeFileSync(path.join(__dirname, 'src', 'App.tsx'), newAppContent);
console.log('Updated App.tsx routes');

const sidebarContent = fs.readFileSync(path.join(__dirname, 'src', 'components/layout/Sidebar.tsx'), 'utf-8');
let newSidebarContent = sidebarContent.replace(
  "const adminLinks = [",
  `const adminLinks = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: Users, label: 'User Management', path: '/admin/users' },
  { icon: Droplet, label: 'Donor Management', path: '/admin/donors' },
  { icon: FileText, label: 'Blood Requests', path: '/admin/requests' },
  { icon: BarChart3, label: 'Reports & Analytics', path: '/admin/reports' },
  { icon: Bell, label: 'Notifications', path: '/notifications' },
  { icon: User, label: 'My Profile', path: '/profile' },
  { icon: Settings, label: 'Settings', path: '/settings' },
]; // `
);
// Make sure imports are present
if (!newSidebarContent.includes("FileText")) {
  newSidebarContent = newSidebarContent.replace("LayoutDashboard,", "LayoutDashboard, FileText, BarChart3,");
}
fs.writeFileSync(path.join(__dirname, 'src', 'components/layout/Sidebar.tsx'), newSidebarContent);
console.log('Updated Sidebar.tsx navigation links');
