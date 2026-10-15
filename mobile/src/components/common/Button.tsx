import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { Icon, IconName } from './Icon';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
}) => {
  const getContainerStyle = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return styles.primaryBtn;
      case 'secondary':
        return styles.secondaryBtn;
      case 'outline':
        return styles.outlineBtn;
      case 'danger':
        return styles.dangerBtn;
      case 'ghost':
        return styles.ghostBtn;
      default:
        return styles.primaryBtn;
    }
  };

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case 'primary':
        return styles.primaryText;
      case 'secondary':
        return styles.secondaryText;
      case 'outline':
        return styles.outlineText;
      case 'danger':
        return styles.dangerText;
      case 'ghost':
        return styles.ghostText;
      default:
        return styles.primaryText;
    }
  };

  const getSizeStyle = (): { container: ViewStyle; text: TextStyle } => {
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

  const getIconColor = (): string => {
    switch (variant) {
      case 'outline':
      case 'ghost':
        return Colors.primary;
      case 'danger':
      case 'primary':
      case 'secondary':
      default:
        return Colors.textInverted;
    }
  };

  const sizeStyles = getSizeStyle();
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.base,
        getContainerStyle(),
        sizeStyles.container,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? Colors.primary : Colors.textInverted} />
      ) : (
        <View style={styles.contentRow}>
          {icon && iconPosition === 'left' && (
            <View style={styles.leftIcon}>
              <Icon name={icon} size={size === 'sm' ? 16 : 18} color={getIconColor()} />
            </View>
          )}
          <Text style={[styles.baseText, getTextStyle(), sizeStyles.text, textStyle]}>
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <View style={styles.rightIcon}>
              <Icon name={icon} size={size === 'sm' ? 16 : 18} color={getIconColor()} />
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  baseText: {
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },

  // 3D Tactile Variants
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderTopWidth: 1.5,
    borderTopColor: Colors.highlightTop,
    borderBottomWidth: 2.5,
    borderBottomColor: Colors.primaryDeep,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryText: {
    color: Colors.textInverted,
  },

  secondaryBtn: {
    backgroundColor: Colors.secondary,
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    borderBottomWidth: 2.5,
    borderBottomColor: Colors.secondaryDeep,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 3,
  },
  secondaryText: {
    color: Colors.textInverted,
  },

  outlineBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: Colors.primaryBorder,
    borderBottomWidth: 2.5,
    borderBottomColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  outlineText: {
    color: Colors.primary,
  },

  dangerBtn: {
    backgroundColor: Colors.emergency,
    borderTopWidth: 1.5,
    borderTopColor: Colors.highlightTop,
    borderBottomWidth: 2.5,
    borderBottomColor: Colors.emergencyDeep,
    shadowColor: Colors.emergency,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  dangerText: {
    color: Colors.textInverted,
  },

  ghostBtn: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: Colors.primary,
  },

  disabled: {
    opacity: 0.5,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 0,
    borderTopWidth: 0,
  },

  // Sizes
  sizeSm: {
    paddingVertical: 9,
    paddingHorizontal: 15,
    borderRadius: 12,
  },
  textSm: {
    fontSize: 13,
  },
  sizeMd: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  textMd: {
    fontSize: 15,
  },
  sizeLg: {
    paddingVertical: 17,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  textLg: {
    fontSize: 16,
    fontWeight: '800',
  },
});
