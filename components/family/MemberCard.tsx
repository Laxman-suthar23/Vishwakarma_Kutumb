import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { COLORS } from '@constants/colors';
import {
  calculateAgeDetailed,
  getEducationDisplay,
  getEducationColor,
  formatMobile,
  RELATION_LABELS,
} from '@utils/helpers';
import type { Member } from '@types/index';

// ─── Member Card ──────────────────────────────────────────────────────────────

interface MemberCardProps {
  member: Member;
  index: number;
  isAdmin?: boolean;
  onEdit?: (member: Member) => void;
  onDelete?: (memberId: string) => void;
}

export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  index,
  isAdmin = false,
  onEdit,
  onDelete,
}) => {
  const [expanded, setExpanded] = useState(false);
  const rotation = useSharedValue(0);
  const height = useSharedValue(0);

  const toggleExpand = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    rotation.value = withSpring(newExpanded ? 1 : 0);
    height.value = withTiming(newExpanded ? 1 : 0, { duration: 300 });
  };

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(rotation.value, [0, 1], [0, 180])}deg` }],
  }));

  const expandStyle = useAnimatedStyle(() => ({
    opacity: height.value,
    maxHeight: interpolate(height.value, [0, 1], [0, 200]),
  }));

  const age = calculateAgeDetailed(member.dateOfBirth);
  const educationDisplay = getEducationDisplay(member);
  const eduColor = getEducationColor(member.educationType);
  const relationLabel = RELATION_LABELS[member.relation] || member.relation;

  const isHeadOfFamily = member.relation === 'SELF';

  return (
    <View style={[styles.card, isHeadOfFamily && styles.headCard]}>
      {/* Relation color bar */}
      <View style={[styles.colorBar, { backgroundColor: isHeadOfFamily ? COLORS.gold[500] : COLORS.saffron[400] }]} />

      <TouchableOpacity
        onPress={toggleExpand}
        activeOpacity={0.8}
        style={styles.header}
      >
        {/* Gender icon */}
        <View style={[styles.genderBadge, { backgroundColor: member.gender === 'FEMALE' ? '#FCE4EC' : '#E3F2FD' }]}>
          <Text style={{ fontSize: 16 }}>
            {member.gender === 'MALE' ? '👨' : member.gender === 'FEMALE' ? '👩' : '🧑'}
          </Text>
        </View>

        <View style={styles.mainInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {member.name}
            </Text>
            {isHeadOfFamily && (
              <View style={styles.headBadge}>
                <Text style={styles.headBadgeText}>Head</Text>
              </View>
            )}
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.relation}>{relationLabel}</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.age}>{age}</Text>
          </View>

          {/* Education badge */}
          <View style={[styles.eduBadge, { backgroundColor: eduColor.bg }]}>
            <Text style={[styles.eduText, { color: eduColor.text }]}>
              {educationDisplay || member.educationType}
            </Text>
          </View>
        </View>

        {/* Expand arrow */}
        <Animated.Text style={[styles.arrow, arrowStyle]}>▼</Animated.Text>
      </TouchableOpacity>

      {/* Expanded details */}
      <Animated.View style={[styles.expandedContent, expandStyle]}>
        <View style={styles.divider} />

        <View style={styles.detailGrid}>
          {member.mobile && (
            <DetailItem
              label="Mobile"
              value={formatMobile(member.mobile)}
              onPress={() => Linking.openURL(`tel:${member.mobile}`)}
              icon="📱"
            />
          )}
          {member.occupation && (
            <DetailItem label="Occupation" value={member.occupation} icon="💼" />
          )}
          {member.educationType === 'SCHOOL' && member.currentStandard && (
            <DetailItem
              label="Class"
              value={`Standard ${member.currentStandard}`}
              icon="📚"
            />
          )}
          {member.schoolOrCollegeName && (
            <DetailItem
              label="Institution"
              value={member.schoolOrCollegeName}
              icon="🏫"
            />
          )}
          {member.degree && (
            <DetailItem label="Degree" value={member.degree} icon="🎓" />
          )}
        </View>

        {/* Admin Actions */}
        {isAdmin && (
          <View style={styles.adminActions}>
            <TouchableOpacity
              onPress={() => onEdit?.(member)}
              style={styles.editBtn}
            >
              <Text style={styles.editBtnText}>✏️ Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onDelete?.(member.$id)}
              style={styles.deleteBtn}
            >
              <Text style={styles.deleteBtnText}>🗑️ Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    </View>
  );
};

// ─── Detail Item ──────────────────────────────────────────────────────────────

interface DetailItemProps {
  label: string;
  value: string;
  icon?: string;
  onPress?: () => void;
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value, icon, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={!onPress}
    style={styles.detailItem}
    activeOpacity={onPress ? 0.7 : 1}
  >
    <Text style={styles.detailLabel}>{icon} {label}</Text>
    <Text style={[styles.detailValue, onPress && { color: COLORS.maroon[700], textDecorationLine: 'underline' }]}>
      {value}
    </Text>
  </TouchableOpacity>
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FEFDF8',
    borderRadius: 14,
    marginBottom: 8,
    overflow: 'hidden',
    shadowColor: '#3D0C11',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  headCard: {
    borderWidth: 1,
    borderColor: COLORS.gold[300],
    shadowOpacity: 0.12,
    elevation: 4,
  },
  colorBar: {
    height: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  genderBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainInfo: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.maroon[900],
    flex: 1,
  },
  headBadge: {
    backgroundColor: COLORS.gold[100],
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.gold[400],
  },
  headBadgeText: {
    fontSize: 10,
    color: COLORS.gold[700],
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  relation: {
    fontSize: 12,
    color: COLORS.saffron[600],
    fontWeight: '600',
  },
  dot: {
    color: COLORS.sandal[400],
    fontSize: 10,
  },
  age: {
    fontSize: 12,
    color: COLORS.sandal[500],
  },
  eduBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 3,
  },
  eduText: {
    fontSize: 11,
    fontWeight: '600',
  },
  arrow: {
    color: COLORS.gold[500],
    fontSize: 11,
    fontWeight: '700',
  },
  expandedContent: {
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.cream[300],
    marginHorizontal: 12,
  },
  detailGrid: {
    padding: 12,
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.sandal[500],
    flex: 1,
  },
  detailValue: {
    fontSize: 13,
    color: COLORS.maroon[800],
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  adminActions: {
    flexDirection: 'row',
    gap: 8,
    padding: 10,
    paddingTop: 0,
  },
  editBtn: {
    flex: 1,
    backgroundColor: COLORS.cream[200],
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gold[300],
  },
  editBtnText: {
    fontSize: 12,
    color: COLORS.maroon[700],
    fontWeight: '600',
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: '#FFEBEE',
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteBtnText: {
    fontSize: 12,
    color: '#C62828',
    fontWeight: '600',
  },
});

export default MemberCard;
