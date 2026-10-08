const fs = require('fs');
const path = require('path');

const write = (file, content) => {
  const fullPath = path.join(__dirname, 'src', file);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n');
  console.log(`Updated ${file}`);
};

// 1. My Profile Page
const profilePageContent = `
import React, { useState } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { User, Droplet, MapPin, Edit2, Save, X, Camera } from 'lucide-react';
import { Input, Select, Textarea } from '../../components/ui/Input';

export function ProfilePage() {
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    // Personal
    fullName: 'Rahul Patel',
    dob: '1990-05-15',
    gender: 'Male',
    email: 'rahul.p@example.com',
    mobile: '+91 9876543210',
    altMobile: '+91 9876543211',
    emergencyContactName: 'Priya Patel',
    emergencyContactNumber: '+91 9876543212',
    memberSince: 'Jan 2024',
    status: 'Active',
    
    // Blood Info
    bloodGroup: 'B_POS',
    lastDonation: '2026-06-15',
    totalDonations: 4,
    eligibility: 'Eligible',
    nextEligible: '2026-09-15',
    preferredType: 'Whole Blood',
    availability: 'Available',
    availabilityNotes: 'Available on weekends.',
    
    // Address
    address1: 'B-402, Shanti Heights',
    address2: 'Near SG Highway',
    area: 'Thaltej',
    city: 'Ahmedabad',
    state: 'Gujarat',
    country: 'India',
    pincode: '380059',
    radius: '10',
    locationPermission: true,
    preferredLocation: 'Ahmedabad West'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setProfile(p => ({ ...p, [name]: val }));
  };

  return (
    <PageLayout title="My Profile" subtitle="Manage your personal, blood, and location information">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 shrink-0 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col items-center">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-black border-2 border-primary/20">
                {profile.fullName.charAt(0)}
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
                <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-lg transition-colors">
                  <Save size={16} /> Save Changes
                </button>
              </div>
            )}
          </div>

          <form className="space-y-6">
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
                  <Input label="Last Donation Date" type="date" value={profile.lastDonation} disabled />
                  <Input label="Total Donations" value={profile.totalDonations} disabled />
                  <Input label="Donation Eligibility" value={profile.eligibility} disabled />
                  <Input label="Next Eligible Date" type="date" value={profile.nextEligible} disabled />
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

// 2. Find Donors Page
const findDonorsPageContent = `
import React, { useState } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Search, Filter, MapPin, Activity, Calendar } from 'lucide-react';
import { Input, Select } from '../../components/ui/Input';
import toast from 'react-hot-toast';

