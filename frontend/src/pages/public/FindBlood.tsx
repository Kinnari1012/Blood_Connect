import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal, MapPin, Clock, Droplets, ChevronRight, Map, LayoutGrid, Navigation, ExternalLink } from 'lucide-react';
import { PageLayout } from '../../components/layout/PageLayout';
import { LoadingSpinner } from '../../components/ui/Alert';
import { Pagination } from '../../components/ui/Pagination';
import { donorApi } from '../../services/api';
import { BLOOD_GROUPS, BLOOD_GROUP_DISPLAY, ROUTES } from '../../constants';
import { DonorProfile, BloodGroup } from '../../types';
import { MapModal } from '../../components/common/MapModal';
import { getGoogleMapsEmbedUrl, openGoogleMapsDirections, buildAddressQuery } from '../../utils/mapUtils';

const BG_COLORS: Record<string, { bg: string; text: string; light: string }> = {
  A_POS:  { bg: '#FFCDD2', text: '#B71C1C', light: '#FFF5F5' },
  A_NEG:  { bg: '#EF9A9A', text: '#7F0000', light: '#FFF5F5' },
  B_POS:  { bg: '#FFE0B2', text: '#BF360C', light: '#FFF8F0' },
  B_NEG:  { bg: '#FFCC80', text: '#8D3200', light: '#FFF8F0' },
  AB_POS: { bg: '#E1BEE7', text: '#4A148C', light: '#F8F0FC' },
  AB_NEG: { bg: '#CE93D8', text: '#38006B', light: '#F8F0FC' },
  O_POS:  { bg: '#BBDEFB', text: '#0D47A1', light: '#F0F8FF' },
  O_NEG:  { bg: '#90CAF9', text: '#01295F', light: '#F0F8FF' },
};

