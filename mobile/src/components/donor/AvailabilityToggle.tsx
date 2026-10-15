import React from 'react';
import { View, Text, Switch, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { Icon } from '../common/Icon';

interface AvailabilityToggleProps {
  available: boolean;
  onToggle: (newVal: boolean) => void;
  loading?: boolean;
  style?: ViewStyle;
}

export const AvailabilityToggle: React.FC<AvailabilityToggleProps> = ({
  available,
  onToggle,
  loading = false,
  style,
}) => {
  return (
    <View style={[styles.container, available ? styles.containerActive : styles.containerInactive, style]}>
      <View style={styles.textCol}>
        <View style={styles.titleRow}>
          <View style={[styles.statusPill, available ? styles.statusPillActive : styles.statusPillInactive]}>
            <View style={[styles.statusDot, available ? styles.statusDotActive : styles.statusDotInactive]} />
            <Text style={[styles.statusPillText, available ? styles.statusTextActive : styles.statusTextInactive]}>
              {available ? 'Available' : 'Unavailable'}
            </Text>
          </View>
          <Text style={styles.title}>Donor Status</Text>
        </View>

        <Text style={styles.description}>
          {available
            ? 'Ready to receive emergency blood alerts and save lives.'
            : 'Marked unavailable. Seekers and alerts are temporarily paused.'}
        </Text>
      </View>

      <Switch
        value={available}
        onValueChange={onToggle}
        disabled={loading}
        trackColor={{ false: Colors.border, true: Colors.normalBorder }}
        thumbColor={available ? Colors.normal : '#94A3B8'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderTopWidth: 1.5,
    borderTopColor: '#FFFFFF',
    borderBottomWidth: 2.5,
    shadowColor: Colors.shadowAmbient,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  containerActive: {
    borderBottomColor: Colors.normalBorder,
  },
  containerInactive: {
    borderBottomColor: '#CBD5E1',
  },
  textCol: {
    flex: 1,
    marginRight: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 5,
  },
  statusPillActive: {
    backgroundColor: Colors.normalBg,
    borderWidth: 1,
    borderColor: Colors.normalBorder,
  },
  statusPillInactive: {
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusDotActive: {
    backgroundColor: Colors.normal,
  },
  statusDotInactive: {
    backgroundColor: Colors.textMuted,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  statusTextActive: {
    color: Colors.normal,
  },
  statusTextInactive: {
    color: Colors.textMuted,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  description: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
});
