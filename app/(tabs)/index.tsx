import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore, useIsSuperAdmin, useAssignedVillage } from '@store/auth.store';
import { useVillages, useRecentFamilies, QUERY_KEYS } from '@hooks/useQueries';
import { VillageCard } from '@components/village/VillageCard';
import { FamilyCard } from '@components/family/FamilyCard';
import { HomeScreenSkeleton, VillageCardSkeleton, FamilyCardSkeleton } from '@components/ui/SkeletonLoader';
import { EmptyState } from '@components/ui/EmptyState';
import { COLORS } from '@constants/colors';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { user } = useAuthStore();
  const isSuperAdmin = useIsSuperAdmin();
  const { villageId } = useAssignedVillage();
  const qc = useQueryClient();

  const { data: villagesData, isLoading: loadingVillages, refetch: refetchVillages } = useVillages();
  const { data: recentFamilies, isLoading: loadingFamilies, refetch: refetchFamilies } = useRecentFamilies(
    isSuperAdmin ? undefined : villageId,
    6
  );

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchVillages(), refetchFamilies()]);
    setRefreshing(false);
  }, []);

  const villages = villagesData?.villages ?? [];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'शुभ प्रभात 🌅';
    if (h < 17) return 'नमस्ते 🙏';
    return 'शुभ संध्या 🌙';
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.cream[50] }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.gold[500]}
              colors={[COLORS.maroon[700]]}
            />
          }
        >
          {/* ── Welcome Banner ─────────────────────────────────── */}
          <LinearGradient
            colors={['#3D0C11', '#6B1414', '#8B1A1A']}
            style={styles.banner}
          >
            {/* Decorative mandala */}
            <Text style={styles.bannerMandala}>☸</Text>

            <View style={styles.bannerContent}>
              <Text style={styles.greeting}>{greeting()}</Text>
              <Text style={styles.userName}>{user?.name || 'Guest User'}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>
                  {!user ? '👤 Public Viewer' : user.role === 'SUPER_ADMIN' ? '👑 Super Admin' : '🏘️ Village Admin'}
                </Text>
              </View>
            </View>

            {/* Stats row */}
            <View style={styles.bannerStats}>
              <StatChip
                value={villagesData?.total ?? 0}
                label="Villages"
                emoji="🏘️"
              />
              <View style={styles.statDivider} />
              <StatChip
                value={villages.reduce((a, v) => a + v.totalFamilies, 0)}
                label="Families"
                emoji="🏠"
              />
              <View style={styles.statDivider} />
              <StatChip
                value={villages.reduce((a, v) => a + v.totalMembers, 0)}
                label="Members"
                emoji="👥"
              />
            </View>

            {/* Gold bottom ornament */}
            <View style={styles.bannerOrnament}>
              <View style={styles.ornamentLine} />
              <Text style={styles.ornamentDiamond}>◆</Text>
              <View style={styles.ornamentLine} />
            </View>
          </LinearGradient>

          {/* ── Quick Actions ──────────────────────────────────── */}
          <View style={styles.quickActions}>
            <QuickAction
              emoji="🔍"
              label="Search"
              onPress={() => router.push('/(tabs)/search')}
            />
            <QuickAction
              emoji="🏘️"
              label="Villages"
              onPress={() => router.push('/(tabs)/villages')}
            />
            {user ? (
              <>
                {isSuperAdmin ? (
                  <QuickAction
                    emoji="👑"
                    label="Dashboard"
                    onPress={() => router.push('/admin/super')}
                  />
                ) : (
                  <QuickAction
                    emoji="📋"
                    label="Manage"
                    onPress={() => router.push('/admin/village')}
                  />
                )}
                <QuickAction
                  emoji="➕"
                  label="Add Family"
                  onPress={() => router.push('/village/family/add')}
                />
              </>
            ) : (
              <QuickAction
                emoji="🔐"
                label="Admin Login"
                onPress={() => router.push('/auth/login')}
              />
            )}
          </View>

          {/* ── Featured Villages ──────────────────────────────── */}
          <SectionHeader
            title="Featured Villages"
            subtitle="Tap to explore families"
            onSeeAll={() => router.push('/(tabs)/villages')}
          />

          {loadingVillages ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {[1, 2, 3].map((i) => (
                <View key={i} style={{ width: 160, marginLeft: 16 }}>
                  <VillageCardSkeleton />
                </View>
              ))}
            </ScrollView>
          ) : villages.length === 0 ? (
            <EmptyState
              icon="🏘️"
              title="No Villages Yet"
              description="Start by adding your first village"
              actionLabel={isSuperAdmin ? 'Add Village' : undefined}
              onAction={isSuperAdmin ? () => router.push('/admin/super/add-village') : undefined}
            />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalContent}
            >
              {villages.map((village) => (
                <View key={village.$id} style={{ width: 180 }}>
                  <VillageCard
                    village={village}
                    onPress={() => router.push(`/village/${village.$id}`)}
                  />
                </View>
              ))}
            </ScrollView>
          )}

          {/* ── Recently Added Families ────────────────────────── */}
          <SectionHeader
            title="Recent Families"
            subtitle="Newly added to the directory"
            onSeeAll={() => router.push('/(tabs)/villages')}
          />

          <View style={styles.familyList}>
            {loadingFamilies ? (
              [1, 2, 3].map((i) => <FamilyCardSkeleton key={i} />)
            ) : !recentFamilies || recentFamilies.length === 0 ? (
              <EmptyState
                icon="🏠"
                title="No Families Added Yet"
                description="Start adding families to your village directory"
              />
            ) : (
              recentFamilies.map((family) => (
                <FamilyCard
                  key={family.$id}
                  family={family}
                  showVillage
                  onPress={() => router.push(`/village/family/${family.$id}`)}
                />
              ))
            )}
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatChip = ({
  value,
  label,
  emoji,
}: {
  value: number;
  label: string;
  emoji: string;
}) => (
  <View style={styles.statChip}>
    <Text style={styles.statEmoji}>{emoji}</Text>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const QuickAction = ({
  emoji,
  label,
  onPress,
}: {
  emoji: string;
  label: string;
  onPress: () => void;
}) => (
  <TouchableOpacity onPress={onPress} style={styles.quickAction}>
    <View style={styles.qaIconBg}>
      <Text style={styles.qaEmoji}>{emoji}</Text>
    </View>
    <Text style={styles.qaLabel}>{label}</Text>
  </TouchableOpacity>
);

const SectionHeader = ({
  title,
  subtitle,
  onSeeAll,
}: {
  title: string;
  subtitle?: string;
  onSeeAll?: () => void;
}) => (
  <View style={styles.sectionHeader}>
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
    {onSeeAll && (
      <TouchableOpacity onPress={onSeeAll}>
        <Text style={styles.seeAll}>See All →</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  banner: {
    padding: 20,
    paddingTop: 24,
    paddingBottom: 0,
    position: 'relative',
    overflow: 'hidden',
  },
  bannerMandala: {
    position: 'absolute',
    right: -30,
    top: -20,
    fontSize: 140,
    color: 'rgba(212,160,23,0.07)',
  },
  bannerContent: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(245,208,110,0.8)',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  userName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FEFDF8',
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(212,160,23,0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(212,160,23,0.4)',
  },
  roleText: {
    color: COLORS.gold[300],
    fontSize: 12,
    fontWeight: '600',
  },
  bannerStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 16,
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(212,160,23,0.25)',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(212,160,23,0.3)',
    marginHorizontal: 8,
  },
  statChip: {
    flex: 1,
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 18,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.gold.light,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(245,208,110,0.7)',
    marginTop: 1,
  },
  bannerOrnament: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
  },
  ornamentLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(212,160,23,0.3)',
  },
  ornamentDiamond: {
    color: COLORS.gold[500],
    fontSize: 10,
    marginHorizontal: 8,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 10,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#FEFDF8',
    borderWidth: 1,
    borderColor: COLORS.cream[300],
    shadowColor: '#3D0C11',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  qaIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.cream[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: COLORS.gold[200] + '40', // Subtle gold border
  },
  qaEmoji: {
    fontSize: 20,
  },
  qaLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.maroon[900],
    textAlign: 'center',
  },
  horizontalScroll: {
    paddingLeft: 16,
  },
  horizontalContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.maroon[900],
    letterSpacing: 0.2,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.sandal[400],
    marginTop: 2,
  },
  seeAll: {
    fontSize: 13,
    color: COLORS.saffron[600],
    fontWeight: '600',
  },
  familyList: {
    paddingHorizontal: 16,
  },
});
