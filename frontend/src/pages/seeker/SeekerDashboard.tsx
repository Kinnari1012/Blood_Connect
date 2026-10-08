import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Plus, AlertTriangle, Search, Activity, ChevronRight } from 'lucide-react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { BloodGroupBadge, StatusBadge, Badge } from '../../components/ui/Badge';
import { LoadingSpinner, EmptyState } from '../../components/ui/Alert';
import { requestApi } from '../../services/api';
import { ROUTES } from '../../constants';
import { BloodRequest } from '../../types';

export function SeekerDashboard() {
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ['requests', 'seeker'],
    queryFn: () => requestApi.getMyRequests({ page: 1, limit: 20 }).then(r => r.data),
  });

  const requests: BloodRequest[] = data?.data || [];

  return (
    <PageLayout title={t('nav.dashboard')}>
      <div className="space-y-5">
        {/* Action CTAs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link to={ROUTES.FIND_BLOOD}>
            <Card hoverable padding="md" className="flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Search size={20} className="text-blue-600" />
              </div>
              <p className="font-semibold text-sm text-gray-900">{t('home.findBlood')}</p>
            </Card>
          </Link>
          <Link to={ROUTES.REQUEST_CREATE}>
            <Card hoverable padding="md" className="flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <Plus size={20} className="text-green-600" />
              </div>
              <p className="font-semibold text-sm text-gray-900">{t('request.createRequest')}</p>
            </Card>
          </Link>
          <Link to={ROUTES.REQUEST_EMERGENCY}>
            <Card hoverable padding="md" className="flex flex-col items-center text-center gap-2 border-emergency/20">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <AlertTriangle size={20} className="text-emergency" />
              </div>
              <p className="font-semibold text-sm text-emergency">{t('request.emergencyRequest')}</p>
            </Card>
          </Link>
        </div>

        {/* My Requests */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900">{t('request.myRequests')}</h2>
          </div>

          {isLoading ? (
            <LoadingSpinner className="py-8" />
          ) : requests.length === 0 ? (
            <EmptyState
              icon={<Activity size={36} />}
              title={t('request.noRequests')}
              description="Create a blood request to find donors."
              action={
                <Link to={ROUTES.REQUEST_CREATE}>
                  <Button size="sm" variant="primary">{t('request.createRequest')}</Button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-3">
              {requests.map(req => (
                <Link key={req.id} to={ROUTES.REQUEST_DETAILS.replace(':id', req.id)}>
                  <Card hoverable>
                    <div className="flex items-start gap-3">
                      <BloodGroupBadge group={req.bloodGroup} />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900">{req.patientName}</p>
                        <p className="text-xs text-gray-500">{req.hospitalName}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <StatusBadge status={req.status} />
                          {req.isEmergency && <Badge variant="emergency">URGENT</Badge>}
                          <span className="text-xs text-gray-400">{req.unitsRequired} unit{req.unitsRequired !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </PageLayout>
  );
}
