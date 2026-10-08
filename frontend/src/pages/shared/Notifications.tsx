import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck } from 'lucide-react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner, EmptyState } from '../../components/ui/Alert';
import { notificationApi } from '../../services/api';
import { Notification, NotificationType } from '../../types';

const TYPE_COLORS: Record<NotificationType, string> = {
  NEW_BLOOD_REQUEST: 'text-primary bg-red-50',
  EMERGENCY_REQUEST: 'text-emergency bg-red-50',
  DONOR_ACCEPTED: 'text-green-700 bg-green-50',
  DONOR_DECLINED: 'text-gray-600 bg-gray-50',
  REQUEST_COMPLETED: 'text-green-700 bg-green-50',
  DONATION_REMINDER: 'text-orange-600 bg-orange-50',
  ACCOUNT_SECURITY: 'text-blue-600 bg-blue-50',
  SYSTEM: 'text-gray-600 bg-gray-50',
};

export function Notifications() {
  const { t } = useTranslation();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.getAll().then(r => r.data),
    refetchInterval: 30000, // Poll every 30 seconds
  });

  const markAllRead = useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markRead = useMutation({
    mutationFn: (id: string) => notificationApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications: Notification[] = data?.data || [];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <PageLayout
      title={t('notifications.title')}
      actions={
        unreadCount > 0 ? (
          <Button variant="ghost" size="sm" onClick={() => markAllRead.mutate()}>
            <CheckCheck size={14} /> {t('notifications.markAllRead')}
          </Button>
        ) : undefined
      }
    >
      <div>
        {isLoading ? (
          <LoadingSpinner className="py-12" />
        ) : notifications.length === 0 ? (
          <EmptyState icon={<Bell size={40} />} title={t('notifications.noNotifications')} />
        ) : (
          <div className="space-y-2">
            {notifications.map(n => (
              <button
                key={n.id}
                onClick={() => !n.isRead && markRead.mutate(n.id)}
                className={`w-full text-left rounded-2xl border p-4 transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
                  n.isRead ? 'bg-white border-gray-100' : 'bg-red-50/50 border-primary/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm ${TYPE_COLORS[n.type] || 'text-gray-600 bg-gray-100'}`}>
                    <Bell size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-sm text-gray-900">{n.title}</p>
                      {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" aria-label="Unread" />}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5 leading-snug">{n.body}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
