import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '@constants/colors';

// ─── Card Variants ─────────────────────────────────────────────────────────────

type CardVariant = 'default' | 'elevated' | 'bordered' | 'gold';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  style?: ViewStyle;
  padding?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  style,
  padding = 16,
}) => {
  const variantStyle: Record<CardVariant, ViewStyle> = {
    default: {
      backgroundColor: '#FEFDF8',
      shadowColor: '#3D0C11',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
    elevated: {
      backgroundColor: '#FEFDF8',
      shadowColor: '#3D0C11',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 8,
    },
    bordered: {
      backgroundColor: '#FEFDF8',
      borderWidth: 1,
      borderColor: COLORS.cream[300],
      shadowColor: '#3D0C11',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    gold: {
      backgroundColor: '#FEFDF8',
      borderWidth: 1,
      borderColor: COLORS.gold[300],
      shadowColor: COLORS.gold[600],
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 4,
    },
  };

  return (
    <View
      style={[
        styles.base,
        { padding },
        variantStyle[variant],
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 20,
    overflow: 'hidden',
  },
});

// ─── Card Section Divider ─────────────────────────────────────────────────────

export const CardDivider: React.FC = () => (
  <View style={dividerStyles.container}>
    <View style={dividerStyles.line} />
    <View style={dividerStyles.ornament} />
    <View style={dividerStyles.line} />
  </View>
);

const dividerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.cream[300],
  },
  ornament: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.gold[500],
    marginHorizontal: 8,
  },
});

export default Card;
