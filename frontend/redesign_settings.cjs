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
import { User, Lock, Bell, Globe, Palette, Shield, Loader2, CheckCircle2, ChevronRight, Laptop } from 'lucide-react';
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
    { id: 'account', label: 'Account Settings', icon: User, desc: 'Manage your profile and contact info' },
    { id: 'security', label: 'Password & Security', icon: Lock, desc: 'Update password and protect your account' },
    { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Choose what updates you want to see' },
    { id: 'language', label: 'Language', icon: Globe, desc: 'Change the application language' },
    { id: 'theme', label: 'Appearance', icon: Palette, desc: 'Customize the UI theme and colors' },
    { id: 'privacy', label: 'Privacy & Data', icon: Shield, desc: 'Control your visibility and personal data' },
  ];

  const activeTabData = tabs.find(t => t.id === activeTab);

  return (
    <PageLayout title="Settings" subtitle="Manage your account preferences and configurations">
      <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
        
        {/* Modern Sidebar */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-3 flex flex-col gap-1">
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={\`w-full text-left flex items-start gap-4 p-4 rounded-2xl transition-all duration-300 relative overflow-hidden group \${
                    isActive ? 'bg-primary border-transparent shadow-md shadow-primary/20 scale-[1.02]' : 'bg-transparent hover:bg-gray-50 border-transparent hover:scale-[1.01]'
                  }\`}
                >
                  <div className={\`p-2.5 rounded-xl transition-colors \${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-white group-hover:text-primary group-hover:shadow-sm'}\`}>
                    <tab.icon size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className={\`font-bold text-sm mb-0.5 \${isActive ? 'text-white' : 'text-gray-900'}\`}>{tab.label}</h4>
                    <p className={\`text-xs leading-relaxed \${isActive ? 'text-primary-50' : 'text-gray-500'}\`}>{tab.desc}</p>
                  </div>
                  {isActive && <ChevronRight size={18} className="text-white/50 absolute right-4 top-1/2 -translate-y-1/2" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 flex flex-col min-h-[600px] relative overflow-hidden">
            
            {/* Subtle background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/3"></div>

            <div className="mb-8 pb-6 border-b border-gray-100/80">
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                {activeTabData?.label}
              </h2>
              <p className="text-gray-500 mt-1 text-sm">{activeTabData?.desc}</p>
            </div>

            <form onSubmit={handleSave} className="flex-1 flex flex-col z-10">
              <div className="flex-1">
                
                {/* ACCOUNT TAB */}
                {activeTab === 'account' && (
                  <div className="max-w-xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Input label="Username" defaultValue={user?.fullName?.replace(' ', '_').toLowerCase() || "user"} required className="bg-gray-50/50" />
                      <Input label="Email Address" defaultValue={user?.email} required type="email" className="bg-gray-50/50" />
                    </div>
                    <div className="flex items-end gap-3">
                      <Input label="Mobile Number" defaultValue={user?.mobile} required className="flex-1 bg-gray-50/50" />
                      <button type="button" className="h-[42px] px-5 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-xl text-sm transition-colors">Verify</button>
                    </div>
                    
                    <div className="p-5 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl border border-gray-100/80 space-y-3 mt-8">
                      <h4 className="font-bold text-gray-900 text-sm mb-2">Account Status</h4>
                      <div className="flex justify-between items-center text-sm p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                        <span className="text-gray-600 font-semibold flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500"></span> Active Profile
                        </span>
                        <span className="text-gray-400">Verified</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* SECURITY TAB */}
                {activeTab === 'security' && (
                  <div className="max-w-xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Input label="Current Password" type="password" required className="bg-gray-50/50" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Input label="New Password" type="password" required className="bg-gray-50/50" />
                      <Input label="Confirm New Password" type="password" required className="bg-gray-50/50" />
                    </div>
                    
                    <div className="pt-6 mt-6 border-t border-gray-100/80 space-y-4">
                      <h4 className="font-bold text-gray-900 text-sm">Advanced Security</h4>
                      <label className="flex justify-between items-center p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-primary/30 transition-colors cursor-pointer group">
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
                  <div className="max-w-xl space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {[
                      { id: 'req', label: 'Blood Request Notifications', desc: 'Alerts when someone needs blood nearby', active: true },
                      { id: 'status', label: 'Request Status Updates', desc: 'Updates on your accepted/rejected requests', active: true },
                      { id: 'reminder', label: 'Donation Reminders', desc: 'Get reminded when you are eligible to donate', active: true },
                      { id: 'match', label: 'Matching Donor Alerts', desc: 'Notify me when a perfect donor matches my request', active: true },
                      { id: 'email', label: 'Email Notifications', desc: 'Receive summaries via email', active: false },
                      { id: 'sms', label: 'SMS Notifications', desc: 'Urgent alerts delivered directly via SMS', active: true }
                    ].map(n => (
                      <label key={n.id} className="flex justify-between items-center p-4 bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 hover:border-primary/30 transition-all cursor-pointer group">
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
                  <div className="max-w-xl space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Select label="Application Language" className="bg-gray-50/50" options={[
                      {value: 'en', label: 'English'},
                      {value: 'gu', label: 'Gujarati (ગુજરાતી)'},
                      {value: 'hi', label: 'Hindi (हिन्दी)'}
                    ]} />
                  </div>
                )}

                {/* THEME TAB */}
                {activeTab === 'theme' && (
                  <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                            className={\`relative p-6 rounded-3xl flex flex-col items-center gap-3 transition-all duration-300 overflow-hidden \${
                              isSelected 
                                ? 'bg-gradient-to-b from-primary/10 to-transparent border-2 border-primary shadow-lg shadow-primary/10 scale-105' 
                                : 'bg-white border-2 border-gray-100 hover:border-gray-300 hover:shadow-md text-gray-500'
                            }\`}
                          >
                            {isSelected && (
                              <div className="absolute top-3 right-3 text-primary animate-in zoom-in">
                                <CheckCircle2 size={18} fill="currentColor" className="text-primary bg-white rounded-full" />
                              </div>
                            )}
                            <div className={\`p-4 rounded-2xl \${isSelected ? 'bg-primary text-white shadow-md' : 'bg-gray-50 text-gray-400'}\`}>
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
                  <div className="max-w-xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Select label="Profile Visibility" className="bg-gray-50/50" options={[{value: 'public', label: 'Public'}, {value: 'private', label: 'Private (Donors only)'}]} />
                    <Select label="Location Visibility" className="bg-gray-50/50" options={[{value: 'exact', label: 'Exact Location'}, {value: 'city', label: 'City Level Only'}]} />
                    
                    <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 mt-6">
                      <h4 className="font-bold text-amber-900 text-sm mb-2">Data Export</h4>
                      <p className="text-xs text-amber-700 mb-4">Download a complete copy of all your personal data and donation history.</p>
                      <button type="button" className="px-4 py-2 bg-white text-amber-700 text-xs font-bold rounded-xl border border-amber-200 hover:bg-amber-100 transition-colors">
                        Request Data Archive
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ACTION BUTTONS */}
              {(activeTab !== 'theme') && (
                <div className="pt-6 mt-8 border-t border-gray-100/80 flex justify-end gap-4 shrink-0">
                  <button 
                    type="button" 
                    onClick={handleCancel} 
                    disabled={isSubmitting} 
                    className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl text-sm hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 shadow-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="px-6 py-3 bg-primary text-white font-bold rounded-xl text-sm hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
                  >
                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : null}
                    {activeTab === 'security' ? 'Change Password' : 'Save Changes'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
        
      </div>
    </PageLayout>
  );
}
`;
write('pages/shared/Settings.tsx', settingsContent);
