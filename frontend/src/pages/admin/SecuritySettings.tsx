import React, { useState } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Shield, Key, Clock, AlertTriangle, Lock, Smartphone } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';

export function SecuritySettings() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    passwordPolicy: 'Strong (Min 8 chars, 1 number, 1 special char)',
    sessionTimeout: '30',
    maxLoginAttempts: '5',
    twoFactorAuth: true,
    securityAlerts: true
  });

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Security settings saved successfully!');
    }, 800);
  };

  const handleCancel = () => {
    toast.error('Changes discarded.');
  };

  return (
    <PageLayout title="Security Settings" subtitle="Manage platform-wide security rules and authentication policies">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
            <Shield size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Authentication & Access</h2>
            <p className="text-sm text-gray-500">Configure how users authenticate to the platform</p>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Key size={16} className="text-gray-400" /> Password Policy
              </label>
              <select 
                value={settings.passwordPolicy}
                onChange={(e) => setSettings({...settings, passwordPolicy: e.target.value})}
                className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                <option>Basic (Min 6 chars)</option>
                <option>Medium (Min 8 chars, 1 number)</option>
                <option>Strong (Min 8 chars, 1 number, 1 special char)</option>
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Clock size={16} className="text-gray-400" /> Session Timeout (Minutes)
              </label>
              <Input 
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({...settings, sessionTimeout: e.target.value})}
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <AlertTriangle size={16} className="text-gray-400" /> Max Failed Login Attempts
              </label>
              <Input 
                type="number"
                value={settings.maxLoginAttempts}
                onChange={(e) => setSettings({...settings, maxLoginAttempts: e.target.value})}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
          <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
            <Lock size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Advanced Security Features</h2>
            <p className="text-sm text-gray-500">Enable additional security measures for platform protection</p>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex gap-4 items-start">
               <div className="mt-1"><Smartphone size={20} className="text-gray-500" /></div>
               <div>
                 <h4 className="font-bold text-gray-900">Require Two-Factor Authentication (2FA)</h4>
                 <p className="text-sm text-gray-500">Force all Admins and Super Admins to use 2FA for login.</p>
               </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={settings.twoFactorAuth} onChange={() => setSettings({...settings, twoFactorAuth: !settings.twoFactorAuth})} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex gap-4 items-start">
               <div className="mt-1"><AlertTriangle size={20} className="text-gray-500" /></div>
               <div>
                 <h4 className="font-bold text-gray-900">System Security Alerts</h4>
                 <p className="text-sm text-gray-500">Receive email alerts for suspicious logins and system changes.</p>
               </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={settings.securityAlerts} onChange={() => setSettings({...settings, securityAlerts: !settings.securityAlerts})} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-gray-100 pt-6">
         <button onClick={handleCancel} className="px-6 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors">
           Cancel
         </button>
         <button onClick={handleSave} disabled={loading} className="px-8 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2">
           {loading ? 'Saving...' : 'Save Changes'}
         </button>
      </div>
    </PageLayout>
  );
}
