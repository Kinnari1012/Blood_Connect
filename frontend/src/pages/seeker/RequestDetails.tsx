import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Calendar, Clock, Users, CheckCircle, XCircle, ShieldCheck } from 'lucide-react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { BloodGroupBadge, Badge, StatusBadge } from '../../components/ui/Badge';
import { LoadingSpinner, Alert } from '../../components/ui/Alert';
import { requestApi } from '../../services/api';
import { useAuth } from '../../store/AuthContext';
import { BloodRequest } from '../../types';
import { ROUTES } from '../../constants';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';

export function RequestDetails() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { isDonor, isSeeker, user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const { data: request, isLoading } = useQuery<BloodRequest>({
    queryKey: ['request', id],
    queryFn: () => requestApi.getById(id!).then(r => r.data.data),
    enabled: !!id,
  });

  const respond = useMutation({
    mutationFn: (action: 'accept' | 'decline') =>
      action === 'accept' ? requestApi.accept(id!) : requestApi.decline(id!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['request', id] }),
  });

  const complete = useMutation({
    mutationFn: () => requestApi.complete(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['request', id] });
      navigate(ROUTES.DONATION_HISTORY);
    },
  });

  const cancel = useMutation({
    mutationFn: () => requestApi.cancel(id!),
    onSuccess: () => navigate(ROUTES.USER_DASHBOARD),
  });

  const approve = useMutation({
    mutationFn: () => requestApi.approve(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['request', id] });
      toast.success('Request verified and approved!');
    },
    onError: () => toast.error('Failed to approve request'),
  });

  const reject = useMutation({
    mutationFn: (reason: string) => requestApi.reject(id!, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['request', id] });
      setIsRejectModalOpen(false);
      toast.success('Request rejected.');
    },
    onError: () => toast.error('Failed to reject request'),
  });

  const approveDonor = useMutation({
    mutationFn: (responseId: string) => requestApi.approveDonor(id!, responseId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['request', id] });
      toast.success('Donor approved successfully!');
    },
    onError: () => toast.error('Failed to approve donor'),
  });

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rejectReason.length < 10) {
      toast.error('Rejection reason must be at least 10 characters.');
      return;
    }
    reject.mutate(rejectReason);
  };

  if (isLoading) return <LoadingSpinner className="py-20" />;
  if (!request) return <Alert type="error">Request not found.</Alert>;

  const isAdminOrSuperAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  return (
    <PageLayout title={t('request.requestDetails')}>
      <div className="space-y-4">
        {/* Status header */}
        <Card className={request.isEmergency ? 'border-2 border-emergency' : ''}>
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
            <BloodGroupBadge group={request.bloodGroup} size="lg" />
            <div className="flex items-center gap-2">
              <StatusBadge status={request.status} />
              {request.isEmergency && <Badge variant="emergency">EMERGENCY</Badge>}
            </div>
          </div>
          <h2 className="font-bold text-xl text-gray-900 mb-1">{request.patientName}</h2>
          <p className="text-gray-500 text-sm">{request.unitsRequired} units of {request.bloodGroup.replace('_', '').replace('POS', '+').replace('NEG', '-')} required</p>
          
          {request.status === 'REJECTED' && request.rejectionReason && (
            <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-100">
              <p className="text-sm font-semibold text-red-800">Rejection Reason:</p>
              <p className="text-sm text-red-600">{request.rejectionReason}</p>
            </div>
          )}
        </Card>

        {/* Hospital info */}
        <Card>
          <h3 className="font-semibold text-gray-700 text-sm mb-3 flex items-center gap-2"><MapPin size={14} /> Hospital Details</h3>
          <p className="font-medium text-gray-900">{request.hospitalName}</p>
          {request.hospitalAddress && <p className="text-sm text-gray-500">{request.hospitalAddress}</p>}
          {request.hospitalCity && <p className="text-sm text-gray-500">{request.hospitalCity}</p>}
        </Card>

        {/* Date/time */}
        <Card>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 flex items-center gap-1 mb-1"><Calendar size={11} /> Required Date</p>
              <p className="font-medium text-gray-900">{new Date(request.requiredDate).toLocaleDateString()}</p>
            </div>
            {request.requiredTime && (
              <div>
                <p className="text-xs text-gray-400 flex items-center gap-1 mb-1"><Clock size={11} /> Required Time</p>
                <p className="font-medium text-gray-900">{request.requiredTime}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Notes */}
        {request.notes && (
          <Card>
            <p className="text-sm font-semibold text-gray-700 mb-1">Additional Notes</p>
            <p className="text-sm text-gray-600">{request.notes}</p>
          </Card>
        )}

        {/* Donor responses */}
        {request.donorResponses && request.donorResponses.length > 0 && (
          <Card>
            <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1"><Users size={14} /> {t('request.donorResponses')}</p>
            {request.donorResponses.map(dr => (
              <div key={dr._id || dr.id} className="flex items-center justify-between py-3 border-b last:border-0">
                <div>
                  <span className="text-sm font-medium text-gray-900 block">{dr.donor?.firstName} {dr.donor?.lastName}</span>
                  <StatusBadge status={dr.status} />
                </div>
                {isAdminOrSuperAdmin && dr.status === 'ACCEPTED' && (
                  <Button 
                    size="sm" 
                    variant="primary" 
                    loading={approveDonor.isPending && approveDonor.variables === (dr._id || dr.id)} 
                    onClick={() => approveDonor.mutate(dr._id || dr.id)}
                  >
                    Approve Donor
                  </Button>
                )}
              </div>
            ))}
          </Card>
        )}

        {/* Admin Actions */}
        {isAdminOrSuperAdmin && request.status === 'PENDING_VERIFICATION' && (
          <div className="flex gap-3">
            <Button variant="primary" fullWidth loading={approve.isPending} onClick={() => approve.mutate()}>
              <ShieldCheck size={16} /> Verify & Approve
            </Button>
            <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" fullWidth onClick={() => setIsRejectModalOpen(true)}>
              <XCircle size={16} /> Reject Request
            </Button>
          </div>
        )}

        {/* Actions */}
        {isDonor && request.status === 'MATCHING' && (
          <div className="flex gap-3">
            <Button variant="primary" fullWidth loading={respond.isPending} onClick={() => respond.mutate('accept')}>
              <CheckCircle size={16} /> {t('request.acceptRequest')}
            </Button>
            <Button variant="outline" fullWidth loading={respond.isPending} onClick={() => respond.mutate('decline')}>
              <XCircle size={16} /> {t('request.declineRequest')}
            </Button>
          </div>
        )}

        {isDonor && request.status === 'DONOR_ACCEPTED' && (
          <Button variant="primary" fullWidth loading={complete.isPending} onClick={() => complete.mutate()}>
            <CheckCircle size={16} /> {t('request.markComplete')}
          </Button>
        )}

        {isSeeker && !['COMPLETED', 'CANCELLED', 'Rejected'].includes(request.status) && (
          <Button variant="danger" fullWidth loading={cancel.isPending} onClick={() => cancel.mutate()}>
            {t('request.cancelRequest')}
          </Button>
        )}
      </div>

      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Blood Request"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsRejectModalOpen(false)}>Cancel</Button>
            <Button form="reject-form" type="submit" variant="danger" loading={reject.isPending}>Reject Request</Button>
          </>
        }
      >
        <form id="reject-form" onSubmit={handleRejectSubmit} className="space-y-4">
          <p className="text-sm text-gray-600">Please provide a reason for rejecting this blood request. This will be sent to the creator.</p>
          <Input 
            label="Rejection Reason" 
            required 
            autoFocus
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. Invalid hospital details..."
          />
        </form>
      </Modal>
    </PageLayout>
  );
}
