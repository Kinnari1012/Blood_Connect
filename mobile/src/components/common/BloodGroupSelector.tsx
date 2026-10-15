import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { BLOOD_GROUPS } from '../../constants/bloodGroups';

interface BloodGroupSelectorProps {
  label?: string;
  selected?: string;
  onSelect: (bloodGroup: string) => void;
  error?: string;
  required?: boolean;
  containerStyle?: ViewStyle;
}

export const BloodGroupSelector: React.FC<BloodGroupSelectorProps> = ({
  label = 'Select Blood Group',
  selected,
  onSelect,
  error,
  required = false,
  containerStyle,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {required && <Text style={styles.requiredMark}>*</Text>}
        </View>
      )}

      <View style={styles.grid}>
        {BLOOD_GROUPS.map((item) => {
          // Normalize comparison for value ('A_POS') or display ('A+')
          const isSelected = selected === item.value || selected === item.label;

          return (
            <TouchableOpacity
              key={item.value}
              activeOpacity={0.8}
              onPress={() => onSelect(item.value)}
              style={[
                styles.item,
                isSelected ? styles.itemSelected : styles.itemDefault,
              ]}
            >
              <Text style={[styles.itemText, isSelected && styles.itemTextSelected]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  requiredMark: {
    color: Colors.emergency,
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  item: {
    width: '22%',
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemDefault: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderTopWidth: 1.5,
    borderTopColor: '#FFFFFF',
    borderBottomWidth: 2.5,
    borderBottomColor: '#CBD5E1',
    shadowColor: Colors.shadowAmbient,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  itemSelected: {
    backgroundColor: Colors.primary,
    borderTopWidth: 1.5,
    borderTopColor: Colors.highlightTop,
    borderBottomWidth: 3,
    borderBottomColor: Colors.primaryDeep,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  itemText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  itemTextSelected: {
    color: Colors.textInverted,
  },
  errorText: {
    color: Colors.emergency,
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
  },
});
