import React, { useState, forwardRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { COLORS } from '@constants/colors';

// ─── Input Component ──────────────────────────────────────────────────────────

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  required?: boolean;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      hint,
      icon,
      rightIcon,
      onRightIconPress,
      containerStyle,
      required,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <View style={[styles.container, containerStyle]}>
        {label && (
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        )}
        <View
          style={[
            styles.inputContainer,
            isFocused && styles.focused,
            error ? styles.error : null,
          ]}
        >
          {icon && <View style={styles.iconLeft}>{icon}</View>}
          <TextInput
            ref={ref}
            style={[
              styles.input,
              icon ? styles.inputWithIcon : null,
              rightIcon ? styles.inputWithRightIcon : null,
            ]}
            placeholderTextColor={COLORS.sandal[400]}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
          {rightIcon && (
            <TouchableOpacity
              onPress={onRightIconPress}
              style={styles.iconRight}
            >
              {rightIcon}
            </TouchableOpacity>
          )}
        </View>
        {error && <Text style={styles.errorText}>{error}</Text>}
        {hint && !error && <Text style={styles.hint}>{hint}</Text>}
      </View>
    );
  }
);

Input.displayName = 'Input';

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.maroon[800],
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  required: {
    color: COLORS.saffron[500],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.cream[300],
    backgroundColor: '#FEFDF8',
    shadowColor: '#3D0C11',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  focused: {
    borderColor: COLORS.gold[500],
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  error: {
    borderColor: COLORS.error,
  },
  input: {
    flex: 1,
    paddingVertical: 13,
    paddingHorizontal: 14,
    fontSize: 15,
    color: COLORS.maroon[900],
    fontWeight: '400',
  },
  inputWithIcon: {
    paddingLeft: 4,
  },
  inputWithRightIcon: {
    paddingRight: 4,
  },
  iconLeft: {
    paddingLeft: 14,
  },
  iconRight: {
    paddingRight: 14,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 2,
  },
  hint: {
    color: COLORS.sandal[500],
    fontSize: 12,
    marginTop: 4,
    marginLeft: 2,
  },
});

export default Input;
