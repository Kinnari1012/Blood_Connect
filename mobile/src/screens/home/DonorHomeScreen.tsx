import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Icon } from '../../components/common/Icon';
import { Card } from '../../components/common/Card';
import { BloodGroupBadge } from '../../components/common/BloodGroupBadge';
import { AvailabilityToggle } from '../../components/donor/AvailabilityToggle';
import { useAuth } from '../../context/AuthContext';
import { requestsApi } from '../../api/requests.api';
import { donorsApi } from '../../api/donors.api';
import { BloodRequest } from '../../types';
import { ROUTES } from '../../constants/routes';

export const DonorHomeScreen = ({ navigation }: any) => {
  const { user, refreshUser } = useAuth();
  const [matchingRequests, setMatchingRequests] = useState<BloodRequest[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [availability, setAvailability] = useState(
    user?.donorProfile?.availability ?? true
  );
  const [togglingAvailability, setTogglingAvailability] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const res = await requestsApi.getMatchingRequests({ limit: 4 });
      if (res.success && res.data) {
        setMatchingRequests(res.data);
      }
    } catch {
      // Fallback
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadData(), refreshUser()]);
    setRefreshing(false);
  };

  const handleToggleAvailability = async (newVal: boolean) => {
    try {
      setTogglingAvailability(true);
      setAvailability(newVal);
      await donorsApi.updateAvailability(newVal);
      await refreshUser();
    } catch {
      setAvailability(!newVal); // rollback
    } finally {
      setTogglingAvailability(false);
    }
  };

  const handleAcceptRequest = (request: BloodRequest) => {
    const reqId = request.id || request._id;
    if (!reqId) return;

    Alert.alert(
      'Confirm Blood Donation',
      `Are you ready to donate blood for ${request.patientName} at ${request.hospital}?\n\nThe hospital/requester will be notified immediately.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, I Can Donate',
          style: 'default',
          onPress: async () => {
            try {
              setAcceptingId(reqId);
              const res = await requestsApi.acceptRequest(reqId);
              if (res.success) {
                Alert.alert(
                  'Thank You Lifesaver! ❤️',
                  `Your response has been registered. The requester has been notified with your contact details.\n\nHospital: ${request.hospital}\nContact: ${request.contactName} (${request.contactPhone})`
                );
                await loadData();
              }
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to submit response.');
            } finally {
              setAcceptingId(null);
            }
          },
        },
      ]
    );
  };

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`
    : user?.fullName || 'Lifesaver';

  const userBloodGroup = user?.bloodGroup || user?.donorProfile?.bloodGroup || 'O+';
  const totalDonations = user?.donorProfile?.totalDonations || user?.totalDonations || 0;
  const livesImpacted = totalDonations * 3;

  const nextEligible = user?.donorProfile?.nextEligibleDate || user?.nextEligibleDate;
  const isEligible = !nextEligible || new Date(nextEligible) <= new Date();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.userInfoCol}>
          <Text style={styles.greeting}>Hello, {displayName} 🩸</Text>
          <Text style={styles.subGreeting}>Hero Donor • Ready to save lives</Text>
        </View>

        <TouchableOpacity
          style={styles.notifBtn}
          onPress={() => navigation.navigate(ROUTES.NOTIFICATIONS)}
          activeOpacity={0.75}
        >
          <Icon name="bell" size={20} color={Colors.textPrimary} />
          <View style={styles.notifDot} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Blood & Eligibility Card */}
        <Card variant="3d" style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroTextCol}>
              <View style={styles.heroTagRow}>
                <View style={[styles.pulseDot, !availability && styles.pulseDotInactive]} />
                <Text style={styles.heroTagText}>
                  {availability ? 'ACTIVE LIFESAVER' : 'STANDBY MODE'}
                </Text>
              </View>
              <Text style={styles.heroTitle}>Your Blood Group</Text>
              <Text style={styles.heroDesc}>
                {availability
                  ? 'You are active in our real-time matching network.'
                  : 'Toggle availability below to start receiving alerts.'}
              </Text>
            </View>
            <BloodGroupBadge bloodGroup={userBloodGroup} size="lg" />
          </View>

          {/* Eligibility Indicator */}
          <View style={[styles.eligibilityRow, isEligible ? styles.eligibilityActive : styles.eligibilityCooldown]}>
            <Icon
              name={isEligible ? 'check-circle' : 'clock'}
              size={16}
              color={isEligible ? Colors.normal : Colors.warning}
            />
            <Text style={[styles.eligibilityText, isEligible ? styles.eligibilityTextActive : styles.eligibilityTextCooldown]}>
              {isEligible
                ? 'Eligible to donate blood today'
                : `Cooldown active until ${new Date(nextEligible!).toLocaleDateString()}`}
            </Text>
          </View>
        </Card>

        {/* Real-Time Availability Switch */}
        <AvailabilityToggle
          available={availability}
          onToggle={handleToggleAvailability}
          loading={togglingAvailability}
          style={styles.availabilityToggle}
        />

        {/* 3D Impact Statistics */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{totalDonations}</Text>
            <Text style={styles.statLabel}>Donations Given</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: Colors.primary }]}>{livesImpacted}</Text>
            <Text style={styles.statLabel}>Lives Impacted</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: Colors.normal }]}>
              {totalDonations >= 5 ? 'Gold' : totalDonations >= 2 ? 'Silver' : 'Bronze'}
            </Text>
            <Text style={styles.statLabel}>Hero Badge</Text>
          </View>
        </View>

        {/* Quick Actions Grid for Donors */}
        <Text style={styles.sectionHeader}>Donor Modules</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.actionTile}
            activeOpacity={0.8}
            onPress={() => navigation.navigate(ROUTES.TAB_DONATE)}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: '#FEE2E2', borderColor: '#FECACA' }]}>
              <Icon name="droplet" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.actionTileTitle}>Matching Requests</Text>
            <Text style={styles.actionTileSub}>Urgent cases needing {userBloodGroup}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionTile}
            activeOpacity={0.8}
            onPress={() => navigation.navigate(ROUTES.TAB_HISTORY)}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
              <Icon name="award" size={20} color={Colors.info} />
            </View>
            <Text style={styles.actionTileTitle}>Donation History</Text>
            <Text style={styles.actionTileSub}>Past donations & impact</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionTile}
            activeOpacity={0.8}
            onPress={() => {
              Alert.alert(
                'Blood Donation Guidelines',
                '• Age: 18 - 65 years\n• Weight: At least 50 kg\n• Interval: Minimum 90 days between donations\n• Hydration: Drink 500ml water prior to donation\n• Meals: Have a healthy meal 2-3 hours before\n• Avoid alcohol 24 hours prior',
                [{ text: 'Got It', style: 'default' }]
              );
            }}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
              <Icon name="check-circle" size={20} color={Colors.normal} />
            </View>
            <Text style={styles.actionTileTitle}>Guidelines</Text>
            <Text style={styles.actionTileSub}>Health & eligibility criteria</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionTile}
            activeOpacity={0.8}
            onPress={() => Linking.openURL('tel:108')}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
              <Icon name="phone" size={20} color={Colors.warning} />
            </View>
            <Text style={styles.actionTileTitle}>Emergency 108</Text>
            <Text style={styles.actionTileSub}>National helpline</Text>
          </TouchableOpacity>
        </View>

        {/* Live Incoming Matching Blood Requests Section */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionHeader}>Incoming Blood Requests</Text>
            <Text style={styles.sectionSubHeader}>
              Patients matching your blood type
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate(ROUTES.TAB_DONATE)}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {matchingRequests.length > 0 ? (
          matchingRequests.map((req) => {
            const isAccepted = req.myResponseStatus === 'APPROVED' || req.myResponseStatus === 'ACCEPTED' || req.myResponseStatus === 'INTERESTED';
            const isEmergency = req.urgency === 'Critical' || req.urgency === 'Urgent';

            return (
              <Card key={req.id || req._id || req.requestId} variant="3d" style={styles.matchCard}>
                <View style={styles.matchCardTop}>
                  <View style={styles.matchCardLeft}>
                    <View style={styles.badgeRow}>
                      <View style={[styles.urgencyTag, isEmergency ? styles.urgencyCritical : styles.urgencyNormal]}>
                        <Text style={[styles.urgencyTagText, isEmergency ? styles.urgencyCriticalText : styles.urgencyNormalText]}>
                          {req.urgency.toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.unitsTag}>
                        <Text style={styles.unitsTagText}>{req.unitsRequired} Unit{req.unitsRequired > 1 ? 's' : ''}</Text>
                      </View>
                    </View>
                    <Text style={styles.matchPatientName}>Patient: {req.patientName}</Text>
                    <Text style={styles.matchHospitalName}>🏥 {req.hospital}</Text>
                    <Text style={styles.matchLocationText}>
                      📍 {req.city || req.location || 'Ahmedabad'}{req.state ? `, ${req.state}` : ''}
                    </Text>
                  </View>
                  <BloodGroupBadge bloodGroup={req.bloodGroup} size="md" />
                </View>

                <View style={styles.matchDivider} />

                <View style={styles.matchFooterRow}>
                  <Text style={styles.matchDateText}>
                    🕒 Required by: {req.requiredDate ? new Date(req.requiredDate).toLocaleDateString() : 'Today'} • {req.requiredTime || 'Urgent'}
                  </Text>
                </View>

                {/* Actions */}
                <View style={styles.matchActionsRow}>
                  <TouchableOpacity
                    style={styles.detailsBtn}
                    onPress={() =>
                      navigation.navigate(ROUTES.REQUEST_DETAILS, {
                        requestId: req.id || req._id,
                      })
                    }
                    activeOpacity={0.8}
                  >
                    <Text style={styles.detailsBtnText}>Details</Text>
                  </TouchableOpacity>

                  {isAccepted ? (
                    <View style={styles.acceptedBadge}>
                      <Icon name="check-circle" size={15} color={Colors.normal} />
                      <Text style={styles.acceptedBadgeText}>You Offered Help ✓</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[styles.donateBtn, acceptingId === (req.id || req._id) && { opacity: 0.6 }]}
                      onPress={() => handleAcceptRequest(req)}
                      disabled={acceptingId === (req.id || req._id)}
                      activeOpacity={0.85}
                    >
                      <Icon name="heart" size={16} color={Colors.textInverted} />
                      <Text style={styles.donateBtnText}>
                        {acceptingId === (req.id || req._id) ? 'Accepting...' : 'I Can Donate'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </Card>
            );
          })
        ) : (
          <Card variant="flat" style={styles.emptyRequestsCard}>
            <View style={styles.emptyIconCircle}>
              <Icon name="shield" size={32} color={Colors.normal} />
            </View>
            <Text style={styles.emptyRequestsTitle}>All Clear in Your Area</Text>
            <Text style={styles.emptyRequestsSub}>
              There are no urgent blood requests matching your group right now. You will be alerted instantly when someone needs your help!
            </Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  scrollView: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  userInfoCol: {
    flex: 1,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  subGreeting: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderTopWidth: 1.5,
    borderTopColor: '#FFFFFF',
    borderBottomWidth: 2,
    borderBottomColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: Colors.shadowAmbient,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  notifDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.emergency,
    borderWidth: 1.5,
    borderColor: Colors.surface,
  },
  heroCard: {
    padding: 18,
    marginBottom: 14,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroTextCol: {
    flex: 1,
    marginRight: 14,
  },
  heroTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.normal,
  },
  pulseDotInactive: {
    backgroundColor: Colors.textMuted,
  },
  heroTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.normal,
    letterSpacing: 0.6,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  heroDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 17,
  },
  eligibilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 14,
  },
  eligibilityActive: {
    backgroundColor: Colors.normalBg,
    borderWidth: 1,
    borderColor: Colors.normalBorder,
  },
  eligibilityCooldown: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  eligibilityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  eligibilityTextActive: {
    color: Colors.normal,
  },
  eligibilityTextCooldown: {
    color: '#B45309',
  },
  availabilityToggle: {
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderTopWidth: 1.5,
    borderTopColor: '#FFFFFF',
    borderBottomWidth: 2.5,
    borderBottomColor: '#CBD5E1',
    shadowColor: Colors.shadowAmbient,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.borderLight,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  sectionSubHeader: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 10,
    marginBottom: 16,
  },
  actionTile: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderTopWidth: 1.5,
    borderTopColor: '#FFFFFF',
    borderBottomWidth: 2,
    borderBottomColor: '#CBD5E1',
    shadowColor: Colors.shadowAmbient,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 10,
  },
  actionTileTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  actionTileSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  matchCard: {
    padding: 16,
    marginBottom: 14,
  },
  matchCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  matchCardLeft: {
    flex: 1,
    marginRight: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  urgencyTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  urgencyCritical: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  urgencyNormal: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  urgencyTagText: {
    fontSize: 10,
    fontWeight: '800',
  },
  urgencyCriticalText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.emergency,
  },
  urgencyNormalText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.info,
  },
  unitsTag: {
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  unitsTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  matchPatientName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  matchHospitalName: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  matchLocationText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  matchDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 10,
  },
  matchFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  matchDateText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  matchActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailsBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detailsBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  donateBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    borderTopWidth: 1.5,
    borderTopColor: Colors.highlightTop,
    borderBottomWidth: 2.5,
    borderBottomColor: Colors.primaryDark,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  donateBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textInverted,
  },
  acceptedBadge: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.normalBg,
    borderWidth: 1,
    borderColor: Colors.normalBorder,
  },
  acceptedBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.normal,
  },
  emptyRequestsCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 18,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.normalBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyRequestsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  emptyRequestsSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
