import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { LoadingSpinner, EmptyState } from '../../components/ui/Alert';
import { reportApi } from '../../services/api';
import { UserReport } from '../../types';

export function Reports() {
  const { t } = useTranslation();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: () => reportApi.getAll().then(r => r.data.data),
  });

  const updateReport = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => reportApi.update(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reports'] }),
  });

  const mockReports = [
    { id: '1', category: 'FAKE_REQUEST', status: 'NEW', reporter: { fullName: 'Rahul Sharma' }, reportedUser: { fullName: 'Fake User 1' }, description: 'This user created 10 fake requests in one day.', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
    { id: '2', category: 'SPAM', status: 'UNDER_REVIEW', reporter: { fullName: 'Pooja Desai' }, reportedUser: { fullName: 'Spammer' }, description: 'Sending unnecessary messages.', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
    { id: '3', category: 'ABUSIVE', status: 'RESOLVED', reporter: { fullName: 'Amit Patel' }, reportedUser: { fullName: 'Toxic User' }, description: 'Using abusive language in chat.', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
  ] as any[];

  const reports: UserReport[] = data?.length ? data : mockReports;

  return (
    <PageLayout title={t('report.title')}>
      <div className="space-y-3">
        {isLoading ? (
          <LoadingSpinner className="py-12" />
        ) : reports.length === 0 ? (
          <EmptyState icon={<AlertTriangle size={40} />} title="No reports found." />
        ) : (
          reports.map(report => (
            <Card key={report.id}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-primary bg-red-50 px-2 py-0.5 rounded-full">{report.category.replace('_', ' ')}</span>
                    <StatusBadge status={report.status} />
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    <span className="text-gray-500">Reporter:</span> {report.reporter?.fullName}
                    {' → '}
                    <span className="text-gray-500">Reported:</span> {report.reportedUser?.fullName}
                  </p>
                  {report.description && (
                    <p className="text-sm text-gray-500 mt-1 max-w-lg">{report.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">{new Date(report.createdAt).toLocaleString()}</p>
                </div>
                {report.status === 'NEW' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateReport.mutate({ id: report.id, status: 'UNDER_REVIEW' })}
                      className="text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-medium"
                    >
                      Review
                    </button>
                    <button
                      onClick={() => updateReport.mutate({ id: report.id, status: 'RESOLVED' })}
                      className="text-xs text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg font-medium"
                    >
                      Resolve
                    </button>
                    <button
                      onClick={() => updateReport.mutate({ id: report.id, status: 'DISMISSED' })}
                      className="text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg font-medium"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </PageLayout>
  );
}
