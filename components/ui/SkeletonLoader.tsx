import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';

// ─── Skeleton Item ────────────────────────────────────────────────────────────

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const SkeletonItem: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  borderRadius = 8,
  style,
}) => {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 900 }),
      -1,
      true
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        { width: width as any, height, borderRadius, backgroundColor: '#EDD9AD' },
        animStyle,
        style,
      ]}
    />
  );
};

// ─── Village Card Skeleton ────────────────────────────────────────────────────

export const VillageCardSkeleton: React.FC = () => (
  <View style={sk.villageCard}>
    <SkeletonItem height={140} borderRadius={16} style={{ marginBottom: 12 }} />
    <SkeletonItem height={20} width="60%" borderRadius={8} style={{ marginBottom: 8 }} />
    <SkeletonItem height={14} width="40%" borderRadius={6} />
  </View>
);

// ─── Family Card Skeleton ─────────────────────────────────────────────────────

export const FamilyCardSkeleton: React.FC = () => (
  <View style={sk.familyCard}>
    <View style={sk.familyRow}>
      <SkeletonItem width={60} height={60} borderRadius={30} />
      <View style={sk.familyInfo}>
        <SkeletonItem height={18} width="70%" borderRadius={8} style={{ marginBottom: 8 }} />
        <SkeletonItem height={14} width="50%" borderRadius={6} style={{ marginBottom: 6 }} />
        <SkeletonItem height={12} width="40%" borderRadius={5} />
      </View>
    </View>
  </View>
);

// ─── Member Card Skeleton ─────────────────────────────────────────────────────

export const MemberCardSkeleton: React.FC = () => (
  <View style={sk.memberCard}>
    <SkeletonItem height={16} width="50%" borderRadius={6} style={{ marginBottom: 8 }} />
    <SkeletonItem height={12} width="30%" borderRadius={5} style={{ marginBottom: 6 }} />
    <SkeletonItem height={12} width="60%" borderRadius={5} />
  </View>
);

// ─── Full Page Skeleton ───────────────────────────────────────────────────────

export const HomeScreenSkeleton: React.FC = () => (
  <View style={{ padding: 16 }}>
    <SkeletonItem height={120} borderRadius={20} style={{ marginBottom: 20 }} />
    <SkeletonItem height={20} width="40%" borderRadius={8} style={{ marginBottom: 12 }} />
    <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
      <VillageCardSkeleton />
      <VillageCardSkeleton />
    </View>
    <SkeletonItem height={20} width="50%" borderRadius={8} style={{ marginBottom: 12 }} />
    {[1, 2, 3].map((i) => (
      <FamilyCardSkeleton key={i} />
    ))}
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const sk = StyleSheet.create({
  villageCard: {
    flex: 1,
    backgroundColor: '#FAF0D4',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  familyCard: {
    backgroundColor: '#FAF0D4',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  familyRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  familyInfo: {
    flex: 1,
  },
  memberCard: {
    backgroundColor: '#FAF0D4',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
});

export default SkeletonItem;
