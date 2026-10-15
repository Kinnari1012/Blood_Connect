import React, { useState, useRef, useImperativeHandle } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { Icon, IconName } from './Icon';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  prefixIcon?: IconName;
  isPassword?: boolean;
  containerStyle?: ViewStyle;
  required?: boolean;
}

export const Input = React.forwardRef<any, InputProps>(
  (
    {
      label,
      error,
      prefixIcon,
      isPassword = false,
      containerStyle,
      required = false,
      value,
      onChangeText,
      placeholder,
      style,
      onFocus,
      onBlur,
      ...rest
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const internalRef = useRef<any>(null);

    useImperativeHandle(ref, () => internalRef.current);

    const handleFocus = (e: any) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    return (
      <View style={[styles.container, containerStyle]}>
        {label && (
          <TouchableOpacity
            style={styles.labelRow}
            onPress={() => internalRef.current?.focus()}
            activeOpacity={0.8}
          >
            <Text style={styles.label}>{label}</Text>
            {required && <Text style={styles.requiredMark}>*</Text>}
          </TouchableOpacity>
        )}

        <Pressable
          style={[
            styles.inputWrapper,
            isFocused && styles.inputFocused,
            !!error && styles.inputError,
          ]}
          onPress={() => internalRef.current?.focus()}
        >
          {prefixIcon && (
            <View style={styles.prefixIcon} pointerEvents="none">
              <Icon
                name={prefixIcon}
                size={18}
                color={error ? Colors.emergency : isFocused ? Colors.primary : Colors.textMuted}
              />
            </View>
          )}

          <TextInput
            ref={internalRef}
            style={[styles.textInput, style]}
            value={value !== undefined ? value : ''}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={Colors.textMuted}
            onFocus={handleFocus}
            onBlur={handleBlur}
            secureTextEntry={isPassword && !showPassword}
            autoCapitalize={rest.autoCapitalize ?? 'none'}
            underlineColorAndroid="transparent"
            textAlignVertical="center"
            {...rest}
          />

          {isPassword && (
            <TouchableOpacity
              style={styles.actionIcon}
              onPress={() => setShowPassword(!showPassword)}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon
                name={showPassword ? 'eye-off' : 'eye'}
                size={18}
                color={Colors.textMuted}
              />
            </TouchableOpacity>
          )}

          {!isPassword && !!value && value.length > 0 && isFocused && (
            <TouchableOpacity
              style={styles.actionIcon}
              onPress={() => onChangeText && onChangeText('')}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="x-circle" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </Pressable>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    );
  }
);

Input.displayName = 'Input';

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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  inputFocused: {
    borderColor: Colors.primary,
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: Colors.emergency,
    backgroundColor: '#FFF8F8',
  },
  prefixIcon: {
    marginRight: 10,
  },
  actionIcon: {
    padding: 6,
    marginLeft: 4,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
  errorText: {
    fontSize: 12,
    color: Colors.emergency,
    marginTop: 4,
    fontWeight: '500',
  },
});