// ─── Donor Card ───────────────────────────────────────────────────────────────
function DonorCard({ donor, onOpenMap }: { donor: DonorProfile; onOpenMap?: (d: DonorProfile) => void }) {
  const { t } = useTranslation();
  const isEligible = !donor.nextEligibleDate || new Date(donor.nextEligibleDate) <= new Date();
  const available = donor.availability && isEligible;
  const c = BG_COLORS[donor.bloodGroup] || BG_COLORS.A_POS;

  return (
    <div
      className="rounded-3xl overflow-hidden card-hover"
      style={{ background: 'white', border: '1px solid #F0F0F0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
    >
      {/* Card top band */}
      <div className="h-2" style={{ background: available ? '#C62828' : '#BDBDBD' }} />

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between mb-3">
          {/* Blood group */}
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center font-extrabold text-base flex-shrink-0"
            style={{ background: c.light, color: c.text, border: `2px solid ${c.bg}` }}
          >
            {BLOOD_GROUP_DISPLAY[donor.bloodGroup]}
          </div>

          {/* Availability badge */}
          <span
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{
              background: available ? '#E8F5E9' : '#FEE2E2',
              color: available ? '#2E7D32' : '#DC2626',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: available ? '#2E7D32' : '#DC2626' }}
            />
            {available ? 'Available' : 'Temporarily Unavailable'}
          </span>
        </div>

        {/* Name & location */}
        <div className="mb-3">
          <h3 className="font-bold text-gray-900 text-base truncate">{(donor as any).user?.fullName || 'Verified Donor'}</h3>
          {(donor.city || donor.area) && (
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
                <MapPin size={11} className="flex-shrink-0 text-primary" />
                <span className="truncate">{[donor.area, donor.city].filter(Boolean).join(', ')}</span>
              </p>
              <button
                type="button"
                onClick={() => onOpenMap ? onOpenMap(donor) : openGoogleMapsDirections(buildAddressQuery(donor.area, donor.city))}
                className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 shrink-0 px-1.5 py-0.5 rounded bg-red-50 hover:bg-red-100 transition-colors ml-1"
                title="View on Map & GPS"
              >
                <span>GPS</span>
                <Navigation size={10} />
              </button>
            </div>
          )}
          {!available && (
            <p className="text-[11px] text-amber-700 bg-amber-50 rounded px-2 py-0.5 mt-1.5 inline-block">
              ⚠️ Temporarily unable or unwilling to donate
            </p>
          )}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 mb-4" style={{ borderTop: '1px solid #F0F0F0', paddingTop: 12 }}>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Droplets size={12} style={{ color: '#C62828' }} />
            <span><strong className="text-gray-800">{donor.totalDonations}</strong> donations</span>
          </div>
          {donor.lastDonationDate && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock size={11} />
              <span>{new Date(donor.lastDonationDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
            </div>
          )}
        </div>

        {/* CTA */}
        <Link
          to={`${ROUTES.REQUEST_CREATE}?bloodGroup=${donor.bloodGroup}`}
          className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95 focus:outline-none"
          style={{
            background: available ? '#C62828' : '#F5F5F5',
            color: available ? 'white' : '#9E9E9E',
          }}
        >
          {t('findBlood.requestBlood')}
          <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
}

// ─── Blood Group Filter Chip ───────────────────────────────────────────────────
function BGChip({ group, selected, onClick }: { group?: BloodGroup | ''; selected: boolean; onClick: () => void }) {
  const isAll = !group;
  const c = isAll
    ? { bg: '#C62828', text: '#FFFFFF', border: '#C62828' }
    : { ...(BG_COLORS[group] || BG_COLORS.A_POS), border: (BG_COLORS[group] || BG_COLORS.A_POS).bg };

  return (
    <button
      type="button"
      onClick={onClick}
      className="font-bold text-xs rounded-xl transition-all focus:outline-none"
      style={{
        padding: '6px 14px',
        background: selected ? c.bg : 'white',
        color: selected ? c.text : '#616161',
        border: selected ? `2px solid ${c.border}` : '2px solid #E0E0E0',
        transform: selected ? 'scale(1.05)' : 'scale(1)',
      }}
    >
      {isAll ? 'ALL' : BLOOD_GROUP_DISPLAY[group]}
    </button>
  );
}


export function FindBlood() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    bloodGroup: searchParams.get('bloodGroup') || '',
    city: '',
    area: '',
    availability: 'true',
  });
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'map'>('cards');
  const [selectedMapDonor, setSelectedMapDonor] = useState<DonorProfile | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['donors', 'search', filters, page],
    queryFn: async () => {
      const params: any = { page, limit: 12 };
      if (filters.bloodGroup) params.bloodGroup = filters.bloodGroup;
      if (filters.city) params.city = filters.city;
      if (filters.area) params.area = filters.area;
      if (filters.availability === 'true') params.availability = true;
      const res = await donorApi.search(params);
      return res.data;
    },
  });

  const donors: DonorProfile[] = data?.data || [];
  const meta = data?.meta;

  const set = (key: string, value: string) => { setFilters(f => ({ ...f, [key]: value })); setPage(1); };

  return (
    <PageLayout title={t('findBlood.title')}>
      <div className="pb-28 lg:pb-8">

        {/* ── Search bar ──────────────────────────────────────────────── */}
        <div
          className="rounded-2xl p-4 mb-4 flex flex-col gap-3"
          style={{ background: 'white', border: '1px solid #F0F0F0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
        >
          {/* City search + filter toggle */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </div>
              <input
                type="text"
                placeholder={t('findBlood.searchPlaceholder')}
                value={filters.city}
                onChange={e => set('city', e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl border text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: '#E0E0E0', focusBorderColor: '#C62828' } as any}
              />
            </div>
            <button
              onClick={() => setShowFilters(v => !v)}
              className="flex items-center gap-2 h-11 px-4 rounded-xl border text-sm font-medium transition-all focus:outline-none"
              style={{
                background: showFilters ? '#C62828' : 'white',
                color: showFilters ? 'white' : '#616161',
                borderColor: showFilters ? '#C62828' : '#E0E0E0',
              }}
            >
              <SlidersHorizontal size={15} />
              <span className="hidden sm:inline">{t('common.filter')}</span>
            </button>
          </div>

          {/* Blood group chips */}
          <div className="flex flex-wrap gap-2">
            <BGChip group={'' as any} selected={!filters.bloodGroup} onClick={() => set('bloodGroup', '')} />
            {BLOOD_GROUPS.map(bg => (
              <BGChip key={bg} group={bg} selected={filters.bloodGroup === bg} onClick={() => set('bloodGroup', filters.bloodGroup === bg ? '' : bg)} />
            ))}
          </div>

          {/* Extended filters */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2" style={{ borderTop: '1px solid #F0F0F0' }}>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">{t('findBlood.selectArea')}</label>
                <input
                  type="text"
                  placeholder="Area or locality…"
                  value={filters.area}
                  onChange={e => set('area', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all"
                  style={{ borderColor: '#E0E0E0' }}
                />
              </div>
              <div className="flex items-end pb-0.5">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded"
                    style={{ accentColor: '#C62828' }}
                    checked={filters.availability === 'true'}
                    onChange={e => set('availability', e.target.checked ? 'true' : '')}
                  />
                  <span className="text-sm text-gray-700">{t('findBlood.showAvailableOnly')}</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* ── Results header ───────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          {meta ? (
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-900">{meta.total}</span> donors found
              {filters.bloodGroup ? ` · ${BLOOD_GROUP_DISPLAY[filters.bloodGroup as BloodGroup]}` : ''}
              {filters.city ? ` · ${filters.city}` : ''}
            </p>
          ) : <div />}

          {/* View mode toggle */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'cards' ? 'bg-primary text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LayoutGrid size={13} />
              <span>Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'map' ? 'bg-primary text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Map size={13} />
              <span>Map View</span>
            </button>
          </div>
        </div>

        {/* ── Interactive Map View when selected ───────────────────────── */}
        {viewMode === 'map' && (
          <div className="mb-6 space-y-4">
            <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <MapPin size={16} className="text-primary" />
                    <span>Donor Vicinity Coverage: {filters.city || filters.area || 'Ahmedabad & Gujarat'}</span>
                  </h3>
                  <p className="text-xs text-gray-400">Live GPS map for locating blood donors in this geographic area</p>
                </div>
                <button
                  type="button"
                  onClick={() => openGoogleMapsDirections(buildAddressQuery(filters.area, filters.city || 'Ahmedabad, Gujarat'))}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-primary text-xs font-bold rounded-xl border border-red-200 transition-colors shadow-2xs"
                >
                  <Navigation size={12} />
                  <span>Open in Google Maps</span>
                </button>
              </div>

              <div className="h-80 sm:h-96 rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 relative shadow-inner">
                <iframe
                  title="Live Donors Map"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={getGoogleMapsEmbedUrl(buildAddressQuery(filters.area, filters.city || 'Ahmedabad, Gujarat'))}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Results grid ─────────────────────────────────────────────── */}
        {isLoading ? (
          <LoadingSpinner className="py-16" />
        ) : donors.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🔍</div>
            <h3 className="font-bold text-gray-700 text-base">{t('findBlood.noDonorsFound')}</h3>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or expanding your search area.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
              {donors.map((donor: DonorProfile) => (
                <DonorCard 
                  key={(donor as any)._id || donor.id} 
                  donor={donor} 
                  onOpenMap={(d) => setSelectedMapDonor(d)}
                />
              ))}
            </div>
            {meta && meta.totalPages > 1 && (
              <Pagination
                page={page}
                totalPages={meta.totalPages}
                total={meta.total}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </div>

      <MapModal
        isOpen={!!selectedMapDonor}
        onClose={() => setSelectedMapDonor(null)}
        title="Donor Vicinity Location"
        name={(selectedMapDonor as any)?.user?.fullName ? `${(selectedMapDonor as any).user.fullName} (${BLOOD_GROUP_DISPLAY[selectedMapDonor!.bloodGroup]})` : 'Verified Donor'}
        address={buildAddressQuery(selectedMapDonor?.area, selectedMapDonor?.city)}
      />
    </PageLayout>
  );
}
