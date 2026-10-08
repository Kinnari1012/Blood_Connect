const fs = require('fs');
const path = require('path');

const write = (file, content) => {
  const fullPath = path.join(__dirname, 'src', file);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n');
  console.log(`Updated ${file}`);
};

const profilePageContent = `
import React, { useState, useEffect } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { User, Droplet, MapPin, Camera, Loader2 } from 'lucide-react';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { useAuth } from '../../store/AuthContext';
import toast from 'react-hot-toast';

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const defaultProfile = {
    // Personal
    fullName: user?.fullName || 'User Name',
    dob: '1990-01-01',
    gender: 'Other',
    email: user?.email || 'user@example.com',
    mobile: user?.mobile || '+91 00000 00000',
    altMobile: '',
    emergencyContactName: '',
    emergencyContactNumber: '',
    memberSince: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {month: 'short', year: 'numeric'}) : 'Jan 2026',
    status: user?.status || 'ACTIVE',
    
    // Blood Info
    bloodGroup: user?.donorProfile?.bloodGroup || 'O_POS',
    lastDonation: user?.donorProfile?.lastDonationDate || '',
    totalDonations: user?.donorProfile?.totalDonations || 0,
    eligibility: 'Eligible',
    nextEligible: user?.donorProfile?.nextEligibleDate || '',
    preferredType: 'Whole Blood',
    availability: user?.donorProfile?.availability ? 'Available' : 'Temporarily Unavailable',
    availabilityNotes: '',
    
    // Address
    address1: '',
    address2: '',
    area: user?.donorProfile?.area || '',
    city: user?.donorProfile?.city || '',
    state: '',
    country: 'India',
    pincode: '',
    radius: '10',
    locationPermission: true,
    preferredLocation: ''
  };

  const [profile, setProfile] = useState(defaultProfile);
  const [initialProfile, setInitialProfile] = useState(defaultProfile);

  useEffect(() => {
    if (user) {
      const savedProfile = localStorage.getItem(\`user_profile_\${user.id}\`);
      if (savedProfile) {
        const p = { ...defaultProfile, ...JSON.parse(savedProfile) };
        setProfile(p);
        setInitialProfile(p);
      } else {
        setProfile(defaultProfile);
        setInitialProfile(defaultProfile);
      }
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setProfile(p => ({ ...p, [name]: val }));
  };

  const handleCancel = () => {
    setProfile(initialProfile);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    
    setTimeout(() => {
      localStorage.setItem(\`user_profile_\${user.id}\`, JSON.stringify(profile));
      setInitialProfile(profile);
      
      const updatedUser = {
        ...user,
        fullName: profile.fullName,
        email: profile.email,
        mobile: profile.mobile,
        donorProfile: {
          ...(user.donorProfile || {}),
          bloodGroup: profile.bloodGroup as any,
          city: profile.city,
          area: profile.area,
          availability: profile.availability === 'Available',
          totalDonations: profile.totalDonations
        }
      };
      
      updateUser(updatedUser);
      setIsSubmitting(false);
      toast.success('Changes saved successfully!');
    }, 800);
  };

  if (!user) return null;

  return (
    <PageLayout title="My Profile" subtitle="Manage your personal, blood, and location information">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 shrink-0 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col items-center">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-black border-2 border-primary/20">
                {profile.fullName.charAt(0).toUpperCase()}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-primary transition-colors shadow-sm">
                <Camera size={14} />
              </button>
            </div>
            <h3 className="font-bold text-gray-900 text-lg text-center">{profile.fullName}</h3>
            <p className="text-sm text-gray-500 text-center">{profile.email}</p>
            <p className="text-sm text-gray-500 text-center mb-2">{profile.mobile}</p>
            <p className="text-xs font-bold text-gray-400 mb-4 bg-gray-100 px-3 py-1 rounded-full">Blood Group: {profile.bloodGroup.replace('_POS','+').replace('_NEG','-')}</p>
            <span className={\`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide \${profile.availability === 'Available' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}\`}>
              {profile.availability}
            </span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {[
              { id: 'personal', label: 'Personal Info', icon: User },
              { id: 'blood', label: 'Blood Information', icon: Droplet },
              { id: 'address', label: 'Address & Location', icon: MapPin }
            ].map(tab => (
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

        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">
              {activeTab === 'personal' && 'Personal Information'}
              {activeTab === 'blood' && 'Blood Information'}
              {activeTab === 'address' && 'Address & Location'}
            </h2>
          </div>

          <form className="flex-1 flex flex-col" onSubmit={handleSave}>
            <div className="flex-1 space-y-6">
              {activeTab === 'personal' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input label="Full Name" name="fullName" required value={profile.fullName} onChange={handleChange} />
                  <Input label="Email Address" name="email" required type="email" value={profile.email} onChange={handleChange} />
                  <Input label="Mobile Number" name="mobile" required value={profile.mobile} onChange={handleChange} />
                  <Input label="Alternate Mobile" name="altMobile" value={profile.altMobile} onChange={handleChange} />
                  <Input label="Date of Birth" name="dob" type="date" value={profile.dob} onChange={handleChange} />
                  <Select label="Gender" name="gender" value={profile.gender} onChange={handleChange} options={[
                    { value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }, { value: 'Other', label: 'Other' }
                  ]} />
                  <Input label="Emergency Contact Name" name="emergencyContactName" value={profile.emergencyContactName} onChange={handleChange} />
                  <Input label="Emergency Contact Number" name="emergencyContactNumber" value={profile.emergencyContactNumber} onChange={handleChange} />
                  <Input label="Account Status" value={profile.status} disabled />
                  <Input label="Member Since" value={profile.memberSince} disabled />
                </div>
              )}

              {activeTab === 'blood' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Select label="Blood Group" name="bloodGroup" value={profile.bloodGroup} onChange={handleChange} options={[
                      { value: 'A_POS', label: 'A+' }, { value: 'B_POS', label: 'B+' }, { value: 'O_POS', label: 'O+' }, { value: 'AB_POS', label: 'AB+' },
                      { value: 'A_NEG', label: 'A-' }, { value: 'B_NEG', label: 'B-' }, { value: 'O_NEG', label: 'O-' }, { value: 'AB_NEG', label: 'AB-' }
                    ]} />
                    <Select label="Preferred Donation Type" name="preferredType" value={profile.preferredType} onChange={handleChange} options={[
                      { value: 'Whole Blood', label: 'Whole Blood' }, { value: 'Platelets', label: 'Platelets' }, { value: 'Plasma', label: 'Plasma' }
                    ]} />
                    <Select label="Donor Availability" name="availability" value={profile.availability} onChange={handleChange} options={[
                      { value: 'Available', label: 'Available' }, { value: 'Temporarily Unavailable', label: 'Temporarily Unavailable' }
                    ]} />
                    <Input label="Last Donation Date" type="date" name="lastDonation" value={profile.lastDonation} onChange={handleChange} />
                    <Input label="Total Donations" type="number" name="totalDonations" value={profile.totalDonations} onChange={handleChange} />
                    <Input label="Donation Eligibility" value={profile.eligibility} disabled />
                    <Input label="Next Eligible Date" type="date" name="nextEligible" value={profile.nextEligible} onChange={handleChange} />
                  </div>
                  <Textarea label="Availability Notes" name="availabilityNotes" value={profile.availabilityNotes} onChange={handleChange} rows={3} />
                </div>
              )}

              {activeTab === 'address' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Input label="Address Line 1" name="address1" value={profile.address1} onChange={handleChange} />
                    <Input label="Address Line 2" name="address2" value={profile.address2} onChange={handleChange} />
                    <Input label="Area / Locality" name="area" value={profile.area} onChange={handleChange} />
                    <Input label="City" name="city" required value={profile.city} onChange={handleChange} />
                    <Input label="State" name="state" value={profile.state} onChange={handleChange} />
                    <Input label="Country" name="country" value={profile.country} onChange={handleChange} />
                    <Input label="Pincode" name="pincode" value={profile.pincode} onChange={handleChange} />
                    <Select label="Preferred Donation Radius" name="radius" value={profile.radius} onChange={handleChange} options={[
                      { value: '5', label: '5 km' }, { value: '10', label: '10 km' }, { value: '25', label: '25 km' }, { value: '50', label: '50 km' }
                    ]} />
                    <Input label="Preferred Donation Location" name="preferredLocation" value={profile.preferredLocation} onChange={handleChange} />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="locationPermission" checked={profile.locationPermission} onChange={handleChange} className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded" />
                    <span className="text-sm text-gray-700">Allow Location Permission for Better Matching</span>
                  </label>
                </div>
              )}
            </div>
            
            <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end gap-3 shrink-0">
              <button type="button" onClick={handleCancel} disabled={isSubmitting} className="px-5 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-lg text-sm hover:bg-gray-200 transition-colors disabled:opacity-50">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 bg-primary text-white font-bold rounded-lg text-sm hover:bg-primary-dark transition-colors flex items-center gap-2 disabled:opacity-70">
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageLayout>
  );
}
`;
write('pages/shared/ProfilePage.tsx', profilePageContent);

