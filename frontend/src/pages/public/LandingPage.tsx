import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Heart,
  Droplet,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle,
  Phone,
  ArrowRight,
  Search,
  Users,
  Activity,
  Building2,
  Sparkles,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Star,
  Award,
  Navigation,
  Check,
  Menu,
  X,
  Globe,
  ExternalLink,
  Smartphone,
  HeartHandshake,
  Zap,
  Radio,
  Share2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../store/AuthContext';
import { ROUTES } from '../../constants';
import { requestApi, testimonialApi, analyticsApi } from '../../services/api';
import { MapModal } from '../../components/common/MapModal';

// ─── Blood Compatibility Data ───────────────────────────────────────────────
interface CompatibilityInfo {
  canDonateTo: string[];
  canReceiveFrom: string[];
  title: string;
  description: string;
  rarity: string;
}

const COMPATIBILITY_DATA: Record<string, CompatibilityInfo> = {
  'O-': {
    canDonateTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    canReceiveFrom: ['O-'],
    title: 'Universal Red Cell Donor',
    description: 'O Negative red blood cells can be transfused to any patient in emergency situations when there is no time to test blood type.',
    rarity: '~7% of global population',
  },
  'O+': {
    canDonateTo: ['O+', 'A+', 'B+', 'AB+'],
    canReceiveFrom: ['O+', 'O-'],
    title: 'Most Needed Blood Type',
    description: 'O Positive is the most common blood type. In high demand at trauma centers and during critical surgeries.',
    rarity: '~38% of global population',
  },
  'A-': {
    canDonateTo: ['A-', 'A+', 'AB-', 'AB+'],
    canReceiveFrom: ['A-', 'O-'],
    title: 'Rare & Vital Type',
    description: 'Can donate to all A and AB types. Highly valuable for platelet and red cell donations.',
    rarity: '~6% of global population',
  },
  'A+': {
    canDonateTo: ['A+', 'AB+'],
    canReceiveFrom: ['A+', 'A-', 'O+', 'O-'],
    title: 'Second Most Common Type',
    description: 'One of the most frequently requested blood types in everyday hospital procedures.',
    rarity: '~34% of global population',
  },
  'B-': {
    canDonateTo: ['B-', 'B+', 'AB-', 'AB+'],
    canReceiveFrom: ['B-', 'O-'],
    title: 'Extremely Rare in West',
    description: 'B Negative is crucial for patients with rare blood disorders and specialized transfusions.',
    rarity: '~1.5% of global population',
  },
  'B+': {
    canDonateTo: ['B+', 'AB+'],
    canReceiveFrom: ['B+', 'B-', 'O+', 'O-'],
    title: 'High Prevalence in Asia',
    description: 'Widely prevalent in South Asia and essential for scheduled surgeries and cancer treatments.',
    rarity: '~9% of global population',
  },
  'AB-': {
    canDonateTo: ['AB-', 'AB+'],
    canReceiveFrom: ['AB-', 'A-', 'B-', 'O-'],
    title: 'Rarest Blood Group',
    description: 'The rarest blood type in the world. AB plasma is universal and can be given to all blood types.',
    rarity: '~0.6% of global population',
  },
  'AB+': {
    canDonateTo: ['AB+'],
    canReceiveFrom: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    title: 'Universal Red Cell Recipient',
    description: 'AB Positive individuals can safely receive red blood cells from any blood group in emergencies.',
    rarity: '~3% of global population',
  },
};

const ALL_BLOOD_GROUPS = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

interface LiveRadarItem {
  id: string;
  requestId: string;
  patientName: string;
  condition: string;
  bloodGroup: string;
  unitsRequired: number;
  hospital: string;
  city: string;
  location: string;
  urgency: string;
  status: string;
  broadcastTime: string | Date;
  broadcastTimeAgo: string;
  cluster: string;
  radiusKm: number;
  matchedDonor: {
    id: string;
    name: string;
    bloodGroup: string;
    isVerified: boolean;
    donorType: string;
    matchPercentage: number;
    distanceKm: number;
    city: string;
    phone: string;
    routeUrl?: string;
  };
}

const DEFAULT_RADAR_ITEMS: LiveRadarItem[] = [
  {
    id: 'curated-ahmedabad',
    requestId: 'REQ-2026-LIVE1',
    patientName: 'Aarav Patel',
    condition: 'Critical Surgery',
    bloodGroup: 'O-',
    unitsRequired: 2,
    hospital: 'Apollo Hospital',
    city: 'Ahmedabad',
    location: 'Bhat, Ahmedabad',
    urgency: 'Critical',
    status: 'Searching Donors',
    broadcastTime: new Date(Date.now() - 2 * 60 * 1000),
    broadcastTimeAgo: '2m ago',
    cluster: 'Ahmedabad Cluster',
    radiusKm: 25,
    matchedDonor: {
      id: 'donor-rahul',
      name: 'Rahul Sharma',
      bloodGroup: 'O-',
      isVerified: true,
      donorType: 'Universal Donor • 100% Match',
      matchPercentage: 100,
      distanceKm: 2.4,
      city: 'Ahmedabad',
      phone: '+91 98765 00001',
      routeUrl: 'https://www.google.com/maps/search/?api=1&query=Apollo+Hospital+Ahmedabad',
    },
  },
  {
    id: 'curated-surat',
    requestId: 'REQ-2026-LIVE2',
    patientName: 'Meera Kapadia',
    condition: 'Cardiac Surgery',
    bloodGroup: 'B+',
    unitsRequired: 3,
    hospital: 'Sunshine Global Hospital',
    city: 'Surat',
    location: 'Dumas Road, Surat',
    urgency: 'Critical',
    status: 'Searching Donors',
    broadcastTime: new Date(Date.now() - 5 * 60 * 1000),
    broadcastTimeAgo: '5m ago',
    cluster: 'Surat Cluster',
    radiusKm: 20,
    matchedDonor: {
      id: 'donor-pooja',
      name: 'Pooja Solanki',
      bloodGroup: 'B+',
      isVerified: true,
      donorType: 'Exact Match • 100% Match',
      matchPercentage: 100,
      distanceKm: 1.8,
      city: 'Surat',
      phone: '+91 98765 00002',
      routeUrl: 'https://www.google.com/maps/search/?api=1&query=Sunshine+Global+Hospital+Surat',
    },
  },
  {
    id: 'curated-vadodara',
    requestId: 'REQ-2026-LIVE3',
    patientName: 'Devang Vora',
    condition: 'Accident Trauma',
    bloodGroup: 'A+',
    unitsRequired: 2,
    hospital: 'Sterling Hospital',
    city: 'Vadodara',
    location: 'Race Course, Vadodara',
    urgency: 'Urgent',
    status: 'Searching Donors',
    broadcastTime: new Date(Date.now() - 11 * 60 * 1000),
    broadcastTimeAgo: '11m ago',
    cluster: 'Vadodara Cluster',
    radiusKm: 30,
    matchedDonor: {
      id: 'donor-vikram',
      name: 'Vikram Singh',
      bloodGroup: 'A+',
      isVerified: true,
      donorType: 'Verified Lifesaver • 100% Match',
      matchPercentage: 100,
      distanceKm: 3.1,
      city: 'Vadodara',
      phone: '+91 98765 00005',
      routeUrl: 'https://www.google.com/maps/search/?api=1&query=Sterling+Hospital+Vadodara',
    },
  },
];

