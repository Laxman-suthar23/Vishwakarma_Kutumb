import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import {
  useVillage,
  useFamilies,
  useDeleteVillage,
} from '@hooks/useQueries';
import { useIsSuperAdmin, useIsVillageAdmin, useAssignedVillage } from '@store/auth.store';
import { FamilyCard } from '@components/family/FamilyCard';
import { FamilyCardSkeleton } from '@components/ui/SkeletonLoader';
import { EmptyState } from '@components/ui/EmptyState';
import { COLORS } from '@constants/colors';
import { COMMON_GOTRAS } from '@constants/config';
import type { Family } from '@/types';

export default function VillageDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [searchText, setSearchText] = useState('');
  const [selectedGotra, setSelectedGotra] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Queries
  const { data: village, isLoading: isVillageLoading, refetch: refetchVillage } = useVillage(id!);
  const { data: familiesData, isLoading: isFamiliesLoading, refetch: refetchFamilies } = useFamilies(id!);
  const deleteVillageMutation = useDeleteVillage();

  // Admin Permissions
  const isSuperAdmin = useIsSuperAdmin();
  const isVillageAdmin = useIsVillageAdmin();
  const { villageId: assignedVillageId } = useAssignedVillage();
  const canManage = isSuperAdmin || (isVillageAdmin && assignedVillageId === id);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchVillage(), refetchFamilies()]);
    setRefreshing(false);
  }, [id, refetchVillage, refetchFamilies]);

  // Filter families locally by search term and selected gotra
  const filteredFamilies = useMemo(() => {
    const list = familiesData?.families ?? [];
    return list.filter((family) => {
      const matchesSearch = family.headName.toLowerCase().includes(searchText.toLowerCase()) ||
        (family.gotra && family.gotra.toLowerCase().includes(searchText.toLowerCase())) ||
        (family.address && family.address.toLowerCase().includes(searchText.toLowerCase()));

      const matchesGotra = !selectedGotra || family.gotra === selectedGotra;

      return matchesSearch && matchesGotra;
    });
  }, [familiesData, searchText, selectedGotra]);

  const handleDeleteVillage = () => {
    Alert.alert(
      '🚨 Delete Village',
      `Are you absolutely sure you want to delete ${village?.name}? This will permanently erase the village and cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteVillageMutation.mutateAsync(id!);
              Alert.alert('Success', 'Village deleted successfully.');
              router.replace('/(tabs)/villages');
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete village.');
            }
          },
        },
      ]
    );
  };

  const renderHeader = () => {
    if (isVillageLoading) return null;

    return (
      <View style={styles.contentContainer}>
        {/* Description section */}
        {village?.description ? (
          <View style={styles.descriptionSection}>
            <Text style={styles.descriptionText}>{village.description}</Text>
          </View>
        ) : null}

        {/* Stats Row */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statEmoji}>🏠</Text>
            <View>
              <Text style={styles.statVal}>{village?.totalFamilies ?? 0}</Text>
              <Text style={styles.statLbl}>Families</Text>
            </View>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statEmoji}>👥</Text>
            <View>
              <Text style={styles.statVal}>{village?.totalMembers ?? 0}</Text>
              <Text style={styles.statLbl}>Members</Text>
            </View>
          </View>
        </View>

        {/* Search Bar & Gotra Filters Section */}
        <View style={styles.filtersSection}>
          <Text style={styles.sectionTitle}>Browse Families</Text>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              placeholder="Search by head name, gotra or address..."
              value={searchText}
              onChangeText={setSearchText}
              style={styles.searchInput}
              placeholderTextColor={COLORS.sandal[400]}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Text style={styles.clearBtn}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Gotra chips list */}
          <Text style={styles.filterTitle}>Filter by Gotra</Text>
          <FlatList
            horizontal
            data={[null, ...COMMON_GOTRAS]}
            keyExtractor={(item, index) => item || `all-${index}`}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.gotraChipsList}
            renderItem={({ item }) => {
              const isActive = selectedGotra === item;
              return (
                <TouchableOpacity
                  onPress={() => setSelectedGotra(item)}
                  style={[styles.gotraChip, isActive && styles.gotraChipActive]}
                >
                  <Text style={[styles.gotraChipText, isActive && styles.gotraChipTextActive]}>
                    {item ? item : '✨ All Gotras'}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
    );
  };

  if (isVillageLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.maroon[800]} />
        <Text style={styles.loadingText}>Loading village details...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.cream[50] }}>
      {/* Cover Hero Image & Navigation Header */}
      <View style={styles.heroContainer}>
        {village?.coverImageUrl ? (
          <Image
            source={{ uri: village.coverImageUrl }}
            style={styles.heroImage}
            contentFit="cover"
            transition={300}
          />
        ) : (
          <LinearGradient
            colors={['#8B1A1A', '#6B1414', '#3D0C11']}
            style={styles.heroPlaceholder}
          />
        )}
        
        {/* Soft overlay gradient */}
        <LinearGradient
          colors={['rgba(0,0,0,0.5)', 'transparent', 'rgba(61,12,17,0.95)']}
          style={styles.heroOverlay}
        />

        {/* Back and Admin buttons inside Safe Area */}
        <SafeAreaView edges={['top']} style={styles.heroHeaderActions}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>

          <Text style={styles.heroTitle} numberOfLines={1}>
            {village?.name}
          </Text>

          {isSuperAdmin ? (
            <TouchableOpacity onPress={handleDeleteVillage} style={styles.deleteButton}>
              <Text style={styles.deleteButtonText}>🗑️</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </SafeAreaView>

        {/* Floating Add Family Action inside Hero bottom right */}
        {canManage && (
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: '/village/family/add',
                params: { villageId: id, villageName: village?.name },
              })
            }
            style={styles.floatingAddBtn}
          >
            <LinearGradient
              colors={['#D4A017', '#9A6E00']}
              style={styles.floatingAddGrad}
            >
              <Text style={styles.floatingAddText}>+ Add Family</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      {/* Main Content & Families list */}
      <FlatList
        data={filteredFamilies}
        keyExtractor={(item) => item.$id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.gold[500]}
          />
        }
        renderItem={({ item }) => (
          <FamilyCard
            family={item}
            onPress={() => router.push(`/village/family/${item.$id}`)}
          />
        )}
        ListEmptyComponent={
          isFamiliesLoading ? (
            <View style={{ padding: 16, gap: 10 }}>
              {[1, 2, 3].map((i) => (
                <FamilyCardSkeleton key={i} />
              ))}
            </View>
          ) : (
            <View style={{ padding: 20 }}>
              <EmptyState
                icon="🏘️"
                title={searchText || selectedGotra ? 'No matching families' : 'No Families Registered'}
                description={
                  searchText || selectedGotra
                    ? 'Try adjusting your search query or Gotra filter'
                    : 'Be the first to register a family in this village directory.'
                }
                actionLabel={canManage && !searchText && !selectedGotra ? 'Register First Family' : undefined}
                onAction={
                  canManage
                    ? () =>
                        router.push({
                          pathname: '/village/family/add',
                          params: { villageId: id, villageName: village?.name },
                        })
                    : undefined
                }
              />
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.cream[50],
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: COLORS.maroon[800],
    fontSize: 16,
    fontWeight: '600',
  },
  heroContainer: {
    height: 220,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroPlaceholder: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  heroHeaderActions: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: -3,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FEFDF8',
    letterSpacing: 0.3,
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(192, 57, 43, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
  },
  floatingAddBtn: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  floatingAddGrad: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingAddText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  contentContainer: {
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  descriptionSection: {
    backgroundColor: '#FFFDF9',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FAF0D4',
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.sandal[600],
    lineHeight: 20,
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FAF0D4',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(212,160,23,0.2)',
  },
  statBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statEmoji: {
    fontSize: 24,
  },
  statVal: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.maroon[800],
  },
  statLbl: {
    fontSize: 11,
    color: COLORS.sandal[500],
    marginTop: 1,
  },
  statDivider: {
    width: 1.5,
    height: 32,
    backgroundColor: COLORS.cream[300],
    marginHorizontal: 8,
  },
  filtersSection: {
    gap: 10,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.maroon[900],
    letterSpacing: 0.2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEFDF8',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.cream[300],
  },
  searchIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    color: COLORS.black,
    fontSize: 14,
    padding: 0,
  },
  clearBtn: {
    color: COLORS.sandal[500],
    fontSize: 14,
    fontWeight: '700',
  },
  filterTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.maroon[700],
    marginTop: 6,
  },
  gotraChipsList: {
    paddingRight: 16,
    paddingBottom: 6,
    gap: 8,
  },
  gotraChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: COLORS.cream[100],
    borderWidth: 1,
    borderColor: COLORS.cream[300],
  },
  gotraChipActive: {
    backgroundColor: COLORS.maroon[700],
    borderColor: COLORS.maroon[700],
  },
  gotraChipText: {
    fontSize: 12,
    color: COLORS.sandal[600],
    fontWeight: '500',
  },
  gotraChipTextActive: {
    color: COLORS.gold.light,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 32,
  },
});
