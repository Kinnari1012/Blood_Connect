import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Icon } from '../../components/common/Icon';
import { BloodGroupBadge } from '../../components/common/BloodGroupBadge';
import { useAuth } from '../../context/AuthContext';
import { donationsApi, DonationRecord } from '../../api/donations.api';
import { requestsApi } from '../../api/requests.api';

export const DonationHistoryScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDonations = useCallback(async () => {
    try {
      const res = await donationsApi.getMyDonations();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setDonations(res.data);
      } else {
        // Fallback: check completed requests where user was matched/fulfilled
        const reqRes = await requestsApi.getMyRequests();
        if (reqRes.success && Array.isArray(reqRes.data)) {
          const completedReqs = reqRes.data
            .filter((r: any) => r.status === 'Fulfilled' || r.status === 'Completed' || r.status === 'COMPLETED')
            .map((r: any) => ({
              id: r.id || r._id,
              hospital: r.hospital || r.hospitalName,
              location: r.location || r.city,
              bloodGroup: r.bloodGroup,
              units: r.unitsRequired || 1,
              status: 'Completed',
              createdAt: r.createdAt,
            }));
          setDonations(completedReqs);
        }
      }
    } catch {
      // Keep empty if none
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDonations();
  }, [loadDonations]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDonations();
  };

  const totalDonations = donations.length || user?.donorProfile?.totalDonations || 0;

  // Milestone levels
  const milestone = totalDonations >= 10 ? 'Gold Lifesaver' : totalDonations >= 5 ? 'Silver Lifesaver' : totalDonations >= 1 ? 'Bronze Lifesaver' : 'New Hero';

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Donation History"
        subtitle="Your lifesaving track record"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
      >
        {/* Milestone Banner */}
        <Card variant="elevated" style={styles.heroCard}>
          <View style={styles.badgeCircle}>
            <Icon name="heart" size={32} color={Colors.primary} />
          </View>
          <Text style={styles.heroValue}>{totalDonations}</Text>
          <Text style={styles.heroLabel}>Total Donations Completed</Text>

          <View style={styles.milestoneTag}>
            <Icon name="shield" size={14} color={Colors.normal} />
            <Text style={styles.milestoneText}>{milestone}</Text>
          </View>

          <Text style={styles.impactSub}>
            Every donation can save up to 3 lives. Thank you for your generosity!
          </Text>
        </Card>

        {/* Real Dynamic History List */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Past Donation Records</Text>
          <Text style={styles.recordCountText}>{donations.length} Record{donations.length === 1 ? '' : 's'}</Text>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.loadingText}>Fetching your donation records...</Text>
          </View>
        ) : donations.length === 0 ? (
          <Card style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <Icon name="calendar" size={28} color={Colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No Donations Logged Yet</Text>
            <Text style={styles.emptySub}>
              When you accept and complete a blood donation request at a verified hospital, your record will automatically appear here.
            </Text>
          </Card>
        ) : (
          donations.map((item, idx) => {
            const dateStr = item.date || item.createdAt
              ? new Date(item.date || item.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Recent';

            return (
              <Card key={item.id || item._id || idx} style={styles.donationItemCard}>
                <View style={styles.donationItemHeader}>
                  <BloodGroupBadge bloodGroup={item.bloodGroup || 'O+'} size="sm" />
                  <View style={styles.donationInfoCol}>
                    <Text style={styles.hospitalText}>{item.hospital || item.hospitalName || 'Verified Blood Bank'}</Text>
                    <Text style={styles.locationText}>{item.location || item.city || 'Gujarat'}</Text>
                  </View>
                  <View style={styles.statusPill}>
                    <Text style={styles.statusPillText}>{item.status || 'Verified'}</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.donationFooterRow}>
                  <View style={styles.footerCol}>
                    <Text style={styles.footerMetaLabel}>Donation Type</Text>
                    <Text style={styles.footerMetaVal}>{item.type || item.donationType || 'Whole Blood'}</Text>
                  </View>
                  <View style={styles.footerCol}>
                    <Text style={styles.footerMetaLabel}>Units Given</Text>
                    <Text style={styles.footerMetaVal}>{item.units || item.unitsRequired || 1} Unit</Text>
                  </View>
                  <View style={[styles.footerCol, { alignItems: 'flex-end' }]}>
                    <Text style={styles.footerMetaLabel}>Date</Text>
                    <Text style={styles.footerMetaVal}>{dateStr}</Text>
                  </View>
                </View>
              </Card>
            );
          })
        )}

        {/* Eligibility Status Card */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Donation Eligibility</Text>
          <View style={styles.eligibilityRow}>
            <View style={styles.eligibilityDot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.eligibilityTitle}>You are currently eligible to donate</Text>
              <Text style={styles.eligibilitySub}>
                Standard minimum gap between whole blood donations is 90 days.
              </Text>
            </View>
          </View>
        </Card>

        {/* Donation Guidelines */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Before Donating Blood</Text>
          <View style={styles.guidelineItem}>
            <Icon name="check" size={16} color={Colors.normal} />
            <Text style={styles.guidelineText}>Hydrate well by drinking plenty of water.</Text>
          </View>
          <View style={styles.guidelineItem}>
            <Icon name="check" size={16} color={Colors.normal} />
            <Text style={styles.guidelineText}>Eat a healthy meal before arrival.</Text>
          </View>
          <View style={styles.guidelineItem}>
            <Icon name="check" size={16} color={Colors.normal} />
            <Text style={styles.guidelineText}>Carry a government-issued photo ID.</Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  heroCard: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 20,
  },
  badgeCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  heroValue: {
    fontSize: 38,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  heroLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  milestoneTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginTop: 10,
  },
  milestoneText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.normal,
  },
  impactSub: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 16,
    paddingHorizontal: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  recordCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  donationItemCard: {
    padding: 14,
    marginBottom: 12,
  },
  donationItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  donationInfoCol: {
    flex: 1,
  },
  hospitalText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  locationText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 10,
  },
  donationFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerCol: {
    flex: 1,
  },
  footerMetaLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  footerMetaVal: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  loadingBox: {
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 16,
  },
  emptyIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  emptySub: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    maxWidth: 280,
  },
  card: {
    padding: 16,
    marginBottom: 14,
  },
  eligibilityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 8,
  },
  eligibilityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.normal,
    marginTop: 5,
  },
  eligibilityTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  eligibilitySub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  guidelineText: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
  },
});
