import { useState, useCallback, useRef, useEffect } from 'react';
import { familyService } from '@services/family.service';
import { memberService } from '@services/member.service';
import { villageService } from '@services/village.service';
import type { Family, Member, Village } from '@types/index';

// ─── Search Result Types ──────────────────────────────────────────────────────

export interface CombinedSearchResults {
  families: Family[];
  members: Member[];
  villages: Village[];
  totalCount: number;
}

// ─── useSearch Hook ───────────────────────────────────────────────────────────

interface UseSearchOptions {
  debounceMs?: number;
  minLength?: number;
  includeVillages?: boolean;
  villageId?: string;
}

interface UseSearchReturn {
  query: string;
  setQuery: (q: string) => void;
  results: CombinedSearchResults;
  isSearching: boolean;
  hasSearched: boolean;
  clearSearch: () => void;
}

const EMPTY_RESULTS: CombinedSearchResults = {
  families: [],
  members: [],
  villages: [],
  totalCount: 0,
};

export function useSearch(options: UseSearchOptions = {}): UseSearchReturn {
  const {
    debounceMs = 400,
    minLength = 2,
    includeVillages = true,
    villageId,
  } = options;

  const [query, setQueryState] = useState('');
  const [results, setResults] = useState<CombinedSearchResults>(EMPTY_RESULTS);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const debounceTimer = useRef<ReturnType<typeof setTimeout>>();
  const latestQuery = useRef('');

  const runSearch = useCallback(
    async (q: string) => {
      if (q.trim().length < minLength) {
        setResults(EMPTY_RESULTS);
        setHasSearched(false);
        return;
      }

      setIsSearching(true);
      setHasSearched(true);
      latestQuery.current = q;

      try {
        const searchPromises: Promise<any>[] = [
          familyService.searchFamilies(q, villageId),
          memberService.searchMembers(q, villageId),
        ];

        if (includeVillages && !villageId) {
          searchPromises.push(villageService.searchVillages(q));
        }

        const [families, members, villages = []] = await Promise.all(searchPromises);

        // Only update if this is still the latest query
        if (latestQuery.current === q) {
          setResults({
            families: families as Family[],
            members: members as Member[],
            villages: villages as Village[],
            totalCount: families.length + members.length + villages.length,
          });
        }
      } catch (err) {
        console.error('Search error:', err);
        setResults(EMPTY_RESULTS);
      } finally {
        if (latestQuery.current === q) {
          setIsSearching(false);
        }
      }
    },
    [minLength, villageId, includeVillages]
  );

  const setQuery = useCallback(
    (q: string) => {
      setQueryState(q);
      clearTimeout(debounceTimer.current);

      if (q.trim().length < minLength) {
        setResults(EMPTY_RESULTS);
        setHasSearched(false);
        setIsSearching(false);
        return;
      }

      debounceTimer.current = setTimeout(() => {
        runSearch(q);
      }, debounceMs);
    },
    [runSearch, debounceMs, minLength]
  );

  const clearSearch = useCallback(() => {
    clearTimeout(debounceTimer.current);
    setQueryState('');
    setResults(EMPTY_RESULTS);
    setHasSearched(false);
    setIsSearching(false);
    latestQuery.current = '';
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimeout(debounceTimer.current);
  }, []);

  return {
    query,
    setQuery,
    results,
    isSearching,
    hasSearched,
    clearSearch,
  };
}

export default useSearch;
