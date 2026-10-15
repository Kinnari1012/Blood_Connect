import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Icon } from '../../components/common/Icon';
import { Card } from '../../components/common/Card';
import { BloodGroupBadge } from '../../components/common/BloodGroupBadge';
import { ROUTES } from '../../constants/routes';
import { requestsApi } from '../../api/requests.api';
import { analyticsApi, PublicStats } from '../../api/analytics.api';
import { testimonialsApi, TestimonialItem } from '../../api/testimonials.api';

const { width } = Dimensions.get('window');

const ALL_BLOOD_GROUPS = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

const COMPATIBILITY_MAP: Record<string, { canDonate: string[]; canReceive: string[]; tag: string }> = {
  'O-': { canDonate: ['All Blood Types'], canReceive: ['O-'], tag: 'Universal Red Cell Donor' },
  'O+': { canDonate: ['O+', 'A+', 'B+', 'AB+'], canReceive: ['O+', 'O-'], tag: 'Most Needed Blood Group' },
  'A-': { canDonate: ['A-', 'A+', 'AB-', 'AB+'], canReceive: ['A-', 'O-'], tag: 'Rare & Vital' },
  'A+': { canDonate: ['A+', 'AB+'], canReceive: ['A+', 'A-', 'O+', 'O-'], tag: 'High Hospital Demand' },
  'B-': { canDonate: ['B-', 'B+', 'AB-', 'AB+'], canReceive: ['B-', 'O-'], tag: 'Critical Emergency Need' },
  'B+': { canDonate: ['B+', 'AB+'], canReceive: ['B+', 'B-', 'O+', 'O-'], tag: 'Widely Needed in Asia' },
  'AB-': { canDonate: ['AB-', 'AB+'], canReceive: ['AB-', 'A-', 'B-', 'O-'], tag: 'Rarest Global Blood Type' },
  'AB+': { canDonate: ['AB+'], canReceive: ['All Blood Types'], tag: 'Universal Recipient' },
};

