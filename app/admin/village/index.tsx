import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useVillage,
  useFamilies,
  useRecentFamilies,
  useDeleteFamily,
} from '@hooks/useQueries';
import { useAuthStore, useAssignedVillage } from '@store/auth.store';
import { FamilyCard } from '@components/family/FamilyCard';
import { FamilyCardSkeleton } from '@components/ui/SkeletonLoader';
import { EmptyState } from '@components/ui/EmptyState';
import { Card } from '@components/ui/Card';
import { COLORS } from '@constants/colors';
import type { Family } from '@types/index';
import { useLanguageStore } from '@store/language.store';
import { Ionicons } from '@expo/vector-icons';

export default function VillageAdminDashboard() {
  const { user } = useAuthStore();
  const { villageId, villageName } = useAssignedVillage();
  const [refreshing, setRefreshing] = useState(false);
  const locale = useLanguageStore((s) => s.locale); // dynamic listener

  const { data: village, refetch: refetchVillage } = useVillage(villageId!);
  const { data: familiesData, isLoading, refetch: refetchFamilies } = useFamilies(villageId!);
  const { data: recentFamilies } = useRecentFamilies(villageId, 5);
  const deleteFamily = useDeleteFamily();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchVillage(), refetchFamilies()]);
    setRefreshing(false);
  }, []);

  const handleDelete = (family: Family) => {
    Alert.alert(
      locale === 'en' ? 'Delete Family' : 'परिवार हटाएं',
      locale === 'en'
        ? `Delete ${family.headName}'s family and all ${family.totalMembers} member(s)?`
        : `क्या आप ${family.headName} के परिवार और उसके सभी ${family.totalMembers} सदस्यों को हटाना चाहते हैं?`,
      [
        { text: locale === 'en' ? 'Cancel' : 'रद्द करें', style: 'cancel' },
        {
          text: locale === 'en' ? 'Delete' : 'हटाएं',
          style: 'destructive',
          onPress: () =>
            deleteFamily.mutate(
              { familyId: family.$id, villageId: villageId! },
              { 
                onError: () => Alert.alert(
                  locale === 'en' ? 'Error' : 'त्रुटि', 
                  locale === 'en' ? 'Failed to delete family.' : 'परिवार हटाने में विफल।'
                ) 
              }
            ),
        },
      ]
    );
  };

  const totalFamilies = familiesData?.total ?? 0;
  const totalMembers = village?.totalMembers ?? 0;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.cream[50] }}>
      <LinearGradient colors={['#3D0C11', '#6B1414']} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={20} color={COLORS.gold.light} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {locale === 'en' ? 'Village Admin' : 'गाँव एडमिन'}
            </Text>
            <View style={{ width: 36 }} />
          </View>

          {/* Village Info */}
          <View style={styles.villageInfo}>
            <Text style={styles.villageName}>{villageName ?? (locale === 'en' ? 'My Village' : 'मेरा गाँव')}</Text>
            <Text style={styles.villageWelcome}>
              {locale === 'en' ? `Welcome, ${user?.name}` : `स्वागत है, ${user?.name}`}
            </Text>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <StatItem emoji="🏠" value={totalFamilies} label={locale === 'en' ? 'Families' : 'परिवार'} />
            <View style={styles.statDivider} />
            <StatItem emoji="👥" value={totalMembers} label={locale === 'en' ? 'Members' : 'सदस्य'} />
            <View style={styles.statDivider} />
            <StatItem emoji="🗓️" value={recentFamilies?.length ?? 0} label={locale === 'en' ? 'Recent' : 'नवीनतम'} />
          </View>

          {/* Quick Add */}
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: '/village/family/add',
                params: { villageId, villageName },
              })
            }
            style={styles.addFamilyBtn}
          >
            <LinearGradient colors={['#D4A017', '#9A6E00']} style={styles.addFamilyGrad}>
              <Text style={styles.addFamilyText}>
                {locale === 'en' ? '+ Add New Family' : '+ नया परिवार जोड़ें'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold[500]} />
        }
        contentContainerStyle={{ padding: 16 }}
      >
        {/* Quick actions */}
        <View style={styles.quickActions}>
          <QuickAction emoji="🔍" label={locale === 'en' ? 'Browse All Families' : 'सभी परिवारों को ब्राउज़ करें'}
            onPress={() => router.push(`/village/${villageId}`)} />
          <QuickAction emoji="📊" label={locale === 'en' ? 'Village Overview' : 'गाँव का अवलोकन'}
            onPress={() => router.push(`/village/${villageId}`)} />
        </View>

        {/* Recently added */}
        <Text style={styles.sectionTitle}>
          {locale === 'en' ? 'Recently Added Families' : 'हाल ही में जुड़े परिवार'}
        </Text>

        {isLoading ? (
          [1, 2, 3].map((i) => <FamilyCardSkeleton key={i} />)
        ) : !recentFamilies || recentFamilies.length === 0 ? (
          <EmptyState
            icon="🏠"
            title={locale === 'en' ? 'No Families Yet' : 'कोई परिवार नहीं मिला'}
            description={locale === 'en' ? 'Start adding families to your village' : 'अपने गाँव में परिवार जोड़ना शुरू करें'}
            actionLabel={locale === 'en' ? 'Add First Family' : 'पहला परिवार जोड़ें'}
            onAction={() =>
              router.push({
                pathname: '/village/family/add',
                params: { villageId, villageName },
              })
            }
          />
        ) : (
          recentFamilies.map((family) => (
            <View key={family.$id} style={{ marginBottom: 4 }}>
              <FamilyCard
                family={family}
                onPress={() => router.push(`/village/family/${family.$id}`)}
              />
              <View style={styles.familyActions}>
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: '/village/family/add',
                      params: { villageId, villageName, familyId: family.$id, editMode: 'true' },
                    })
                  }
                  style={styles.editBtn}
                >
                  <Text style={styles.editBtnText}>
                    {locale === 'en' ? '✏️ Edit' : '✏️ संपादित करें'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(family)} style={styles.deleteBtn}>
                  <Text style={styles.deleteBtnText}>
                    {locale === 'en' ? '🗑️ Delete' : '🗑️ हटाएं'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {/* View all families */}
        {totalFamilies > 5 && (
          <TouchableOpacity
            onPress={() => router.push(`/village/${villageId}`)}
            style={styles.viewAllBtn}
          >
            <Text style={styles.viewAllText}>
              {locale === 'en' ? `View All ${totalFamilies} Families →` : `सभी ${totalFamilies} परिवार देखें →`}
            </Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatItem = ({ emoji, value, label }: { emoji: string; value: number; label: string }) => (
  <View style={styles.statItem}>
    <Text style={styles.statEmoji}>{emoji}</Text>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const QuickAction = ({
  emoji, label, onPress,
}: {
  emoji: string; label: string; onPress: () => void;
}) => (
  <TouchableOpacity onPress={onPress} style={styles.quickAction}>
    <Text style={styles.qaEmoji}>{emoji}</Text>
    <Text style={styles.qaLabel}>{label}</Text>
    <Text style={styles.qaArrow}>›</Text>
  </TouchableOpacity>
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingBottom: 16 },
  headerRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingTop: 12,
  },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 18,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.gold.light },
  villageInfo: { marginTop: 12, marginBottom: 16 },
  villageName: { fontSize: 26, fontWeight: '700', color: '#FEFDF8', letterSpacing: 0.3 },
  villageWelcome: { fontSize: 13, color: 'rgba(245,208,110,0.7)', marginTop: 2 },
  statsRow: {
    flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 14, padding: 12, marginBottom: 14,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statEmoji: { fontSize: 18, marginBottom: 2 },
  statValue: { fontSize: 22, fontWeight: '700', color: COLORS.gold.light },
  statLabel: { fontSize: 11, color: 'rgba(245,208,110,0.6)', marginTop: 1 },
  statDivider: { width: 1, backgroundColor: 'rgba(212,160,23,0.3)', marginHorizontal: 8 },
  addFamilyBtn: { borderRadius: 14, overflow: 'hidden' },
  addFamilyGrad: { paddingVertical: 14, alignItems: 'center' },
  addFamilyText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16, letterSpacing: 0.3 },
  quickActions: { gap: 8, marginBottom: 20 },
  quickAction: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#FEFDF8', borderRadius: 14, padding: 14,
    shadowColor: '#3D0C11', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  qaEmoji: { fontSize: 22 },
  qaLabel: { flex: 1, fontSize: 15, color: COLORS.maroon[800], fontWeight: '500' },
  qaArrow: { fontSize: 22, color: COLORS.gold[500] },
  sectionTitle: {
    fontSize: 18, fontWeight: '700', color: COLORS.maroon[900],
    marginBottom: 12, letterSpacing: 0.2,
  },
  familyActions: {
    flexDirection: 'row', gap: 8, marginTop: -2, marginBottom: 12, paddingHorizontal: 2,
  },
  editBtn: {
    flex: 1, backgroundColor: COLORS.cream[100], borderRadius: 10,
    paddingVertical: 8, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.gold[300],
  },
  editBtnText: { fontSize: 12, color: COLORS.maroon[700], fontWeight: '600' },
  deleteBtn: {
    flex: 1, backgroundColor: '#FFEBEE', borderRadius: 10,
    paddingVertical: 8, alignItems: 'center',
  },
  deleteBtnText: { fontSize: 12, color: '#C62828', fontWeight: '600' },
  viewAllBtn: {
    backgroundColor: COLORS.maroon[700], borderRadius: 14,
    paddingVertical: 14, alignItems: 'center', marginTop: 8,
  },
  viewAllText: { color: COLORS.gold.light, fontWeight: '700', fontSize: 15 },
});
