const fs = require('fs');
const path = require('path');

const write = (file, content) => {
  const fullPath = path.join(__dirname, 'src', file);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n');
  console.log(`Updated ${file}`);
};

const settingsContent = `
import React, { useState } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { User, Lock, Bell, Globe, Palette, Shield, Loader2, CheckCircle2, Laptop } from 'lucide-react';
import { Input, Select } from '../../components/ui/Input';
import { useTheme } from '../../store/ThemeContext';
import { useAuth } from '../../store/AuthContext';
import toast from 'react-hot-toast';

export function Settings() {
  const [activeTab, setActiveTab] = useState('account');
  const { mode, setMode } = useTheme();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Settings saved successfully');
    }, 800);
  };

  const handleCancel = () => {
    toast('Changes discarded', { icon: '↺' });
  };

  const tabs = [
    { id: 'account', label: 'Account Settings', icon: User },
    { id: 'security', label: 'Password & Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'language', label: 'Language', icon: Globe },
    { id: 'theme', label: 'Appearance', icon: Palette },
    { id: 'privacy', label: 'Privacy & Data', icon: Shield },
  ];

  return (
    <PageLayout title="Settings" subtitle="Manage your account preferences and configurations">
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Standard Sidebar */}
        <div className="w-full md:w-64 shrink-0 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={\`w-full flex items-center gap-3 px-5 py-4 text-sm font-semibold transition-colors border-l-4 \${
                  activeTab === tab.id ? 'border-primary bg-primary/5 text-primary' : 'border-transparent text-gray-600 hover:bg-gray-50'
                }\`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col min-h-[600px]">
          
          <div className="mb-6 pb-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 capitalize">
              {tabs.find(t => t.id === activeTab)?.label || 'Settings'}
            </h2>
          </div>

          <form onSubmit={handleSave} className="flex-1 flex flex-col">
            <div className="flex-1">
              
              {/* ACCOUNT TAB */}
              {activeTab === 'account' && (
                <div className="max-w-md space-y-5">
                  <Input label="Username" defaultValue={user?.fullName?.replace(' ', '_').toLowerCase() || "user"} required />
                  <Input label="Email Address" defaultValue={user?.email} required type="email" />
                  <div className="flex items-end gap-3">
                    <Input label="Mobile Number" defaultValue={user?.mobile} required className="flex-1" />
                    <button type="button" className="h-[42px] px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg text-sm">Verify</button>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 mt-6 space-y-2">
                    <h4 className="font-bold text-gray-900 text-sm mb-2">Account Status</h4>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 font-semibold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span> Active Profile
                      </span>
                      <span className="text-green-600 font-bold">Verified</span>
                    </div>
                  </div>
                </div>
              )}

              {/* SECURITY TAB */}
              {activeTab === 'security' && (
                <div className="max-w-md space-y-5">
                  <Input label="Current Password" type="password" required />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Input label="New Password" type="password" required />
                    <Input label="Confirm New Password" type="password" required />
                  </div>
                  
                  <div className="pt-6 mt-6 border-t border-gray-100 space-y-4">
                    <h4 className="font-bold text-gray-900 text-sm">Advanced Security</h4>
                    <label className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer">
                      <div>
                        <span className="text-sm font-bold text-gray-900 block mb-0.5">Two-Factor Authentication</span>
                        <span className="text-xs text-gray-500">Add an extra layer of security to your account</span>
                      </div>
                      <div className="relative inline-flex items-center">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* NOTIFICATIONS TAB */}
              {activeTab === 'notifications' && (
                <div className="max-w-md space-y-3">
                  {[
                    { id: 'req', label: 'Blood Request Notifications', desc: 'Alerts when someone needs blood nearby', active: true },
                    { id: 'status', label: 'Request Status Updates', desc: 'Updates on your accepted/rejected requests', active: true },
                    { id: 'reminder', label: 'Donation Reminders', desc: 'Get reminded when you are eligible to donate', active: true },
                    { id: 'match', label: 'Matching Donor Alerts', desc: 'Notify me when a perfect donor matches my request', active: true },
                    { id: 'email', label: 'Email Notifications', desc: 'Receive summaries via email', active: false },
                    { id: 'sms', label: 'SMS Notifications', desc: 'Urgent alerts delivered directly via SMS', active: true }
                  ].map(n => (
                    <label key={n.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer group">
                      <div>
                        <span className="text-sm font-bold text-gray-900 block mb-0.5">{n.label}</span>
                        <span className="text-xs text-gray-500">{n.desc}</span>
                      </div>
                      <div className="relative inline-flex items-center shrink-0">
                        <input type="checkbox" defaultChecked={n.active} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {/* LANGUAGE TAB */}
              {activeTab === 'language' && (
                <div className="max-w-md space-y-5">
                  <Select label="Application Language" options={[
                    {value: 'en', label: 'English'},
                    {value: 'gu', label: 'Gujarati (ગુજરાતી)'},
                    {value: 'hi', label: 'Hindi (हिन्दी)'}
                  ]} />
                </div>
              )}

              {/* THEME TAB */}
              {activeTab === 'theme' && (
                <div className="max-w-2xl">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {[
                      { id: 'light', label: 'Light', icon: Palette, desc: 'Clean and bright' },
                      { id: 'dark', label: 'Dark', icon: Palette, desc: 'Easy on the eyes' },
                      { id: 'system', label: 'System', icon: Laptop, desc: 'Matches device' }
                    ].map(t => {
                      const isSelected = mode === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setMode(t.id as any)}
                          className={\`relative p-6 rounded-2xl flex flex-col items-center gap-3 transition-all duration-200 border-2 \${
                            isSelected 
                              ? 'bg-primary/5 border-primary shadow-sm' 
                              : 'bg-white border-gray-100 hover:border-gray-200 text-gray-500'
                          }\`}
                        >
                          {isSelected && (
                            <div className="absolute top-3 right-3 text-primary animate-in zoom-in">
                              <CheckCircle2 size={18} fill="currentColor" className="text-primary bg-white rounded-full" />
                            </div>
                          )}
                          <div className={\`p-4 rounded-xl \${isSelected ? 'bg-primary text-white' : 'bg-gray-50 text-gray-400'}\`}>
                            <t.icon size={28} />
                          </div>
                          <div className="text-center">
                            <span className={\`block font-bold mb-1 \${isSelected ? 'text-gray-900' : 'text-gray-700'}\`}>{t.label}</span>
                            <span className="text-xs text-gray-400">{t.desc}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* PRIVACY TAB */}
              {activeTab === 'privacy' && (
                <div className="max-w-md space-y-5">
                  <Select label="Profile Visibility" options={[{value: 'public', label: 'Public'}, {value: 'private', label: 'Private (Donors only)'}]} />
                  <Select label="Location Visibility" options={[{value: 'exact', label: 'Exact Location'}, {value: 'city', label: 'City Level Only'}]} />
                  
                  <div className="p-5 bg-amber-50 rounded-xl border border-amber-100 mt-6">
                    <h4 className="font-bold text-amber-900 text-sm mb-2">Data Export</h4>
                    <p className="text-xs text-amber-700 mb-4">Download a complete copy of all your personal data and donation history.</p>
                    <button type="button" className="px-4 py-2 bg-white text-amber-700 text-xs font-bold rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors">
                      Request Data Archive
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ACTION BUTTONS */}
            {(activeTab !== 'theme') && (
              <div className="pt-6 mt-8 border-t border-gray-100 flex justify-end gap-3 shrink-0">
                <button 
                  type="button" 
                  onClick={handleCancel} 
                  disabled={isSubmitting} 
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-lg text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="px-5 py-2.5 bg-primary text-white font-bold rounded-lg text-sm hover:bg-primary-dark transition-colors flex items-center gap-2 disabled:opacity-70"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                  {activeTab === 'security' ? 'Change Password' : 'Save Changes'}
                </button>
              </div>
            )}
          </form>
        </div>
        
      </div>
    </PageLayout>
  );
}
`;
write('pages/shared/Settings.tsx', settingsContent);
