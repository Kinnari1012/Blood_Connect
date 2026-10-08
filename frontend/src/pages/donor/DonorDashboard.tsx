import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, Clock, CheckCircle, XCircle, Activity, ChevronRight, Droplets, MapPin, Calendar } from 'lucide-react';
import { PageLayout } from '../../components/layout/PageLayout';
import { StatCard } from '../../components/ui/Card';
import { BloodGroupBadge, StatusBadge } from '../../components/ui/Badge';
import { LoadingSpinner, EmptyState } from '../../components/ui/Alert';
import { donorApi, requestApi } from '../../services/api';
import { ROUTES, BLOOD_GROUP_DISPLAY } from '../../constants';
import { BloodRequest } from '../../types';

// ─── Availability toggle ──────────────────────────────────────────────────────
function AvailabilityToggle({ available, loading, onToggle }: { available: boolean; loading: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
      style={{
        background: available ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.15)',
        color: 'white',
        border: '1.5px solid rgba(255,255,255,0.3)',
      }}
    >
      {loading ? (
        <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      ) : (
        <span className={`w-2 h-2 rounded-full ${available ? 'bg-green-300' : 'bg-gray-300'}`} />
      )}
      {available ? 'Available' : 'Unavailable'}
    </button>
  );
}

export function DonorDashboard() {
  const { t } = useTranslation();
  const qc = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['donor', 'profile'],
    queryFn: () => donorApi.getMyProfile().then(r => r.data.data),
  });

  const { data: requestsData } = useQuery({
    queryKey: ['requests', 'my', 1],
    queryFn: () => requestApi.getMyRequests({ page: 1, limit: 10 }).then(r => r.data),
  });

  const toggleAvailability = useMutation({
    mutationFn: (availability: boolean) => donorApi.updateAvailability(availability),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['donor', 'profile'] }),
  });

  const respondToRequest = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'accept' | 'decline' }) =>
      action === 'accept' ? requestApi.accept(id) : requestApi.decline(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['requests', 'my'] }),
  });

  if (isLoading) return <LoadingSpinner className="py-20" />;

  const isEligible = !profile?.nextEligibleDate || new Date(profile.nextEligibleDate) <= new Date();
  const nextDate = profile?.nextEligibleDate ? new Date(profile.nextEligibleDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null;
  const lastDate = profile?.lastDonationDate ? new Date(profile.lastDonationDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null;

  return (
    <PageLayout>
      <div className="space-y-5">

        {/* ── Hero card ────────────────────────────────────────────────── */}
        <div
          className="rounded-3xl p-6 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #C62828 0%, #8E0000 100%)' }}
        >
          {/* Decorative circle */}
          <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full opacity-10 bg-white" />
          <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full opacity-10 bg-white" />

          <div className="relative flex items-start justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              {/* Large blood group badge */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center font-extrabold text-xl flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.2)' }}
              >
                <span className="text-white">{profile?.bloodGroup ? BLOOD_GROUP_DISPLAY[profile.bloodGroup] : '—'}</span>
              </div>
              <div>
                <p className="text-white font-bold text-base">My Donor Profile</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: profile?.availability ? '#69F0AE' : '#BDBDBD' }}
                  />
                  <span className="text-sm text-red-100">
                    {profile?.availability ? t('donor.available') : t('donor.notAvailable')}
                  </span>
                </div>
              </div>
            </div>
            <AvailabilityToggle
              available={!!profile?.availability}
              loading={toggleAvailability.isPending}
              onToggle={() => toggleAvailability.mutate(!profile?.availability)}
            />
          </div>

          {/* Info row */}
          <div className="relative mt-4 pt-4 flex flex-wrap gap-4" style={{ borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            {lastDate && (
              <div className="flex items-center gap-1.5">
                <Calendar size={13} className="text-red-200" />
                <p className="text-xs text-red-100">Last: <span className="text-white font-medium">{lastDate}</span></p>
              </div>
            )}
            {profile?.city && (
              <div className="flex items-center gap-1.5">
                <MapPin size={13} className="text-red-200" />
                <p className="text-xs text-red-100"><span className="text-white font-medium">{profile.city}</span></p>
              </div>
            )}
            {profile?.totalDonations !== undefined && (
              <div className="flex items-center gap-1.5">
                <Droplets size={13} className="text-red-200" />
                <p className="text-xs text-red-100">Donations: <span className="text-white font-bold">{profile.totalDonations}</span></p>
              </div>
            )}
          </div>
        </div>

        {/* Eligibility notice */}
        {!isEligible && nextDate && (
          <div
            className="rounded-2xl px-4 py-3 flex items-start gap-3"
            style={{ background: '#FFF8E1', border: '1px solid #FFE082' }}
          >
            <Clock size={16} style={{ color: '#F57F17', marginTop: 1, flexShrink: 0 }} />
            <p className="text-sm" style={{ color: '#F57F17' }}>
              Your next eligible donation date is <strong>{nextDate}</strong>. {t('donor.eligibilityNote')}
            </p>
          </div>
        )}

        {/* ── Stat cards ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label={t('donor.totalDonations')}
            value={profile?.totalDonations ?? 0}
            icon={<Heart size={18} />}
            color="red"
          />
          <StatCard
            label="Eligibility"
            value={isEligible ? 'Now ✓' : 'Waiting'}
            icon={<CheckCircle size={18} />}
            color={isEligible ? 'green' : 'orange'}
          />
          <StatCard
            label="Blood Group"
            value={profile?.bloodGroup ? BLOOD_GROUP_DISPLAY[profile.bloodGroup] : '—'}
            icon={<Droplets size={18} />}
            color="red"
          />
          <StatCard
            label="Status"
            value={profile?.availability ? 'Active' : 'Off'}
            icon={<Activity size={18} />}
            color={profile?.availability ? 'green' : 'blue'}
          />
        </div>

        {/* ── Quick actions ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: t('nav.findBlood'),       to: ROUTES.FIND_BLOOD,       icon: '🔍', bg: '#FFF5F5', text: '#C62828' },
            { label: t('donor.donationHistory'),to: ROUTES.DONATION_HISTORY, icon: '📋', bg: '#F1F8E9', text: '#2E7D32' },
            { label: t('nav.notifications'),    to: ROUTES.NOTIFICATIONS,    icon: '🔔', bg: '#E3F2FD', text: '#1565C0' },
          ].map(a => (
            <Link
              key={a.to}
              to={a.to}
              className="flex items-center gap-3 rounded-2xl p-4 transition-all card-hover focus:outline-none"
              style={{ background: a.bg, border: `1px solid ${a.bg}` }}
            >
              <span className="text-xl">{a.icon}</span>
              <span className="text-sm font-semibold" style={{ color: a.text }}>{a.label}</span>
            </Link>
          ))}
        </div>

        {/* ── Blood requests ───────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900 text-sm">{t('request.myRequests')}</h2>
            <Link
              to={ROUTES.DONATION_HISTORY}
              className="text-xs font-semibold flex items-center gap-0.5"
              style={{ color: '#C62828' }}
            >
              History <ChevronRight size={12} />
            </Link>
          </div>

          {!requestsData?.data?.length ? (
            <div
              className="rounded-2xl p-8 text-center"
              style={{ background: 'white', border: '1px solid #F0F0F0' }}
            >
              <div className="text-4xl mb-3">🩸</div>
              <p className="font-semibold text-gray-700 text-sm">{t('request.noRequests')}</p>
              <p className="text-xs text-gray-400 mt-1">Blood requests matched to your group will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(requestsData.data as BloodRequest[]).map(req => (
                <div
                  key={req.id}
                  className="rounded-2xl p-4 flex items-start gap-3"
                  style={{ background: 'white', border: '1px solid #F0F0F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
                >
                  <BloodGroupBadge group={req.bloodGroup} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{req.patientName}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{req.hospitalName}</p>
                      </div>
                      <StatusBadge status={req.status} />
                    </div>
                    {req.status === 'MATCHING' && (
                      <div className="flex gap-2 mt-3 flex-wrap">
                        <button
                          onClick={() => respondToRequest.mutate({ id: req.id, action: 'accept' })}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all focus:outline-none"
                          style={{ background: '#E8F5E9', color: '#2E7D32' }}
                        >
                          <CheckCircle size={13} /> Accept
                        </button>
                        <button
                          onClick={() => respondToRequest.mutate({ id: req.id, action: 'decline' })}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all focus:outline-none"
                          style={{ background: '#FFEBEE', color: '#C62828' }}
                        >
                          <XCircle size={13} /> Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </PageLayout>
  );
}