export interface TestimonialStory {
  id: string;
  authorName: string;
  role: string;
  city: string;
  bloodGroup: string;
  content: string;
  rating: number;
  initials?: string;
  isApproved?: boolean;
}

const DEFAULT_STORIES: TestimonialStory[] = [
  {
    id: 'story-1',
    authorName: 'Dr. Aarav Mehta',
    role: 'Surgeon & Donor',
    city: 'Ahmedabad',
    bloodGroup: 'O+',
    content: 'When an emergency surgery required 3 units at 2:00 AM at Zydus Hospital, LifeLink matched us with nearby donors in under 10 minutes. A true medical miracle.',
    rating: 5,
    initials: 'DM',
    isApproved: true,
  },
  {
    id: 'story-2',
    authorName: 'Pooja Solanki',
    role: 'Recipient Mother',
    city: 'Surat',
    bloodGroup: 'B+',
    content: 'My 7-year-old daughter requires regular transfusions for Thalassemia. Through LifeLink, verified donors are always available when we need them. I owe them her smile.',
    rating: 5,
    initials: 'PS',
    isApproved: true,
  },
  {
    id: 'story-3',
    authorName: 'Vikramaditya J.',
    role: '12x Blood Donor',
    city: 'Rajkot',
    bloodGroup: 'O-',
    content: 'Donating blood takes just 15 minutes of my day, but knowing it helped a critical accident victim reach stable condition is priceless. The app GPS route directly guided me to the blood bank.',
    rating: 5,
    initials: 'VJ',
    isApproved: true,
  },
];

