import React from 'react';
import { useTranslation } from 'react-i18next';
import { PageLayout } from '../../components/layout/PageLayout';
import { Card } from '../../components/ui/Card';

export function Profile() {
  const { t } = useTranslation();
  return (
    <PageLayout title={t('profile.title')}>
      <div>
        <Card>
          <p className="text-sm text-gray-500">Profile editing coming in Phase 3. Your personal information is managed here.</p>
        </Card>
      </div>
    </PageLayout>
  );
}

export function PrivacyPolicy() {
  const { t } = useTranslation();
  return (
    <PageLayout title={t('privacy.title')}>
      <div className="prose prose-sm">
        <Card padding="lg">
          <h1 className="text-xl font-bold mb-4">{t('privacy.title')}</h1>
          <p className="text-sm text-gray-500 mb-4">{t('privacy.lastUpdated')}: January 2025</p>
          <div className="space-y-4 text-sm text-gray-700">
            <section>
              <h2 className="font-bold text-gray-900 mb-2">1. Information We Collect</h2>
              <p>BloodConnect collects information you provide when registering, including name, email, mobile number, blood group, and location. We use this to facilitate blood donor matching.</p>
            </section>
            <section>
              <h2 className="font-bold text-gray-900 mb-2">2. How We Use Your Information</h2>
              <p>Your information is used to connect blood donors with people in need. We display only approximate location to other users. Your complete address is never publicly displayed.</p>
            </section>
            <section>
              <h2 className="font-bold text-gray-900 mb-2">3. Data Security</h2>
              <p>We implement industry-standard security measures including password hashing, encrypted data transmission, and access controls. We never store or display passwords.</p>
            </section>
            <section>
              <h2 className="font-bold text-gray-900 mb-2">4. Your Rights</h2>
              <p>You may request account deletion, update your profile, control your availability status, and manage notification preferences at any time from your settings.</p>
            </section>
            <section>
              <h2 className="font-bold text-gray-900 mb-2">5. Contact</h2>
              <p>For privacy concerns, contact us at privacy@BloodConnect.in</p>
            </section>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}

export function TermsAndConditions() {
  const { t } = useTranslation();
  return (
    <PageLayout title={t('terms.title')}>
      <div>
        <Card padding="lg">
          <h1 className="text-xl font-bold mb-4">{t('terms.title')}</h1>
          <p className="text-sm text-gray-500 mb-4">{t('terms.lastUpdated')}: January 2025</p>
          <div className="space-y-4 text-sm text-gray-700">
            <section>
              <h2 className="font-bold text-gray-900 mb-2">1. Acceptance of Terms</h2>
              <p>By using BloodConnect, you agree to these terms. BloodConnect is a platform to connect blood donors with blood seekers and does not provide medical advice.</p>
            </section>
            <section>
              <h2 className="font-bold text-gray-900 mb-2">2. Medical Disclaimer</h2>
              <p>BloodConnect does not guarantee the medical eligibility of any donor. All eligibility calculations are estimates based on recorded donation dates. Always consult a qualified healthcare professional before donating blood.</p>
            </section>
            <section>
              <h2 className="font-bold text-gray-900 mb-2">3. User Responsibilities</h2>
              <p>Users must provide accurate information. Donors must only accept requests when medically able. Misuse of the platform may result in account suspension.</p>
            </section>
            <section>
              <h2 className="font-bold text-gray-900 mb-2">4. Limitation of Liability</h2>
              <p>BloodConnect facilitates connections between users but is not responsible for the outcome of donations or medical decisions made by users.</p>
            </section>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}

export function HelpSupport() {
  const { t } = useTranslation();
  const faqs = [
    { q: 'How do I register as a blood donor?', a: 'Go to the Home screen and tap "Donate Blood". Fill in your personal information, blood group, and location details.' },
    { q: 'How often can I donate blood?', a: 'The standard guideline is every 90 days (3 months) for whole blood donation. This is configurable and not a medical guarantee. Consult your doctor for medical advice.' },
    { q: 'Is my address visible to others?', a: 'No. Only your approximate city and area are visible to other users. Your complete address is never publicly displayed.' },
    { q: 'How do I respond to a blood request?', a: 'When your blood group is matched to a request, you will receive a notification. Go to your Dashboard to Accept or Decline.' },
    { q: 'How do I change my language?', a: 'Go to Settings from the navigation and select your preferred language (English, Gujarati, or Hindi).' },
    { q: 'How do I report a suspicious user?', a: 'Visit the user\'s profile and tap the "Report" option. Our admin team will review all reports.' },
  ];

  return (
    <PageLayout title={t('help.title')}>
      <div className="space-y-4">
        <Card padding="lg">
          <h2 className="font-bold text-gray-900 mb-4">{t('help.faq')}</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                <p className="font-semibold text-sm text-gray-900 mb-1">{faq.q}</p>
                <p className="text-sm text-gray-500">{faq.a}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card padding="lg">
          <h2 className="font-bold text-gray-900 mb-2">{t('help.contactUs')}</h2>
          <p className="text-sm text-gray-500">Email: support@BloodConnect.in</p>
          <p className="text-sm text-gray-500">Response time: within 24 hours</p>
        </Card>
      </div>
    </PageLayout>
  );
}
