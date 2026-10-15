import React, { useState, useEffect, useCallback } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { 
  User, 
  Lock, 
  Bell, 
  Globe, 
  Palette, 
  Shield, 
  Loader2, 
  CheckCircle2, 
  Laptop, 
  Sun, 
  Moon, 
  Download 
} from 'lucide-react';
import { Input, Select } from '../../components/ui/Input';
import { useTheme } from '../../store/ThemeContext';
import { useAuth } from '../../store/AuthContext';
import { authApi } from '../../services/api';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export function Settings() {
  const [activeTab, setActiveTab] = useState('account');
  const { mode, setMode } = useTheme();
  const { user, refreshUser } = useAuth();
  const { i18n } = useTranslation();

  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Account State
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || user?.mobile || '');
  const [city, setCity] = useState(user?.donorProfile?.city || user?.city || '');

  // Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);

  // Notifications State
  const [notifications, setNotifications] = useState({
    bloodRequests: true,
    statusUpdates: true,
    donationReminders: true,
    matchingDonors: true,
    emailAlerts: false,
    smsAlerts: true,
  });

  // Language State
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || 'en');

  // Appearance State
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'system'>((mode as any) || 'light');

  // Privacy State
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    locationVisibility: 'city',
  });

  // Fetch settings from backend
  const fetchSettings = useCallback(async () => {
    try {
      setIsLoadingSettings(true);
      const res = await authApi.getSettings();
      if (res.data?.data) {
        const s = res.data.data;
        if (s.notifications) {
          setNotifications(prev => ({ ...prev, ...s.notifications }));
        }
        if (typeof s.twoFactorAuth === 'boolean') {
          setTwoFactorAuth(s.twoFactorAuth);
        }
        if (s.language) {
          setSelectedLanguage(s.language);
        }
        if (s.theme) {
          setSelectedTheme(s.theme);
        }
        if (s.privacy) {
          setPrivacy(prev => ({ ...prev, ...s.privacy }));
        }
      }
    } catch (err) {
      console.error('Failed to load settings from server', err);
    } finally {
      setIsLoadingSettings(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Keep account fields synced with user if user updates
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim());
      setPhone(user.phone || user.mobile || '');
      setCity(user.donorProfile?.city || user.city || '');
    }
  }, [user]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    try {
      if (activeTab === 'account') {
        const parts = fullName.trim().split(' ');
        const firstName = parts[0] || 'User';
        const lastName = parts.slice(1).join(' ') || '';

        await authApi.updateProfile({
          fullName: fullName.trim(),
          firstName,
          lastName,
          phone: phone.trim(),
          city: city.trim(),
        });
        if (refreshUser) await refreshUser();
        toast.success('Account profile updated successfully!');
      } else if (activeTab === 'security') {
        let passwordChanged = false;
        if (currentPassword || newPassword || confirmPassword) {
          if (!currentPassword) {
            toast.error('Please enter your current password');
            setIsSubmitting(false);
            return;
          }
          if (newPassword.length < 8) {
            toast.error('New password must be at least 8 characters');
            setIsSubmitting(false);
            return;
          }
          if (newPassword !== confirmPassword) {
            toast.error('New password and confirm password do not match');
            setIsSubmitting(false);
            return;
          }

          await authApi.changePassword({
            currentPassword,
            newPassword,
          });
          passwordChanged = true;
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        }

        await authApi.updateSettings({ twoFactorAuth });
        toast.success(passwordChanged ? 'Password and security settings updated!' : 'Security settings updated!');
      } else if (activeTab === 'notifications') {
        await authApi.updateSettings({ notifications });
        toast.success('Notification preferences saved successfully!');
      } else if (activeTab === 'language') {
        await authApi.updateSettings({ language: selectedLanguage });
        i18n.changeLanguage(selectedLanguage);
        localStorage.setItem('BloodConnect_lang', selectedLanguage);
        toast.success('Language preference updated successfully!');
      } else if (activeTab === 'theme') {
        await authApi.updateSettings({ theme: selectedTheme });
        setMode(selectedTheme as any);
        toast.success('Appearance preference saved successfully!');
      } else if (activeTab === 'privacy') {
        await authApi.updateSettings({ privacy });
        toast.success('Privacy settings updated successfully!');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to save settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const res = await authApi.exportData();
      const payload = res.data?.data || res.data;

      const dataBlob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const downloadUrl = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `LifeLink_UserData_Archive_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);

      toast.success('Data archive downloaded successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to export data archive');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCancel = () => {
    setFullName(user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim());
    setPhone(user?.phone || user?.mobile || '');
    setCity(user?.donorProfile?.city || user?.city || '');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    fetchSettings();
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

  const notificationOptions = [
    { key: 'bloodRequests', label: 'Blood Request Notifications', desc: 'Alerts when someone needs blood nearby' },
    { key: 'statusUpdates', label: 'Request Status Updates', desc: 'Updates on your accepted/rejected requests' },
    { key: 'donationReminders', label: 'Donation Reminders', desc: 'Get reminded when you are eligible to donate' },
    { key: 'matchingDonors', label: 'Matching Donor Alerts', desc: 'Notify me when a perfect donor matches my request' },
    { key: 'emailAlerts', label: 'Email Notifications', desc: 'Receive summaries via email' },
    { key: 'smsAlerts', label: 'SMS Notifications', desc: 'Urgent alerts delivered directly via SMS' },
  ];

  return (
    <PageLayout title="Settings" subtitle="Manage your account preferences and configurations">
      <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
        
        {/* Settings Navigation: Responsive Horizontal Bar on mobile, Clean Sidebar on md+ */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-1.5 md:p-0 flex md:flex-col overflow-x-auto md:overflow-hidden gap-1.5 md:gap-0 no-scrollbar">
            {tabs.map(tab => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 md:py-4 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap rounded-xl md:rounded-none shrink-0 ${
                    isActive 
                      ? 'bg-primary/10 text-primary font-bold md:border-l-4 md:border-primary md:bg-primary/5' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 md:border-l-4 md:border-transparent'
                  }`}
                >
                  <IconComp size={18} className="shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8 flex flex-col min-h-[450px] md:min-h-[600px]">
          
          <div className="mb-5 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 capitalize">
              {tabs.find(t => t.id === activeTab)?.label || 'Settings'}
            </h2>
            {isLoadingSettings && (
              <span className="flex items-center gap-1.5 text-xs text-gray-400">
                <Loader2 size={14} className="animate-spin text-primary" />
                Loading preferences...
              </span>
            )}
          </div>

          <form onSubmit={handleSave} className="flex-1 flex flex-col justify-between">
            <div className="flex-1 w-full max-w-2xl">
              
              {/* ACCOUNT TAB */}
              {activeTab === 'account' && (
                <div className="space-y-4 sm:space-y-5">
                  <Input 
                    label="Full Name" 
                    value={fullName} 
                    onChange={e => setFullName(e.target.value)} 
                    required 
                  />
                  <Input 
                    label="Email Address" 
                    value={user?.email || ''} 
                    disabled 
                    type="email" 
                  />
                  <Input 
                    label="Mobile Number" 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)} 
                    required 
                  />
                  <Input 
                    label="City / Location" 
                    value={city} 
                    onChange={e => setCity(e.target.value)} 
                    placeholder="e.g. Ahmedabad" 
                  />

                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 mt-5 space-y-2">
                    <h4 className="font-bold text-gray-900 text-sm mb-2">Account Status</h4>
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-gray-500 font-semibold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span> Active Profile
                      </span>
                      <span className="text-green-600 font-bold">{user?.status || 'Active'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* SECURITY TAB */}
              {activeTab === 'security' && (
                <div className="space-y-4 sm:space-y-5">
                  <Input 
                    label="Current Password" 
                    type="password" 
                    value={currentPassword} 
                    onChange={e => setCurrentPassword(e.target.value)} 
                    placeholder="Enter current password to change"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <Input 
                      label="New Password" 
                      type="password" 
                      value={newPassword} 
                      onChange={e => setNewPassword(e.target.value)} 
                      placeholder="Minimum 8 characters"
                    />
                    <Input 
                      label="Confirm New Password" 
                      type="password" 
                      value={confirmPassword} 
                      onChange={e => setConfirmPassword(e.target.value)} 
                      placeholder="Repeat new password"
                    />
                  </div>
                  
                  <div className="pt-5 mt-5 border-t border-gray-100 space-y-3">
                    <h4 className="font-bold text-gray-900 text-sm">Advanced Security</h4>
                    <label className="flex justify-between items-center p-3.5 sm:p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer gap-3">
                      <div>
                        <span className="text-xs sm:text-sm font-bold text-gray-900 block mb-0.5">Two-Factor Authentication</span>
                        <span className="text-[11px] sm:text-xs text-gray-500">Protect account with OTP authorization</span>
                      </div>
                      <div className="relative inline-flex items-center shrink-0">
                        <input 
                          type="checkbox" 
                          checked={twoFactorAuth} 
                          onChange={e => setTwoFactorAuth(e.target.checked)}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* NOTIFICATIONS TAB */}
              {activeTab === 'notifications' && (
                <div className="space-y-2.5 sm:space-y-3">
                  {notificationOptions.map(n => {
                    const isChecked = !!notifications[n.key as keyof typeof notifications];
                    return (
                      <label key={n.key} className="flex justify-between items-center p-3.5 sm:p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer group gap-3">
                        <div className="pr-2">
                          <span className="text-xs sm:text-sm font-bold text-gray-900 block mb-0.5">{n.label}</span>
                          <span className="text-[11px] sm:text-xs text-gray-500 line-clamp-2">{n.desc}</span>
                        </div>
                        <div className="relative inline-flex items-center shrink-0">
                          <input 
                            type="checkbox" 
                            checked={isChecked} 
                            onChange={e => {
                              const checked = e.target.checked;
                              setNotifications(prev => ({ ...prev, [n.key]: checked }));
                            }}
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* LANGUAGE TAB */}
              {activeTab === 'language' && (
                <div className="space-y-4 sm:space-y-5">
                  <Select 
                    label="Application Language" 
                    value={selectedLanguage}
                    onChange={e => setSelectedLanguage(e.target.value)}
                    options={[
                      { value: 'en', label: 'English' },
                      { value: 'gu', label: 'Gujarati (ગુજરાતી)' },
                      { value: 'hi', label: 'Hindi (हिन्दी)' }
                    ]} 
                  />
                  <p className="text-xs text-gray-500">
                    Select your preferred language. Changes will apply immediately across navigation, notifications, and forms upon saving.
                  </p>
                </div>
              )}

              {/* THEME TAB */}
              {activeTab === 'theme' && (
                <div className="space-y-5 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    {([
                      { id: 'light', label: 'Light', icon: Sun, desc: 'Clean and bright' },
                      { id: 'dark', label: 'Dark', icon: Moon, desc: 'Easy on the eyes' },
                      { id: 'system', label: 'System', icon: Laptop, desc: 'Matches device' }
                    ] as const).map(t => {
                      const IconC = t.icon;
                      const isSelected = selectedTheme === t.id;
                      return (
                        <div 
                          key={t.id} 
                          onClick={() => {
                            setSelectedTheme(t.id);
                            setMode(t.id as any);
                          }}
                          className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                            isSelected 
                              ? 'border-primary bg-primary/5 shadow-sm' 
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2.5 sm:mb-3">
                            <IconC size={20} className={isSelected ? 'text-primary' : 'text-gray-400'} />
                            {isSelected && <CheckCircle2 size={16} className="text-primary" />}
                          </div>
                          <h4 className="font-bold text-gray-900 text-sm">{t.label}</h4>
                          <p className="text-xs text-gray-500 mt-0.5">{t.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-500">
                    Switch between themes instantly or save your preference to remember across all your devices.
                  </p>
                </div>
              )}

              {/* PRIVACY TAB */}
              {activeTab === 'privacy' && (
                <div className="space-y-4 sm:space-y-5">
                  <Select 
                    label="Profile Visibility" 
                    value={privacy.profileVisibility}
                    onChange={e => setPrivacy(prev => ({ ...prev, profileVisibility: e.target.value }))}
                    options={[
                      { value: 'public', label: 'Public (Visible in search directory)' },
                      { value: 'private', label: 'Private (Verified donors and hospitals only)' }
                    ]} 
                  />
                  <Select 
                    label="Location Visibility" 
                    value={privacy.locationVisibility}
                    onChange={e => setPrivacy(prev => ({ ...prev, locationVisibility: e.target.value }))}
                    options={[
                      { value: 'exact', label: 'Exact Location (GPS coordinates)' },
                      { value: 'city', label: 'City Level Only (General area)' }
                    ]} 
                  />
                  
                  <div className="p-4 sm:p-5 bg-amber-50 rounded-xl border border-amber-200 mt-5 sm:mt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Download size={18} className="text-amber-700" />
                      <h4 className="font-bold text-amber-900 text-sm">Data Export</h4>
                    </div>
                    <p className="text-xs text-amber-700 mb-3.5 sm:mb-4">
                      Download a complete copy of all your personal data, requests, and donation history in JSON format.
                    </p>
                    <button 
                      type="button" 
                      onClick={handleExportData} 
                      disabled={isExporting}
                      className="w-full sm:w-auto px-4 py-2.5 bg-white text-amber-800 text-xs font-bold rounded-lg border border-amber-300 hover:bg-amber-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                      {isExporting ? 'Exporting...' : 'Request Data Archive'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ACTION BUTTONS: Fully responsive on mobile, tablet & desktop */}
            <div className="pt-5 sm:pt-6 mt-6 sm:mt-8 border-t border-gray-100 flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3 shrink-0">
              <button 
                type="button" 
                onClick={handleCancel} 
                disabled={isSubmitting} 
                className="w-full sm:w-auto px-5 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-lg text-sm hover:bg-gray-200 transition-colors disabled:opacity-50 text-center"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full sm:w-auto px-5 py-2.5 bg-primary text-white font-bold rounded-lg text-sm hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-70 text-center"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                {activeTab === 'security' && (currentPassword || newPassword) ? 'Change Password & Save' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageLayout>
  );
}
