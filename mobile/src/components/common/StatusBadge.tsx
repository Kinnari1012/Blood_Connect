import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';

interface StatusBadgeProps {
  status: string;
  type?: 'status' | 'urgency';
  style?: ViewStyle;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type = 'status',
  style,
}) => {
  const getBadgeColors = (): { bg: string; text: string; border: string } => {
    const s = (status || '').toLowerCase();

    if (type === 'urgency') {
      if (s.includes('critical') || s.includes('emergency')) {
        return { bg: Colors.emergencyBg, text: Colors.emergency, border: Colors.emergencyBorder };
      }
      if (s.includes('urgent')) {
        return { bg: Colors.urgentBg, text: Colors.urgent, border: Colors.urgentBorder };
      }
      return { bg: Colors.normalBg, text: Colors.normal, border: Colors.normalBorder };
    }

    // Request & User statuses
    if (s.includes('fulfilled') || s.includes('active') || s.includes('found') || s.includes('accepted')) {
      return { bg: Colors.normalBg, text: Colors.normal, border: Colors.normalBorder };
    }
    if (s.includes('searching') || s.includes('in progress') || s.includes('pending')) {
      return { bg: Colors.infoBg, text: Colors.info, border: Colors.infoBorder };
    }
    if (s.includes('rejected') || s.includes('cancelled') || s.includes('disabled')) {
      return { bg: Colors.emergencyBg, text: Colors.emergency, border: Colors.emergencyBorder };
    }

    return { bg: Colors.surfaceSubtle, text: Colors.textSecondary, border: Colors.border };
  };

  const colors = getBadgeColors();

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: colors.bg, borderColor: colors.border },
        style,
      ]}
    >
      <Text style={[styles.badgeText, { color: colors.text }]}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
