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

interface DatePickerModalProps {
  label?: string;
  value?: string;
  onChange: (dateString: string) => void;
  error?: string;
  required?: boolean;
  containerStyle?: ViewStyle;
}

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  label = 'Required Date',
  value,
  onChange,
  error,
  required = false,
  containerStyle,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  // Helper to format ISO YYYY-MM-DD
  const formatDateString = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const today = new Date();
  const tomorrow = new Date(Date.now() + 86400000);
  const inTwoDays = new Date(Date.now() + 86400000 * 2);

  const presets = [
    { label: 'Today', date: formatDateString(today) },
    { label: 'Tomorrow', date: formatDateString(tomorrow) },
    { label: 'In 2 Days', date: formatDateString(inTwoDays) },
  ];

  const handleSelect = (dateStr: string) => {
    onChange(dateStr);
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
          <Icon name="calendar" size={18} color={error ? Colors.emergency : Colors.textMuted} />
        </View>

        <Text style={[styles.valueText, !value && styles.placeholderText]}>
          {value || 'Select Date'}
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

            <Text style={styles.sectionSubtitle}>Quick Presets</Text>
            <View style={styles.presetRow}>
              {presets.map((p) => {
                const isSelected = value === p.date;
                return (
                  <TouchableOpacity
                    key={p.label}
                    style={[styles.presetBtn, isSelected && styles.presetBtnActive]}
                    onPress={() => handleSelect(p.date)}
                  >
                    <Text
                      style={[styles.presetText, isSelected && styles.presetTextActive]}
                    >
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.calendarNotice}>
              <Icon name="info" size={16} color={Colors.info} />
              <Text style={styles.noticeText}>
                Date set to: <Text style={{ fontWeight: '700' }}>{value || formatDateString(today)}</Text>
              </Text>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={() => {
                  if (!value) onChange(formatDateString(today));
                  setModalVisible(false);
                }}
              >
                <Text style={styles.confirmBtnText}>Done</Text>
              </TouchableOpacity>
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
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 10,
    fontWeight: '600',
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  presetBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
  },
  presetBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  presetText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  presetTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  calendarNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.infoBg,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    gap: 8,
  },
  noticeText: {
    fontSize: 13,
    color: Colors.info,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  confirmBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  confirmBtnText: {
    color: Colors.textInverted,
    fontWeight: '700',
    fontSize: 14,
  },
});
