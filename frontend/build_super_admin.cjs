const fs = require('fs');
const path = require('path');

const write = (file, content) => {
  const fullPath = path.join(__dirname, 'src', file);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n');
  console.log(`Updated ${file}`);
};

const saDashboardContent = `
import React from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Activity, Users, ShieldCheck, Database, Server, Clock, AlertTriangle, UserPlus, Heart, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function SuperAdminDashboard() {
  const navigate = useNavigate();

  const stats = [
    { title: 'Total Admins', value: '12', icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50', link: '/super-admin/admins' },
    { title: 'Active Admins', value: '10', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', link: '/super-admin/admins?tab=active' },
    { title: 'Total Users', value: '1,245', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', link: '/super-admin/users' },
    { title: 'Total Donors', value: '842', icon: Heart, color: 'text-red-600', bg: 'bg-red-50', link: '/super-admin/donors' },
    { title: 'System Alerts', value: '3', icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50', link: '/super-admin/audit' },
    { title: 'Active Sessions', value: '45', icon: Server, color: 'text-indigo-600', bg: 'bg-indigo-50', link: '/super-admin/audit' },
  ];

  return (
    <PageLayout title="Super Admin Control Panel" subtitle="Global overview and system health">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} onClick={() => navigate(stat.link)} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all">
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-all" onClick={() => navigate('/super-admin/audit')}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2"><Database size={20} className="text-primary" /> System Audit Logs</h3>
            <span className="text-sm text-primary font-bold">View Full Log</span>
          </div>
          <div className="space-y-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex flex-col">
                  <span className="font-bold text-gray-900 text-sm">Security Update</span>
                  <span className="text-xs text-gray-500">Admin privileges modified for Kinnari Patel</span>
                </div>
                <span className="text-xs text-gray-400">10 mins ago</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-all" onClick={() => navigate('/super-admin/admins')}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2"><ShieldCheck size={20} className="text-purple-600" /> Recent Admin Activity</h3>
            <span className="text-sm text-primary font-bold">Manage Admins</span>
          </div>
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold">A</div>
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900 text-sm">Rahul Patel (Admin)</span>
                    <span className="text-xs text-gray-500">Approved Blood Request REQ-001</span>
                  </div>
                </div>
                <span className="text-xs text-gray-400">1 hour ago</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
`;
write('pages/dashboard/SuperAdminDashboard.tsx', saDashboardContent);

const adminMgtContent = `
import React, { useState } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { ShieldCheck, UserPlus, Search, Edit2, ShieldOff, CheckCircle } from 'lucide-react';
import { Input, Select } from '../../components/ui/Input';
import toast from 'react-hot-toast';

export function AdminManagement() {
  const [activeTab, setActiveTab] = useState('all');
  
  const admins = [
    { id: 'ADM-001', name: 'Kinnari Patel', email: 'kinnari@bloodconnect.com', role: 'Regional Admin', status: 'Active', login: '2 mins ago' },
    { id: 'ADM-002', name: 'Rahul Shah', email: 'rahul@bloodconnect.com', role: 'Verification Admin', status: 'Active', login: '1 hour ago' },
    { id: 'ADM-003', name: 'Amit Desai', email: 'amit@bloodconnect.com', role: 'Support Admin', status: 'Inactive', login: '2 days ago' },
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Admin account created successfully! Audit log updated.');
    setActiveTab('all');
  };

  const handleAction = (id: string, act: string) => {
    toast.success(\`Admin \${id} \${act} successfully.\`);
  };

  const filtered = activeTab === 'active' ? admins.filter(a => a.status === 'Active') 
                 : activeTab === 'inactive' ? admins.filter(a => a.status === 'Inactive') 
                 : admins;

  return (
    <PageLayout title="Admin Management" subtitle="Create, monitor, and manage administrator access">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden min-h-[600px] flex flex-col">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="flex gap-2 p-1 bg-gray-200/50 rounded-xl w-full md:w-auto overflow-x-auto">
            {['all', 'active', 'inactive', 'add'].map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={\`px-6 py-2.5 rounded-lg text-sm font-bold transition-all capitalize whitespace-nowrap \${
                  activeTab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'
                }\`}
              >
                {t === 'add' ? '+ Add Admin' : \`\${t} Admins\`}
              </button>
            ))}
          </div>
          {activeTab !== 'add' && (
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" placeholder="Search admins..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none" />
            </div>
          )}
        </div>

        <div className="flex-1 overflow-x-auto">
          {activeTab === 'add' ? (
            <div className="max-w-2xl mx-auto p-8">
              <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2"><UserPlus size={20} className="text-primary" /> Create New Admin</h2>
              <form onSubmit={handleCreate} className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <Input label="Full Name" required />
                  <Input label="Email Address" type="email" required />
                  <Input label="Mobile Number" required />
                  <Select label="Role/Department" options={[{label:'Regional Admin', value:'1'}, {label:'Verification Admin', value:'2'}]} />
                  <Input label="Password" type="password" required />
                  <Input label="Confirm Password" type="password" required />
                </div>
                <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                  <button type="button" onClick={() => setActiveTab('all')} className="px-6 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl">Cancel</button>
                  <button type="submit" className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl">Create Admin</button>
                </div>
              </form>
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white border-b border-gray-100 text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-bold">Administrator</th>
                  <th className="px-6 py-4 font-bold">Role / Dept</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold">Last Login</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((a, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold">{a.name.charAt(0)}</div>
                        <div>
                          <p className="font-bold text-gray-900">{a.name}</p>
                          <p className="text-xs text-gray-500">{a.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{a.role}</td>
                    <td className="px-6 py-4">
                      <span className={\`px-2.5 py-1 rounded-md text-xs font-bold \${a.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}\`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">{a.login}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleAction(a.id, 'edited')} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16}/></button>
                        {a.status === 'Active' ? (
                          <button onClick={() => handleAction(a.id, 'deactivated')} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Deactivate"><ShieldOff size={16}/></button>
                        ) : (
                          <button onClick={() => handleAction(a.id, 'activated')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Activate"><CheckCircle size={16}/></button>
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
write('pages/admin/AdminManagement.tsx', adminMgtContent);

const auditContent = `
import React from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Database, Search } from 'lucide-react';