const settingsContent = `
import React, { useState } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { User, Lock, Bell, Globe, Palette, Shield, Loader2 } from 'lucide-react';
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
    // Just resetting forms is complex for multiple tabs in a dummy component, but we will show the toast for effect.
    toast('Changes discarded');
  };

  return (
    <PageLayout title="Settings" subtitle="Manage your account preferences and configurations">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {[
              { id: 'account', label: 'Account Settings', icon: User },
              { id: 'security', label: 'Password & Security', icon: Lock },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'language', label: 'Language', icon: Globe },
              { id: 'theme', label: 'Theme', icon: Palette },
              { id: 'privacy', label: 'Privacy & Data', icon: Shield },
            ].map(tab => (
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

        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col min-h-[500px]">
          <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100 capitalize">
            {activeTab.replace('-', ' ')}
          </h2>

          <form onSubmit={handleSave} className="flex-1 flex flex-col">
            <div className="flex-1">
              {activeTab === 'account' && (
                <div className="max-w-md space-y-5">
                  <Input label="Username" defaultValue={user?.fullName?.replace(' ', '_').toLowerCase() || "user"} required />
                  <Input label="Email Address" defaultValue={user?.email} required type="email" />
                  <div className="flex items-end gap-3">
                    <Input label="Mobile Number" defaultValue={user?.mobile} required className="flex-1" />
                    <button type="button" className="h-11 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg text-sm">Verify</button>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 font-semibold">Account Status:</span>
                      <span className="text-green-600 font-bold">{user?.status || 'Active'}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="max-w-md space-y-5">
                  <Input label="Current Password" type="password" required />
                  <Input label="New Password" type="password" required />
                  <Input label="Confirm New Password" type="password" required />
                  <div className="pt-4 border-t border-gray-100 space-y-3">
                    <h4 className="font-bold text-gray-900 text-sm">Security Options</h4>
                    <label className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer">
                      <span className="text-sm font-semibold text-gray-700">Two-Factor Authentication</span>
                      <input type="checkbox" className="w-5 h-5 rounded text-primary focus:ring-primary" />
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="max-w-md space-y-3">
                  {[
                    'Blood Request Notifications',
                    'Request Status Updates',
                    'Donation Reminders',
                    'Matching Donor Alerts',
                    'Email Notifications',
                    'SMS Notifications'
                  ].map(n => (
                    <label key={n} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                      <span className="text-sm font-semibold text-gray-700">{n}</span>
                      <div className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {activeTab === 'language' && (
                <div className="max-w-md space-y-5">
                  <Select label="Application Language" options={[
                    {value: 'en', label: 'English'},
                    {value: 'gu', label: 'Gujarati (ગુજરાતી)'},
                    {value: 'hi', label: 'Hindi (हिन्दी)'}
                  ]} />
                </div>
              )}

              {activeTab === 'theme' && (
                <div className="max-w-md space-y-5">
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: 'light', label: 'Light', icon: '☀️' },
                      { id: 'dark', label: 'Dark', icon: '🌙' },
                      { id: 'system', label: 'System', icon: '💻' }
                    ].map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setMode(t.id as any)}
                        className={\`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all \${mode === t.id ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-600 hover:border-gray-300'}\`}
                      >
                        <span className="text-2xl">{t.icon}</span>
                        <span className="font-bold text-sm">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div className="max-w-md space-y-5">
                  <Select label="Profile Visibility" options={[{value: 'public', label: 'Public'}, {value: 'private', label: 'Private (Donors only)'}]} />
                  <Select label="Location Visibility" options={[{value: 'exact', label: 'Exact Location'}, {value: 'city', label: 'City Level Only'}]} />
                </div>
              )}
            </div>

            {(activeTab !== 'theme') && (
              <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end gap-3 shrink-0">
                <button type="button" onClick={handleCancel} disabled={isSubmitting} className="px-5 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-lg text-sm hover:bg-gray-200 transition-colors disabled:opacity-50">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 bg-primary text-white font-bold rounded-lg text-sm hover:bg-primary-dark transition-colors flex items-center gap-2 disabled:opacity-70">
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

const requestFormContent = `
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Calendar, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';
import { useAuth } from '../../store/AuthContext';
import toast from 'react-hot-toast';

