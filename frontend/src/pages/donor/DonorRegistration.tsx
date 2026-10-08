import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { PageLayout } from '../../components/layout/PageLayout';
import { Input, Select } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { ROUTES, BLOOD_GROUPS, BLOOD_GROUP_DISPLAY } from '../../constants';
import { donorApi } from '../../services/api';

const schema = z.object({
  dateOfBirth: z.string().min(1),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  bloodGroup: z.enum(['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG']),
  availability: z.boolean().default(true),
  lastDonationDate: z.string().optional(),
  preferredContact: z.enum(['CALL', 'WHATSAPP', 'IN_APP']).default('IN_APP'),
  state: z.string().optional(),
  city: z.string().optional(),
  area: z.string().optional(),
  pincode: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export function DonorRegistration() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (data: FormData) => donorApi.createProfile(data),
    onSuccess: () => navigate(ROUTES.DONOR_DASHBOARD),
  });

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: { availability: true, preferredContact: 'IN_APP' },
  });

  return (
    <PageLayout title={t('donor.createProfile')}>
      <div>
        <div className="bg-white rounded-2xl shadow-card p-6">
          {mutation.error && (
            <Alert type="error" className="mb-4">
              {(mutation.error as any)?.response?.data?.error?.message || t('errors.serverError')}
            </Alert>
          )}

          <form onSubmit={handleSubmit(d => mutation.mutate(d as any))} noValidate className="space-y-5">
            {/* Personal Info */}
            <fieldset>
              <legend className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Personal Information</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label={t('donor.dateOfBirth')} type="date" error={errors.dateOfBirth?.message} required {...register('dateOfBirth')} />
                <Select
                  label={t('donor.gender')}
                  placeholder="Select gender"
                  options={[
                    { value: 'MALE', label: t('donor.male') },
                    { value: 'FEMALE', label: t('donor.female') },
                    { value: 'OTHER', label: t('donor.other') },
                  ]}
                  error={errors.gender?.message}
                  required
                  {...register('gender')}
                />
              </div>
            </fieldset>

            {/* Medical Info */}
            <fieldset>
              <legend className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Medical Information</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label={t('donor.bloodGroup')}
                  placeholder={t('validation.selectBloodGroup')}
                  options={BLOOD_GROUPS.map(bg => ({ value: bg, label: BLOOD_GROUP_DISPLAY[bg] }))}
                  error={errors.bloodGroup?.message}
                  required
                  {...register('bloodGroup')}
                />
                <Input label={t('donor.lastDonationDate')} type="date" {...register('lastDonationDate')} />
              </div>
              <Alert type="info" className="mt-3">
                <span className="text-xs">{t('donor.eligibilityNote')}</span>
              </Alert>
            </fieldset>

            {/* Location */}
            <fieldset>
              <legend className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Location</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label={t('profile.state')} {...register('state')} />
                <Input label={t('profile.city')} {...register('city')} />
                <Input label={t('profile.area')} {...register('area')} />
                <Input label={t('profile.pincode')} {...register('pincode')} />
              </div>
            </fieldset>

            {/* Contact Preference */}
            <Select
              label={t('donor.preferredContact')}
              options={[
                { value: 'IN_APP', label: t('donor.inApp') },
                { value: 'CALL', label: t('donor.call') },
                { value: 'WHATSAPP', label: t('donor.whatsapp') },
              ]}
              {...register('preferredContact')}
            />

            {/* Availability */}
            <div className="flex items-center gap-3">
              <input type="checkbox" id="availability" className="w-4 h-4 accent-primary" defaultChecked {...register('availability')} />
              <label htmlFor="availability" className="text-sm font-medium text-gray-700">
                I am available to donate blood
              </label>
            </div>

            <Button type="submit" fullWidth loading={mutation.isPending} size="lg">
              {t('donor.createProfile')}
            </Button>
          </form>
        </div>
      </div>
    </PageLayout>
  );
}
