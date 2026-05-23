import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@constants/colors';

// ─── Gold Ornament Divider ────────────────────────────────────────────────────

interface OrnamentDividerProps {
  symbol?: string;
  style?: ViewStyle;
  color?: string;
}

export const OrnamentDivider: React.FC<OrnamentDividerProps> = ({
  symbol = '◆',
  style,
  color = COLORS.gold[500],
}) => (
  <View style={[divStyles.row, style]}>
    <View style={[divStyles.line, { backgroundColor: `${color}40` }]} />
    <Text style={[divStyles.symbol, { color }]}>{symbol}</Text>
    <View style={[divStyles.line, { backgroundColor: `${color}40` }]} />
  </View>
);

const divStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  line: {
    flex: 1,
    height: 1,
  },
  symbol: {
    fontSize: 10,
    marginHorizontal: 10,
  },
});

// ─── Gold Section Badge ───────────────────────────────────────────────────────

interface SectionBadgeProps {
  title: string;
  emoji?: string;
  subtitle?: string;
  style?: ViewStyle;
}

export const SectionBadge: React.FC<SectionBadgeProps> = ({
  title,
  emoji,
  subtitle,
  style,
}) => (
  <View style={[badgeStyles.container, style]}>
    <LinearGradient
      colors={['#D4A017', '#9A6E00']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={badgeStyles.gradient}
    />
    <View style={badgeStyles.content}>
      {emoji && <Text style={badgeStyles.emoji}>{emoji}</Text>}
      <View>
        <Text style={badgeStyles.title}>{title}</Text>
        {subtitle && <Text style={badgeStyles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  </View>
);

const badgeStyles = StyleSheet.create({
  container: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 14,
    shadowColor: COLORS.gold[600],
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  gradient: {
    height: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.cream[100],
  },
  emoji: {
    fontSize: 22,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.maroon[900],
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.sandal[400],
    marginTop: 2,
  },
});

// ─── Mandala Pattern Background ───────────────────────────────────────────────

export const MandalaBackground: React.FC<{
  size?: number;
  opacity?: number;
  style?: ViewStyle;
}> = ({ size = 200, opacity = 0.05, style }) => (
  <View
    style={[
      {
        position: 'absolute',
        right: -size * 0.3,
        top: -size * 0.3,
        opacity,
        pointerEvents: 'none',
      },
      style,
    ]}
    pointerEvents="none"
  >
    <Text
      style={{
        fontSize: size,
        color: COLORS.gold[400],
      }}
    >
      ☸
    </Text>
  </View>
);

// ─── Stats Row Component ──────────────────────────────────────────────────────

interface StatItem {
  emoji: string;
  value: string | number;
  label: string;
}

interface StatsRowProps {
  stats: StatItem[];
  style?: ViewStyle;
  dark?: boolean;
}

export const StatsRow: React.FC<StatsRowProps> = ({
  stats,
  style,
  dark = false,
}) => (
  <View
    style={[
      statsStyles.container,
      dark ? statsStyles.containerDark : statsStyles.containerLight,
      style,
    ]}
  >
    {stats.map((stat, index) => (
      <React.Fragment key={index}>
        <View style={statsStyles.item}>
          <Text style={statsStyles.emoji}>{stat.emoji}</Text>
          <Text
            style={[
              statsStyles.value,
              { color: dark ? COLORS.gold.light : COLORS.maroon[900] },
            ]}
          >
            {stat.value}
          </Text>
          <Text
            style={[
              statsStyles.label,
              {
                color: dark
                  ? 'rgba(245,208,110,0.65)'
                  : COLORS.sandal[400],
              },
            ]}
          >
            {stat.label}
          </Text>
        </View>
        {index < stats.length - 1 && (
          <View
            style={[
              statsStyles.divider,
              {
                backgroundColor: dark
                  ? 'rgba(212,160,23,0.25)'
                  : COLORS.cream[300],
              },
            ]}
          />
        )}
      </React.Fragment>
    ))}
  </View>
);

const statsStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 14,
  },
  containerDark: {
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  containerLight: {
    backgroundColor: COLORS.cream[100],
    borderWidth: 1,
    borderColor: COLORS.cream[300],
    shadowColor: '#3D0C11',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  emoji: {
    fontSize: 20,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.3,
  },
  divider: {
    width: 1,
    marginHorizontal: 8,
  },
});

// ─── Badge/Tag Component ──────────────────────────────────────────────────────

interface BadgeProps {
  label: string;
  color?: string;
  textColor?: string;
  emoji?: string;
  small?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  color = COLORS.cream[200],
  textColor = COLORS.maroon[700],
  emoji,
  small = false,
}) => (
  <View
    style={[
      badgeTagStyles.container,
      { backgroundColor: color },
      small && badgeTagStyles.small,
    ]}
  >
    {emoji && <Text style={[badgeTagStyles.emoji, small && { fontSize: 11 }]}>{emoji}</Text>}
    <Text style={[badgeTagStyles.text, { color: textColor }, small && badgeTagStyles.textSmall]}>
      {label}
    </Text>
  </View>
);

const badgeTagStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  small: {
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  emoji: {
    fontSize: 13,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  textSmall: {
    fontSize: 11,
  },
});

// ─── Loading Spinner ──────────────────────────────────────────────────────────

export const GoldSpinner: React.FC<{ message?: string }> = ({
  message = 'Loading...',
}) => (
  <View style={spinnerStyles.container}>
    <View style={spinnerStyles.iconCircle}>
      <LinearGradient
        colors={['#D4A017', '#9A6E00']}
        style={spinnerStyles.iconGrad}
      >
        <Text style={{ fontSize: 28 }}>🏛️</Text>
      </LinearGradient>
    </View>
    <Text style={spinnerStyles.text}>{message}</Text>
  </View>
);

const spinnerStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: 'hidden',
    shadowColor: COLORS.gold[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  iconGrad: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: COLORS.sandal[500],
    fontSize: 14,
    fontStyle: 'italic',
    letterSpacing: 0.3,
  },
});
