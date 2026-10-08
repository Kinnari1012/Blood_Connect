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

export function BloodRequestForm({ isEmergency = false }: { isEmergency?: boolean }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
      requester: 'Current User',
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
                <div className="md:col-span-2"><Input label="Patient Name" name="patientName" required defaultValue="Rahul Patel" /></div>
                <Input label="Patient Age" name="patientAge" type="number" required defaultValue="35" />
                <Select label="Blood Group Required" name="bloodGroup" required defaultValue={defaultBloodGroup || "B_POS"} options={[
                  {value:'A_POS',label:'A+'},{value:'B_POS',label:'B+'},{value:'O_POS',label:'O+'},{value:'AB_POS',label:'AB+'},
                  {value:'A_NEG',label:'A-'},{value:'B_NEG',label:'B-'},{value:'O_NEG',label:'O-'},{value:'AB_NEG',label:'AB-'}
                ]} />
                <Input label="Required Units" name="unitsRequired" type="number" min="1" required defaultValue="2" />
                <Input label="Required Date" name="requiredDate" type="date" required defaultValue="2026-10-08" leftIcon={<Calendar size={14}/>} />
                <Input label="Required Time" name="requiredTime" type="time" leftIcon={<Clock size={14}/>} />
                <Select label="Urgency" name="urgency" defaultValue={isEmergency ? "Emergency" : "Urgent"} options={[
                  {value:'Normal',label:'Normal'},{value:'Urgent',label:'Urgent'},{value:'Emergency',label:'Emergency'}
                ]} />
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 border-b pb-1 block w-full">Hospital Information</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2"><Input label="Hospital Name" name="hospitalName" required defaultValue="Shalby Hospital" leftIcon={<MapPin size={14}/>} /></div>
                <div className="sm:col-span-2"><Input label="Hospital Address" name="hospitalAddress" required defaultValue="SG Highway" /></div>
                <Input label="City" name="city" required defaultValue="Ahmedabad" />
                <Input label="State" name="state" required defaultValue="Gujarat" />
                <Input label="Pincode" name="pincode" required defaultValue="380015" />
                <Select label="Preferred Donor Radius" name="radius" defaultValue="10" options={[
                  {value:'5',label:'5 km'},{value:'10',label:'10 km'},{value:'25',label:'25 km'},{value:'50',label:'50 km'}
                ]} />
              </div>
            </fieldset>
            
            <fieldset>
              <legend className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 border-b pb-1 block w-full">Contact & Additional Details</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <Input label="Contact Person Name" name="contactPerson" required defaultValue="Amit Patel" />
                <Input label="Contact Number" name="contactNumber" required defaultValue="+91 9876543210" />
                <Input label="Alternate Contact" name="altContact" defaultValue="+91 9876543211" />
                <Input label="Reason / Medical Req." name="reason" defaultValue="Surgery" />
              </div>
              <Textarea label="Additional Message" name="message" rows={3} defaultValue="Blood required urgently for heart surgery." />
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
