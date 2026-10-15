import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { Card } from '../common/Card';
import { BloodGroupBadge } from '../common/BloodGroupBadge';
import { Icon } from '../common/Icon';
import { Colors } from '../../constants/colors';
import { DonorProfile } from '../../types';

interface DonorCardProps {
  donor: DonorProfile;
  onPress?: () => void;
}

export const DonorCard: React.FC<DonorCardProps> = ({ donor, onPress }) => {
  const name =
    donor.user?.fullName ||
    (donor.user?.firstName ? `${donor.user.firstName} ${donor.user.lastName || ''}`.trim() : 'Verified Donor');

  const phone = donor.user?.phone || '';
  const location = [donor.area, donor.city].filter(Boolean).join(', ') || 'Ahmedabad';
  const isAvailable = !!donor.availability;

  const initiateCall = () => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`);
  };

  const initiateWhatsApp = () => {
    if (!phone) return;
    const clean = phone.replace(/[^0-9]/g, '');
    Linking.openURL(`https://wa.me/${clean}?text=Hello,%20I%20found%20your%20profile%20on%20LifeLink.`);
  };

  const handleCall = () => {
    if (!phone) return;
    if (!isAvailable) {
      Alert.alert(
        'Donor Temporarily Unavailable',
        'This donor has marked themselves as currently unable or unwilling to donate blood. Would you still like to proceed with calling them?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Call Anyway', onPress: initiateCall },
        ]
      );
    } else {
      initiateCall();
    }
  };

  const handleWhatsApp = () => {
    if (!phone) return;
    if (!isAvailable) {
      Alert.alert(
        'Donor Temporarily Unavailable',
        'This donor has marked themselves as currently unable or unwilling to donate blood. Would you still like to message them?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Message Anyway', onPress: initiateWhatsApp },
        ]
      );
    } else {
      initiateWhatsApp();
    }
  };

  return (
    <Card
      onPress={onPress}
      style={[styles.card, !isAvailable && styles.cardUnavailable]}
    >
      <View style={styles.headerRow}>
        <BloodGroupBadge bloodGroup={donor.bloodGroup} size="lg" />
        <View style={styles.infoCol}>
          <View style={styles.nameRow}>
            <Text style={styles.donorName} numberOfLines={1}>{name}</Text>
            {isAvailable ? (
              <View style={styles.availableBadge}>
                <View style={styles.dotAvailable} />
                <Text style={styles.availableText}>Available</Text>
              </View>
            ) : (
              <View style={styles.unavailableBadge}>
                <Icon name="alert-circle" size={11} color="#DC2626" />
                <Text style={styles.unavailableText}>Unavailable</Text>
              </View>
            )}
          </View>

          <View style={styles.metaRow}>
            <Icon name="map-pin" size={13} color={Colors.textMuted} />
            <Text style={styles.locationText} numberOfLines={1}>{location}</Text>
          </View>

          <View style={styles.donationsBadge}>
            <Icon name="droplet" size={12} color={Colors.primary} />
            <Text style={styles.donationsText}>
              {donor.totalDonations || 0} donation{(donor.totalDonations || 0) === 1 ? '' : 's'}
            </Text>
          </View>
        </View>
      </View>

      {/* Unavailable warning banner for seekers */}
      {!isAvailable && (
        <View style={styles.unavailableNotice}>
          <Icon name="info" size={13} color="#B91C1C" />
          <Text style={styles.unavailableNoticeText}>
            Temporarily unavailable: Currently unable or unwilling to donate blood
          </Text>
        </View>
      )}

      <View style={styles.footerRow}>
        <View style={styles.contactType}>
          <Text style={styles.contactLabel}>Preferred: </Text>
          <Text style={styles.contactValue}>{donor.preferredContact || 'CALL'}</Text>
        </View>

        <View style={styles.actionButtons}>
          {phone ? (
            <>
              <TouchableOpacity
                style={[styles.callButton, !isAvailable && styles.callButtonMuted]}
                onPress={handleCall}
                activeOpacity={0.7}
              >
                <Icon name="phone" size={14} color={isAvailable ? Colors.primary : Colors.textMuted} />
                <Text style={[styles.callButtonText, !isAvailable && styles.actionTextMuted]}>Call</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.whatsappButton, !isAvailable && styles.whatsappButtonMuted]}
                onPress={handleWhatsApp}
                activeOpacity={0.7}
              >
                <Icon name="share" size={14} color={isAvailable ? Colors.normal : Colors.textMuted} />
                <Text style={[styles.whatsappText, !isAvailable && styles.actionTextMuted]}>WhatsApp</Text>
              </TouchableOpacity>
            </>
          ) : null}
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginVertical: 6,
  },
  cardUnavailable: {
    borderColor: '#FED7AA',
    backgroundColor: '#FFFAF5',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  infoCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  donorName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  availableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.normalBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  dotAvailable: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.normal,
  },
  availableText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.normal,
  },
  unavailableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  unavailableText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  locationText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  donationsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    gap: 4,
  },
  donationsText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  unavailableNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 10,
    gap: 6,
  },
  unavailableNoticeText: {
    fontSize: 11,
    color: '#9A3412',
    fontWeight: '600',
    flex: 1,
    lineHeight: 15,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  contactType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  contactValue: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primaryBorder,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 5,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  callButtonMuted: {
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderBottomWidth: 1,
  },
  callButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.normalBg,
    borderWidth: 1,
    borderColor: Colors.normalBorder,
    borderBottomWidth: 2,
    borderBottomColor: Colors.normalBorder,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 5,
    shadowColor: Colors.normal,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  whatsappButtonMuted: {
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderBottomWidth: 1,
  },
  whatsappText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.normal,
  },
  actionTextMuted: {
    color: Colors.textMuted,
  },
});
