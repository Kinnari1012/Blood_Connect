import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { formatBloodGroup } from '../../utils/formatters';

interface BloodGroupBadgeProps {
  bloodGroup?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'filled' | 'tint';
  style?: ViewStyle;
}

export const BloodGroupBadge: React.FC<BloodGroupBadgeProps> = ({
  bloodGroup = 'O+',
  size = 'md',
  variant = 'filled',
  style,
}) => {
  const display = formatBloodGroup(bloodGroup);

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return { container: styles.sizeSm, text: styles.textSm };
      case 'lg':
        return { container: styles.sizeLg, text: styles.textLg };
      case 'md':
      default:
        return { container: styles.sizeMd, text: styles.textMd };
    }
  };

  const { container: sizeContainer, text: sizeText } = getSizeStyle();

  return (
    <View
      style={[
        styles.badge,
        variant === 'tint' ? styles.tintContainer : styles.filledContainer,
        sizeContainer,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          variant === 'tint' ? styles.tintText : styles.filledText,
          sizeText,
        ]}
      >
        {display}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  filledContainer: {
    backgroundColor: Colors.primary,
    borderTopWidth: 1.5,
    borderTopColor: Colors.highlightTop,
    borderBottomWidth: 2.5,
    borderBottomColor: Colors.primaryDeep,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.32,
    shadowRadius: 5,
    elevation: 3,
  },
  filledText: {
    color: Colors.textInverted,
    letterSpacing: 0.5,
  },
  tintContainer: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primaryBorder,
    shadowColor: Colors.shadowAmbient,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  tintText: {
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  text: {
    fontWeight: '800',
  },
  sizeSm: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  textSm: {
    fontSize: 11,
  },
  sizeMd: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  textMd: {
    fontSize: 13,
  },
  sizeLg: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  textLg: {
    fontSize: 17,
  },
});
