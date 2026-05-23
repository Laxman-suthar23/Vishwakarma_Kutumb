import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { familyService } from '@services/family.service';
import { memberService } from '@services/member.service';
import { FamilyCard } from '@components/family/FamilyCard';
import { EmptyState } from '@components/ui/EmptyState';
import { COLORS } from '@constants/colors';
import type { Family, Member } from '@/types/index';

type FilterType = 'all' | 'families' | 'members';

const FILTER_CHIPS: { label: string; value: FilterType; emoji: string }[] = [
  { label: 'All', value: 'all', emoji: '🌐' },
  { label: 'Families', value: 'families', emoji: '🏠' },
  { label: 'Members', value: 'members', emoji: '👤' },
];

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [isSearching, setIsSearching] = useState(false);
  const [families, setFamilies] = useState<Family[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();
  const inputRef = useRef<TextInput>(null);

  const runSearch = useCallback(async (q: string, filter: FilterType) => {
    if (!q.trim() || q.trim().length < 2) {
      setFamilies([]);
      setMembers([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      const [fams, mems] = await Promise.all([
        filter !== 'members' ? familyService.searchFamilies(q) : Promise.resolve([]),
        filter !== 'families' ? memberService.searchMembers(q) : Promise.resolve([]),
      ]);

      setFamilies(fams);
      setMembers(mems);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleQueryChange = (text: string) => {
    setQuery(text);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      runSearch(text, activeFilter);
    }, 450);
  };

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    if (query.trim().length >= 2) {
      runSearch(query, filter);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setFamilies([]);
    setMembers([]);
    setHasSearched(false);
    inputRef.current?.focus();
  };

  const totalResults = families.length + members.length;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.cream[50] }}>
      {/* Header */}
      <LinearGradient colors={['#3D0C11', '#6B1414']} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <Text style={styles.headerTitle}>Search Directory</Text>
          <Text style={styles.headerSub}>Find families, members, gotras and more</Text>

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>{isSearching ? '⌛' : '🔍'}</Text>
            <TextInput
              ref={inputRef}
              placeholder="Search by name, gotra, mobile..."
              value={query}
              onChangeText={handleQueryChange}
              style={styles.searchInput}
              placeholderTextColor="rgba(253,248,236,0.45)"
              returnKeyType="search"
              autoFocus
              autoCapitalize="words"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <Text style={styles.clearBtn}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {FILTER_CHIPS.map((chip) => (
              <TouchableOpacity
                key={chip.value}
                onPress={() => handleFilterChange(chip.value)}
                style={[
                  styles.filterChip,
                  activeFilter === chip.value && styles.filterChipActive,
                ]}
              >
                <Text style={styles.filterEmoji}>{chip.emoji}</Text>
                <Text
                  style={[
                    styles.filterLabel,
                    activeFilter === chip.value && styles.filterLabelActive,
                  ]}
                >
                  {chip.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      {/* Results */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Result count */}
        {hasSearched && !isSearching && (
          <View style={styles.resultCount}>
            <Text style={styles.resultCountText}>
              {totalResults === 0
                ? 'No results found'
                : `${totalResults} result${totalResults !== 1 ? 's' : ''} for "${query}"`}
            </Text>
          </View>
        )}

        {isSearching && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={COLORS.gold[500]} size="large" />
            <Text style={styles.loadingText}>Searching directory...</Text>
          </View>
        )}

        {/* Family Results */}
        {families.length > 0 && (
          <>
            <SectionLabel title="Families" count={families.length} emoji="🏠" />
            {families.map((family) => (
              <FamilyCard
                key={family.$id}
                family={family}
                showVillage
                onPress={() => router.push(`/village/family/${family.$id}`)}
              />
            ))}
          </>
        )}

        {/* Member Results */}
        {members.length > 0 && (
          <>
            <SectionLabel title="Members" count={members.length} emoji="👤" />
            {members.map((member) => (
              <MemberSearchResult key={member.$id} member={member} />
            ))}
          </>
        )}

        {/* Empty State */}
        {!isSearching && hasSearched && totalResults === 0 && (
          <EmptyState
            icon="🔍"
            title="No results found"
            description={`We couldn't find anything for "${query}". Try a different name, mobile number, or gotra.`}
          />
        )}

        {!hasSearched && (
          <SearchHints />
        )}
      </ScrollView>
    </View>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionLabel = ({
  title,
  count,
  emoji,
}: {
  title: string;
  count: number;
  emoji: string;
}) => (
  <View style={styles.sectionLabel}>
    <Text style={styles.sectionLabelText}>
      {emoji} {title}
    </Text>
    <View style={styles.countBadge}>
      <Text style={styles.countText}>{count}</Text>
    </View>
  </View>
);

const MemberSearchResult = ({ member }: { member: Member }) => (
  <View style={styles.memberResult}>
    <View style={styles.memberResultIcon}>
      <Text style={{ fontSize: 20 }}>
        {member.gender === 'MALE' ? '👨' : '👩'}
      </Text>
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.memberName}>{member.name}</Text>
      <Text style={styles.memberMeta}>{member.relation} · {member.educationType}</Text>
    </View>
    <TouchableOpacity
      onPress={() => router.push(`/village/family/${member.familyId}`)}
      style={styles.viewFamilyBtn}
    >
      <Text style={styles.viewFamilyText}>View Family</Text>
    </TouchableOpacity>
  </View>
);

const SearchHints = () => (
  <View style={styles.hints}>
    <Text style={styles.hintsTitle}>🔍 Search Tips</Text>
    {[
      { emoji: '👤', text: 'Search by family head name' },
      { emoji: '📱', text: 'Search by mobile number' },
      { emoji: '🏷️', text: 'Search by Gotra (e.g., Lunja, Kuleriya, Padama)' },
      { emoji: '🏘️', text: 'Search by village name' },
      { emoji: '💼', text: 'Search by occupation or education' },
    ].map((hint, i) => (
      <View key={i} style={styles.hintItem}>
        <Text style={styles.hintEmoji}>{hint.emoji}</Text>
        <Text style={styles.hintText}>{hint.text}</Text>
      </View>
    ))}
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FEFDF8',
    marginTop: 12,
    letterSpacing: 0.3,
  },
  headerSub: {
    fontSize: 13,
    color: 'rgba(245,208,110,0.7)',
    marginTop: 2,
    marginBottom: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(212,160,23,0.35)',
    marginBottom: 12,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    color: '#FEFDF8',
    fontSize: 16,
  },
  clearBtn: {
    color: 'rgba(245,208,110,0.7)',
    fontSize: 14,
    fontWeight: '700',
    paddingLeft: 4,
  },
  filterRow: {
    gap: 8,
    paddingBottom: 4,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(212,160,23,0.2)',
  },
  filterChipActive: {
    backgroundColor: COLORS.gold[500],
    borderColor: COLORS.gold[400],
  },
  filterEmoji: {
    fontSize: 13,
  },
  filterLabel: {
    fontSize: 13,
    color: 'rgba(253,248,236,0.7)',
    fontWeight: '500',
  },
  filterLabelActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  resultCount: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cream[300],
  },
  resultCountText: {
    fontSize: 13,
    color: COLORS.sandal[500],
    fontStyle: 'italic',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  loadingText: {
    color: COLORS.sandal[400],
    fontSize: 14,
  },
  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    marginTop: 8,
  },
  sectionLabelText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.maroon[800],
  },
  countBadge: {
    backgroundColor: COLORS.maroon[700],
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countText: {
    color: COLORS.gold.light,
    fontSize: 11,
    fontWeight: '700',
  },
  memberResult: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FEFDF8',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#3D0C11',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.saffron[400],
  },
  memberResultIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.cream[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.maroon[900],
  },
  memberMeta: {
    fontSize: 12,
    color: COLORS.sandal[500],
    marginTop: 2,
  },
  viewFamilyBtn: {
    backgroundColor: COLORS.cream[200],
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gold[300],
  },
  viewFamilyText: {
    fontSize: 11,
    color: COLORS.maroon[700],
    fontWeight: '600',
  },
  hints: {
    backgroundColor: '#FEFDF8',
    borderRadius: 18,
    padding: 20,
    marginTop: 8,
    shadowColor: '#3D0C11',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  hintsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.maroon[800],
    marginBottom: 14,
  },
  hintItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  hintEmoji: {
    fontSize: 18,
    width: 28,
    textAlign: 'center',
  },
  hintText: {
    fontSize: 14,
    color: COLORS.sandal[500],
    flex: 1,
  },
});
