import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { Icon } from '../common/Icon';
import { UrgencyLevel } from '../../types';

interface UrgencyBannerProps {
  urgency: UrgencyLevel | string;
  style?: ViewStyle;
}

export const UrgencyBanner: React.FC<UrgencyBannerProps> = ({ urgency, style }) => {
  const isCritical = urgency === 'Critical' || urgency === 'Emergency';
  const isUrgent = urgency === 'Urgent';

  if (!isCritical && !isUrgent) return null;

  return (
    <View
      style={[
        styles.banner,
        isCritical ? styles.bannerCritical : styles.bannerUrgent,
        style,
      ]}
    >
      <Icon
        name="alert-triangle"
        size={16}
        color={isCritical ? Colors.emergency : Colors.urgent}
      />
      <Text
        style={[
          styles.text,
          isCritical ? styles.textCritical : styles.textUrgent,
        ]}
      >
        {isCritical ? 'CRITICAL EMERGENCY REQUEST' : 'URGENT BLOOD REQUIREMENT'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  bannerCritical: {
    backgroundColor: Colors.emergencyBg,
    borderWidth: 1,
    borderColor: Colors.emergencyBorder,
  },
  bannerUrgent: {
    backgroundColor: Colors.urgentBg,
    borderWidth: 1,
    borderColor: Colors.urgentBorder,
  },
  text: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  textCritical: {
    color: Colors.emergency,
  },
  textUrgent: {
    color: Colors.urgent,
  },
});