export function AuditLogs() {
  const logs = [
    { id: 'AUD-001', admin: 'Kinnari (SuperAdmin)', action: 'Deactivated User USR-092', ip: '192.168.1.1', time: '10 mins ago' },
    { id: 'AUD-002', admin: 'Rahul (Admin)', action: 'Verified Request REQ-082', ip: '10.0.0.5', time: '1 hour ago' },
    { id: 'AUD-003', admin: 'System', action: 'Automated Backup Completed', ip: 'localhost', time: '5 hours ago' },
  ];

  return (
    <PageLayout title="System Audit Logs" subtitle="Secure, read-only record of all critical system events">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden min-h-[600px] flex flex-col">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="font-bold text-gray-900 flex items-center gap-2"><Database size={20} className="text-primary"/> Security Audit Trail</h2>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Search by Action or Admin..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm" />
          </div>
        </div>
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-bold">Event ID</th>
                <th className="px-6 py-4 font-bold">Actor</th>
                <th className="px-6 py-4 font-bold">Action</th>
                <th className="px-6 py-4 font-bold">IP Address</th>
                <th className="px-6 py-4 font-bold">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.map((l, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors text-gray-700">
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">{l.id}</td>
                  <td className="px-6 py-4 font-bold">{l.admin}</td>
                  <td className="px-6 py-4">{l.action}</td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">{l.ip}</td>
                  <td className="px-6 py-4 text-xs">{l.time}</td>
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
write('pages/admin/AuditLogs.tsx', auditContent);

// Update sidebar mapping in Sidebar.tsx
const sidebarPath = path.join(__dirname, 'src', 'components/layout/Sidebar.tsx');
let sidebarFile = fs.readFileSync(sidebarPath, 'utf-8');
sidebarFile = sidebarFile.replace(
  "return [\n        { items: [{ path: ROUTES.SUPER_ADMIN_DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' }] },",
  `return [
        { items: [{ path: ROUTES.SUPER_ADMIN_DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' }] },
        {
          title: 'Management',
          items: [
            { path: '/super-admin/admins', icon: ShieldCheck, label: 'Admin Management' },
            { path: '/super-admin/users', icon: Users, label: 'User Management' },
            { path: '/super-admin/donors', icon: Heart, label: 'Donor Management' },
          ]
        },
        {
          title: 'Blood Ecosystem',
          items: [
            { path: '/super-admin/requests', icon: FileText, label: 'Blood Requests' },
          ]
        },
        {
          title: 'Insights & System',
          items: [
            { path: '/super-admin/reports', icon: BarChart2, label: 'Reports & Analytics' },
            { path: '/super-admin/audit', icon: Database, label: 'Audit Logs' },
            { path: '/super-admin/settings', icon: Settings, label: 'System Settings' },
            { path: '/super-admin/security', icon: ShieldCheck, label: 'Security' },
          ]
        },
        {
          title: 'Account',
          items: [
            { path: '/profile', icon: User, label: 'My Profile' },
          ]
        }
      ]; //`
);
if(!sidebarFile.includes("Database")) sidebarFile = sidebarFile.replace("BarChart2,", "BarChart2, Database,");
fs.writeFileSync(sidebarPath, sidebarFile);
console.log('Updated Sidebar.tsx for Super Admin');

// Update App.tsx
const appPath = path.join(__dirname, 'src', 'App.tsx');
let appFile = fs.readFileSync(appPath, 'utf-8');
appFile = appFile.replace(
  "<Route path=\"/super-admin/dashboard\" element={<SuperAdminRoute><Home /></SuperAdminRoute>} />",
  "<Route path=\"/super-admin/dashboard\" element={<SuperAdminRoute><SuperAdminDashboard /></SuperAdminRoute>} />\n      <Route path=\"/super-admin/admins\" element={<SuperAdminRoute><AdminManagement /></SuperAdminRoute>} />\n      <Route path=\"/super-admin/users\" element={<SuperAdminRoute><UserManagement /></SuperAdminRoute>} />\n      <Route path=\"/super-admin/donors\" element={<SuperAdminRoute><UserManagement /></SuperAdminRoute>} />\n      <Route path=\"/super-admin/requests\" element={<SuperAdminRoute><RequestManagement /></SuperAdminRoute>} />\n      <Route path=\"/super-admin/reports\" element={<SuperAdminRoute><ReportsPage /></SuperAdminRoute>} />\n      <Route path=\"/super-admin/settings\" element={<SuperAdminRoute><Settings /></SuperAdminRoute>} />\n      <Route path=\"/super-admin/security\" element={<SuperAdminRoute><Settings /></SuperAdminRoute>} />"
);
fs.writeFileSync(appPath, appFile);
console.log('Updated App.tsx with Super Admin routes');
