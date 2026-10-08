const fs = require('fs');

const usersContent = `import React from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Users, MoreVertical, Edit2, Trash2 } from 'lucide-react';

const mockUsers = [
  { id: 'USR-001', name: 'Rajesh Kumar', email: 'rajesh@example.com', phone: '+91 98765 43210', role: 'User', location: 'Ahmedabad', status: 'Active', created: 'Oct 01, 2026', lastLogin: 'Oct 06, 2026' },
  { id: 'USR-002', name: 'Priya Sharma', email: 'priya@example.com', phone: '+91 91234 56789', role: 'Admin', location: 'Surat', status: 'Active', created: 'Sep 25, 2026', lastLogin: 'Oct 05, 2026' },
  { id: 'USR-003', name: 'Amit Patel', email: 'amit@example.com', phone: '+91 99887 76655', role: 'User', location: 'Vadodara', status: 'Inactive', created: 'Sep 15, 2026', lastLogin: 'Sep 20, 2026' },
  { id: 'USR-004', name: 'Sneha Desai', email: 'sneha@example.com', phone: '+91 98765 12345', role: 'User', location: 'Rajkot', status: 'Active', created: 'Sep 10, 2026', lastLogin: 'Oct 06, 2026' },
  { id: 'USR-005', name: 'Vikram Singh', email: 'vikram@example.com', phone: '+91 99988 88899', role: 'User', location: 'Gandhinagar', status: 'Suspended', created: 'Aug 05, 2026', lastLogin: 'Aug 10, 2026' },
];

export function UsersPage() {
  return (
    <PageLayout title="Users Directory" subtitle="Manage all registered platform users">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
           <h2 className="text-lg font-bold text-gray-900">All Users</h2>
           <button className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:opacity-90">Add New User</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
              <tr>
                <th className="px-6 py-4 font-medium">User ID</th>
                <th className="px-6 py-4 font-medium">Name & Email</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Location</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Last Login</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockUsers.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{u.id}</td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">{u.name}</p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={\`px-2.5 py-1 rounded-md text-xs font-semibold \${u.role === 'Admin' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-gray-100 text-gray-700 border border-gray-200'}\`}>{u.role}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{u.location}</td>
                  <td className="px-6 py-4">
                    <span className={\`flex items-center gap-1.5 text-xs font-semibold w-fit px-2.5 py-1 rounded-full \${u.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-200' : u.status === 'Inactive' ? 'bg-gray-100 text-gray-600 border border-gray-300' : 'bg-red-50 text-red-700 border border-red-200'}\`}>
                      <span className={\`w-1.5 h-1.5 rounded-full \${u.status === 'Active' ? 'bg-green-500' : u.status === 'Inactive' ? 'bg-gray-400' : 'bg-red-500'}\`}></span>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{u.lastLogin}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-gray-400 hover:text-primary mx-2 transition-colors"><Edit2 size={16} /></button>
                    <button className="text-gray-400 hover:text-red-600 mx-2 transition-colors"><Trash2 size={16} /></button>
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

const donorsContent = `import React from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Edit2, Trash2, Heart } from 'lucide-react';
import { BLOOD_GROUP_DISPLAY } from '../../constants';

const mockDonors = [
  { id: 'DNR-1021', name: 'Vikash Mehta', bg: 'O_POS', phone: '+91 98980 11223', location: 'Maninagar, Ahmedabad', lastDonation: 'Aug 12, 2026', eligibility: 'Eligible', status: 'Available' },
  { id: 'DNR-1022', name: 'Riya Shah', bg: 'A_NEG', phone: '+91 99000 22334', location: 'Adajan, Surat', lastDonation: 'Sep 25, 2026', eligibility: 'Not Eligible (Recent)', status: 'Unavailable' },
  { id: 'DNR-1023', name: 'Sanjay Gupta', bg: 'B_POS', phone: '+91 98222 33445', location: 'Alkapuri, Vadodara', lastDonation: 'Mar 10, 2026', eligibility: 'Eligible', status: 'Available' },
  { id: 'DNR-1024', name: 'Anjali Desai', bg: 'AB_POS', phone: '+91 94222 44556', location: 'Kalawad Road, Rajkot', lastDonation: 'Jan 05, 2026', eligibility: 'Eligible', status: 'Available' },
  { id: 'DNR-1025', name: 'Rahul Verma', bg: 'O_NEG', phone: '+91 95555 66778', location: 'Navrangpura, Ahmedabad', lastDonation: 'Oct 01, 2026', eligibility: 'Not Eligible (Recent)', status: 'Unavailable' },
];

