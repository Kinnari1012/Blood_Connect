import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui/Button';
import { ROUTES, LANGUAGES } from '../../constants';
import i18n from '../../i18n';

// ─── Logo SVG ─────────────────────────────────────────────────────────────────
function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" aria-hidden="true">
      <circle cx="28" cy="28" r="28" fill="#FFF5F5" />
      <path
        d="M28 42C28 42 14 33 14 22C14 17.6 17.6 14 22 14C24.4 14 26.5 15.1 28 17C29.5 15.1 31.6 14 34 14C38.4 14 42 17.6 42 22C42 33 28 42 28 42Z"
        fill="#C62828"
      />
      <path d="M28 17L30.5 24H25.5L28 17Z" fill="white" opacity="0.6" />
      <ellipse cx="28" cy="25" rx="2.5" ry="2" fill="white" opacity="0.55" />
      <circle cx="16" cy="48" r="3" fill="#8E0000" />
      <circle cx="28" cy="52" r="3" fill="#8E0000" />
      <circle cx="40" cy="48" r="3" fill="#8E0000" />
      <line x1="16" y1="48" x2="28" y2="52" stroke="#C62828" strokeWidth="1.8" />
      <line x1="40" y1="48" x2="28" y2="52" stroke="#C62828" strokeWidth="1.8" />
      <line x1="16" y1="48" x2="40" y2="48" stroke="#C62828" strokeWidth="1.4" strokeDasharray="3 2.5" />
    </svg>
  );
}

