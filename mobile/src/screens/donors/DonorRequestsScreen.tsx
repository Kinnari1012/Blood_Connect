import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Icon } from '../../components/common/Icon';
import { Card } from '../../components/common/Card';
import { BloodGroupBadge } from '../../components/common/BloodGroupBadge';
import { useAuth } from '../../context/AuthContext';
import { requestsApi } from '../../api/requests.api';
import { BloodRequest } from '../../types';
import { ROUTES } from '../../constants/routes';

type FilterTab = 'ALL' | 'URGENT' | 'ACCEPTED';

export const DonorRequestsScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      const res = await requestsApi.getMatchingRequests({ limit: 50 });
      if (res.success && res.data) {
        setRequests(res.data);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  };

  const handleAccept = (req: BloodRequest) => {
    const reqId = req.id || req._id;
    if (!reqId) return;

    Alert.alert(
      'Confirm Donation Offer',
      `Would you like to offer your blood donation for patient ${req.patientName} at ${req.hospital}?\n\nThe hospital and patient contact will receive your contact details immediately.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm & Notify',
          style: 'default',
          onPress: async () => {
            try {
              setAcceptingId(reqId);
              const res = await requestsApi.acceptRequest(reqId);
              if (res.success) {
                Alert.alert(
                  'Offer Registered! ❤️',
                  `Thank you! You have accepted request ${req.requestId}.\n\nPlease coordinate with the hospital:\nContact: ${req.contactName} (${req.contactPhone})`
                );
                await loadRequests();
              }
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Could not accept request.');
            } finally {
              setAcceptingId(null);
            }
          },
        },
      ]
    );
  };

  const handleOpenMaps = (req: BloodRequest) => {
    const addressQuery = encodeURIComponent(
      `${req.hospital}, ${req.street || ''} ${req.city || ''} ${req.state || ''}`.trim()
    );
    const url = Platform.select({
      ios: `maps:0,0?q=${addressQuery}`,
      android: `geo:0,0?q=${addressQuery}`,
    }) || `https://www.google.com/maps/search/?api=1&query=${addressQuery}`;

    Linking.openURL(url).catch(() => {
      Alert.alert('Maps Error', 'Could not open map application.');
    });
  };

  const handleCall = (phone?: string) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`);
  };

  const donorBloodGroup = user?.bloodGroup || user?.donorProfile?.bloodGroup || 'O+';

  const filteredRequests = requests.filter((req) => {
    const isAccepted =
      req.myResponseStatus === 'APPROVED' ||
      req.myResponseStatus === 'ACCEPTED' ||
      req.myResponseStatus === 'INTERESTED';

    if (activeTab === 'ACCEPTED') return isAccepted;
    if (activeTab === 'URGENT') return req.urgency === 'Critical' || req.urgency === 'Urgent';
    return true;
  });

  const renderItem = ({ item }: { item: BloodRequest }) => {
    const isAccepted =
      item.myResponseStatus === 'APPROVED' ||
      item.myResponseStatus === 'ACCEPTED' ||
      item.myResponseStatus === 'INTERESTED';
    const isEmergency = item.urgency === 'Critical' || item.urgency === 'Urgent';
    const reqId = item.id || item._id;

    return (
      <Card variant="3d" style={styles.card}>
        {/* Header row */}
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.badgeRow}>
              <View
                style={[
                  styles.urgencyTag,
                  isEmergency ? styles.urgencyCritical : styles.urgencyNormal,
                ]}
              >
                <Text
                  style={[
                    styles.urgencyTagText,
                    isEmergency ? styles.urgencyCriticalText : styles.urgencyNormalText,
                  ]}
                >
                  {item.urgency.toUpperCase()}
                </Text>
              </View>
              <View style={styles.unitsTag}>
                <Text style={styles.unitsTagText}>
                  {item.unitsRequired} Unit{item.unitsRequired > 1 ? 's' : ''}
                </Text>
              </View>
              {isAccepted && (
                <View style={styles.acceptedTag}>
                  <Text style={styles.acceptedTagText}>ACCEPTED ✓</Text>
                </View>
              )}
            </View>
            <Text style={styles.patientName}>{item.patientName}</Text>
          </View>
          <BloodGroupBadge bloodGroup={item.bloodGroup} size="md" />
        </View>

        {/* Hospital & Location info */}
        <View style={styles.infoRow}>
          <Icon name="activity" size={15} color={Colors.primary} />
          <Text style={styles.hospitalText}>{item.hospital}</Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="map-pin" size={15} color={Colors.textMuted} />
          <Text style={styles.locationText} numberOfLines={2}>
            {[item.street, item.city, item.state, item.pincode].filter(Boolean).join(', ') ||
              item.location ||
              'Hospital Location'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="clock" size={15} color={Colors.textMuted} />
          <Text style={styles.timeText}>
            Required: {item.requiredDate ? new Date(item.requiredDate).toLocaleDateString() : 'Immediate'} • {item.requiredTime || 'Urgent'}
          </Text>
        </View>

        {/* Separator */}
        <View style={styles.divider} />

        {/* Contact info bar */}
        <View style={styles.contactBar}>
          <View style={styles.contactLeft}>
            <Text style={styles.contactLabel}>Requester Contact:</Text>
            <Text style={styles.contactValue}>
              {item.contactName} ({item.contactPhone})
            </Text>
          </View>
          <TouchableOpacity
            style={styles.callIconBtn}
            onPress={() => handleCall(item.contactPhone)}
            activeOpacity={0.8}
          >
            <Icon name="phone" size={16} color={Colors.normal} />
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.mapBtn}
            onPress={() => handleOpenMaps(item)}
            activeOpacity={0.8}
          >
            <Icon name="navigation" size={15} color={Colors.info} />
            <Text style={styles.mapBtnText}>Directions</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.detailsBtn}
            onPress={() =>
              navigation.navigate(ROUTES.REQUEST_DETAILS, {
                requestId: reqId,
              })
            }
            activeOpacity={0.8}
          >
            <Text style={styles.detailsBtnText}>Details</Text>
          </TouchableOpacity>

          {isAccepted ? (
            <View style={styles.statusDonePill}>
              <Icon name="check-circle" size={15} color={Colors.normal} />
              <Text style={styles.statusDoneText}>Standby</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.acceptBtn,
                acceptingId === reqId && { opacity: 0.6 },
              ]}
              disabled={acceptingId === reqId}
              onPress={() => handleAccept(item)}
              activeOpacity={0.85}
            >
              <Icon name="heart" size={15} color={Colors.textInverted} />
              <Text style={styles.acceptBtnText}>
                {acceptingId === reqId ? 'Sending...' : 'I Can Donate'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Matching Blood Requests</Text>
          <Text style={styles.headerSub}>
            Requests compatible with your blood type ({donorBloodGroup})
          </Text>
        </View>
        <TouchableOpacity
          style={styles.refreshIconBtn}
          onPress={onRefresh}
          activeOpacity={0.75}
        >
          <Icon name="refresh-cw" size={18} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabsRow}>
        <TouchableOpacity
          style={[styles.filterTab, activeTab === 'ALL' && styles.filterTabActive]}
          onPress={() => setActiveTab('ALL')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.filterTabText,
              activeTab === 'ALL' && styles.filterTabTextActive,
            ]}
          >
            All Matching ({requests.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, activeTab === 'URGENT' && styles.filterTabActive]}
          onPress={() => setActiveTab('URGENT')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.filterTabText,
              activeTab === 'URGENT' && styles.filterTabTextActive,
            ]}
          >
            Urgent Only
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, activeTab === 'ACCEPTED' && styles.filterTabActive]}
          onPress={() => setActiveTab('ACCEPTED')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.filterTabText,
              activeTab === 'ACCEPTED' && styles.filterTabTextActive,
            ]}
          >
            My Accepted
          </Text>
        </TouchableOpacity>
      </View>

      {/* Requests List */}
      <FlatList
        data={filteredRequests}
        keyExtractor={(item) => item.id || item._id || item.requestId}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
          />
        }
        ListEmptyComponent={
          !loading ? (
            <Card variant="flat" style={styles.emptyCard}>
              <View style={styles.emptyIconCircle}>
                <Icon name="heart" size={32} color={Colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>
                {activeTab === 'ACCEPTED'
                  ? 'No Accepted Requests'
                  : 'No Matching Requests Right Now'}
              </Text>
              <Text style={styles.emptySub}>
                {activeTab === 'ACCEPTED'
                  ? 'When you offer to donate for a request, it will appear here so you can easily view contact and hospital navigation info.'
                  : `Currently there are no active blood requests needing ${donorBloodGroup} in your area. Check back soon or stand by for alerts!`}
              </Text>
            </Card>
          ) : undefined
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  refreshIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterTabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterTabActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primaryBorder,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  filterTabTextActive: {
    color: Colors.primary,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: Colors.background,
    flexGrow: 1,
  },
  card: {
    padding: 16,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerLeft: {
    flex: 1,
    marginRight: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
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
  acceptedTag: {
    backgroundColor: Colors.normalBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.normalBorder,
  },
  acceptedTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.normal,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  hospitalText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  locationText: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
  timeText: {
    fontSize: 12,
    color: Colors.textMuted,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 12,
  },
  contactBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceSubtle,
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  contactLeft: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  contactValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  callIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.normalBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.normalBorder,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  mapBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.info,
  },
  detailsBtn: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detailsBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  acceptBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    borderTopWidth: 1.5,
    borderTopColor: Colors.highlightTop,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primaryDark,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  acceptBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textInverted,
  },
  statusDonePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: Colors.normalBg,
    borderWidth: 1,
    borderColor: Colors.normalBorder,
  },
  statusDoneText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.normal,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 28,
    borderRadius: 18,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    marginTop: 20,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
