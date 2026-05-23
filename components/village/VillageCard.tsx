import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { COLORS } from '@constants/colors';
import type { Village } from '@types/index';

// ─── Village Card ─────────────────────────────────────────────────────────────

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

interface VillageCardProps {
  village: Village;
  onPress: () => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const VillageCard: React.FC<VillageCardProps> = ({ village, onPress }) => {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.96); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      activeOpacity={0.9}
      style={[styles.card, animStyle]}
    >
      {/* Village Image */}
      <View style={styles.imageContainer}>
        {village.coverImageUrl ? (
          <Image
            source={{ uri: village.coverImageUrl }}
            style={styles.image}
            contentFit="cover"
            transition={400}
          />
        ) : (
          <LinearGradient
            colors={['#8B1A1A', '#3D0C11']}
            style={styles.imagePlaceholder}
          >
            <Text style={styles.placeholderIcon}>🏘️</Text>
          </LinearGradient>
        )}

        {/* Gold overlay gradient */}
        <LinearGradient
          colors={['transparent', 'rgba(61,12,17,0.85)']}
          style={styles.overlay}
        >
          <Text style={styles.villageName} numberOfLines={2}>
            {village.name}
          </Text>
        </LinearGradient>

        {/* Gold accent top border */}
        <View style={styles.goldBorder} />
      </View>

      {/* Stats Row */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{village.totalFamilies}</Text>
          <Text style={styles.statLabel}>Families</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{village.totalMembers}</Text>
          <Text style={styles.statLabel}>Members</Text>
        </View>
      </View>
    </AnimatedTouchable>
  );
};

// ─── Full Width Village Card ──────────────────────────────────────────────────

export const VillageCardFull: React.FC<VillageCardProps> = ({ village, onPress }) => {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.97); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      activeOpacity={0.9}
      style={[styles.fullCard, animStyle]}
    >
      <View style={styles.fullImageContainer}>
        {village.coverImageUrl ? (
          <Image
            source={{ uri: village.coverImageUrl }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            transition={400}
          />
        ) : (
          <LinearGradient
            colors={['#8B1A1A', '#6B1414', '#3D0C11']}
            style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ fontSize: 40 }}>🏘️</Text>
          </LinearGradient>
        )}

        <LinearGradient
          colors={['transparent', 'rgba(61,12,17,0.9)']}
          style={styles.fullOverlay}
        >
          <Text style={styles.fullVillageName}>{village.name}</Text>
          <View style={styles.fullStats}>
            <Text style={styles.fullStatText}>
              🏠 {village.totalFamilies} Families · 👥 {village.totalMembers} Members
            </Text>
          </View>
        </LinearGradient>
      </View>
    </AnimatedTouchable>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FEFDF8',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#3D0C11',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  imageContainer: {
    height: 130,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    fontSize: 36,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    paddingTop: 30,
  },
  goldBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: COLORS.gold[500],
  },
  villageName: {
    color: COLORS.gold.light,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  stats: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#FAF0D4',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.maroon[800],
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.sandal[500],
    marginTop: 1,
    letterSpacing: 0.3,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.cream[300],
  },

  // Full width variant
  fullCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#3D0C11',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 7,
  },
  fullImageContainer: {
    height: 160,
    width: '100%',
    position: 'relative',
  },
  fullOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingTop: 40,
  },
  fullVillageName: {
    color: '#FEFDF8',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  fullStats: {},
  fullStatText: {
    color: COLORS.gold[300],
    fontSize: 12,
    fontWeight: '500',
  },
});

export default VillageCard;
