import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useVillages, useDeleteVillage } from '@hooks/useQueries';
import { authService } from '@services/auth.service';
import { VillageCardFull } from '@components/village/VillageCard';
import { Card } from '@components/ui/Card';
import { EmptyState } from '@components/ui/EmptyState';
import { COLORS } from '@constants/colors';

export default function SuperAdminDashboard() {
  const qc = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'villages' | 'admins'>('villages');

  const { data: villagesData, refetch: refetchVillages } = useVillages();
  const { data: admins, refetch: refetchAdmins } = useQuery({
    queryKey: ['admins'],
    queryFn: () => authService.listAdmins(),
  });
  const deleteVillage = useDeleteVillage();

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchVillages(), refetchAdmins()]);
    setRefreshing(false);
  };

  const totalMembers = (villagesData?.villages ?? []).reduce((a, v) => a + v.totalMembers, 0);
  const totalFamilies = (villagesData?.villages ?? []).reduce((a, v) => a + v.totalFamilies, 0);

  const handleDeleteVillage = (villageId: string, villageName: string) => {
    Alert.alert(
      'Delete Village',
      `Are you sure you want to permanently delete "${villageName}" and ALL its families and members? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Permanently',
          style: 'destructive',
          onPress: () =>
            deleteVillage.mutate(villageId, {
              onError: () => Alert.alert('Error', 'Failed to delete village.'),
            }),
        },
      ]
    );
  };

  const handleDeleteAdmin = async (adminId: string, adminName: string) => {
    Alert.alert(
      'Remove Admin',
      `Remove "${adminName}" as a Village Admin?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.updateAdmin(adminId, { isActive: false });
              qc.invalidateQueries({ queryKey: ['admins'] });
            } catch {
              Alert.alert('Error', 'Failed to remove admin.');
            }
          },
        },
      ]
    );
  };

  const villages = villagesData?.villages ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.cream[50] }}>
      {/* Header */}
      <LinearGradient colors={['#1A0505', '#3D0C11']} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backBtnText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Super Admin</Text>
            <View style={{ width: 60 }} />
          </View>

          {/* Global Stats */}
          <View style={styles.statsGrid}>
            <StatCard value={villagesData?.total ?? 0} label="Villages" emoji="🏘️" color="#FFE0B2" />
            <StatCard value={totalFamilies} label="Families" emoji="🏠" color="#E8F5E9" />
            <StatCard value={totalMembers} label="Members" emoji="👥" color="#E3F2FD" />
            <StatCard value={admins?.length ?? 0} label="Admins" emoji="👮" color="#FCE4EC" />
          </View>

          {/* Action buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              onPress={() => router.push('/admin/super/add-village')}
              style={styles.actionBtn}
            >
              <LinearGradient colors={['#D4A017', '#9A6E00']} style={styles.actionGrad}>
                <Text style={styles.actionText}>+ Add Village</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/admin/super/add-admin')}
              style={styles.actionBtn}
            >
              <LinearGradient colors={['#8B1A1A', '#3D0C11']} style={styles.actionGrad}>
                <Text style={styles.actionText}>+ Add Admin</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Tab selector */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              onPress={() => setActiveTab('villages')}
              style={[styles.tab, activeTab === 'villages' && styles.tabActive]}
            >
              <Text style={[styles.tabText, activeTab === 'villages' && styles.tabTextActive]}>
                🏘️ Villages
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('admins')}
              style={[styles.tab, activeTab === 'admins' && styles.tabActive]}
            >
              <Text style={[styles.tabText, activeTab === 'admins' && styles.tabTextActive]}>
                👮 Admins
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ paddingVertical: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold[500]} />
        }
      >
        {/* ── Villages Tab ──────────────────────────────── */}
        {activeTab === 'villages' && (
          <>
            {villages.length === 0 ? (
              <EmptyState
                icon="🏘️"
                title="No Villages Yet"
                description="Start by adding the first village"
                actionLabel="Add Village"
                onAction={() => router.push('/admin/super/add-village')}
              />
            ) : (
              villages.map((village) => (
                <View key={village.$id} style={styles.villageRow}>
                  <VillageCardFull
                    village={village}
                    onPress={() => router.push(`/village/${village.$id}`)}
                  />
                  <View style={styles.villageAdminBtns}>
                    <TouchableOpacity
                      onPress={() => router.push({
                        pathname: '/admin/super/add-village',
                        params: { villageId: village.$id, editMode: 'true' },
                      })}
                      style={styles.editVillageBtn}
                    >
                      <Text style={styles.editVillageBtnText}>✏️ Edit Village</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteVillage(village.$id, village.name)}
                      style={styles.deleteVillageBtn}
                    >
                      <Text style={styles.deleteVillageBtnText}>🗑️ Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </>
        )}

        {/* ── Admins Tab ────────────────────────────────── */}
        {activeTab === 'admins' && (
          <View style={{ paddingHorizontal: 16, gap: 10 }}>
            {!admins || admins.length === 0 ? (
              <EmptyState
                icon="👮"
                title="No Admins Yet"
                description="Add village admins to manage individual villages"
                actionLabel="Add Admin"
                onAction={() => router.push('/admin/super/add-admin')}
              />
            ) : (
              admins.map((admin: any) => (
                <AdminCard
                  key={admin.$id}
                  admin={admin}
                  onEdit={() => router.push({
                    pathname: '/admin/super/add-admin',
                    params: { adminId: admin.$id, editMode: 'true' },
                  })}
                  onDelete={() => handleDeleteAdmin(admin.$id, admin.name)}
                />
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatCard = ({
  value,
  label,
  emoji,
  color,
}: {
  value: number;
  label: string;
  emoji: string;
  color: string;
}) => (
  <View style={[styles.statCard, { backgroundColor: color }]}>
    <Text style={styles.statEmoji}>{emoji}</Text>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const AdminCard = ({
  admin,
  onEdit,
  onDelete,
}: {
  admin: any;
  onEdit: () => void;
  onDelete: () => void;
}) => (
  <Card variant="bordered">
    <View style={styles.adminCardHeader}>
      <View style={styles.adminAvatarCircle}>
        <Text style={{ fontSize: 20 }}>👤</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.adminName}>{admin.name}</Text>
        <Text style={styles.adminEmail}>{admin.email}</Text>
        {admin.assignedVillageName && (
          <Text style={styles.adminVillage}>📍 {admin.assignedVillageName}</Text>
        )}
      </View>
      <View style={[styles.adminStatusBadge, { backgroundColor: admin.isActive ? '#E8F5E9' : '#FFEBEE' }]}>
        <Text style={{ fontSize: 11, color: admin.isActive ? '#2D7A3A' : '#C62828', fontWeight: '600' }}>
          {admin.isActive ? '● Active' : '● Inactive'}
        </Text>
      </View>
    </View>
    <View style={styles.adminActions}>
      <TouchableOpacity onPress={onEdit} style={styles.adminEditBtn}>
        <Text style={styles.adminEditText}>✏️ Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onDelete} style={styles.adminDeleteBtn}>
        <Text style={styles.adminDeleteText}>🗑️ Remove</Text>
      </TouchableOpacity>
    </View>
  </Card>
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingBottom: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginBottom: 16,
  },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  backBtnText: {
    color: COLORS.gold.light,
    fontSize: 13,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.gold.light,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: '20%',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    gap: 2,
  },
  statEmoji: { fontSize: 18 },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.maroon[900],
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.sandal[500],
    textAlign: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionGrad: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 0,
  },
  tab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: COLORS.gold[500],
  },
  tabText: {
    color: 'rgba(245,208,110,0.6)',
    fontWeight: '600',
    fontSize: 14,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  villageRow: {
    marginBottom: 4,
  },
  villageAdminBtns: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
    marginTop: -4,
  },
  editVillageBtn: {
    flex: 1,
    backgroundColor: COLORS.cream[100],
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gold[300],
  },
  editVillageBtnText: {
    fontSize: 13,
    color: COLORS.maroon[700],
    fontWeight: '600',
  },
  deleteVillageBtn: {
    flex: 1,
    backgroundColor: '#FFEBEE',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  deleteVillageBtnText: {
    fontSize: 13,
    color: '#C62828',
    fontWeight: '600',
  },
  adminCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  adminAvatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.cream[200],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.gold[300],
  },
  adminName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.maroon[900],
  },
  adminEmail: {
    fontSize: 12,
    color: COLORS.sandal[400],
    marginTop: 2,
  },
  adminVillage: {
    fontSize: 11,
    color: COLORS.saffron[600],
    marginTop: 2,
  },
  adminStatusBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  adminActions: {
    flexDirection: 'row',
    gap: 8,
  },
  adminEditBtn: {
    flex: 1,
    backgroundColor: COLORS.cream[100],
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gold[300],
  },
  adminEditText: {
    fontSize: 13,
    color: COLORS.maroon[700],
    fontWeight: '600',
  },
  adminDeleteBtn: {
    flex: 1,
    backgroundColor: '#FFEBEE',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  adminDeleteText: {
    fontSize: 13,
    color: '#C62828',
    fontWeight: '600',
  },
});