export function BloodRequestForm({ isEmergency = false }: { isEmergency?: boolean }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const defaultBloodGroup = searchParams.get('bloodGroup') as any || '';
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const fd = new FormData(e.target as HTMLFormElement);
    
    setTimeout(() => {
      const newRequest = {
        id: \`BC-REQ-00\${Math.floor(Math.random() * 1000)}\`,
        patient: fd.get('patientName'),
        bg: fd.get('bloodGroup'),
        units: fd.get('unitsRequired'),
        hospital: fd.get('hospitalName'),
        location: fd.get('city') || 'Ahmedabad',
        date: fd.get('requiredDate'),
        urgency: isEmergency ? 'Emergency' : (fd.get('urgency') || 'Normal'),
        status: 'Pending',
      };
      
      const existing = JSON.parse(localStorage.getItem('my_requests') || '[]');
      localStorage.setItem('my_requests', JSON.stringify([newRequest, ...existing]));
      
      const existingIncoming = JSON.parse(localStorage.getItem('incoming_requests') || '[]');
      const incomingRequest = {
        ...newRequest,
        requester: user?.fullName || 'Current User',
        phone: fd.get('contactNumber'),
        address: fd.get('hospitalAddress'),
        reqDate: fd.get('requiredDate'),
      };
      localStorage.setItem('incoming_requests', JSON.stringify([incomingRequest, ...existingIncoming]));
      
      setIsSubmitting(false);
      toast.success(isEmergency ? 'Emergency request broadcasted!' : 'Blood request created successfully!');
      navigate('/requests/my');
    }, 1000);
  };

  return (
    <PageLayout title={isEmergency ? 'Emergency Blood Request' : 'Create Blood Request'}>
      <div>
        {isEmergency && (
          <Alert type="error" className="mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} />
              <strong>Emergency Request</strong>
            </div>
            This will immediately alert all compatible donors in your area.
          </Alert>
        )}

        <div className={\`bg-white rounded-2xl shadow-sm border p-6 \${isEmergency ? 'border-red-500' : 'border-gray-200'}\`}>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <fieldset>
              <legend className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 border-b pb-1 block w-full">Patient Information</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="md:col-span-2"><Input label="Patient Name" name="patientName" required defaultValue={user?.fullName || ''} /></div>
                <Input label="Patient Age" name="patientAge" type="number" required defaultValue="35" />
                <Select label="Blood Group Required" name="bloodGroup" required defaultValue={defaultBloodGroup || user?.donorProfile?.bloodGroup || "B_POS"} options={[
                  {value:'A_POS',label:'A+'},{value:'B_POS',label:'B+'},{value:'O_POS',label:'O+'},{value:'AB_POS',label:'AB+'},
                  {value:'A_NEG',label:'A-'},{value:'B_NEG',label:'B-'},{value:'O_NEG',label:'O-'},{value:'AB_NEG',label:'AB-'}
                ]} />
                <Input label="Required Units" name="unitsRequired" type="number" min="1" required defaultValue="2" />
                <Input label="Required Date" name="requiredDate" type="date" required defaultValue={new Date().toISOString().split('T')[0]} leftIcon={<Calendar size={14}/>} />
                <Input label="Required Time" name="requiredTime" type="time" leftIcon={<Clock size={14}/>} />
                <Select label="Urgency" name="urgency" defaultValue={isEmergency ? "Emergency" : "Urgent"} options={[
                  {value:'Normal',label:'Normal'},{value:'Urgent',label:'Urgent'},{value:'Emergency',label:'Emergency'}
                ]} />
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 border-b pb-1 block w-full">Hospital Information</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2"><Input label="Hospital Name" name="hospitalName" required defaultValue="" leftIcon={<MapPin size={14}/>} /></div>
                <div className="sm:col-span-2"><Input label="Hospital Address" name="hospitalAddress" required defaultValue="" /></div>
                <Input label="City" name="city" required defaultValue={user?.donorProfile?.city || ""} />
                <Input label="State" name="state" required defaultValue="" />
                <Input label="Pincode" name="pincode" required defaultValue="" />
                <Select label="Preferred Donor Radius" name="radius" defaultValue="10" options={[
                  {value:'5',label:'5 km'},{value:'10',label:'10 km'},{value:'25',label:'25 km'},{value:'50',label:'50 km'}
                ]} />
              </div>
            </fieldset>
            
            <fieldset>
              <legend className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 border-b pb-1 block w-full">Contact & Additional Details</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <Input label="Contact Person Name" name="contactPerson" required defaultValue={user?.fullName || ''} />
                <Input label="Contact Number" name="contactNumber" required defaultValue={user?.mobile || ''} />
                <Input label="Alternate Contact" name="altContact" defaultValue="" />
                <Input label="Reason / Medical Req." name="reason" defaultValue="Surgery" />
              </div>
              <Textarea label="Additional Message" name="message" rows={3} defaultValue="Blood required urgently." />
            </fieldset>

            <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end gap-3 shrink-0">
              <button type="button" onClick={() => navigate(-1)} disabled={isSubmitting} className="px-5 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-lg text-sm hover:bg-gray-200 transition-colors disabled:opacity-50">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className={\`px-5 py-2.5 text-white font-bold rounded-lg text-sm transition-colors flex items-center gap-2 disabled:opacity-70 \${isEmergency ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary-dark'}\`}>
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                {isEmergency ? 'Submit Emergency Request' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageLayout>
  );
}
`;
write('pages/seeker/BloodRequestForm.tsx', requestFormContent);