// ─── Slide illustrations ───────────────────────────────────────────────────────
const illustrations = [
  // Slide 1 — Connect donors
  <svg key="s1" viewBox="0 0 280 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[280px]" aria-hidden="true">
    <rect width="280" height="220" rx="24" fill="#FFF5F5" />
    {/* Center heart */}
    <path d="M140 138C140 138 100 115 100 90C100 79 108 70 119 70C124 70 129 72.5 134 77C139 72.5 144 70 149 70C160 70 168 79 168 90C168 115 140 138 140 138Z" fill="#C62828" />
    <path d="M140 77L144 88H136L140 77Z" fill="white" opacity="0.55" />
    <ellipse cx="140" cy="90" rx="4" ry="3.2" fill="white" opacity="0.5" />
    {/* Left person */}
    <circle cx="70" cy="90" r="18" fill="#FFCDD2" />
    <circle cx="70" cy="84" r="9" fill="#E57373" />
    <path d="M52 110c0-10 8-16 18-16s18 6 18 16" fill="#FFCDD2" />
    {/* Right person */}
    <circle cx="210" cy="90" r="18" fill="#FFCDD2" />
    <circle cx="210" cy="84" r="9" fill="#E57373" />
    <path d="M192 110c0-10 8-16 18-16s18 6 18 16" fill="#FFCDD2" />
    {/* Connection lines */}
    <path d="M88 90 Q114 90 120 90" stroke="#C62828" strokeWidth="2" strokeDasharray="5 3" />
    <path d="M160 90 Q166 90 192 90" stroke="#C62828" strokeWidth="2" strokeDasharray="5 3" />
    {/* Nodes */}
    <circle cx="88" cy="90" r="5" fill="#C62828" />
    <circle cx="192" cy="90" r="5" fill="#C62828" />
    {/* Bottom nodes */}
    <circle cx="100" cy="175" r="7" fill="#8E0000" opacity="0.8" />
    <circle cx="140" cy="185" r="7" fill="#8E0000" opacity="0.8" />
    <circle cx="180" cy="175" r="7" fill="#8E0000" opacity="0.8" />
    <line x1="100" y1="175" x2="140" y2="185" stroke="#C62828" strokeWidth="2" />
    <line x1="180" y1="175" x2="140" y2="185" stroke="#C62828" strokeWidth="2" />
  </svg>,

  // Slide 2 — Track donations
  <svg key="s2" viewBox="0 0 280 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[280px]" aria-hidden="true">
    <rect width="280" height="220" rx="24" fill="#F3F8FF" />
    {/* Phone frame */}
    <rect x="90" y="30" width="100" height="160" rx="16" fill="white" stroke="#E0E0E0" strokeWidth="2" />
    <rect x="90" y="30" width="100" height="42" rx="16" fill="#C62828" />
    <path d="M140 44L143 53H137L140 44Z" fill="white" opacity="0.8" />
    <ellipse cx="140" cy="55" rx="3" ry="2.4" fill="white" opacity="0.7" />
    {/* App content */}
    <rect x="103" y="83" width="74" height="8" rx="4" fill="#FFCDD2" />
    <rect x="103" y="97" width="54" height="6" rx="3" fill="#EEEEEE" />
    <rect x="103" y="109" width="64" height="6" rx="3" fill="#EEEEEE" />
    {/* Check mark */}
    <circle cx="185" cy="75" r="20" fill="#E8F5E9" />
    <path d="M175 75l6 6 12-12" stroke="#2E7D32" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    {/* Blood drops */}
    <path d="M55 100 C55 100 48 92 48 87C48 83 51 80 55 80C59 80 62 83 62 87C62 92 55 100 55 100Z" fill="#EF5350" opacity="0.8" />
    <path d="M55 135 C55 135 48 127 48 122C48 118 51 115 55 115C59 115 62 118 62 122C62 127 55 135 55 135Z" fill="#C62828" opacity="0.7" />
    <path d="M225 100 C225 100 218 92 218 87C218 83 221 80 225 80C229 80 232 83 232 87C232 92 225 100 225 100Z" fill="#EF5350" opacity="0.8" />
    <path d="M225 135 C225 135 218 127 218 122C218 118 221 115 225 115C229 115 232 118 232 122C232 127 225 135 225 135Z" fill="#C62828" opacity="0.7" />
  </svg>,

  // Slide 3 — Emergency help
  <svg key="s3" viewBox="0 0 280 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[280px]" aria-hidden="true">
    <rect width="280" height="220" rx="24" fill="#FFF8F8" />
    {/* Hospital */}
    <rect x="70" y="60" width="140" height="120" rx="12" fill="white" stroke="#E0E0E0" strokeWidth="2" />
    <rect x="70" y="60" width="140" height="40" rx="12" fill="#D32F2F" />
    {/* Cross */}
    <rect x="128" y="70" width="24" height="20" rx="4" fill="white" opacity="0.9" />
    <rect x="132" y="66" width="16" height="28" rx="4" fill="white" opacity="0.9" />
    {/* Windows */}
    <rect x="90" y="115" width="24" height="22" rx="4" fill="#BBDEFB" />
    <rect x="128" y="115" width="24" height="22" rx="4" fill="#BBDEFB" />
    <rect x="166" y="115" width="24" height="22" rx="4" fill="#BBDEFB" />
    {/* Door */}
    <rect x="118" y="148" width="44" height="32" rx="6" fill="#EFEBE9" />
    <circle cx="155" cy="164" r="3" fill="#BDBDBD" />
    {/* Urgency rings */}
    <circle cx="210" cy="68" r="28" fill="none" stroke="#D32F2F" strokeWidth="2" opacity="0.3" strokeDasharray="5 3" />
    <circle cx="210" cy="68" r="20" fill="none" stroke="#D32F2F" strokeWidth="2" opacity="0.5" />
    <circle cx="210" cy="68" r="12" fill="#D32F2F" opacity="0.85" />
    <path d="M207 64h6M210 61v6" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    {/* Signal waves */}
    <path d="M55 90 Q60 85 65 90 Q70 95 75 90" stroke="#C62828" strokeWidth="2" fill="none" opacity="0.6" />
    <path d="M52 82 Q60 74 68 82 Q76 90 84 82" stroke="#C62828" strokeWidth="2" fill="none" opacity="0.4" />
  </svg>,
];

const slideData = [
  { titleKey: 'onboarding.slide1Title', descKey: 'onboarding.slide1Desc' },
  { titleKey: 'onboarding.slide2Title', descKey: 'onboarding.slide2Desc' },
  { titleKey: 'onboarding.slide3Title', descKey: 'onboarding.slide3Desc' },
];

// ─── Language flags ───────────────────────────────────────────────────────────
const LANG_META = [
  { code: 'en', label: 'English', nativeLabel: 'English',    flag: '🇬🇧', subtitle: 'Continue in English' },
  { code: 'gu', label: 'Gujarati', nativeLabel: 'ગુજરાતી',  flag: '🇮🇳', subtitle: 'ગુજરાતીમાં ચાલુ રાખો' },
  { code: 'hi', label: 'Hindi',   nativeLabel: 'हिन्दी',    flag: '🇮🇳', subtitle: 'हिंदी में जारी रखें' },
];

