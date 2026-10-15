import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  ViewStyle,
  TextInput,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { Icon, IconName } from './Icon';

export interface SelectOption {
  label: string;
  value: string;
  subtitle?: string;
}

interface SelectDropdownProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  prefixIcon?: IconName;
  error?: string;
  required?: boolean;
  containerStyle?: ViewStyle;
}

export const SelectDropdown: React.FC<SelectDropdownProps> = ({
  label,
  placeholder = 'Select an option',
  options,
  selectedValue,
  onSelect,
  prefixIcon,
  error,
  required = false,
  containerStyle,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedOption = options.find((o) => o.value === selectedValue);

  const filteredOptions = searchQuery.trim()
    ? options.filter((o) =>
        o.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  const handleSelect = (val: string) => {
    onSelect(val);
    setModalVisible(false);
    setSearchQuery('');
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
        style={[
          styles.trigger,
          !!error && styles.triggerError,
        ]}
      >
        {prefixIcon && (
          <View style={styles.prefixIcon}>
            <Icon name={prefixIcon} size={18} color={error ? Colors.emergency : Colors.textMuted} />
          </View>
        )}

        <Text
          style={[
            styles.valueText,
            !selectedOption && styles.placeholderText,
          ]}
          numberOfLines={1}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>

        <Icon name="chevron-down" size={18} color={Colors.textMuted} />
      </TouchableOpacity>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          />
          <View style={styles.sheetContainer}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{label || 'Select'}</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeBtn}
              >
                <Icon name="x" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {options.length > 6 && (
              <View style={styles.searchBox}>
                <Icon name="search" size={16} color={Colors.textMuted} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search..."
                  placeholderTextColor={Colors.textMuted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Icon name="x-circle" size={16} color={Colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>
            )}

            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item.value}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => {
                const isSelected = item.value === selectedValue;
                return (
                  <TouchableOpacity
                    style={[styles.optionItem, isSelected && styles.optionItemSelected]}
                    onPress={() => handleSelect(item.value)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.optionTextCol}>
                      <Text
                        style={[
                          styles.optionLabel,
                          isSelected && styles.optionLabelSelected,
                        ]}
                      >
                        {item.label}
                      </Text>
                      {item.subtitle ? (
                        <Text style={styles.optionSubtitle}>{item.subtitle}</Text>
                      ) : null}
                    </View>
                    {isSelected && (
                      <Icon name="check" size={18} color={Colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
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
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  backdrop: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '75%',
    paddingBottom: 24,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  closeBtn: {
    padding: 6,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 12,
    height: 42,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  optionItemSelected: {
    backgroundColor: Colors.primaryLight,
  },
  optionTextCol: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  optionLabelSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  optionSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
