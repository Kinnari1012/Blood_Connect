import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../common/Card';
import { BloodGroupBadge } from '../common/BloodGroupBadge';
import { StatusBadge } from '../common/StatusBadge';
import { UrgencyBanner } from './UrgencyBanner';
import { Icon } from '../common/Icon';
import { Colors } from '../../constants/colors';
import { BloodRequest } from '../../types';
import { formatDate } from '../../utils/formatters';

interface RequestCardProps {
  request: BloodRequest;
  onPress?: () => void;
}

export const RequestCard: React.FC<RequestCardProps> = ({ request, onPress }) => {
  const isEmergency = request.urgency === 'Critical';

  return (
    <Card
      onPress={onPress}
      variant={isEmergency ? 'emergency' : 'elevated'}
      style={styles.card}
    >
      <UrgencyBanner urgency={request.urgency} />

      <View style={styles.topRow}>
        <View style={styles.patientCol}>
          <Text style={styles.patientName} numberOfLines={1}>
            {request.patientName}
          </Text>
          <Text style={styles.requestId}>Req ID: {request.requestId}</Text>
        </View>

        <BloodGroupBadge bloodGroup={request.bloodGroup} size="lg" />
      </View>

      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <Icon name="hospital" size={14} color={Colors.primary} />
          <Text style={styles.detailText} numberOfLines={1}>
            {request.hospital}
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Icon name="map-pin" size={14} color={Colors.info} />
          <Text style={styles.detailText} numberOfLines={1}>
            {request.location}
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Icon name="calendar" size={14} color={Colors.textMuted} />
          <Text style={styles.detailText} numberOfLines={1}>
            {formatDate(request.requiredDate)} • {request.requiredTime || 'Immediate'}
          </Text>
        </View>
      </View>

      <View style={styles.footerRow}>
        <View style={styles.unitsBadge}>
          <Icon name="droplet" size={12} color={Colors.primary} />
          <Text style={styles.unitsText}>
            {request.unitsRequired} Unit{request.unitsRequired > 1 ? 's' : ''} needed
          </Text>
        </View>

        <StatusBadge status={request.status} />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginVertical: 6,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  patientCol: {
    flex: 1,
    marginRight: 12,
  },
  patientName: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  requestId: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  detailsGrid: {
    gap: 8,
    marginBottom: 14,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  unitsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 5,
  },
  unitsText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
});
