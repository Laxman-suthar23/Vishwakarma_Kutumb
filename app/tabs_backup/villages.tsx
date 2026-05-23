import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useVillages, QUERY_KEYS } from '@hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { useIsSuperAdmin } from '@store/auth.store';
import { VillageCardFull } from '@components/village/VillageCard';
import { VillageCardSkeleton } from '@components/ui/SkeletonLoader';
import { EmptyState } from '@components/ui/EmptyState';
import { COLORS } from '@constants/colors';
import type { Village } from '@types/index';

export default function VillagesScreen() {
  const { data, isLoading, refetch } = useVillages();
  const isSuperAdmin = useIsSuperAdmin();
  const qc = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, []);

  const villages = (data?.villages ?? []).filter((v) =>
    v.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderVillage = ({ item }: { item: Village }) => (
    <VillageCardFull
      village={item}
      onPress={() => router.push(`/village/${item.$id}`)}
    />
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.cream[50] }}>
      {/* Header */}
      <LinearGradient colors={['#3D0C11', '#6B1414']} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>Villages</Text>
              <Text style={styles.headerSub}>
                {data?.total ?? 0} village{(data?.total ?? 0) !== 1 ? 's' : ''} in the directory
              </Text>
            </View>

            {isSuperAdmin && (
              <TouchableOpacity
                onPress={() => router.push('/admin/super/add-village')}
                style={styles.addButton}
              >
                <LinearGradient
                  colors={['#D4A017', '#9A6E00']}
                  style={styles.addButtonGrad}
                >
                  <Text style={styles.addButtonText}>+ Add</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>

          {/* Search bar */}
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              placeholder="Search village..."
              value={searchText}
              onChangeText={setSearchText}
              style={styles.searchInput}
              placeholderTextColor="rgba(253,248,236,0.5)"
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Text style={styles.clearBtn}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Village List */}
      {isLoading ? (
        <View style={{ padding: 16, gap: 12 }}>
          {[1, 2, 3, 4].map((i) => (
            <VillageCardSkeleton key={i} />
          ))}
        </View>
      ) : (
        <FlashList
          data={villages}
          renderItem={renderVillage}
          estimatedItemSize={172}
          keyExtractor={(item) => item.$id}
          contentContainerStyle={{ paddingVertical: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.gold[500]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="🏘️"
              title={searchText ? 'No villages found' : 'No Villages Yet'}
              description={
                searchText
                  ? `No village matches "${searchText}"`
                  : 'Start by adding your first village to the directory'
              }
              actionLabel={isSuperAdmin && !searchText ? 'Add First Village' : undefined}
              onAction={
                isSuperAdmin ? () => router.push('/admin/super/add-village') : undefined
              }
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FEFDF8',
    letterSpacing: 0.3,
  },
  headerSub: {
    fontSize: 13,
    color: 'rgba(245,208,110,0.7)',
    marginTop: 2,
  },
  addButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  addButtonGrad: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(212,160,23,0.3)',
  },
  searchIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    color: '#FEFDF8',
    fontSize: 15,
  },
  clearBtn: {
    color: 'rgba(245,208,110,0.7)',
    fontSize: 14,
    fontWeight: '700',
  },
});
