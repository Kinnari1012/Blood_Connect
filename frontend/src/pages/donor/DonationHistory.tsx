import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Clock, CheckCircle } from 'lucide-react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Card } from '../../components/ui/Card';
import { BloodGroupBadge } from '../../components/ui/Badge';
import { LoadingSpinner, EmptyState } from '../../components/ui/Alert';
import { requestApi } from '../../services/api';
import { BloodRequest } from '../../types';

export function DonationHistory() {
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ['donation-history'],
    queryFn: () => requestApi.getMyRequests({ page: 1, limit: 50 }).then(r => r.data),
  });

  const completed: BloodRequest[] = (data?.data || []).filter(
    (r: BloodRequest) => r.status === 'COMPLETED'
  );

  return (
    <PageLayout title={t('donor.donationHistory')}>
      <div>
        {isLoading ? (
          <LoadingSpinner className="py-12" />
        ) : completed.length === 0 ? (
          <EmptyState
            icon={<Clock size={40} />}
            title={t('donor.noDonationHistory')}
            description="Your completed donations will appear here."
          />
        ) : (
          <div className="relative">
            {/* Timeline */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200" aria-hidden="true" />
            <div className="space-y-4 pl-10">
              {completed.map(req => (
                <div key={req.id} className="relative">
                  <div className="absolute -left-10 top-3 w-6 h-6 rounded-full bg-green-100 border-2 border-green-400 flex items-center justify-center">
                    <CheckCircle size={12} className="text-green-600" />
                  </div>
                  <Card>
                    <div className="flex items-start gap-3">
                      <BloodGroupBadge group={req.bloodGroup} />
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{req.patientName}</p>
                        <p className="text-xs text-gray-500">{req.hospitalName}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
