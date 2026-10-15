import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { BloodGroupBadge } from '../../components/common/BloodGroupBadge';
import { StatusBadge } from '../../components/common/StatusBadge';
import { UrgencyBanner } from '../../components/request/UrgencyBanner';
import { Button } from '../../components/common/Button';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { Icon } from '../../components/common/Icon';
import { requestsApi } from '../../api/requests.api';
import { BloodRequest } from '../../types';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

export const RequestDetailsScreen = ({ route, navigation }: any) => {
  const { requestId, request: initialRequest } = route.params || {};
  const { user } = useAuth();
  const [request, setRequest] = useState<BloodRequest | null>(initialRequest || null);
  const [_loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);

  const loadDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await requestsApi.getRequestById(requestId);
      if (res.success && res.data) {
        setRequest(res.data);
      }
    } catch {
      // Keep initial
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    if (requestId) {
      loadDetails();
    }
  }, [requestId, loadDetails]);

  const handleCall = () => {
    if (request?.contactPhone) {
      Linking.openURL(`tel:${request.contactPhone}`);
    }
  };

  const handleOpenMap = () => {
    if (!request) return;
    const destination = `${request.hospital}, ${request.location}`;
    const encoded = encodeURIComponent(destination);
    const url = Platform.select({
      ios: `maps:0,0?q=${encoded}`,
      android: `geo:0,0?q=${encoded}`,
      default: `https://www.google.com/maps/search/?api=1&query=${encoded}`,
    });

    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encoded}`);
    });
  };

  const handleCancelRequest = async () => {
    try {
      await requestsApi.cancelRequest(request?.id || requestId);
      setCancelModalVisible(false);
      Alert.alert('Request Cancelled', 'The blood request has been cancelled.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not cancel request');
    }
  };

  const handleAcceptDonation = async () => {
    try {
      setActionLoading(true);
      await requestsApi.acceptRequest(request?.id || requestId);
      Alert.alert(
        'Thank You for Donating!',
        'You have accepted this blood request. The patient family has been notified and other donors have been updated. Please proceed to the hospital.',
        [{ text: 'OK', onPress: () => loadDetails() }]
      );
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not accept donation request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteRequest = async () => {
    try {
      setActionLoading(true);
      await requestsApi.completeRequest(request?.id || requestId);
      Alert.alert('Success', 'Blood request marked as fulfilled! Thank you.');
      loadDetails();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not mark fulfilled');
    } finally {
      setActionLoading(false);
    }
  };

  if (!request) return null;

  const isFulfilled = request.status === 'Fulfilled';
  const isCancelled = request.status === 'Cancelled' || request.status === 'Rejected';

  const isOwner = !!(
    user &&
    (request.createdBy === user.id ||
      request.createdBy === user._id ||
      (typeof request.createdBy === 'object' &&
        (request.createdBy?.id === user.id || (request.createdBy as any)?._id === user._id)))
  );

  const myResponse = request.donorResponses?.find(
    (r: any) =>
      (typeof r.donorId === 'string' && (r.donorId === user?.id || r.donorId === user?._id)) ||
      (typeof r.donorId === 'object' &&
        (r.donorId?.id === user?.id ||
          r.donorId?._id === user?._id ||
          r.donorId?.id === user?._id ||
          r.donorId?._id === user?.id))
  );

  const hasAccepted = myResponse?.status === 'ACCEPTED' || myResponse?.status === 'APPROVED';
  const hasDonorFound =
    request.status === 'Donor Found' ||
    request.donorResponses?.some((r) => r.status === 'ACCEPTED' || r.status === 'APPROVED');

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Request Details"
        subtitle={`ID: ${request.requestId}`}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <UrgencyBanner urgency={request.urgency} />

        {/* Patient & Blood Card */}
        <Card variant="elevated" style={styles.card}>
          <View style={styles.topRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.patientName}>{request.patientName}</Text>
              <Text style={styles.patientSub}>Patient</Text>
            </View>
            <BloodGroupBadge bloodGroup={request.bloodGroup} size="lg" />
          </View>

          <View style={styles.badgeRow}>
            <StatusBadge status={request.status} />
            <View style={styles.unitsTag}>
              <Icon name="droplet" size={13} color={Colors.primary} />
              <Text style={styles.unitsTagText}>
                {request.unitsRequired} Unit{request.unitsRequired > 1 ? 's' : ''} Needed
              </Text>
            </View>
          </View>
        </Card>

        {/* Hospital & Location Card */}
        <Card style={styles.card}>
          <Text style={styles.cardSectionTitle}>Hospital & Location</Text>

          <View style={styles.infoRow}>
            <Icon name="hospital" size={18} color={Colors.primary} />
            <View style={styles.infoTextCol}>
              <Text style={styles.infoTitle}>Hospital</Text>
              <Text style={styles.infoValue}>{request.hospital}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Icon name="map-pin" size={18} color={Colors.info} />
            <View style={styles.infoTextCol}>
              <Text style={styles.infoTitle}>Location / City</Text>
              <Text style={styles.infoValue}>{request.location}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Icon name="calendar" size={18} color={Colors.normal} />
            <View style={styles.infoTextCol}>
              <Text style={styles.infoTitle}>Required Schedule</Text>
              <Text style={styles.infoValue}>
                {formatDate(request.requiredDate)} • {request.requiredTime || 'Immediate'}
              </Text>
            </View>
          </View>

          {/* Interactive Navigation Button */}
          <TouchableOpacity
            style={styles.mapNavButton}
            onPress={handleOpenMap}
            activeOpacity={0.8}
          >
            <View style={styles.mapNavIconBg}>
              <Icon name="map-pin" size={18} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.mapNavTitle}>Open Turn-by-Turn GPS</Text>
              <Text style={styles.mapNavSub}>Navigate directly to {request.hospital} in Google Maps</Text>
            </View>
            <Icon name="chevron-right" size={18} color={Colors.primary} />
          </TouchableOpacity>
        </Card>

        {/* Contact Attendant Card */}
        <Card style={styles.card}>
          <Text style={styles.cardSectionTitle}>Attendant Contact</Text>

          <View style={styles.contactRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.contactName}>{request.contactName}</Text>
              <Text style={styles.contactPhone}>{request.contactPhone}</Text>
            </View>

            <Button
              title="Call"
              onPress={handleCall}
              icon="phone"
              size="sm"
            />
          </View>
        </Card>

        {/* Donor Status / Acceptance Notices */}
        {hasAccepted && !isFulfilled && !isCancelled && (
          <Card style={[styles.card, styles.acceptedCard]}>
            <View style={styles.statusNoticeRow}>
              <Icon name="check-circle" size={24} color={Colors.normal} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.acceptedTitle}>You have accepted this donation!</Text>
                <Text style={styles.acceptedSub}>
                  Thank you for stepping up to save a life. Please proceed to {request.hospital} as scheduled.
                </Text>
              </View>
            </View>
          </Card>
        )}

        {hasDonorFound && !hasAccepted && !isOwner && !isFulfilled && !isCancelled && (
          <Card style={[styles.card, styles.noticeCard]}>
            <View style={styles.statusNoticeRow}>
              <Icon name="heart" size={20} color={Colors.info} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.noticeTitle}>A Donor Has Stepped Forward</Text>
                <Text style={styles.noticeSub}>
                  Another generous donor is on their way to donate for this request. Thank you for your support!
                </Text>
              </View>
            </View>
          </Card>
        )}

        {isFulfilled && (
          <Card style={[styles.card, styles.fulfilledCard]}>
            <View style={styles.statusNoticeRow}>
              <Icon name="check-circle" size={24} color={Colors.normal} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.fulfilledTitle}>Request Fulfilled</Text>
                <Text style={styles.fulfilledSub}>
                  This blood request has been successfully fulfilled. Thank you to everyone who supported!
                </Text>
              </View>
            </View>
          </Card>
        )}

        {isCancelled && (
          <Card style={[styles.card, styles.cancelledCard]}>
            <View style={styles.statusNoticeRow}>
              <Icon name="x-circle" size={24} color={Colors.emergency} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.cancelledTitle}>Request Cancelled</Text>
                <Text style={styles.cancelledSub}>
                  This blood request has been closed or cancelled.
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Action Buttons */}
        {!isFulfilled && !isCancelled && (
          <View style={styles.actionButtonGroup}>
            {isOwner ? (
              <>
                <Button
                  title="Mark as Fulfilled"
                  onPress={handleCompleteRequest}
                  variant="outline"
                  size="lg"
                  loading={actionLoading}
                  icon="check-circle"
                  style={{ marginBottom: 12 }}
                />

                <Button
                  title="Cancel Request"
                  onPress={() => setCancelModalVisible(true)}
                  variant="danger"
                  size="lg"
                  disabled={actionLoading}
                  icon="x-circle"
                />
              </>
            ) : hasAccepted ? (
              <>
                <Button
                  title="Mark Donation as Completed"
                  onPress={handleCompleteRequest}
                  variant="primary"
                  size="lg"
                  loading={actionLoading}
                  icon="check-circle"
                  style={{ marginBottom: 12 }}
                />

                <Button
                  title="Navigate to Hospital"
                  onPress={handleOpenMap}
                  variant="outline"
                  size="lg"
                  icon="map-pin"
                />
              </>
            ) : !hasDonorFound ? (
              <>
                <Button
                  title="I Can Donate (Accept Request)"
                  onPress={handleAcceptDonation}
                  variant="primary"
                  size="lg"
                  loading={actionLoading}
                  icon="heart"
                  style={{ marginBottom: 12 }}
                />

                <Button
                  title="Navigate to Hospital"
                  onPress={handleOpenMap}
                  variant="outline"
                  size="lg"
                  icon="map-pin"
                />
              </>
            ) : (
              <Button
                title="View Hospital on Map"
                onPress={handleOpenMap}
                variant="outline"
                size="lg"
                icon="map-pin"
              />
            )}
          </View>
        )}
      </ScrollView>

      <ConfirmationDialog
        visible={cancelModalVisible}
        title="Cancel Blood Request?"
        message="Are you sure you want to cancel this request? Matched donors will no longer be alerted."
        confirmText="Yes, Cancel Request"
        confirmVariant="danger"
        onConfirm={handleCancelRequest}
        onCancel={() => setCancelModalVisible(false)}
      />
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
    paddingBottom: 40,
  },
  card: {
    padding: 18,
    marginBottom: 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  patientName: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  patientSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  unitsTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 5,
  },
  unitsTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  cardSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  infoTextCol: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  mapNavButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
    gap: 12,
  },
  mapNavIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapNavTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  mapNavSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contactName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  contactPhone: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusNoticeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  acceptedCard: {
    backgroundColor: Colors.normalBg,
    borderColor: Colors.normalBorder,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  acceptedTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.normal,
  },
  acceptedSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 3,
    lineHeight: 17,
  },
  noticeCard: {
    backgroundColor: Colors.infoBg,
    borderColor: Colors.infoBorder,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.info,
  },
  noticeSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 3,
    lineHeight: 17,
  },
  fulfilledCard: {
    backgroundColor: Colors.normalBg,
    borderColor: Colors.normalBorder,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  fulfilledTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.normal,
  },
  fulfilledSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 3,
  },
  cancelledCard: {
    backgroundColor: Colors.emergencyBg,
    borderColor: Colors.emergencyBorder,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  cancelledTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.emergency,
  },
  cancelledSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 3,
  },
  actionButtonGroup: {
    marginTop: 8,
  },
});
