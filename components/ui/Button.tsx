import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@constants/colors';

// ─── Types ────────────────────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

// ─── Animated Wrapper ─────────────────────────────────────────────────────────

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// ─── Button Component ─────────────────────────────────────────────────────────

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon,
  fullWidth = false,
  style,
  textStyle,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const sizeStyles = {
    sm: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 10 },
    md: { paddingVertical: 13, paddingHorizontal: 24, borderRadius: 14 },
    lg: { paddingVertical: 16, paddingHorizontal: 32, borderRadius: 16 },
  };

  const textSizes = {
    sm: 13,
    md: 15,
    lg: 17,
  };

  if (variant === 'primary') {
    return (
      <Animated.View style={[animatedStyle, fullWidth && { width: '100%' }]}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || isLoading}
          activeOpacity={0.9}
          style={[fullWidth && { width: '100%' }, style]}
        >
          <LinearGradient
            colors={['#8B1A1A', '#6B1414', '#3D0C11']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.base,
              sizeStyles[size],
              (disabled || isLoading) && styles.disabled,
            ]}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.gold.light} size="small" />
            ) : (
              <>
                {icon && <>{icon}</>}
                <Text
                  style={[
                    styles.textPrimary,
                    { fontSize: textSizes[size] },
                    textStyle,
                  ]}
                >
                  {title}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  if (variant === 'gold') {
    return (
      <Animated.View style={[animatedStyle, fullWidth && { width: '100%' }]}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || isLoading}
          activeOpacity={0.9}
          style={[fullWidth && { width: '100%' }, style]}
        >
          <LinearGradient
            colors={['#D4A017', '#B8860B', '#9A6E00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.base,
              sizeStyles[size],
              (disabled || isLoading) && styles.disabled,
            ]}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                {icon && <>{icon}</>}
                <Text
                  style={[
                    styles.textGold,
                    { fontSize: textSizes[size] },
                    textStyle,
                  ]}
                >
                  {title}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  const variantStyles: Record<string, ViewStyle> = {
    secondary: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: COLORS.maroon[700],
    },
    ghost: {
      backgroundColor: 'transparent',
    },
    danger: {
      backgroundColor: COLORS.error,
    },
  };

  const variantTextColors: Record<string, string> = {
    secondary: COLORS.maroon[700],
    ghost: COLORS.maroon[700],
    danger: '#FFFFFF',
  };

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      style={[
        animatedStyle,
        styles.base,
        sizeStyles[size],
        variantStyles[variant],
        (disabled || isLoading) && styles.disabled,
        fullWidth && { width: '100%' },
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={variantTextColors[variant]} size="small" />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text
            style={[
              styles.text,
              { color: variantTextColors[variant], fontSize: textSizes[size] },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </AnimatedTouchable>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#3D0C11',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  disabled: {
    opacity: 0.5,
  },
  textPrimary: {
    color: '#F5D06E',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  textGold: {
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});

export default Button;