export function DonorsPage() {
  return (
    <PageLayout title="Donor Directory" subtitle="Manage registered blood donors and their eligibility">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
           <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Heart size={20} className="text-primary"/> Registered Donors</h2>
           <div className="flex gap-2">
             <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50">Export</button>
             <button className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:opacity-90">Add Donor</button>
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
              <tr>
                <th className="px-6 py-4 font-medium">Donor ID</th>
                <th className="px-6 py-4 font-medium">Name & Blood Group</th>
                <th className="px-6 py-4 font-medium">Location</th>
                <th className="px-6 py-4 font-medium">Last Donation</th>
                <th className="px-6 py-4 font-medium">Eligibility</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockDonors.map(d => (
                <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{d.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center font-bold border border-primary/20">
                        {BLOOD_GROUP_DISPLAY[d.bg] || d.bg}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{d.name}</p>
                        <p className="text-xs text-gray-500">{d.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{d.location}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{d.lastDonation}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={\`text-xs font-semibold \${d.eligibility.includes('Not') ? 'text-red-600' : 'text-green-600'}\`}>
                        {d.eligibility}
                      </span>
                      <span className={\`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded w-fit \${d.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}\`}>
                        {d.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-gray-400 hover:text-primary mx-2 transition-colors"><Edit2 size={16} /></button>
                    <button className="text-gray-400 hover:text-red-600 mx-2 transition-colors"><Trash2 size={16} /></button>
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

const settingsContent = `import React from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { useTheme } from '../../store/ThemeContext';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../../constants';
import { Shield, Palette, Globe, Bell, Lock, User, Settings as SettingsIcon, Monitor } from 'lucide-react';

export function Settings() {
  const { color, setColor, mode, setMode } = useTheme();
  const { i18n, t } = useTranslation();
  const [activeTab, setActiveTab] = React.useState('appearance');

  const tabs = [
    { id: 'general', icon: SettingsIcon, label: 'General Settings' },
    { id: 'appearance', icon: Palette, label: 'Appearance & Theme' },
    { id: 'language', icon: Globe, label: 'Language & Region' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'security', icon: Lock, label: 'Security & Privacy' },
    { id: 'profile', icon: User, label: 'Profile Preferences' },
  ];

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('bloodconnect_lang', code);
  };

  return (
    <PageLayout title="Settings" subtitle="Manage your application preferences and configurations">
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0 space-y-1 bg-white rounded-xl shadow-sm border border-gray-200 p-2">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={\`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all \${isActive ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}\`}
              >
                <Icon size={18} className={isActive ? 'text-primary' : 'text-gray-400'} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 min-h-[500px]">
          
          {activeTab === 'appearance' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Theme Color</h3>
                <p className="text-sm text-gray-500 mb-5">Select a primary accent color for the entire application.</p>
                
                <div className="flex flex-wrap gap-3 mb-6">
                  {[
                    '#C62828', '#E65100', '#F9A825', '#2E7D32', '#827717',
                    '#00695C', '#00838F', '#1565C0', '#0277BD', '#1A237E', 
                    '#283593', '#6A1B9A', '#4A148C', '#880E4F', '#AD1457', 
                    '#D81B60', '#4E342E', '#424242', '#212121', '#FFFFFF'
                  ].map(c => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={\`w-10 h-10 rounded-full shadow-sm transition-transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 \${
                        color === c ? 'scale-110 ring-2 ring-offset-2 ring-primary border-none' : 'hover:scale-105 border border-gray-200'
                      }\`}
                      style={{ backgroundColor: c }}
                      title={\`Set theme to \${c}\`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 max-w-sm">
                  <div className="relative w-12 h-12 rounded-lg shadow-sm border border-gray-200 overflow-hidden flex-shrink-0">
                    <input 
                      type="color" 
                      value={color.startsWith('#') ? color : '#C62828'} 
                      onChange={(e) => setColor(e.target.value)}
                      className="absolute inset-[-10px] w-20 h-20 cursor-pointer" 
                      title="Custom Color Picker"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900">Custom Color Picker</span>
                    <span className="text-xs text-gray-500 mt-0.5">Select any HEX, RGB, or HSL color</span>
                  </div>
                </div>
              </div>

              <div className="h-px bg-gray-200 w-full"></div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Theme Mode</h3>
                <p className="text-sm text-gray-500 mb-5">Choose between light, dark, or sync with your system.</p>
                <div className="flex gap-4">
                  {(['light', 'dark', 'system'] as const).map(m => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={\`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border-2 font-medium capitalize transition-all focus:outline-none \${
                        mode === m
                          ? 'border-primary text-primary bg-primary/5'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                      }\`}
                    >
                      {m === 'system' && <Monitor size={16} />}
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'language' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Language Preferences</h3>
                <p className="text-sm text-gray-500 mb-5">Select your preferred language. The entire application will update instantly.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={\`flex items-center justify-between px-5 py-4 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-primary \${
                        i18n.language === lang.code
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                      }\`}
                    >
                      <div className="flex flex-col text-left">
                        <span className={\`font-bold \${i18n.language === lang.code ? 'text-primary' : 'text-gray-900'}\`}>
                          {lang.label}
                        </span>
                        <span className={\`text-sm mt-0.5 \${i18n.language === lang.code ? 'text-primary/70' : 'text-gray-500'}\`}>
                          {lang.nativeLabel}
                        </span>
                      </div>
                      <div className={\`w-5 h-5 rounded-full border-2 flex items-center justify-center \${i18n.language === lang.code ? 'border-primary' : 'border-gray-300'}\`}>
                        {i18n.language === lang.code && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'appearance' && activeTab !== 'language' && (
            <div className="flex flex-col items-center justify-center h-full text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
               <Shield size={48} className="text-gray-300 mb-4" />
               <h3 className="text-lg font-bold text-gray-900">Module Under Construction</h3>
               <p className="text-sm text-gray-500 mt-2 max-w-sm">This settings section will be available in the upcoming release. Please check back later.</p>
            </div>
          )}

        </div>
      </div>
    </PageLayout>
  );
}
`;

fs.writeFileSync('src/pages/shared/UsersPage.tsx', usersContent);
fs.writeFileSync('src/pages/shared/DonorsPage.tsx', donorsContent);
fs.writeFileSync('src/pages/shared/Settings.tsx', settingsContent);
console.log('Pages generated');