export function FindDonorsPage() {
  const [filters, setFilters] = useState({
    bg: 'All', city: '', radius: '25', availability: 'All'
  });

  const donors = [
    { id: 1, name: 'Amit Patel', bg: 'O+', location: 'Navrangpura, Ahmedabad', dist: '2 km', lastDonation: 'Jan 2026', status: 'Available', total: 5, eligible: 'Yes' },
    { id: 2, name: 'Priya Desai', bg: 'A+', location: 'Vastrapur, Ahmedabad', dist: '5 km', lastDonation: 'Dec 2025', status: 'Temporarily Unavailable', total: 2, eligible: 'No' },
    { id: 3, name: 'Sanjay Sharma', bg: 'B+', location: 'Bopal, Ahmedabad', dist: '8 km', lastDonation: 'Mar 2026', status: 'Available', total: 8, eligible: 'Yes' },
    { id: 4, name: 'Neha Gupta', bg: 'AB-', location: 'Thaltej, Ahmedabad', dist: '4 km', lastDonation: 'Sep 2025', status: 'Available', total: 3, eligible: 'Yes' }
  ];

  const handleRequest = () => {
    toast.success('Blood Request Sent to Donor successfully!');
  };

  return (
    <PageLayout title="Find Donors" subtitle="Search and request blood from donors nearby">
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <Select label="Blood Group" options={[
            {value: 'All', label: 'All'}, {value: 'A+', label: 'A+'}, {value: 'O+', label: 'O+'}, {value: 'B+', label: 'B+'}, {value: 'AB-', label: 'AB-'}
          ]} value={filters.bg} onChange={e => setFilters({...filters, bg: e.target.value})} />
          <Input label="City/Location" placeholder="Enter city..." value={filters.city} onChange={e => setFilters({...filters, city: e.target.value})} />
          <Select label="Distance Radius" options={[
            {value: '5', label: 'Within 5 km'}, {value: '10', label: 'Within 10 km'}, {value: '25', label: 'Within 25 km'}
          ]} value={filters.radius} onChange={e => setFilters({...filters, radius: e.target.value})} />
          <button className="h-11 bg-primary text-white font-bold rounded-lg w-full flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors">
            <Search size={18} /> Search Donors
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {donors.map(d => (
          <div key={d.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-5 border-b border-gray-100 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-black flex items-center justify-center text-xl border border-primary/20">
                  {d.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{d.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                    <MapPin size={12} /> {d.location} ({d.dist})
                  </div>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 font-black flex items-center justify-center border border-red-100">
                {d.bg}
              </div>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Availability:</span>
                <span className={\`font-semibold \${d.status === 'Available' ? 'text-green-600' : 'text-yellow-600'}\`}>{d.status}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Eligibility:</span>
                <span className="font-semibold text-gray-900">{d.eligible}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Last Donation:</span>
                <span className="font-semibold text-gray-900">{d.lastDonation}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Donations:</span>
                <span className="font-semibold text-gray-900">{d.total}</span>
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors text-sm">
                View Profile
              </button>
              <button 
                onClick={handleRequest}
                disabled={d.status !== 'Available'} 
                className={\`flex-1 py-2.5 font-bold rounded-lg transition-colors text-sm \${d.status === 'Available' ? 'bg-primary text-white hover:bg-primary-dark' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}\`}
              >
                Send Request
              </button>
            </div>
          </div>
        ))}
      </div>
    </PageLayout>
  );
}
`;
write('pages/user/FindDonorsPage.tsx', findDonorsPageContent);

// 3. Donation History Page
const donationHistoryContent = `
import React, { useState } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Droplet, Activity, Calendar, MapPin } from 'lucide-react';
import { Select } from '../../components/ui/Input';

export function DonationHistoryPage() {
  const stats = [
    { label: 'Total Donations', value: '4', icon: Droplet, color: 'text-primary' },
    { label: 'Total Units', value: '4', icon: Activity, color: 'text-green-600' },
    { label: 'Last Donation', value: 'Jan 15, 2026', icon: Calendar, color: 'text-blue-600' },
    { label: 'Next Eligible', value: 'Apr 15, 2026', icon: Calendar, color: 'text-purple-600' },
  ];

  const history = [
    { id: 'DON-9871', date: 'Jan 15, 2026', bg: 'B+', type: 'Whole Blood', hospital: 'Shalby Hospital', location: 'Ahmedabad', units: 1, recipient: 'REQ-1001', status: 'Completed', next: 'Apr 15, 2026' },
    { id: 'DON-8234', date: 'Jul 22, 2025', bg: 'B+', type: 'Whole Blood', hospital: 'Civil Hospital', location: 'Ahmedabad', units: 1, recipient: 'REQ-0842', status: 'Completed', next: 'Oct 22, 2025' },
    { id: 'DON-7123', date: 'Dec 10, 2024', bg: 'B+', type: 'Platelets', hospital: 'Apollo Hospital', location: 'Gandhinagar', units: 1, recipient: 'REQ-0521', status: 'Completed', next: 'Jan 10, 2025' },
  ];

  return (
    <PageLayout title="Donation History" subtitle="Track your past blood donations and eligibility">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex items-center gap-4">
            <div className={\`w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center \${s.color}\`}>
              <s.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">{s.label}</p>
              <p className="text-xl font-black text-gray-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-gray-900 text-lg">Past Donations</h3>
          <div className="flex gap-3">
            <Select options={[{value:'All',label:'All Time'}, {value:'2026',label:'2026'}, {value:'2025',label:'2025'}]} />
            <Select options={[{value:'All',label:'All Types'}, {value:'Whole Blood',label:'Whole Blood'}, {value:'Platelets',label:'Platelets'}]} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white border-b border-gray-200 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Donation ID & Date</th>
                <th className="px-6 py-4 font-semibold">Type & Blood</th>
                <th className="px-6 py-4 font-semibold">Hospital & Location</th>
                <th className="px-6 py-4 font-semibold">Units & Ref</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {history.map(h => (
                <tr key={h.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{h.id}</p>
                    <p className="text-xs text-gray-500">{h.date}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs">{h.bg}</span>
                      <span className="font-semibold text-gray-700">{h.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">{h.hospital}</p>
                    <p className="text-xs text-gray-500">{h.location}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">{h.units} Unit(s)</p>
                    <p className="text-xs text-blue-600 hover:underline cursor-pointer">{h.recipient}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-green-100 text-green-800 rounded-md text-[10px] font-black uppercase tracking-wide border border-green-200">
                      {h.status}
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
write('pages/user/DonationHistoryPage.tsx', donationHistoryContent);

// 4. Notifications Page
const notificationsContent = `
import React, { useState } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Bell, Heart, AlertCircle, Info, CheckCircle, Trash2, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'Request Received', title: 'New Blood Request Match', message: 'Rahul Patel requires B+ blood at Shalby Hospital urgently.', time: '2 hours ago', read: false, icon: AlertCircle, color: 'text-red-600 bg-red-100' },
    { id: 2, type: 'Request Accepted', title: 'Request Accepted', message: 'Amit Shah has accepted your blood request (BC-REQ-002).', time: '1 day ago', read: true, icon: CheckCircle, color: 'text-green-600 bg-green-100' },
    { id: 3, type: 'Donation Reminder', title: 'Eligibility Reminder', message: 'You are now eligible to donate blood again! Consider saving a life.', time: '3 days ago', read: true, icon: Heart, color: 'text-primary bg-primary/10' },
    { id: 4, type: 'System', title: 'Profile Updated', message: 'Your address and location preferences have been successfully updated.', time: '1 week ago', read: true, icon: Info, color: 'text-blue-600 bg-blue-100' },
  ]);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({...n, read: true})));
    toast.success('All notifications marked as read');
  };

  const deleteNotif = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <PageLayout title="Notifications" subtitle="View and manage your alerts and updates">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-gray-900">All Notifications ({notifications.filter(n => !n.read).length} unread)</h3>
          <button onClick={markAllRead} className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors flex items-center gap-1">
            <Check size={16} /> Mark all as read
          </button>
        </div>
        
        <div className="divide-y divide-gray-100">
          {notifications.map(n => (
            <div key={n.id} className={\`p-5 flex gap-4 transition-colors hover:bg-gray-50 \${!n.read ? 'bg-primary/5' : ''}\`}>
              <div className={\`w-12 h-12 rounded-full flex items-center justify-center shrink-0 \${n.color}\`}>
                <n.icon size={24} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h4 className={\`text-sm \${!n.read ? 'font-black text-gray-900' : 'font-bold text-gray-700'}\`}>{n.title}</h4>
                  <span className="text-xs font-semibold text-gray-400">{n.time}</span>
                </div>
                <p className={\`text-sm mb-2 \${!n.read ? 'text-gray-800 font-medium' : 'text-gray-500'}\`}>{n.message}</p>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{n.type}</span>
                  {(n.type === 'Request Received' || n.type === 'Request Accepted') && (
                    <button className="text-xs font-bold text-primary hover:underline">Open Request</button>
                  )}
                </div>
              </div>
              <div className="shrink-0 flex items-start">
                <button onClick={() => deleteNotif(n.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {notifications.length === 0 && (
            <div className="p-10 text-center text-gray-500">
              <Bell size={48} className="mx-auto mb-3 text-gray-300" />
              <p className="font-semibold text-lg">No notifications yet</p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
`;
write('pages/shared/NotificationsPage.tsx', notificationsContent);

// 5. Settings Page
const settingsContent = `
import React, { useState } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { User, Lock, Bell, Globe, Palette, Shield } from 'lucide-react';
import { Input, Select } from '../../components/ui/Input';
import { useTheme } from '../../store/ThemeContext';
import toast from 'react-hot-toast';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('account');
  const { theme, setTheme } = useTheme();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Settings saved successfully');
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

        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100 capitalize">
            {activeTab.replace('-', ' ')}
          </h2>

          <form onSubmit={handleSave} className="space-y-6">
            {activeTab === 'account' && (
              <div className="max-w-md space-y-5">
                <Input label="Username" defaultValue="rahul_patel90" />
                <Input label="Email Address" defaultValue="rahul.p@example.com" />
                <div className="flex items-end gap-3">
                  <Input label="Mobile Number" defaultValue="+91 9876543210" className="flex-1" />
                  <button type="button" className="h-11 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg text-sm">Verify</button>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-semibold">Account Status:</span>
                    <span className="text-green-600 font-bold">Active</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-semibold">Email Verified:</span>
                    <span className="text-green-600 font-bold">Yes</span>
                  </div>
                </div>
                <button type="button" className="text-red-600 text-sm font-bold hover:underline">Deactivate Account</button>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="max-w-md space-y-5">
                <Input label="Current Password" type="password" />
                <Input label="New Password" type="password" />
                <Input label="Confirm New Password" type="password" />
                <div className="pt-4 border-t border-gray-100 space-y-3">
                  <h4 className="font-bold text-gray-900 text-sm">Security Options</h4>
                  <label className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer">
                    <span className="text-sm font-semibold text-gray-700">Two-Factor Authentication</span>
                    <input type="checkbox" className="w-5 h-5 rounded text-primary focus:ring-primary" />
                  </label>
                  <label className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer">
                    <span className="text-sm font-semibold text-gray-700">Login Alerts</span>
                    <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-primary focus:ring-primary" />
                  </label>
                </div>
                <button type="button" className="text-red-600 text-sm font-bold hover:underline">Logout from all devices</button>
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
                  'SMS Notifications',
                  'Push Notifications'
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
                <p className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg border border-blue-100 text-blue-800">
                  Changing the language updates the application interface immediately without affecting your personal data.
                </p>
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
                      onClick={() => setTheme(t.id as any)}
                      className={\`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all \${theme === t.id ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-600 hover:border-gray-300'}\`}
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
                <Select label="Contact Info Visibility" options={[{value: 'all', label: 'Show to everyone'}, {value: 'matched', label: 'Show only to matched users'}]} />
                
                <div className="pt-6 border-t border-gray-100 flex gap-3">
                  <button type="button" className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg text-sm hover:bg-gray-200">Download My Data</button>
                  <button type="button" className="px-4 py-2 bg-red-50 text-red-600 font-bold rounded-lg text-sm hover:bg-red-100">Delete Account</button>
                </div>
              </div>
            )}

            {(activeTab !== 'theme' && activeTab !== 'privacy') && (
              <div className="pt-6 border-t border-gray-100">
                <button type="submit" className="px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition-colors">
                  Save Settings
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
