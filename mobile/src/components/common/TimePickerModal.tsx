import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { Icon } from './Icon';

interface TimePickerModalProps {
  label?: string;
  value?: string;
  onChange: (timeString: string) => void;
  error?: string;
  required?: boolean;
  containerStyle?: ViewStyle;
}

export const TimePickerModal: React.FC<TimePickerModalProps> = ({
  label = 'Required Time',
  value,
  onChange,
  error,
  required = false,
  containerStyle,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const timeSlots = [
    'Immediately (Emergency)',
    'Within 2 hours',
    'Morning (9 AM - 12 PM)',
    'Afternoon (12 PM - 4 PM)',
    'Evening (4 PM - 8 PM)',
    'Night (8 PM - 11 PM)',
  ];

  const handleSelect = (slot: string) => {
    onChange(slot);
    setModalVisible(false);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {required && <Text style={styles.requiredMark}>*</Text>}
        </View>
      )}

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setModalVisible(true)}
        style={[styles.trigger, !!error && styles.triggerError]}
      >
        <View style={styles.prefixIcon}>
          <Icon name="clock" size={18} color={error ? Colors.emergency : Colors.textMuted} />
        </View>

        <Text style={[styles.valueText, !value && styles.placeholderText]}>
          {value || 'Select Time Slot'}
        </Text>

        <Icon name="chevron-down" size={18} color={Colors.textMuted} />
      </TouchableOpacity>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.dialogContainer}>
            <View style={styles.dialogHeader}>
              <Text style={styles.dialogTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="x" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.slotList}>
              {timeSlots.map((slot) => {
                const isSelected = value === slot;
                const isEmergency = slot.includes('Immediately');
                return (
                  <TouchableOpacity
                    key={slot}
                    style={[
                      styles.slotItem,
                      isSelected && styles.slotItemSelected,
                      isEmergency && styles.emergencySlot,
                    ]}
                    onPress={() => handleSelect(slot)}
                  >
                    <Text
                      style={[
                        styles.slotText,
                        isSelected && styles.slotTextSelected,
                        isEmergency && styles.emergencySlotText,
                      ]}
                    >
                      {slot}
                    </Text>
                    {isSelected && (
                      <Icon
                        name="check"
                        size={18}
                        color={isEmergency ? Colors.emergency : Colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
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
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  requiredMark: {
    color: Colors.emergency,
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '700',
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  triggerError: {
    borderColor: Colors.emergency,
    backgroundColor: '#FFF8F8',
  },
  prefixIcon: {
    marginRight: 10,
  },
  valueText: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  placeholderText: {
    color: Colors.textMuted,
    fontWeight: '400',
  },
  errorText: {
    fontSize: 12,
    color: Colors.emergency,
    marginTop: 4,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    padding: 20,
  },
  dialogContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    width: '100%',
    maxWidth: 360,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  dialogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  slotList: {
    gap: 8,
  },
  slotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  slotItemSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  emergencySlot: {
    backgroundColor: '#FEF2F2',
    borderColor: Colors.emergencyBorder,
  },
  emergencySlotText: {
    color: Colors.emergency,
    fontWeight: '700',
  },
  slotText: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  slotTextSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
