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
        id: `BC-REQ-00${Math.floor(Math.random() * 1000)}`,
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

        <div className={`bg-white rounded-2xl shadow-sm border p-6 ${isEmergency ? 'border-red-500' : 'border-gray-200'}`}>
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
              <button type="submit" disabled={isSubmitting} className={`px-5 py-2.5 text-white font-bold rounded-lg text-sm transition-colors flex items-center gap-2 disabled:opacity-70 ${isEmergency ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary-dark'}`}>
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
