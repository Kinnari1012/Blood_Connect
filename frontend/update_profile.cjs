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
import { User, Droplet, MapPin, Edit2, Save, X, Camera } from 'lucide-react';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { useAuth } from '../../store/AuthContext';
import toast from 'react-hot-toast';

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  
  // Default values to fall back to if some data is missing
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

  // Load from localStorage if present
  useEffect(() => {
    if (user) {
      const savedProfile = localStorage.getItem(\`user_profile_\${user.id}\`);
      if (savedProfile) {
        setProfile({ ...defaultProfile, ...JSON.parse(savedProfile) });
      } else {
        setProfile(defaultProfile);
      }
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setProfile(p => ({ ...p, [name]: val }));
  };

  const handleSave = () => {
    if (!user) return;
    
    // Save to local storage for persistence across the dummy flows
    localStorage.setItem(\`user_profile_\${user.id}\`, JSON.stringify(profile));
    
    // Update the AuthContext so the TopHeader and other components immediately see the change
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
    
    // If the auth uses localStorage to persist session between reloads, update it too
    // (In reality this would be an API call, but we simulate for the frontend flow)
    const storedAuth = localStorage.getItem('user_session_dummy'); // Assuming you want it to persist across reloads
    
    setIsEditing(false);
    toast.success('Profile updated successfully!');
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
            <p className="text-sm text-gray-500 mb-4">{profile.bloodGroup.replace('_POS','+').replace('_NEG','-')}</p>
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

        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">
              {activeTab === 'personal' && 'Personal Information'}
              {activeTab === 'blood' && 'Blood Information'}
              {activeTab === 'address' && 'Address & Location'}
            </h2>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg transition-colors">
                <Edit2 size={16} /> Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg transition-colors">
                  <X size={16} /> Cancel
                </button>
                <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-lg transition-colors">
                  <Save size={16} /> Save Changes
                </button>
              </div>
            )}
          </div>

          <form className="space-y-6" onSubmit={e => e.preventDefault()}>
            {activeTab === 'personal' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input label="Full Name" name="fullName" value={profile.fullName} onChange={handleChange} disabled={!isEditing} />
                <Input label="Email Address" name="email" type="email" value={profile.email} onChange={handleChange} disabled={!isEditing} />
                <Input label="Mobile Number" name="mobile" value={profile.mobile} onChange={handleChange} disabled={!isEditing} />
                <Input label="Alternate Mobile" name="altMobile" value={profile.altMobile} onChange={handleChange} disabled={!isEditing} />
                <Input label="Date of Birth" name="dob" type="date" value={profile.dob} onChange={handleChange} disabled={!isEditing} />
                <Select label="Gender" name="gender" value={profile.gender} onChange={handleChange} disabled={!isEditing} options={[
                  { value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }, { value: 'Other', label: 'Other' }
                ]} />
                <Input label="Emergency Contact Name" name="emergencyContactName" value={profile.emergencyContactName} onChange={handleChange} disabled={!isEditing} />
                <Input label="Emergency Contact Number" name="emergencyContactNumber" value={profile.emergencyContactNumber} onChange={handleChange} disabled={!isEditing} />
                <Input label="Account Status" value={profile.status} disabled />
                <Input label="Member Since" value={profile.memberSince} disabled />
              </div>
            )}

            {activeTab === 'blood' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Select label="Blood Group" name="bloodGroup" value={profile.bloodGroup} onChange={handleChange} disabled={!isEditing} options={[
                    { value: 'A_POS', label: 'A+' }, { value: 'B_POS', label: 'B+' }, { value: 'O_POS', label: 'O+' }, { value: 'AB_POS', label: 'AB+' },
                    { value: 'A_NEG', label: 'A-' }, { value: 'B_NEG', label: 'B-' }, { value: 'O_NEG', label: 'O-' }, { value: 'AB_NEG', label: 'AB-' }
                  ]} />
                  <Select label="Preferred Donation Type" name="preferredType" value={profile.preferredType} onChange={handleChange} disabled={!isEditing} options={[
                    { value: 'Whole Blood', label: 'Whole Blood' }, { value: 'Platelets', label: 'Platelets' }, { value: 'Plasma', label: 'Plasma' }
                  ]} />
                  <Select label="Donor Availability" name="availability" value={profile.availability} onChange={handleChange} disabled={!isEditing} options={[
                    { value: 'Available', label: 'Available' }, { value: 'Temporarily Unavailable', label: 'Temporarily Unavailable' }
                  ]} />
                  <Input label="Last Donation Date" type="date" name="lastDonation" value={profile.lastDonation} onChange={handleChange} disabled={!isEditing} />
                  <Input label="Total Donations" type="number" name="totalDonations" value={profile.totalDonations} onChange={handleChange} disabled={!isEditing} />
                  <Input label="Donation Eligibility" value={profile.eligibility} disabled />
                  <Input label="Next Eligible Date" type="date" name="nextEligible" value={profile.nextEligible} onChange={handleChange} disabled={!isEditing} />
                </div>
                <Textarea label="Availability Notes" name="availabilityNotes" value={profile.availabilityNotes} onChange={handleChange} disabled={!isEditing} rows={3} />
              </div>
            )}

            {activeTab === 'address' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input label="Address Line 1" name="address1" value={profile.address1} onChange={handleChange} disabled={!isEditing} />
                  <Input label="Address Line 2" name="address2" value={profile.address2} onChange={handleChange} disabled={!isEditing} />
                  <Input label="Area / Locality" name="area" value={profile.area} onChange={handleChange} disabled={!isEditing} />
                  <Input label="City" name="city" value={profile.city} onChange={handleChange} disabled={!isEditing} />
                  <Input label="State" name="state" value={profile.state} onChange={handleChange} disabled={!isEditing} />
                  <Input label="Country" name="country" value={profile.country} onChange={handleChange} disabled={!isEditing} />
                  <Input label="Pincode" name="pincode" value={profile.pincode} onChange={handleChange} disabled={!isEditing} />
                  <Select label="Preferred Donation Radius" name="radius" value={profile.radius} onChange={handleChange} disabled={!isEditing} options={[
                    { value: '5', label: '5 km' }, { value: '10', label: '10 km' }, { value: '25', label: '25 km' }, { value: '50', label: '50 km' }
                  ]} />
                  <Input label="Preferred Donation Location" name="preferredLocation" value={profile.preferredLocation} onChange={handleChange} disabled={!isEditing} />
                </div>
                {isEditing && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="locationPermission" checked={profile.locationPermission} onChange={handleChange} className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded" />
                    <span className="text-sm text-gray-700">Allow Location Permission for Better Matching</span>
                  </label>
                )}
                {!isEditing && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-500">Location Permission:</span>
                    <span className="text-sm font-bold text-gray-900">{profile.locationPermission ? 'Granted' : 'Denied'}</span>
                  </div>
                )}
              </div>
            )}
          </form>
        </div>
      </div>
    </PageLayout>
  );
}
`;
write('pages/shared/ProfilePage.tsx', profilePageContent);
