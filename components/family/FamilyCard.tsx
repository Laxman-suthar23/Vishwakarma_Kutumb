import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Avatar } from '@components/ui/Avatar';
import { COLORS } from '@constants/colors';
import { formatMobile } from '@utils/helpers';
import type { Family } from '@types/index';

// ─── Family Card Component ────────────────────────────────────────────────────

interface FamilyCardProps {
  family: Family;
  onPress: () => void;
  showVillage?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const FamilyCard: React.FC<FamilyCardProps> = ({
  family,
  onPress,
  showVillage = false,
}) => {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleCall = () => {
    Linking.openURL(`tel:${family.mobile}`);
  };

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.98); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      activeOpacity={0.9}
      style={[styles.card, animStyle]}
    >
      {/* Gold top accent */}
      <View style={styles.goldAccent} />

      <View style={styles.content}>
        {/* Avatar & Info */}
        <View style={styles.left}>
          <Avatar
            name={family.headName}
            imageUrl={family.headImageUrl}
            size="md"
            isHead
          />
        </View>

        <View style={styles.middle}>
          <Text style={styles.headName} numberOfLines={1}>
            {family.headName}
          </Text>

          {family.fatherName && (
            <Text style={styles.fatherName} numberOfLines={1}>
              S/o {family.fatherName}
            </Text>
          )}

          <View style={styles.metaRow}>
            {/* Gotra badge */}
            <View style={styles.gotraBadge}>
              <Text style={styles.gotraText}>{family.gotra}</Text>
            </View>

            {/* Village (optional) */}
            {showVillage && family.villageName && (
              <View style={styles.villageBadge}>
                <Text style={styles.villageText} numberOfLines={1}>
                  📍 {family.villageName}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.memberCount}>
            👥 {family.totalMembers} Member{family.totalMembers !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Call Button */}
        <TouchableOpacity
          onPress={handleCall}
          style={styles.callButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.callIcon}>📞</Text>
        </TouchableOpacity>
      </View>

      {/* Address */}
      {family.address && (
        <Text style={styles.address} numberOfLines={1}>
          📍 {family.address}
        </Text>
      )}
    </AnimatedTouchable>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FEFDF8',
    borderRadius: 18,
    marginBottom: 10,
    shadowColor: '#3D0C11',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    overflow: 'hidden',
  },
  goldAccent: {
    height: 2,
    backgroundColor: COLORS.gold[500],
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  left: {},
  middle: {
    flex: 1,
    gap: 3,
  },
  headName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.maroon[900],
    letterSpacing: 0.2,
  },
  fatherName: {
    fontSize: 12,
    color: COLORS.sandal[500],
    fontStyle: 'italic',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginTop: 2,
  },
  gotraBadge: {
    backgroundColor: COLORS.cream[200],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.gold[300],
  },
  gotraText: {
    fontSize: 11,
    color: COLORS.maroon[700],
    fontWeight: '600',
  },
  villageBadge: {
    backgroundColor: '#FFF0E6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  villageText: {
    fontSize: 10,
    color: COLORS.saffron[700],
    fontWeight: '500',
    maxWidth: 100,
  },
  memberCount: {
    fontSize: 12,
    color: COLORS.sandal[500],
    marginTop: 2,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  callIcon: {
    fontSize: 16,
  },
  address: {
    fontSize: 12,
    color: COLORS.sandal[400],
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
});

export default FamilyCard;