// ─── Component ────────────────────────────────────────────────────────────────
export function Onboarding() {
  const [step, setStep] = useState<'lang' | 'slides'>('lang');
  const [slideIdx, setSlideIdx] = useState(0);
  const [selectedLang, setSelectedLang] = useState('en');
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLangSelect = (code: string) => {
    setSelectedLang(code);
    i18n.changeLanguage(code);
    localStorage.setItem('BloodConnect_lang', code);
    setStep('slides');
  };

  const handleNext = () => {
    if (slideIdx < slideData.length - 1) {
      setSlideIdx(i => i + 1);
    } else {
      localStorage.setItem('bc_onboarded', '1');
      navigate(ROUTES.LOGIN);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('bc_onboarded', '1');
    navigate(ROUTES.LOGIN);
  };

  // ── Language selection screen ────────────────────────────────────────────
  if (step === 'lang') {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Top gradient band */}
        <div
          className="h-48 flex flex-col items-center justify-end pb-8"
          style={{ background: 'linear-gradient(150deg, #C62828 0%, #8E0000 100%)' }}
        >
          <div className="flex flex-col items-center gap-3">
            <Logo size={52} />
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white">BloodConnect</h1>
              <p className="text-red-200 text-xs mt-0.5">Connecting Donors. Saving Lives.</p>
            </div>
          </div>
        </div>

        {/* Language cards */}
        <div className="flex-1 flex flex-col px-6 pt-8 pb-10 max-w-sm mx-auto w-full">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Choose your language</h2>
          <p className="text-sm text-gray-500 mb-6">Select the language you're most comfortable with</p>

          <div className="flex flex-col gap-3">
            {LANG_META.map(lang => (
              <button
                key={lang.code}
                onClick={() => handleLangSelect(lang.code)}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl border-2 transition-all duration-150 text-left focus:outline-none ${
                  selectedLang === lang.code
                    ? 'border-[#C62828] bg-red-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <span className="text-3xl flex-shrink-0">{lang.flag}</span>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-base">{lang.nativeLabel}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{lang.subtitle}</p>
                </div>
                {selectedLang === lang.code && (
                  <div className="ml-auto w-5 h-5 rounded-full bg-[#C62828] flex items-center justify-center flex-shrink-0">
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>

          <p className="text-center text-xs text-gray-400 mt-auto pt-8">
            You can change your language anytime in Settings
          </p>
        </div>
      </div>
    );
  }

  // ── Slide screen ─────────────────────────────────────────────────────────
  const slide = slideData[slideIdx];
  const isLast = slideIdx === slideData.length - 1;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <div className="flex items-center gap-2">
          <Logo size={28} />
          <span className="font-bold text-gray-800 text-sm">BloodConnect</span>
        </div>
        <button
          onClick={handleSkip}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100 focus:outline-none"
        >
          {t('onboarding.skip')}
        </button>
      </div>

      {/* Illustration */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-4">
        <div
          key={slideIdx}
          className="w-full flex justify-center mb-8 animate-bc-fade-in"
        >
          {illustrations[slideIdx]}
        </div>

        {/* Text */}
        <div className="text-center max-w-xs animate-bc-slide-up">
          <h2 className="text-2xl font-bold text-gray-900 mb-3 leading-snug">
            {t(slide.titleKey)}
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            {t(slide.descKey)}
          </p>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="px-6 pb-10 pt-4 flex flex-col items-center gap-5">
        {/* Progress dots */}
        <div className="flex gap-2" aria-label={`Step ${slideIdx + 1} of ${slideData.length}`}>
          {slideData.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlideIdx(i)}
              className={`h-2.5 rounded-full transition-all duration-300 focus:outline-none ${
                i === slideIdx
                  ? 'w-7 bg-[#C62828]'
                  : i < slideIdx
                  ? 'w-2.5 bg-red-300'
                  : 'w-2.5 bg-gray-200'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* CTA button */}
        <button
          onClick={handleNext}
          className="w-full h-14 rounded-2xl font-bold text-base text-white transition-all duration-150 active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-red-200"
          style={{ background: 'linear-gradient(135deg, #C62828 0%, #8E0000 100%)', boxShadow: '0 4px 20px rgba(198,40,40,0.35)' }}
        >
          {isLast ? t('common.getStarted') : t('common.next')}
        </button>

        {/* Sign in link */}
        <p className="text-sm text-gray-500">
          Already have an account?{' '}
          <button
            onClick={() => navigate(ROUTES.LOGIN)}
            className="text-[#C62828] font-semibold hover:underline focus:outline-none"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
