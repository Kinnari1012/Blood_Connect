import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Icon } from '../../components/common/Icon';
import { Card } from '../../components/common/Card';
import { RequestCard } from '../../components/request/RequestCard';
import { useAuth } from '../../context/AuthContext';
import { requestsApi } from '../../api/requests.api';
import { analyticsApi, PublicStats } from '../../api/analytics.api';
import { BloodRequest } from '../../types';
import { ROUTES } from '../../constants/routes';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export const UserHomeScreen = ({ navigation }: any) => {
  const { user, refreshUser } = useAuth();
  const [myRequests, setMyRequests] = useState<BloodRequest[]>([]);
  const [platformStats, setPlatformStats] = useState<PublicStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [res, statsRes] = await Promise.all([
        requestsApi.getMyRequests(),
        analyticsApi.getPublicStats().catch(() => null),
      ]);
      if (res.success && res.data) {
        setMyRequests(res.data.slice(0, 4));
      }
      if (statsRes?.success && statsRes.data) {
        setPlatformStats(statsRes.data);
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

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`
    : user?.fullName || 'Seeker';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.userInfoCol}>
          <Text style={styles.greeting}>Hello, {displayName} 👋</Text>
          <Text style={styles.subGreeting}>Find blood donors & manage requests</Text>
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
        {/* Critical Emergency Broadcast Card with 3D Elevation */}
        <TouchableOpacity
          activeOpacity={0.88}
          style={styles.emergencyCard}
          onPress={() => navigation.navigate(ROUTES.EMERGENCY_REQUEST)}
        >
          <View style={styles.emergencyIconWrapper}>
            <Icon name="alert-triangle" size={26} color={Colors.textInverted} />
          </View>
          <View style={styles.emergencyTextCol}>
            <View style={styles.emergencyTagRow}>
              <Text style={styles.emergencyTitle}>EMERGENCY BLOOD REQUEST</Text>
              <View style={styles.liveBadge}>
                <Text style={styles.liveBadgeText}>URGENT</Text>
              </View>
            </View>
            <Text style={styles.emergencySubtitle}>
              Broadcast instant alert to all matching donors near your hospital
            </Text>
          </View>
          <Icon name="chevron-right" size={20} color={Colors.emergency} />
        </TouchableOpacity>

        {/* Quick Blood Group Finder */}
        <View style={styles.bloodFinderCard}>
          <View style={styles.bloodFinderHeader}>
            <View style={styles.bloodFinderTitleRow}>
              <Icon name="search" size={16} color={Colors.primary} />
              <Text style={styles.bloodFinderTitle}>Find Donors by Blood Group</Text>
            </View>
            <Text style={styles.bloodFinderSub}>
              Select blood type to search available lifesavers:
            </Text>
          </View>

          <View style={styles.bloodChipsGrid}>
            {BLOOD_GROUPS.map((bg) => (
              <TouchableOpacity
                key={bg}
                style={styles.bloodChip}
                onPress={() =>
                  navigation.navigate(ROUTES.FIND_DONORS, { bloodGroup: bg })
                }
                activeOpacity={0.75}
              >
                <Text style={styles.bloodChipText}>{bg}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Action Navigation Tiles */}
        <Text style={styles.sectionHeader}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.actionTile}
            activeOpacity={0.8}
            onPress={() => navigation.navigate(ROUTES.FIND_DONORS)}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
              <Icon name="search" size={20} color={Colors.info} />
            </View>
            <Text style={styles.actionTileTitle}>Find Donors</Text>
            <Text style={styles.actionTileSub}>Search by city & type</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionTile}
            activeOpacity={0.8}
            onPress={() => navigation.navigate(ROUTES.CREATE_REQUEST)}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: Colors.primaryLight, borderColor: Colors.primaryBorder }]}>
              <Icon name="plus" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.actionTileTitle}>Request Blood</Text>
            <Text style={styles.actionTileSub}>Create standard request</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionTile}
            activeOpacity={0.8}
            onPress={() => navigation.navigate(ROUTES.MY_REQUESTS)}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
              <Icon name="file-text" size={20} color={Colors.normal} />
            </View>
            <Text style={styles.actionTileTitle}>My Requests</Text>
            <Text style={styles.actionTileSub}>Track responses & status</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionTile}
            activeOpacity={0.8}
            onPress={() => {
              Alert.alert(
                'Emergency Protocol & Tips',
                '1. Identify patient blood group and required units from doctor prescription.\n2. Create an Emergency Request or call verified donors directly.\n3. Make sure to have the hospital address and recipient contact ready.\n4. Call national emergency 108 if immediate blood bank stock is needed.',
                [{ text: 'Understood', style: 'default' }]
              );
            }}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: '#FAF5FF', borderColor: '#E9D5FF' }]}>
              <Icon name="help-circle" size={20} color="#9333EA" />
            </View>
            <Text style={styles.actionTileTitle}>Emergency Help</Text>
            <Text style={styles.actionTileSub}>Protocols & helpline</Text>
          </TouchableOpacity>
        </View>

        {/* Tactile Platform Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {platformStats && platformStats.totalDonors > 0
                ? `${platformStats.totalDonors}+`
                : '1,500+'}
            </Text>
            <Text style={styles.statLabel}>Active Donors</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: Colors.emergency }]}>
              &lt; {platformStats?.avgResponseMinutes || 12} min
            </Text>
            <Text style={styles.statLabel}>Avg Response</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: Colors.normal }]}>
              {platformStats?.verifiedRate || 100}%
            </Text>
            <Text style={styles.statLabel}>Verified Network</Text>
          </View>
        </View>

        {/* Recent Blood Requests Created by User */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionHeader}>Your Blood Requests</Text>
            <Text style={styles.sectionSubHeader}>
              Track real-time donor responses
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate(ROUTES.MY_REQUESTS)}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {myRequests.length > 0 ? (
          myRequests.map((req) => (
            <RequestCard
              key={req.id || req.requestId}
              request={req}
              onPress={() =>
                navigation.navigate(ROUTES.REQUEST_DETAILS, { requestId: req.id || req._id })
              }
            />
          ))
        ) : (
          <Card variant="flat" style={styles.emptyRequestsCard}>
            <View style={styles.emptyIconCircle}>
              <Icon name="file-text" size={28} color={Colors.textMuted} />
            </View>
            <Text style={styles.emptyRequestsTitle}>No active blood requests</Text>
            <Text style={styles.emptyRequestsSub}>
              When you post a blood requirement or emergency broadcast, it will appear here so you can monitor matching donors.
            </Text>
            <TouchableOpacity
              style={styles.createFirstBtn}
              onPress={() => navigation.navigate(ROUTES.CREATE_REQUEST)}
              activeOpacity={0.85}
            >
              <Icon name="plus" size={16} color={Colors.textInverted} />
              <Text style={styles.createFirstBtnText}>Create Blood Request</Text>
            </TouchableOpacity>
          </Card>
        )}

        {/* Lifesaver Invitation Banner */}
        <Card variant="3d" style={styles.inviteCard}>
          <View style={styles.inviteIconCircle}>
            <Icon name="heart" size={24} color={Colors.primary} />
          </View>
          <View style={styles.inviteTextCol}>
            <Text style={styles.inviteTitle}>Want to Save Lives Too?</Text>
            <Text style={styles.inviteSub}>
              Join LifeLink as a registered donor and receive alerts when patients nearby need your blood.
            </Text>
            <TouchableOpacity
              style={styles.joinDonorBtn}
              onPress={() => navigation.navigate(ROUTES.DONOR_REGISTRATION)}
              activeOpacity={0.8}
            >
              <Text style={styles.joinDonorBtnText}>Register as Blood Donor →</Text>
            </TouchableOpacity>
          </View>
        </Card>
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
  emergencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderTopWidth: 1.5,
    borderTopColor: '#FFFFFF',
    borderBottomWidth: 3,
    borderBottomColor: Colors.emergency,
    marginBottom: 16,
    shadowColor: Colors.emergency,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  emergencyIconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.emergency,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderTopWidth: 1.5,
    borderTopColor: Colors.highlightTop,
    borderBottomWidth: 2,
    borderBottomColor: Colors.emergencyDeep,
  },
  emergencyTextCol: {
    flex: 1,
  },
  emergencyTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  emergencyTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.emergency,
    letterSpacing: 0.4,
  },
  liveBadge: {
    backgroundColor: Colors.emergency,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textInverted,
  },
  emergencySubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  bloodFinderCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderTopWidth: 1.5,
    borderTopColor: '#FFFFFF',
    borderBottomWidth: 2.5,
    borderBottomColor: '#CBD5E1',
    marginBottom: 18,
    shadowColor: Colors.shadowAmbient,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  bloodFinderHeader: {
    marginBottom: 12,
  },
  bloodFinderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  bloodFinderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  bloodFinderSub: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  bloodChipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bloodChip: {
    width: '22.5%',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bloodChipText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
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
    marginTop: 8,
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
    fontSize: 20,
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
  emptyRequestsCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 18,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    marginBottom: 16,
  },
  emptyIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emptyRequestsTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  emptyRequestsSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 14,
  },
  createFirstBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderTopWidth: 1.5,
    borderTopColor: Colors.highlightTop,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primaryDark,
  },
  createFirstBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textInverted,
  },
  inviteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FFE4E6',
    marginTop: 10,
    marginBottom: 16,
  },
  inviteIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inviteTextCol: {
    flex: 1,
  },
  inviteTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  inviteSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginBottom: 10,
  },
  joinDonorBtn: {
    alignSelf: 'flex-start',
  },
  joinDonorBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },
});