export const LandingScreen = ({ navigation }: any) => {
  const [selectedGroup, setSelectedGroup] = useState('O-');
  const [selectedCluster, setSelectedCluster] = useState('Ahmedabad Cluster');
  const [liveRadarRequests, setLiveRadarRequests] = useState<any[]>([]);
  const [clusters, setClusters] = useState<string[]>(['Ahmedabad Cluster', 'Surat Cluster', 'Vadodara Cluster', 'Rajkot Cluster']);
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [radarRes, statsRes, testRes] = await Promise.all([
        requestsApi.getPublicLiveRadar({ cluster: selectedCluster }).catch(() => null),
        analyticsApi.getPublicStats().catch(() => null),
        testimonialsApi.getAll().catch(() => null),
      ]);

      if (radarRes?.success && radarRes.data) {
        if (radarRes.data.requests) setLiveRadarRequests(radarRes.data.requests);
        if (radarRes.data.clusters) setClusters(radarRes.data.clusters);
      }
      if (statsRes?.success && statsRes.data) {
        setStats(statsRes.data);
      }
      if (testRes?.success && Array.isArray(testRes.data)) {
        setTestimonials(testRes.data.slice(0, 4));
      }
    } catch {
      // Keep fallbacks
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCluster]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const compat = COMPATIBILITY_MAP[selectedGroup] || COMPATIBILITY_MAP['O-'];
  const topRadarItem = liveRadarRequests[0];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <View style={styles.brandLogo}>
            <Icon name="droplet" size={20} color={Colors.textInverted} />
          </View>
          <Text style={styles.brandName}>
            Life<Text style={styles.brandHighlight}>Link</Text>
          </Text>
        </View>

        <View style={styles.topRightActions}>
          <View style={styles.livePulseBadge}>
            <View style={styles.livePulseDot} />
            <Text style={styles.livePulseText}>24/7 LIVE</Text>
          </View>
          <TouchableOpacity
            style={styles.signInBtn}
            onPress={() => navigation.navigate(ROUTES.LOGIN)}
            activeOpacity={0.8}
          >
            <Text style={styles.signInBtnText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
      >
        {/* Hero Section */}
        <View style={styles.heroBanner}>
          <View style={styles.urgentPill}>
            <Icon name="alert-triangle" size={14} color={Colors.primary} />
            <Text style={styles.urgentPillText}>Emergency Blood Matching Network</Text>
          </View>

          <Text style={styles.heroHeading}>
            Every Second Saves a Life.{'\n'}
            <Text style={styles.heroHeadingRed}>Find Donors Fast.</Text>
          </Text>

          <Text style={styles.heroSub}>
            Connect instantly with verified, eligible voluntary blood donors in your area.
            Free, transparent, and built for real-time medical emergencies.
          </Text>

          {/* Quick Action CTAs */}
          <View style={styles.heroActionRow}>
            <TouchableOpacity
              style={styles.ctaPrimary}
              activeOpacity={0.85}
              onPress={() => navigation.navigate(ROUTES.EMERGENCY_REQUEST)}
            >
              <Icon name="alert-triangle" size={18} color={Colors.textInverted} />
              <Text style={styles.ctaPrimaryText}>Emergency Request</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.ctaSecondary}
              activeOpacity={0.85}
              onPress={() => navigation.navigate(ROUTES.FIND_DONORS)}
            >
              <Icon name="search" size={18} color={Colors.primary} />
              <Text style={styles.ctaSecondaryText}>Find Donors</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Live Radar Preview Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.radarTitleRow}>
              <View style={styles.radarRadioDot}>
                <View style={styles.radarRadioCore} />
              </View>
              <Text style={styles.sectionTitle}>Live Blood Radar</Text>
            </View>
            <Text style={styles.radarSub}>Real-time matching</Text>
          </View>

          {/* Cluster Selector Pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.clusterScroll}>
            {clusters.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.clusterChip, selectedCluster === c && styles.clusterChipActive]}
                onPress={() => setSelectedCluster(c)}
                activeOpacity={0.75}
              >
                <Text style={[styles.clusterChipText, selectedCluster === c && styles.clusterChipTextActive]}>
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Radar Active Case Card */}
          {topRadarItem ? (
            <Card style={styles.radarCaseCard} variant="elevated">
              <View style={styles.radarCaseHeader}>
                <View style={styles.caseBadgeRow}>
                  <BloodGroupBadge bloodGroup={topRadarItem.bloodGroup} size="sm" />
                  <View style={styles.caseUrgencyTag}>
                    <Text style={styles.caseUrgencyText}>{topRadarItem.urgency || 'Critical'}</Text>
                  </View>
                </View>
                <Text style={styles.caseBroadcastTime}>{topRadarItem.broadcastTimeAgo || 'Just now'}</Text>
              </View>

              <Text style={styles.casePatientName}>Patient: {topRadarItem.patientName}</Text>
              <Text style={styles.caseHospital}>{topRadarItem.hospital || 'Apollo Hospital'}</Text>
              <Text style={styles.caseLocation}>📍 {topRadarItem.location || topRadarItem.city || 'Gujarat'}</Text>

              {topRadarItem.matchedDonor && (
                <View style={styles.matchedDonorBox}>
                  <View style={styles.matchedDonorIcon}>
                    <Icon name="check-circle" size={16} color={Colors.normal} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.matchedDonorTitle}>
                      Matched Donor: {typeof topRadarItem.matchedDonor === 'object' ? topRadarItem.matchedDonor.name : 'Verified Lifesaver'}
                    </Text>
                    <Text style={styles.matchedDonorMeta}>
                      {typeof topRadarItem.matchedDonor === 'object' ? `${topRadarItem.matchedDonor.distanceKm || '2.5'} km away • 100% Match` : 'Nearby • Ready to donate'}
                    </Text>
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={styles.radarRespondBtn}
                activeOpacity={0.85}
                onPress={() => navigation.navigate(ROUTES.LOGIN)}
              >
                <Icon name="heart" size={16} color={Colors.textInverted} />
                <Text style={styles.radarRespondBtnText}>Respond as Lifesaver</Text>
              </TouchableOpacity>
            </Card>
          ) : (
            <Card style={styles.emptyRadarCard}>
              <Icon name="check-circle" size={24} color={Colors.normal} />
              <Text style={styles.emptyRadarTitle}>All Requests Fulfillled in {selectedCluster}</Text>
              <Text style={styles.emptyRadarSub}>Donors are currently on standby for upcoming needs.</Text>
            </Card>
          )}
        </View>

        {/* Dynamic Impact Statistics */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {stats?.completedDonations ? `${stats.completedDonations}+` : '4,500+'}
            </Text>
            <Text style={styles.statLabel}>Lives Saved</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: Colors.primary }]}>
              {stats?.totalDonors ? `${stats.totalDonors}+` : '1,500+'}
            </Text>
            <Text style={styles.statLabel}>Active Donors</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: Colors.emergency }]}>
              &lt; {stats?.avgResponseMinutes || 12} min
            </Text>
            <Text style={styles.statLabel}>Avg Response</Text>
          </View>
        </View>

        {/* Blood Group Compatibility Quick Lookup */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Blood Compatibility Matrix</Text>
          <Text style={styles.compatSub}>Tap any blood group to see donor and recipient compatibility:</Text>

          <View style={styles.bloodChipsGrid}>
            {ALL_BLOOD_GROUPS.map((bg) => (
              <TouchableOpacity
                key={bg}
                style={[styles.bloodChip, selectedGroup === bg && styles.bloodChipActive]}
                onPress={() => setSelectedGroup(bg)}
                activeOpacity={0.75}
              >
                <Text style={[styles.bloodChipText, selectedGroup === bg && styles.bloodChipTextActive]}>
                  {bg}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Card style={styles.compatDetailsCard}>
            <View style={styles.compatCardHeader}>
              <BloodGroupBadge bloodGroup={selectedGroup} size="sm" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.compatGroupTitle}>{selectedGroup} Profile</Text>
                <Text style={styles.compatTag}>{compat.tag}</Text>
              </View>
            </View>

            <View style={styles.compatRow}>
              <Text style={styles.compatLabel}>Can Donate To:</Text>
              <Text style={styles.compatValue}>{compat.canDonate.join(', ')}</Text>
            </View>

            <View style={styles.compatRow}>
              <Text style={styles.compatLabel}>Can Receive From:</Text>
              <Text style={styles.compatValue}>{compat.canReceive.join(', ')}</Text>
            </View>

            <TouchableOpacity
              style={styles.compatSearchBtn}
              activeOpacity={0.8}
              onPress={() => navigation.navigate(ROUTES.FIND_DONORS, { bloodGroup: selectedGroup })}
            >
              <Icon name="search" size={16} color={Colors.primary} />
              <Text style={styles.compatSearchBtnText}>Search {selectedGroup} Donors</Text>
            </TouchableOpacity>
          </Card>
        </View>

        {/* How It Works (3 Steps) */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>How LifeLink Works</Text>
          <Text style={styles.compatSub}>Simple, reliable, and verified life-saving workflow:</Text>

          <View style={styles.stepsColumn}>
            <View style={styles.stepItem}>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepInfoCol}>
                <Text style={styles.stepTitle}>Submit Blood Requirement</Text>
                <Text style={styles.stepDesc}>Enter patient details, hospital, blood group, and required units.</Text>
              </View>
            </View>

            <View style={styles.stepItem}>
              <View style={[styles.stepNumberBadge, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
                <Text style={[styles.stepNumberText, { color: Colors.info }]}>2</Text>
              </View>
              <View style={styles.stepInfoCol}>
                <Text style={styles.stepTitle}>Automated Live Radar Match</Text>
                <Text style={styles.stepDesc}>The platform instantly alerts nearby compatible voluntary donors.</Text>
              </View>
            </View>

            <View style={styles.stepItem}>
              <View style={[styles.stepNumberBadge, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
                <Text style={[styles.stepNumberText, { color: Colors.normal }]}>3</Text>
              </View>
              <View style={styles.stepInfoCol}>
                <Text style={styles.stepTitle}>Direct Connect & Donation</Text>
                <Text style={styles.stepDesc}>Donors arrive at the hospital and donation is verified with complete safety.</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Community Stories & Testimonials */}
        {testimonials.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Lifesaver Community Stories</Text>
            <Text style={styles.compatSub}>Real experiences from donors and grateful families:</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.testimonialsScroll}>
              {testimonials.map((t) => (
                <Card key={t.id || t._id} style={styles.testimonialCard}>
                  <View style={styles.testimonialHeader}>
                    <View style={styles.testimonialAvatar}>
                      <Text style={styles.avatarText}>{t.initials || t.authorName.charAt(0)}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.authorName}>{t.authorName}</Text>
                      <Text style={styles.authorRole}>{t.role || 'Donor'} • {t.city}</Text>
                    </View>
                    <BloodGroupBadge bloodGroup={t.bloodGroup} size="sm" />
                  </View>
                  <Text style={styles.testimonialContent} numberOfLines={4}>
                    "{t.content}"
                  </Text>
                </Card>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Bottom Banner */}
        <Card style={styles.bottomHeroCard} variant="elevated">
          <Icon name="heart" size={32} color={Colors.primary} />
          <Text style={styles.bottomHeroTitle}>Ready to Become a Lifesaver?</Text>
          <Text style={styles.bottomHeroSub}>
            Register your voluntary donor profile today. Your single donation can save up to 3 lives in critical trauma care.
          </Text>
          <TouchableOpacity
            style={styles.registerHeroBtn}
            onPress={() => navigation.navigate(ROUTES.REGISTER)}
            activeOpacity={0.85}
          >
            <Text style={styles.registerHeroBtnText}>Register as Donor Now</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>

      {/* Persistent Bottom Bar */}
      <View style={styles.persistentBottomBar}>
        <TouchableOpacity
          style={styles.bottomBarSecondaryBtn}
          onPress={() => navigation.navigate(ROUTES.LOGIN)}
          activeOpacity={0.8}
        >
          <Text style={styles.bottomBarSecondaryText}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomBarPrimaryBtn}
          onPress={() => navigation.navigate(ROUTES.REGISTER)}
          activeOpacity={0.85}
        >
          <Text style={styles.bottomBarPrimaryText}>Get Started Free</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  brandHighlight: {
    color: Colors.primary,
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  livePulseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  livePulseText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
  },
  signInBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.surfaceVariant,
  },
  signInBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  scrollContent: {
    paddingBottom: 90,
  },
  heroBanner: {
    padding: 20,
    backgroundColor: '#FFF5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#FED7D7',
  },
  urgentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FED7D7',
  },
  urgentPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
    textTransform: 'uppercase',
  },
  heroHeading: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.textPrimary,
    lineHeight: 32,
  },
  heroHeadingRed: {
    color: Colors.primary,
  },
  heroSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
    marginTop: 8,
  },
  heroActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  ctaPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  ctaPrimaryText: {
    color: Colors.textInverted,
    fontSize: 13,
    fontWeight: '800',
  },
  ctaSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ctaSecondaryText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  sectionContainer: {
    paddingHorizontal: 16,
    marginTop: 22,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  radarTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radarRadioDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarRadioCore: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  radarSub: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  clusterScroll: {
    marginBottom: 12,
  },
  clusterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  clusterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  clusterChipText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  clusterChipTextActive: {
    color: Colors.textInverted,
    fontWeight: '800',
  },
  radarCaseCard: {
    padding: 16,
    borderColor: '#FECACA',
    borderWidth: 1,
  },
  radarCaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  caseBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  caseUrgencyTag: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  caseUrgencyText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
    textTransform: 'uppercase',
  },
  caseBroadcastTime: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  casePatientName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  caseHospital: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  caseLocation: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  matchedDonorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginTop: 12,
  },
  matchedDonorIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchedDonorTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  matchedDonorMeta: {
    fontSize: 10,
    color: '#166534',
    marginTop: 1,
  },
  radarRespondBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  radarRespondBtnText: {
    color: Colors.textInverted,
    fontSize: 12,
    fontWeight: '800',
  },
  emptyRadarCard: {
    padding: 20,
    alignItems: 'center',
    gap: 6,
  },
  emptyRadarTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  emptyRadarSub: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  statDivider: {
    width: 1,
    height: '70%',
    backgroundColor: Colors.border,
    alignSelf: 'center',
  },
  compatSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 10,
    marginTop: 2,
  },
  bloodChipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  bloodChip: {
    width: (width - 64) / 4,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  bloodChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  bloodChipText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  bloodChipTextActive: {
    color: Colors.textInverted,
  },
  compatDetailsCard: {
    padding: 14,
  },
  compatCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  compatGroupTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  compatTag: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
  },
  compatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  compatLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  compatValue: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  compatSearchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
    marginTop: 10,
  },
  compatSearchBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  stepsColumn: {
    gap: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },
  stepInfoCol: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  stepDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  testimonialsScroll: {
    marginTop: 4,
  },
  testimonialCard: {
    width: width * 0.75,
    padding: 14,
    marginRight: 10,
  },
  testimonialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  testimonialAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  authorName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  authorRole: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  testimonialContent: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 17,
  },
  bottomHeroCard: {
    alignItems: 'center',
    padding: 24,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
    backgroundColor: '#FFF5F5',
    borderColor: '#FECACA',
    borderWidth: 1,
  },
  bottomHeroTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginTop: 10,
    textAlign: 'center',
  },
  bottomHeroSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 17,
  },
  registerHeroBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 14,
  },
  registerHeroBtnText: {
    color: Colors.textInverted,
    fontSize: 13,
    fontWeight: '800',
  },
  persistentBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 6,
    elevation: 8,
  },
  bottomBarSecondaryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBarSecondaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  bottomBarPrimaryBtn: {
    flex: 1.5,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBarPrimaryText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textInverted,
  },
});