// ─── Main Landing Page Component ───────────────────────────────────────────
export function LandingPage() {
  const { isAuthenticated, user, isDonor, isAdmin, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  // Search State
  const [selectedGroup, setSelectedGroup] = useState('O+');
  const [selectedCity, setSelectedCity] = useState('Ahmedabad');
  const [urgencyLevel, setUrgencyLevel] = useState<'immediate' | '24hrs'>('immediate');

  // Compatibility matrix selected group
  const [activeMatrixGroup, setActiveMatrixGroup] = useState('O-');

  // FAQ Accordion State
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Mobile menu toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Language selector toggle
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  // ─── Dynamic Live Radar State & API Integration ──────────────────────────
  const [radarRequests, setRadarRequests] = useState<LiveRadarItem[]>(DEFAULT_RADAR_ITEMS);
  const [activeRadarIdx, setActiveRadarIdx] = useState(0);
  const [radarClusters, setRadarClusters] = useState<string[]>([
    'Ahmedabad Cluster',
    'Surat Cluster',
    'Vadodara Cluster',
    'Rajkot Cluster',
  ]);
  const [selectedRadarCluster, setSelectedRadarCluster] = useState<string>('Ahmedabad Cluster');
  const [clusterDropdownOpen, setClusterDropdownOpen] = useState(false);
  const [clusterSearch, setClusterSearch] = useState('');
  const [isRadarLoading, setIsRadarLoading] = useState(false);
  const [isRadarPaused, setIsRadarPaused] = useState(false);

  // Modals for dynamic interactions
  const [connectDonorModalItem, setConnectDonorModalItem] = useState<LiveRadarItem | null>(null);
  const [mapRouteModalItem, setMapRouteModalItem] = useState<{ name: string; address: string } | null>(null);

  // Fetch real-time live radar requests from API
  const fetchRadarData = async (clusterName?: string) => {
    try {
      setIsRadarLoading(true);
      const res = await requestApi.getPublicLiveRadar({
        cluster: clusterName || selectedRadarCluster,
      });
      if (res.data?.success && res.data?.data?.requests?.length > 0) {
        setRadarRequests(res.data.data.requests);
        if (res.data.data.clusters?.length > 0) {
          setRadarClusters(res.data.data.clusters);
        }
        if (res.data.data.selectedCluster) {
          setSelectedRadarCluster(res.data.data.selectedCluster);
        }
        setActiveRadarIdx(0);
      }
    } catch (err) {
      console.error('Error fetching dynamic live radar data:', err);
    } finally {
      setIsRadarLoading(false);
    }
  };

  useEffect(() => {
    fetchRadarData();
    const interval = setInterval(() => {
      fetchRadarData();
    }, 30000); // 30s background poll
    return () => clearInterval(interval);
  }, []);

  // Auto-cycle radar emergency requests every 7s when not hovered/paused
  useEffect(() => {
    if (isRadarPaused || radarRequests.length <= 1) return;
    const cycleTimer = setInterval(() => {
      setActiveRadarIdx((prev) => (prev + 1) % radarRequests.length);
    }, 7000);
    return () => clearInterval(cycleTimer);
  }, [isRadarPaused, radarRequests.length]);

  const handleSelectCluster = (cluster: string) => {
    const cleanCluster = cluster.trim().endsWith('Cluster') ? cluster.trim() : `${cluster.trim()} Cluster`;
    setSelectedRadarCluster(cleanCluster);
    setClusterDropdownOpen(false);
    setClusterSearch('');
    fetchRadarData(cleanCluster);
  };

  const handleNextRadar = () => {
    setActiveRadarIdx((prev) => (prev + 1) % radarRequests.length);
  };

  const handlePrevRadar = () => {
    setActiveRadarIdx((prev) => (prev - 1 + radarRequests.length) % radarRequests.length);
  };

  const currentRadarItem = radarRequests[activeRadarIdx] || radarRequests[0] || DEFAULT_RADAR_ITEMS[0];

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('BloodConnect_lang', lang);
    setLangDropdownOpen(false);
  };

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const bgParam = selectedGroup.replace('+', '_POS').replace('-', '_NEG');
    navigate(`/find-blood?bloodGroup=${bgParam}&city=${encodeURIComponent(selectedCity)}&urgency=${urgencyLevel}`);
  };

  // ─── Dynamic Testimonials State & Handlers ──────────────────────────────
  const [testimonials, setTestimonials] = useState<TestimonialStory[]>(DEFAULT_STORIES);
  const [isTestimonialsLoading, setIsTestimonialsLoading] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSubmittingStory, setIsSubmittingStory] = useState(false);
  const [storyForm, setStoryForm] = useState({
    authorName: '',
    role: 'Verified Donor',
    city: 'Ahmedabad',
    bloodGroup: 'O+',
    rating: 5,
    content: '',
  });

  const fetchTestimonials = async () => {
    try {
      setIsTestimonialsLoading(true);
      const res = await testimonialApi.getAll();
      if (res.data?.success && Array.isArray(res.data?.data) && res.data.data.length > 0) {
        setTestimonials(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load testimonials:', err);
    } finally {
      setIsTestimonialsLoading(false);
    }
  };

  const [platformStats, setPlatformStats] = useState<{
    totalDonors: number;
    activeRequests: number;
    completedDonations: number;
    totalUsers: number;
    avgResponseMinutes: number;
  }>({
    totalDonors: 15200,
    activeRequests: 42,
    completedDonations: 45000,
    totalUsers: 25000,
    avgResponseMinutes: 8,
  });

  useEffect(() => {
    fetchTestimonials();
    analyticsApi.getPublicStats()
      .then(res => {
        if (res.data?.success && res.data?.data) {
          setPlatformStats(res.data.data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user) {
      setStoryForm((prev) => ({
        ...prev,
        authorName: prev.authorName || user.fullName || (user as any).name || '',
        role: prev.role || (isDonor ? 'Verified Donor' : 'Community Lifesaver'),
      }));
    }
  }, [user, isDonor]);

  const handleShareStorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyForm.authorName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!storyForm.content.trim() || storyForm.content.trim().length < 10) {
      toast.error('Story must be at least 10 characters long');
      return;
    }
    try {
      setIsSubmittingStory(true);
      const res = await testimonialApi.create({
        authorName: storyForm.authorName.trim(),
        role: storyForm.role.trim() || 'Verified Lifesaver',
        city: storyForm.city.trim() || 'Ahmedabad',
        bloodGroup: storyForm.bloodGroup,
        rating: storyForm.rating,
        content: storyForm.content.trim(),
      });
      if (res.data?.success) {
        toast.success(res.data.message || 'Thank you! Your hero story has been published.');
        setIsShareModalOpen(false);
        setStoryForm({
          authorName: user?.fullName || (user as any)?.name || '',
          role: isDonor ? 'Verified Donor' : 'Community Lifesaver',
          city: 'Ahmedabad',
          bloodGroup: 'O+',
          rating: 5,
          content: '',
        });
        await fetchTestimonials();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to submit story. Please try again.');
    } finally {
      setIsSubmittingStory(false);
    }
  };

  const getDashboardRoute = () => {
    if (isSuperAdmin) return '/super-admin/dashboard';
    if (isAdmin) return '/admin/dashboard';
    if (isDonor) return '/donor/dashboard';
    return '/user/dashboard';
  };

  return (
    <div className="min-h-screen bg-[#FDFBFB] text-gray-900 font-sans selection:bg-red-500 selection:text-white">
      {/* ─── 1. Sticky Glassmorphic Navigation Bar ────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-rose-100 shadow-2xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-white shadow-md shadow-red-600/20 group-hover:scale-105 transition-transform">
              <Heart className="w-6 h-6 fill-white animate-heart-beat" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-gray-900">
                Life<span className="text-primary">Link</span>
              </span>
              <p className="text-[10px] font-semibold tracking-wider uppercase text-gray-400">
                Connecting Donors. Saving Lives.
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-8">
            <a href="#search" className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors">
              Find Blood
            </a>
            <a href="#how-it-works" className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors">
              How It Works
            </a>
            <a href="#compatibility" className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors">
              Blood Compatibility
            </a>
            <a href="#impact" className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors">
              Impact
            </a>
            <a href="#faqs" className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors">
              FAQs
            </a>
          </nav>

          {/* Right Controls */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Language Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors focus:outline-none"
              >
                <Globe size={14} className="text-gray-500" />
                <span>{i18n.language.toUpperCase()}</span>
                <ChevronDown size={12} className="text-gray-400" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50">
                  <button
                    onClick={() => handleLanguageChange('en')}
                    className={`w-full text-left px-3.5 py-1.5 text-xs font-semibold ${i18n.language === 'en' ? 'text-primary bg-rose-50' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    English (EN)
                  </button>
                  <button
                    onClick={() => handleLanguageChange('gu')}
                    className={`w-full text-left px-3.5 py-1.5 text-xs font-semibold ${i18n.language === 'gu' ? 'text-primary bg-rose-50' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    ગુજરાતી (GU)
                  </button>
                  <button
                    onClick={() => handleLanguageChange('hi')}
                    className={`w-full text-left px-3.5 py-1.5 text-xs font-semibold ${i18n.language === 'hi' ? 'text-primary bg-rose-50' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    हिन्दी (HI)
                  </button>
                </div>
              )}
            </div>

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <Link
                to={getDashboardRoute()}
                className="px-5 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary-dark transition-all shadow-sm flex items-center gap-1.5"
              >
                <span>Dashboard</span>
                <ArrowRight size={14} />
              </Link>
            ) : (
              <>
                <Link
                  to={ROUTES.LOGIN}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold text-gray-700 hover:text-primary hover:bg-rose-50/50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to={`${ROUTES.REGISTER}?role=DONOR`}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white shadow-md shadow-red-600/20 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Droplet size={14} className="fill-white" />
                  <span>Become a Donor</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-b border-rose-100 bg-white/95 px-4 pt-2 pb-6 space-y-3">
            <nav className="flex flex-col space-y-2">
              <a
                href="#search"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-bold text-gray-700 hover:text-primary rounded-lg hover:bg-rose-50"
              >
                Find Blood
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-bold text-gray-700 hover:text-primary rounded-lg hover:bg-rose-50"
              >
                How It Works
              </a>
              <a
                href="#compatibility"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-bold text-gray-700 hover:text-primary rounded-lg hover:bg-rose-50"
              >
                Blood Compatibility
              </a>
              <a
                href="#impact"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-bold text-gray-700 hover:text-primary rounded-lg hover:bg-rose-50"
              >
                Impact
              </a>
              <a
                href="#faqs"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-bold text-gray-700 hover:text-primary rounded-lg hover:bg-rose-50"
              >
                FAQs
              </a>
            </nav>

            <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
              {isAuthenticated ? (
                <Link
                  to={getDashboardRoute()}
                  className="w-full text-center py-2.5 rounded-xl font-bold bg-primary text-white"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to={ROUTES.LOGIN}
                    className="w-full text-center py-2.5 rounded-xl font-bold text-gray-700 border border-gray-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    to={`${ROUTES.REGISTER}?role=DONOR`}
                    className="w-full text-center py-2.5 rounded-xl font-bold bg-primary text-white shadow-md shadow-red-600/20"
                  >
                    Become a Donor
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ─── 2. Hero Section ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24">
        {/* Background ambient radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none -z-10">
          <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-red-200/50 via-rose-100/30 to-transparent blur-3xl rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Emergency Status Pill */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-red-50 border border-red-200 shadow-2xs">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-red-700">
                  24/7 Real-Time Emergency Matching Active
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.1]">
                Every Drop Counts. <br />
                <span className="bg-gradient-to-r from-red-600 via-rose-600 to-red-800 bg-clip-text text-transparent">
                  A Single Donation Can Save 3 Lives.
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-lg text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Connect instantly with verified local blood donors and emergency requests in your city. Safe, rapid, and community-powered.
              </p>

              {/* Dual CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <a
                  href="#search"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl font-extrabold text-base bg-primary hover:bg-primary-dark text-white shadow-xl shadow-red-600/25 active:scale-95 transition-all flex items-center justify-center gap-2.5 group"
                >
                  <Search size={18} />
                  <span>Find Blood Now</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </a>

                <Link
                  to={`${ROUTES.REGISTER}?role=DONOR`}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl font-extrabold text-base bg-white hover:bg-rose-50/60 text-gray-800 border-2 border-gray-200 hover:border-red-300 shadow-xs active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Heart size={18} className="text-primary fill-red-100" />
                  <span>Register as Donor</span>
                </Link>
              </div>

              {/* Social Proof */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <div className="flex -space-x-2.5 overflow-hidden p-0.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-2 ring-white bg-red-100 text-primary font-bold text-xs leading-none shadow-xs">
                    RS
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-2 ring-white bg-blue-100 text-blue-700 font-bold text-xs leading-none shadow-xs">
                    AP
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-2 ring-white bg-emerald-100 text-emerald-700 font-bold text-xs leading-none shadow-xs">
                    PD
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-2 ring-white bg-purple-100 text-purple-700 font-bold text-xs leading-none shadow-xs">
                    VK
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-2 ring-white bg-red-600 text-white font-black text-[11px] leading-none shadow-xs tracking-tight">
                    +15k
                  </div>
                </div>


                <div className="text-left text-xs">
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-gray-900 ml-1">4.9 / 5.0</span>
                  </div>
                  <p className="text-gray-500 mt-0.5">
                    Trusted by <strong className="text-gray-800 font-semibold">15,000+ registered donors</strong> & 120+ certified hospitals
                  </p>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Card - Dynamic Real-Time Matching Radar */}
            <div
              className="lg:col-span-5 relative"
              onMouseEnter={() => setIsRadarPaused(true)}
              onMouseLeave={() => setIsRadarPaused(false)}
            >
              <div className="relative mx-auto max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-red-100 transition-all duration-300 hover:shadow-red-500/10">
                {/* Simulation Top Bar */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                    </span>
                    <span className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                      Live Matching Radar
                    </span>
                    {isRadarLoading && (
                      <RefreshCw size={11} className="text-gray-400 animate-spin ml-1" />
                    )}
                  </div>

                  {/* Interactive Dynamic Cluster Selector */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setClusterDropdownOpen(!clusterDropdownOpen)}
                      className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors flex items-center gap-1 focus:outline-none cursor-pointer"
                    >
                      <span>{currentRadarItem.cluster || selectedRadarCluster}</span>
                      <ChevronDown size={12} className={`transition-transform duration-200 ${clusterDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {clusterDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 flex items-center justify-between">
                          <span>Dynamic Radar Clusters</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-50 text-primary font-bold">Live</span>
                        </div>

                        {/* Search or Add City input */}
                        <div className="p-2 border-b border-gray-100">
                          <div className="relative">
                            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              value={clusterSearch}
                              onChange={(e) => setClusterSearch(e.target.value)}
                              placeholder="Search or add city..."
                              className="w-full pl-7 pr-2 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && clusterSearch.trim()) {
                                  handleSelectCluster(clusterSearch.trim());
                                }
                              }}
                            />
                          </div>
                        </div>

                        {/* Clusters list */}
                        <div className="max-h-52 overflow-y-auto">
                          {radarClusters
                            .filter(c => !clusterSearch.trim() || c.toLowerCase().includes(clusterSearch.trim().toLowerCase()))
                            .map((cluster) => (
                              <button
                                key={cluster}
                                type="button"
                                onClick={() => handleSelectCluster(cluster)}
                                className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between transition-colors ${
                                  selectedRadarCluster === cluster ? 'text-primary bg-rose-50 font-bold' : 'text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                <span>{cluster}</span>
                                {selectedRadarCluster === cluster && <Check size={14} className="text-primary" />}
                              </button>
                            ))}

                          {/* Instant Custom City Addition */}
                          {clusterSearch.trim() && !radarClusters.some(c => c.toLowerCase() === clusterSearch.trim().toLowerCase() || c.toLowerCase() === `${clusterSearch.trim().toLowerCase()} cluster`) && (
                            <button
                              type="button"
                              onClick={() => handleSelectCluster(clusterSearch.trim())}
                              className="w-full text-left px-3.5 py-2.5 text-xs font-bold text-primary bg-rose-50/80 hover:bg-rose-100 transition-colors flex items-center gap-1.5 border-t border-rose-100/50"
                            >
                              <span>+ Center on "{clusterSearch.trim()}" Cluster</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Patient Request Card */}
                <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-100 space-y-2 mb-4 relative overflow-hidden transition-all duration-300">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase font-extrabold tracking-wider text-rose-600 block">
                          Incoming Emergency Request
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                      </div>
                      <h4 className="font-extrabold text-gray-900 text-base truncate">
                        {currentRadarItem.patientName} ({currentRadarItem.condition})
                      </h4>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                        <Building2 size={12} className="text-gray-400 flex-shrink-0" />
                        <span className="truncate">{currentRadarItem.hospital}, {currentRadarItem.city}</span>
                      </p>
                    </div>

                    {/* Blood Group Badge */}
                    <span className="w-12 h-12 rounded-xl bg-red-600 text-white font-black text-lg flex items-center justify-center shadow-md shadow-red-600/20 flex-shrink-0 animate-scale-in">
                      {currentRadarItem.bloodGroup}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-rose-100/80">
                    <span className="font-semibold text-rose-800">
                      Required: {currentRadarItem.unitsRequired} {currentRadarItem.unitsRequired === 1 ? 'Unit' : 'Units'}
                    </span>
                    <span className="text-gray-500 flex items-center gap-1">
                      <Clock size={12} /> Broadcasted {currentRadarItem.broadcastTimeAgo}
                    </span>
                  </div>
                </div>

                {/* Radar Matching Pulse Graphic */}
                <div className="relative py-3 flex flex-col items-center justify-center">
                  <div className="w-24 h-24 rounded-full border border-red-200/80 flex items-center justify-center relative">
                    <div className="absolute inset-0 rounded-full border border-red-400/40 animate-ping opacity-60 pointer-events-none" />
                    <div className="w-16 h-16 rounded-full border border-red-300 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shadow-inner">
                        <Radio size={16} className="text-primary animate-spin" />
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-gray-500 mt-2 flex items-center gap-1">
                    <span>Scanning {currentRadarItem.radiusKm || 25} km Radius Algorithm...</span>
                  </span>
                </div>

                {/* Matched Donor Notification */}
                <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200 space-y-2 transition-all duration-300 shadow-2xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm">
                        <Check size={16} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h5 className="font-bold text-sm text-gray-900 truncate">
                            {currentRadarItem.matchedDonor.name}
                          </h5>
                          <ShieldCheck size={14} className="text-emerald-600 flex-shrink-0" />
                        </div>
                        <p className="text-[11px] text-gray-500 truncate">
                          {currentRadarItem.matchedDonor.donorType}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md flex-shrink-0">
                      {currentRadarItem.matchedDonor.distanceKm} km away
                    </span>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setConnectDonorModalItem(currentRadarItem)}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs text-center transition-colors shadow-sm active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Phone size={13} />
                      <span>Connect with Donor</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMapRouteModalItem({
                        name: currentRadarItem.hospital,
                        address: `${currentRadarItem.hospital}, ${currentRadarItem.location || currentRadarItem.city}`,
                      })}
                      className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs active:scale-95 cursor-pointer"
                    >
                      <Navigation size={13} className="text-primary" />
                      <span>Route</span>
                    </button>
                  </div>
                </div>

                {/* Radar Carousel Pagination strip if multiple requests */}
                {radarRequests.length > 1 && (
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 text-xs text-gray-400">
                    <span className="text-[11px] font-semibold text-gray-500">
                      Live Case {activeRadarIdx + 1} of {radarRequests.length}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handlePrevRadar}
                        className="p-1 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
                        title="Previous Emergency Case"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <div className="flex gap-1">
                        {radarRequests.map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setActiveRadarIdx(i)}
                            className={`h-1.5 rounded-full transition-all cursor-pointer ${
                              activeRadarIdx === i ? 'w-4 bg-red-600' : 'w-1.5 bg-gray-200 hover:bg-gray-300'
                            }`}
                            aria-label={`Go to case ${i + 1}`}
                          />
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={handleNextRadar}
                        className="p-1 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
                        title="Next Emergency Case"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. Quick Emergency Blood Search Bar ──────────────────────────────── */}
      <section id="search" className="relative z-30 max-w-6xl mx-auto px-4 sm:px-6 -mt-4 mb-20">
        <div className="bg-white/95 backdrop-blur-xl border border-red-100 shadow-2xl rounded-3xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-primary flex items-center justify-center">
                <Search size={20} />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">Quick Emergency Blood Finder</h3>
                <p className="text-xs text-gray-500">Search compatible, verified donors active near your hospital</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Verified GPS Directory
            </span>
          </div>

          <form onSubmit={handleQuickSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
            {/* Blood Group */}
            <div className="lg:col-span-3">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Blood Group Needed *
              </label>
              <div className="relative">
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-bold text-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none cursor-pointer"
                >
                  {ALL_BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg} Blood Group
                    </option>
                  ))}
                </select>
                <Droplet size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-primary pointer-events-none fill-red-100" />
              </div>
            </div>

            {/* City / Location */}
            <div className="lg:col-span-4">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                City / Location *
              </label>
              <div className="relative">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-bold text-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none cursor-pointer"
                >
                  <option value="Ahmedabad">Ahmedabad, Gujarat</option>
                  <option value="Surat">Surat, Gujarat</option>
                  <option value="Vadodara">Vadodara, Gujarat</option>
                  <option value="Rajkot">Rajkot, Gujarat</option>
                  <option value="Bhavnagar">Bhavnagar, Gujarat</option>
                  <option value="Gandhinagar">Gandhinagar, Gujarat</option>
                  <option value="Jamnagar">Jamnagar, Gujarat</option>
                  <option value="Vapi">Vapi / Valsad, Gujarat</option>
                </select>
                <MapPin size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Urgency Selector */}
            <div className="lg:col-span-3">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Requirement Urgency
              </label>
              <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200 h-12 items-center">
                <button
                  type="button"
                  onClick={() => setUrgencyLevel('immediate')}
                  className={`flex-1 h-full rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1 ${
                    urgencyLevel === 'immediate' ? 'bg-red-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Zap size={13} />
                  <span>&lt; 2 Hours</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUrgencyLevel('24hrs')}
                  className={`flex-1 h-full rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1 ${
                    urgencyLevel === '24hrs' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Clock size={13} />
                  <span>24 Hours</span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="lg:col-span-2">
              <button
                type="submit"
                className="w-full h-12 bg-primary hover:bg-primary-dark text-white font-extrabold rounded-xl shadow-md shadow-red-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Search size={16} />
                <span>Search</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ─── 4. Live Impact & Stats Counter ──────────────────────────────────── */}
      <section id="impact" className="py-16 bg-white border-y border-rose-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-primary bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
              Verified Platform Numbers
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              Community Impact That Saves Lives Daily
            </h2>
            <p className="text-sm sm:text-base text-gray-500">
              Transparent, real-time statistics powered by decentralized community donors across Gujarat and India.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Stat 1 */}
            <div className="bg-gradient-to-br from-rose-50/50 to-white p-7 rounded-3xl border border-rose-100/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <HeartHandshake size={24} />
              </div>
              <p className="text-4xl font-black text-gray-900 tracking-tight">
                {platformStats.completedDonations > 0 ? `${platformStats.completedDonations.toLocaleString()}+` : '45,000+'}
              </p>
              <h4 className="text-base font-bold text-gray-800 mt-1">Lives Saved</h4>
              <p className="text-xs text-gray-500 mt-1">Successful transfusions verified by partner hospitals.</p>
            </div>

            {/* Stat 2 */}
            <div className="bg-gradient-to-br from-rose-50/50 to-white p-7 rounded-3xl border border-rose-100/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users size={24} />
              </div>
              <p className="text-4xl font-black text-gray-900 tracking-tight">
                {platformStats.totalDonors > 0 ? `${platformStats.totalDonors.toLocaleString()}+` : '15,200+'}
              </p>
              <h4 className="text-base font-bold text-gray-800 mt-1">Verified Donors</h4>
              <p className="text-xs text-gray-500 mt-1">Medically screened voluntary donors ready on standby.</p>
            </div>

            {/* Stat 3 */}
            <div className="bg-gradient-to-br from-rose-50/50 to-white p-7 rounded-3xl border border-rose-100/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap size={24} />
              </div>
              <p className="text-4xl font-black text-gray-900 tracking-tight">
                &lt; {platformStats.avgResponseMinutes || 12} min
              </p>
              <h4 className="text-base font-bold text-gray-800 mt-1">Avg. Match Time</h4>
              <p className="text-xs text-gray-500 mt-1">From emergency request submission to donor confirmation.</p>
            </div>

            {/* Stat 4 */}
            <div className="bg-gradient-to-br from-rose-50/50 to-white p-7 rounded-3xl border border-rose-100/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Building2 size={24} />
              </div>
              <p className="text-4xl font-black text-gray-900 tracking-tight">
                {platformStats.totalUsers > 0 ? `${platformStats.totalUsers.toLocaleString()}+` : '120+'}
              </p>
              <h4 className="text-base font-bold text-gray-800 mt-1">Community Members</h4>
              <p className="text-xs text-gray-500 mt-1">Volunteers, accredited blood banks, and healthcare facilities.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. How It Works (3 Simple Steps) ─────────────────────────────────── */}
      <section id="how-it-works" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-wider text-primary bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            Simple, Rapid, & Secure
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            How LifeLink Operates in 3 Steps
          </h2>
          <p className="text-sm sm:text-base text-gray-500">
            Designed for high-stress emergency situations with zero unnecessary delays or paperwork.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-all relative group">
            <span className="text-6xl font-black text-red-100/80 absolute top-6 right-6 select-none group-hover:text-red-200 transition-colors">
              01
            </span>
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-primary flex items-center justify-center mb-6 shadow-2xs">
              <Heart size={26} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Request or Register</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Submit patient blood requirements (hospital, blood group, units) or register your voluntary donor profile in under 2 minutes.
            </p>
            <ul className="text-xs text-gray-500 space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-600" /> Instant verification with hospital slips
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-600" /> 100% confidential contact details
              </li>
            </ul>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-3xl p-8 border border-red-200 shadow-md relative group">
            <span className="text-6xl font-black text-red-100/80 absolute top-6 right-6 select-none group-hover:text-red-200 transition-colors">
              02
            </span>
            <div className="w-14 h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center mb-6 shadow-md shadow-red-600/30">
              <Radio size={26} className="animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Instant Smart Matching</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Our automated matching algorithm instantly notifies compatible, verified donors located within your preferred city radius.
            </p>
            <ul className="text-xs text-gray-500 space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-600" /> Automated compatibility checks
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-600" /> Instant Push & SMS broadcast
              </li>
            </ul>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-all relative group">
            <span className="text-6xl font-black text-red-100/80 absolute top-6 right-6 select-none group-hover:text-red-200 transition-colors">
              03
            </span>
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-primary flex items-center justify-center mb-6 shadow-2xs">
              <Navigation size={26} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Connect & Save Lives</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Coordinate direct donation or hospital transfer safely with built-in turn-by-turn GPS navigation and real-time updates.
            </p>
            <ul className="text-xs text-gray-500 space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-600" /> Live GPS directions to hospital
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-600" /> Verified donation completion badge
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ─── 6. Interactive Blood Compatibility Matrix ────────────────────────── */}
      <section id="compatibility" className="py-20 bg-rose-50/40 border-y border-rose-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-primary bg-white px-3 py-1 rounded-full border border-rose-200 shadow-2xs">
              Medical Transfusion Guide
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              Interactive Blood Compatibility Matrix
            </h2>
            <p className="text-sm sm:text-base text-gray-500">
              Select any blood group below to see which groups they can donate blood to and receive blood from.
            </p>
          </div>

          {/* Blood Type Selection Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mb-10 max-w-3xl mx-auto">
            {ALL_BLOOD_GROUPS.map((bg) => {
              const isSelected = activeMatrixGroup === bg;
              return (
                <button
                  key={bg}
                  type="button"
                  onClick={() => setActiveMatrixGroup(bg)}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl font-black text-lg transition-all focus:outline-none flex flex-col items-center justify-center ${
                    isSelected
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 scale-105 ring-4 ring-red-200'
                      : 'bg-white text-gray-800 border border-gray-200 hover:border-red-300 hover:bg-rose-50/50'
                  }`}
                >
                  <span>{bg}</span>
                </button>
              );
            })}
          </div>

          {/* Matrix Detail Display */}
          {(() => {
            const data = COMPATIBILITY_DATA[activeMatrixGroup];
            return (
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-red-100 shadow-xl max-w-4xl mx-auto space-y-8">
                {/* Header for Selected Group */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 border-b border-gray-100 pb-6 text-center sm:text-left">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-red-600 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-red-600/20">
                      {activeMatrixGroup}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 justify-center sm:justify-start">
                        <h3 className="text-xl font-black text-gray-900">{data.title}</h3>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-primary border border-rose-200">
                          {data.rarity}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-xl">{data.description}</p>
                    </div>
                  </div>
                </div>

                {/* Compatibility Grids */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Can Donate To */}
                  <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100 space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                        <Check size={14} />
                      </div>
                      <h4 className="font-extrabold text-gray-900 text-sm">
                        Can Donate Red Blood Cells To:
                      </h4>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {ALL_BLOOD_GROUPS.map((group) => {
                        const isCompatible = data.canDonateTo.includes(group);
                        return (
                          <div
                            key={group}
                            className={`py-2 px-1 rounded-xl text-center font-extrabold text-xs transition-all ${
                              isCompatible
                                ? 'bg-emerald-600 text-white shadow-2xs scale-100'
                                : 'bg-gray-100 text-gray-300 opacity-40'
                            }`}
                          >
                            {group}
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-[11px] text-emerald-800 font-medium">
                      Compatible with <strong>{data.canDonateTo.length} of 8</strong> blood groups.
                    </p>
                  </div>

                  {/* Can Receive From */}
                  <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                        <Droplet size={14} className="fill-white" />
                      </div>
                      <h4 className="font-extrabold text-gray-900 text-sm">
                        Can Safely Receive Red Cells From:
                      </h4>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {ALL_BLOOD_GROUPS.map((group) => {
                        const isCompatible = data.canReceiveFrom.includes(group);
                        return (
                          <div
                            key={group}
                            className={`py-2 px-1 rounded-xl text-center font-extrabold text-xs transition-all ${
                              isCompatible
                                ? 'bg-blue-600 text-white shadow-2xs scale-100'
                                : 'bg-gray-100 text-gray-300 opacity-40'
                            }`}
                          >
                            {group}
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-[11px] text-blue-800 font-medium">
                      Can safely receive from <strong>{data.canReceiveFrom.length} of 8</strong> blood groups.
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* ─── 7. Donor Stories & Testimonials ─────────────────────────────────── */}
      <section id="testimonials" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary bg-rose-50 border border-rose-200 px-3.5 py-1.5 rounded-full">
              <Sparkles size={13} className="text-primary animate-pulse" />
              <span>Real Stories, Real Impact</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              Hear From Our Community of Heroes
            </h2>
            <p className="text-sm sm:text-base text-gray-500">
              Every day, ordinary citizens step forward to become extraordinary lifesavers. Read their stories or share your experience.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={() => fetchTestimonials()}
              className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
              title="Refresh stories"
            >
              <RefreshCw size={16} className={isTestimonialsLoading ? 'animate-spin text-primary' : ''} />
            </button>
            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
            >
              <Heart size={16} className="fill-white" />
              <span>+ Share Your Story</span>
            </button>
          </div>
        </div>

        {/* Dynamic Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item, idx) => {
            const avatarColors = [
              'bg-blue-100 text-blue-800',
              'bg-rose-100 text-rose-800',
              'bg-emerald-100 text-emerald-800',
              'bg-amber-100 text-amber-800',
              'bg-purple-100 text-purple-800',
              'bg-indigo-100 text-indigo-800',
            ];
            const colorClass = avatarColors[idx % avatarColors.length];
            const isFeatured = idx === 1;

            return (
              <div
                key={item.id || idx}
                className={`bg-white rounded-3xl p-8 border space-y-4 flex flex-col justify-between transition-all duration-300 hover:shadow-lg relative overflow-hidden ${
                  isFeatured ? 'border-red-200 shadow-md ring-1 ring-red-100' : 'border-gray-200 shadow-sm'
                }`}
              >
                {isFeatured && (
                  <div className="absolute top-0 right-0 w-28 h-28 bg-red-50/70 rounded-bl-full -z-0 pointer-events-none" />
                )}

                <div className="space-y-3 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[1, 2, 3, 4, 5].map((starIdx) => (
                        <Star
                          key={starIdx}
                          size={15}
                          className={starIdx <= (item.rating || 5) ? 'fill-amber-400' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                    {item.isApproved && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        <CheckCircle size={11} className="text-emerald-600" />
                        Verified Story
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-700 italic leading-relaxed">
                    "{item.content}"
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full font-black flex items-center justify-center text-sm shadow-xs ${colorClass}`}
                    >
                      {item.initials || item.authorName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">{item.authorName}</h4>
                      <p className="text-xs text-gray-500">
                        {item.role || 'Lifesaver'} • {item.city}
                      </p>
                    </div>
                  </div>
                  <span className="w-9 h-9 rounded-xl bg-red-50 text-red-600 font-extrabold text-xs flex items-center justify-center border border-red-100 shadow-2xs">
                    {item.bloodGroup}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── 8. Mobile App Promotion ─────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-900 to-red-950 text-white relative overflow-hidden">
        {/* Background glow accent */}
        <div className="absolute top-1/2 right-10 -translate-y-1/2 w-96 h-96 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-bold uppercase tracking-wider">
                <Smartphone size={14} /> Mobile App for Android & iOS
              </div>

              <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                Emergency Alerts In Your Pocket. <br />
                <span className="bg-gradient-to-r from-red-400 to-rose-300 bg-clip-text text-transparent">
                  Download the LifeLink Mobile App.
                </span>
              </h2>

              <p className="text-base text-gray-300 max-w-xl leading-relaxed">
                Receive instant priority alerts whenever a compatible emergency blood request is issued near you. Features turn-by-turn hospital GPS navigation and digital donor cards.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-sm text-gray-200">
                  <CheckCircle size={18} className="text-red-400 shrink-0" />
                  <span>Real-time push notifications for urgent local requirements</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-200">
                  <CheckCircle size={18} className="text-red-400 shrink-0" />
                  <span>Integrated Google Maps directions straight to hospital blood banks</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-200">
                  <CheckCircle size={18} className="text-red-400 shrink-0" />
                  <span>Automated 90-day donation interval eligibility tracker</span>
                </div>
              </div>

              {/* App Store Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <a
                  href="#download"
                  className="px-6 py-3.5 rounded-2xl bg-white text-gray-900 font-extrabold text-sm hover:bg-gray-100 transition-all flex items-center gap-3 shadow-lg active:scale-95 border border-gray-100"
                >
                  <svg className="w-7 h-7 fill-current shrink-0 text-gray-900" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.87-.9.04-2 .6-2.64 1.36-.56.65-.99 1.71-.86 2.76 1.01.08 2.05-.53 2.58-1.25z" />
                  </svg>
                  <div className="text-left">
                    <p className="text-[10px] uppercase font-semibold text-gray-500 leading-none">Download on the</p>
                    <p className="text-base font-bold leading-tight mt-0.5">App Store</p>
                  </div>
                </a>

                <a
                  href="#download"
                  className="px-6 py-3.5 rounded-2xl bg-gray-900 text-white border border-gray-700/80 hover:bg-gray-800 font-extrabold text-sm transition-all flex items-center gap-3 shadow-lg active:scale-95"
                >
                  <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M3.609 1.814L13.792 12 3.61 22.186A2.22 2.22 0 0 1 3 20.61V3.39c0-.606.223-1.168.609-1.576z"
                      fill="#00E676"
                    />
                    <path
                      d="M17.18 8.614l-3.388 3.386 3.388 3.386 3.864-2.22c1.104-.635 1.104-1.698 0-2.332l-3.864-2.22z"
                      fill="#FFD600"
                    />
                    <path
                      d="M3.609 1.814l10.183 10.186 3.388-3.386L6.535 2.527C5.463 1.91 4.305 1.488 3.609 1.814z"
                      fill="#00B0FF"
                    />
                    <path
                      d="M3.609 22.186c.696.326 1.854-.096 2.926-.713l10.645-6.087-3.388-3.386L3.609 22.186z"
                      fill="#FF3D00"
                    />
                  </svg>
                  <div className="text-left">
                    <p className="text-[10px] uppercase font-semibold text-gray-400 leading-none">Get it on</p>
                    <p className="text-base font-bold leading-tight mt-0.5">Google Play</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Mockup Frame */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-72 sm:w-80 h-[520px] bg-gray-800 rounded-[44px] p-3 shadow-2xl border-4 border-gray-700 relative">
                {/* Speaker pill */}
                <div className="w-24 h-4 bg-gray-900 rounded-full mx-auto mb-2" />
                {/* Inner Screen */}
                <div className="w-full h-[470px] bg-white rounded-[32px] overflow-hidden text-gray-900 p-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <span className="font-black text-sm text-red-600">LifeLink Mobile</span>
                      <span className="text-[10px] font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                        ● GPS Live
                      </span>
                    </div>

                    <div className="bg-red-500 text-white p-3.5 rounded-2xl space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span>🔴 CRITICAL MATCH</span>
                        <span>O- NEEDED</span>
                      </div>
                      <p className="text-xs font-medium">Civil Hospital • 1.8 km</p>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-xl space-y-1.5 border border-gray-100">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Your Donor Status</span>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-gray-800">Eligibility: Now Available</span>
                        <CheckCircle size={14} className="text-emerald-600" />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-gray-900 text-white text-center font-bold text-xs">
                    Tap to Accept & Navigate
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 9. Interactive FAQs Section ──────────────────────────────────────── */}
      <section id="faqs" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-wider text-primary bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            Got Questions?
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-gray-500">
            Everything you need to know about blood donation safety, matching, and hospital coordination.
          </p>
        </div>

        <div className="space-y-4">
          {[
            {
              q: 'Who is eligible to donate blood through LifeLink?',
              a: 'Any individual aged between 18 and 65 years, weighing at least 45 kg, with a hemoglobin count above 12.5 g/dL and in good general health. A mandatory 90-day interval for males and 120-day interval for females is required between whole blood donations.',
            },
            {
              q: 'How fast does the emergency matching algorithm notify donors?',
              a: 'When an emergency request is broadcasted, our system checks compatible blood groups within the specified radius (5 to 50 km) and sends instant push notifications and SMS within 30 to 90 seconds. Average confirmed donor response time is 8 minutes.',
            },
            {
              q: 'Is my personal contact information kept private and secure?',
              a: 'Yes, absolutely. LifeLink never publicly exposes your personal phone number or home address. Contact details are securely coordinated only with verified hospital desks or mutually accepted emergency requesters.',
            },
            {
              q: 'Are blood donations voluntary or paid?',
              a: 'All donations on LifeLink are strictly 100% voluntary, altruistic, and free of cost, in compliance with the National Blood Transfusion Council regulations. Commercial blood buying or selling is strictly illegal and prohibited.',
            },
            {
              q: 'How are hospital blood requests verified?',
              a: 'Blood requests must submit hospital admission details, doctor prescription slips, or hospital contact numbers. Our accredited Admin & Hospital review team verifies critical cases before issuing verified high-priority badges.',
            },
          ].map((item, idx) => {
            const isOpen = expandedFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setExpandedFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left font-bold text-gray-900 flex items-center justify-between gap-4 focus:outline-none hover:bg-gray-50/50 transition-colors"
                >
                  <span className="text-base sm:text-lg">{item.q}</span>
                  <div className="w-8 h-8 rounded-full bg-rose-50 text-primary flex items-center justify-center shrink-0">
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── 10. Footer ──────────────────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
        {/* Emergency Helpline Banner */}
        <div className="bg-red-600 text-white py-4 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2.5">
              <AlertTriangle size={20} className="animate-pulse" />
              <span className="font-extrabold text-sm sm:text-base">
                Critical Medical Emergency? Call 24/7 Helpline: 1800-120-BLOOD (Toll Free) or Dial 108
              </span>
            </div>
            <Link
              to={ROUTES.REQUEST_CREATE}
              className="px-4 py-1.5 rounded-xl bg-white text-red-700 hover:bg-gray-100 font-extrabold text-xs transition-colors shadow-sm"
            >
              Post Emergency Request
            </Link>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
            {/* Brand column */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white">
                  <Heart size={18} className="fill-white" />
                </div>
                <span className="text-xl font-black text-white">
                  Life<span className="text-red-500">Link</span>
                </span>
              </div>
              <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
                India's decentralized, real-time blood donor network connecting critical hospital emergency requests directly with voluntary lifesavers.
              </p>
              <div className="flex items-center gap-3 pt-2 text-gray-400">
                <span className="text-xs">Connecting Donors. Saving Lives.</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Quick Links</h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <a href="#search" className="hover:text-white transition-colors">
                    Find Blood Donors
                  </a>
                </li>
                <li>
                  <Link to={`${ROUTES.REGISTER}?role=DONOR`} className="hover:text-white transition-colors">
                    Become a Donor
                  </Link>
                </li>
                <li>
                  <a href="#compatibility" className="hover:text-white transition-colors">
                    Blood Compatibility
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-white transition-colors">
                    How It Works
                  </a>
                </li>
              </ul>
            </div>

            {/* Hospital & Legal */}
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Legal & Portals</h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link to="/privacy" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-white transition-colors">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link to="/help" className="hover:text-white transition-colors">
                    Help & Support
                  </Link>
                </li>
                <li>
                  <Link to="/locations" className="hover:text-white transition-colors">
                    Service Locations
                  </Link>
                </li>
              </ul>
            </div>

            {/* Portals */}
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Portals</h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link to={ROUTES.LOGIN} className="hover:text-white transition-colors">
                    User / Seeker Login
                  </Link>
                </li>
                <li>
                  <Link to={ROUTES.LOGIN} className="hover:text-white transition-colors">
                    Donor Dashboard
                  </Link>
                </li>
                <li>
                  <Link to={ROUTES.LOGIN} className="hover:text-white transition-colors">
                    Hospital & Admin Portal
                  </Link>
                </li>
                <li>
                  <Link to={ROUTES.LOGIN} className="hover:text-white transition-colors">
                    Super Admin Console
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="pt-12 mt-12 border-t border-gray-800 text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© 2026 LifeLink Platform. All rights reserved. Built for humanitarian life-saving impact.</p>
            <div className="flex items-center gap-4">
              <span>National Blood Safety Standards Compliant</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ─── Map Route Modal ─────────────────────────────────────────────────── */}
      {mapRouteModalItem && (
        <MapModal
          isOpen={true}
          onClose={() => setMapRouteModalItem(null)}
          title="Hospital & Emergency Navigation Route"
          name={mapRouteModalItem.name}
          address={mapRouteModalItem.address}
        />
      )}

      {/* ─── Connect With Donor Modal ────────────────────────────────────────── */}
      {connectDonorModalItem && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-gray-100 relative space-y-5 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black">
                  <CheckCircle size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">Direct Lifesaver Connection</h3>
                  <p className="text-xs text-gray-500">Live verified emergency match coordinate</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConnectDonorModalItem(null)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Emergency Case Summary */}
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100">
              <div className="flex items-center justify-between text-xs text-rose-700 font-extrabold uppercase tracking-wider mb-1">
                <span>Active Hospital Case</span>
                <span>{connectDonorModalItem.condition}</span>
              </div>
              <h4 className="font-extrabold text-gray-900 text-base">
                {connectDonorModalItem.patientName} • {connectDonorModalItem.unitsRequired} Units Required
              </h4>
              <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                <Building2 size={13} className="text-primary flex-shrink-0" />
                <span>{connectDonorModalItem.hospital}, {connectDonorModalItem.city}</span>
              </p>
            </div>

            {/* Matched Donor Details Card */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                    {connectDonorModalItem.matchedDonor.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-gray-900 text-sm">
                        {connectDonorModalItem.matchedDonor.name}
                      </h4>
                      <ShieldCheck size={15} className="text-emerald-600" />
                    </div>
                    <p className="text-xs text-emerald-800 font-medium">
                      {connectDonorModalItem.matchedDonor.donorType}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="w-8 h-8 rounded-lg bg-red-600 text-white font-extrabold text-xs inline-flex items-center justify-center">
                    {connectDonorModalItem.matchedDonor.bloodGroup}
                  </span>
                  <span className="block text-[11px] font-bold text-gray-500 mt-0.5">
                    {connectDonorModalItem.matchedDonor.distanceKm} km away
                  </span>
                </div>
              </div>

              {/* Direct Communication Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-200/60">
                <a
                  href={`tel:${connectDonorModalItem.matchedDonor.phone}`}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Phone size={14} />
                  <span>Call Lifesaver</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setConnectDonorModalItem(null);
                    setMapRouteModalItem({
                      name: connectDonorModalItem.hospital,
                      address: `${connectDonorModalItem.hospital}, ${connectDonorModalItem.location || connectDonorModalItem.city}`,
                    });
                  }}
                  className="py-2.5 px-3 rounded-xl bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Navigation size={14} className="text-primary" />
                  <span>Navigate Route</span>
                </button>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <Link
                to={`${ROUTES.REQUEST_CREATE}?bloodGroup=${connectDonorModalItem.bloodGroup.replace('+', '_POS').replace('-', '_NEG')}&hospital=${encodeURIComponent(connectDonorModalItem.hospital)}`}
                className="w-full py-3 rounded-xl font-bold bg-primary hover:bg-primary-dark text-white text-xs text-center shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Broadcast Emergency Blood Request</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ─── Share Your Story Modal ────────────────────────────────────────── */}
      {isShareModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-6 relative max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-100 text-xs font-bold">
                  <Heart size={13} className="fill-red-500 text-red-500" />
                  <span>Community Voices</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                  Share Your Hero Story
                </h3>
                <p className="text-xs sm:text-sm text-gray-500">
                  Inspire others across LifeLink with your experience as a blood donor or recipient.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleShareStorySubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Your Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Aarav Mehta"
                    value={storyForm.authorName}
                    onChange={(e) => setStoryForm({ ...storyForm, authorName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Role / Identity
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Recipient Mother, 5x Donor"
                    value={storyForm.role}
                    onChange={(e) => setStoryForm({ ...storyForm, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ahmedabad, Surat"
                    value={storyForm.city}
                    onChange={(e) => setStoryForm({ ...storyForm, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Blood Group <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={storyForm.bloodGroup}
                    onChange={(e) => setStoryForm({ ...storyForm, bloodGroup: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white"
                  >
                    {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Star Rating */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Overall Rating
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setStoryForm({ ...storyForm, rating: star })}
                        className="p-1 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          size={22}
                          className={
                            star <= storyForm.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-gray-300'
                          }
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-gray-600">
                    {storyForm.rating} of 5 Stars
                  </span>
                </div>
              </div>

              {/* Story Content */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Your Experience / Story <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Share how LifeLink helped you find blood during an emergency, or what motivates you to donate..."
                  value={storyForm.content}
                  onChange={(e) => setStoryForm({ ...storyForm, content: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
                />
                <p className="text-[11px] text-gray-400 mt-1">Minimum 10 characters.</p>
              </div>

              {/* Modal Actions */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingStory}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSubmittingStory ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <Heart size={14} className="fill-white" />
                      <span>Publish Hero Story</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default LandingPage;
