const fs = require('fs');
const path = require('path');

const write = (file, content) => {
  const fullPath = path.join(__dirname, 'src', file);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n');
  console.log(`Updated ${file}`);
};

const formContent = `
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { useAuth } from '../../store/AuthContext';

export function BloodRequestForm({ isEmergency = false }: { isEmergency?: boolean }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const defaultBloodGroup = searchParams.get('bloodGroup') as any || '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
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
    
    navigate('/requests/my');
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

            <div className="pt-4 flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>Cancel</Button>
              <Button type="button" variant="outline" className="flex-1">Save Draft</Button>
              <Button type="submit" variant={isEmergency ? 'emergency' : 'primary'} className="flex-1">
                {isEmergency ? '🚨 Submit Emergency Request' : 'Submit Request'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </PageLayout>
  );
}
`;
write('pages/seeker/BloodRequestForm.tsx', formContent);

const dashboardContent = `
import React from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Activity, Droplet, Clock, Heart, Users } from 'lucide-react';
import { useAuth } from '../../store/AuthContext';

export function UserDashboard() {
  const { user } = useAuth();
  
  return (
    <PageLayout title={\`Welcome back, \${user?.fullName || 'User'}\`} subtitle="Here is your quick overview and recent activity">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center border-2 border-red-100">
             <Droplet size={28} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-semibold">Blood Group</p>
            <p className="text-xl font-black text-gray-900">{user?.donorProfile?.bloodGroup?.replace('_POS', '+')?.replace('_NEG', '-') || 'O+'}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border-2 border-blue-100">
             <Activity size={28} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-semibold">Total Donations</p>
            <p className="text-xl font-black text-gray-900">{user?.donorProfile?.totalDonations || 0}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-green-50 text-green-600 flex items-center justify-center border-2 border-green-100">
             <Heart size={28} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-semibold">Active Requests</p>
            <p className="text-xl font-black text-gray-900">1</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center border-2 border-purple-100">
             <Users size={28} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-semibold">Profile Status</p>
            <p className="text-xl font-black text-gray-900">{user?.status || 'Active'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2"><Clock size={18} className="text-gray-400" /> Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Droplet size={18} />
              </div>
              <div>
                <p className="font-semibold text-gray-900">You updated your profile information.</p>
                <p className="text-sm text-gray-500 mt-1">Just now</p>
              </div>
            </div>
            <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Activity size={18} />
              </div>
              <div>
                <p className="font-semibold text-gray-900">You logged in from Ahmedabad.</p>
                <p className="text-sm text-gray-500 mt-1">Today, 10:00 AM</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
           <h3 className="font-bold text-gray-900 text-lg mb-4">Contact Information</h3>
           <div className="space-y-3">
             <div className="flex justify-between py-2 border-b border-gray-100">
               <span className="text-gray-500">Email Address</span>
               <span className="font-semibold text-gray-900">{user?.email}</span>
             </div>
             <div className="flex justify-between py-2 border-b border-gray-100">
               <span className="text-gray-500">Mobile Number</span>
               <span className="font-semibold text-gray-900">{user?.mobile}</span>
             </div>
             <div className="flex justify-between py-2 border-b border-gray-100">
               <span className="text-gray-500">City</span>
               <span className="font-semibold text-gray-900">{user?.donorProfile?.city || 'Not Specified'}</span>
             </div>
           </div>
        </div>
      </div>
    </PageLayout>
  );
}
`;
write('pages/dashboard/UserDashboard.tsx', dashboardContent);
