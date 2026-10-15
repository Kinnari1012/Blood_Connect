import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  variant?: 'elevated' | 'outlined' | 'flat' | 'emergency' | '3d';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  variant = 'elevated',
}) => {
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case '3d':
        return styles.card3D;
      case 'outlined':
        return styles.outlined;
      case 'emergency':
        return styles.emergency;
      case 'flat':
        return styles.flat;
      case 'elevated':
      default:
        return styles.elevated;
    }
  };

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.82}
        onPress={onPress}
        style={[styles.card, getVariantStyle(), style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.card, getVariantStyle(), style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    marginVertical: 6,
  },
  elevated: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderTopWidth: 1.5,
    borderTopColor: '#FFFFFF',
    borderBottomWidth: 2,
    borderBottomColor: '#E2E8F0',
    shadowColor: Colors.shadowAmbient,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  card3D: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderTopWidth: 2,
    borderTopColor: '#FFFFFF',
    borderBottomWidth: 3,
    borderBottomColor: '#CBD5E1',
    shadowColor: Colors.shadowAmbient,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  outlined: {
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  emergency: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1.5,
    borderColor: Colors.emergencyBorder,
    borderTopWidth: 1.5,
    borderTopColor: '#FFFFFF',
    borderBottomWidth: 2.5,
    borderBottomColor: Colors.emergencyBorder,
    shadowColor: Colors.emergency,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 4,
  },
  flat: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
});
