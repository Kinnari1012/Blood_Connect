import React, { useState } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Search, Filter, MapPin, Activity, Calendar, Map, List, Navigation, ExternalLink, Heart } from 'lucide-react';
import { Input, Select } from '../../components/ui/Input';
import { MapModal } from '../../components/common/MapModal';
import { openGoogleMapsDirections, getGoogleMapsEmbedUrl, buildAddressQuery } from '../../utils/mapUtils';
import toast from 'react-hot-toast';

export function FindDonorsPage() {
  const [filters, setFilters] = useState({
    bg: 'All', city: '', radius: '25', availability: 'All'
  });
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedMapDonor, setSelectedMapDonor] = useState<any | null>(null);

  const donors = [
    { id: 1, name: 'Amit Patel', bg: 'O+', location: 'Navrangpura, Ahmedabad', dist: '2 km', lastDonation: 'Jan 2026', status: 'Available', total: 5, eligible: 'Yes', area: 'Navrangpura', city: 'Ahmedabad' },
    { id: 2, name: 'Priya Desai', bg: 'A+', location: 'Vastrapur, Ahmedabad', dist: '5 km', lastDonation: 'Dec 2025', status: 'Temporarily Unavailable', total: 2, eligible: 'No', area: 'Vastrapur', city: 'Ahmedabad' },
    { id: 3, name: 'Sanjay Sharma', bg: 'B+', location: 'Bopal, Ahmedabad', dist: '8 km', lastDonation: 'Mar 2026', status: 'Available', total: 8, eligible: 'Yes', area: 'Bopal', city: 'Ahmedabad' },
    { id: 4, name: 'Neha Gupta', bg: 'AB-', location: 'Thaltej, Ahmedabad', dist: '4 km', lastDonation: 'Sep 2025', status: 'Available', total: 3, eligible: 'Yes', area: 'Thaltej', city: 'Ahmedabad' }
  ];

  const filteredDonors = donors.filter(d => {
    if (filters.bg !== 'All' && d.bg !== filters.bg) return false;
    if (filters.city && !d.location.toLowerCase().includes(filters.city.toLowerCase())) return false;
    return true;
  });

  const handleRequest = (donorName?: string) => {
    toast.success(`Blood Request Sent to ${donorName || 'Donor'} successfully!`);
  };

  const mapCenterQuery = filters.city.trim() ? `${filters.city.trim()}, Gujarat` : 'Ahmedabad, Gujarat';

  return (
    <PageLayout title="Find Donors" subtitle="Search and request blood from donors nearby with GPS navigation">
      {/* Search Filters Bar */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <Select label="Blood Group" options={[
            {value: 'All', label: 'All'}, {value: 'A+', label: 'A+'}, {value: 'O+', label: 'O+'}, {value: 'B+', label: 'B+'}, {value: 'AB-', label: 'AB-'}
          ]} value={filters.bg} onChange={e => setFilters({...filters, bg: e.target.value})} />
          <Input label="City/Location" placeholder="e.g. Ahmedabad, Surat..." value={filters.city} onChange={e => setFilters({...filters, city: e.target.value})} />
          <Select label="Distance Radius" options={[
            {value: '5', label: 'Within 5 km'}, {value: '10', label: 'Within 10 km'}, {value: '25', label: 'Within 25 km'}
          ]} value={filters.radius} onChange={e => setFilters({...filters, radius: e.target.value})} />
          <div className="flex gap-2">
            <button 
              type="button"
              className="h-11 bg-primary text-white font-bold rounded-lg flex-1 flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors shadow-xs"
            >
              <Search size={18} /> Search
            </button>
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'}`}
                title="List View"
              >
                <List size={18} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('map')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'map' ? 'bg-white text-primary shadow-xs' : 'text-gray-500 hover:text-gray-900'}`}
                title="Interactive Map View"
              >
                <Map size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Map View Mode */}
      {viewMode === 'map' ? (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div>
                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  <MapPin size={20} className="text-primary" />
                  <span>Nearby Donors Map: {filters.city || 'Ahmedabad Region'}</span>
                </h3>
                <p className="text-xs text-gray-500">Live geographic distribution of verified donors</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-green-50 text-green-700 font-bold px-3 py-1 rounded-full border border-green-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  {filteredDonors.filter(d => d.status === 'Available').length} Available Donors
                </span>
                <button
                  type="button"
                  onClick={() => openGoogleMapsDirections(mapCenterQuery)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-primary text-xs font-bold rounded-xl border border-red-200 transition-colors shadow-2xs"
                >
                  <Navigation size={13} />
                  <span>Open in Google Maps</span>
                </button>
              </div>
            </div>

            {/* Embedded interactive Google Map iframe */}
            <div className="h-[420px] rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 relative shadow-inner">
              <iframe
                title="Donors Location Map"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={getGoogleMapsEmbedUrl(mapCenterQuery)}
              />
            </div>
          </div>

          {/* Donor Cards Grid under the map */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredDonors.map(d => (
              <div key={d.id} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-black flex items-center justify-center text-base">
                      {d.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{d.name}</h4>
                      <p className="text-[11px] text-gray-500 flex items-center gap-1">
                        <MapPin size={11} className="text-primary" /> {d.dist} away
                      </p>
                    </div>
                  </div>
                  <span className="w-8 h-8 rounded-full bg-red-50 text-red-600 font-extrabold flex items-center justify-center text-xs border border-red-100">
                    {d.bg}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-3">{d.location}</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openGoogleMapsDirections(d.location)}
                    className="flex-1 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg border border-gray-200 transition-colors flex items-center justify-center gap-1"
                    title="Turn-by-Turn GPS"
                  >
                    <Navigation size={12} className="text-primary" />
                    <span>GPS</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRequest(d.name)}
                    disabled={d.status !== 'Available'}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${d.status === 'Available' ? 'bg-primary text-white hover:bg-primary-dark' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                  >
                    Request
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* List View Mode */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDonors.map(d => (
            <div key={d.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-5 border-b border-gray-100 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-black flex items-center justify-center text-xl ">
                    {d.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{d.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                      <MapPin size={12} className="text-primary shrink-0" />
                      <span>{d.location}</span>
                      <span className="font-bold text-primary">({d.dist})</span>
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
              <div className="p-5 border-t border-gray-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMapDonor(d)}
                  className="px-3 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-lg border border-gray-200 transition-colors text-sm flex items-center gap-1"
                  title="View on Map"
                >
                  <MapPin size={15} />
                  <span>Map</span>
                </button>
                <button
                  type="button"
                  onClick={() => openGoogleMapsDirections(d.location)}
                  className="px-3 py-2.5 bg-red-50 hover:bg-red-100 text-primary font-bold rounded-lg border border-red-200 transition-colors text-sm flex items-center gap-1"
                  title="Turn-by-Turn GPS Directions"
                >
                  <Navigation size={15} />
                  <span>GPS</span>
                </button>
                <button 
                  onClick={() => handleRequest(d.name)}
                  disabled={d.status !== 'Available'} 
                  className={`flex-1 py-2.5 font-bold rounded-lg transition-colors text-sm ${d.status === 'Available' ? 'bg-primary text-white hover:bg-primary-dark' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                >
                  Send Request
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Map modal for individual donor preview */}
      <MapModal
        isOpen={!!selectedMapDonor}
        onClose={() => setSelectedMapDonor(null)}
        title="Donor Vicinity Location"
        name={selectedMapDonor?.name ? `${selectedMapDonor.name} (${selectedMapDonor.bg})` : undefined}
        address={selectedMapDonor?.location || ''}
      />
    </PageLayout>
  );
}
