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
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-black flex items-center justify-center text-xl ">
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
                <span className={`font-semibold ${d.status === 'Available' ? 'text-green-600' : 'text-yellow-600'}`}>{d.status}</span>
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
                className={`flex-1 py-2.5 font-bold rounded-lg transition-colors text-sm ${d.status === 'Available' ? 'bg-primary text-white hover:bg-primary-dark' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
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
