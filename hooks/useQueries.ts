import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { villageService } from '@services/village.service';
import { familyService } from '@services/family.service';
import { memberService } from '@services/member.service';
import type { VillageFormData, FamilyFormData, MemberFormData, SearchFilters } from '@/types';

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const QUERY_KEYS = {
  villages: ['villages'] as const,
  village: (id: string) => ['villages', id] as const,
  families: (villageId: string) => ['families', villageId] as const,
  allFamilies: ['families', 'all'] as const,
  family: (id: string) => ['family', id] as const,
  members: (familyId: string) => ['members', familyId] as const,
  recentFamilies: (villageId?: string) => ['recent-families', villageId] as const,
} as const;

// ─── Village Hooks ────────────────────────────────────────────────────────────

export function useVillages() {
  return useQuery({
    queryKey: QUERY_KEYS.villages,
    queryFn: () => villageService.listVillages(0),
    staleTime: 5 * 60 * 1000,
  });
}

export function useVillage(villageId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.village(villageId),
    queryFn: () => villageService.getVillage(villageId),
    enabled: !!villageId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateVillage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: VillageFormData) => villageService.createVillage(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.villages });
    },
  });
}

export function useUpdateVillage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<VillageFormData> }) =>
      villageService.updateVillage(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.villages });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.village(id) });
    },
  });
}

export function useDeleteVillage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (villageId: string) => villageService.deleteVillage(villageId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.villages });
    },
  });
}

// ─── Family Hooks ─────────────────────────────────────────────────────────────

export function useFamilies(villageId: string, gotraFilter?: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.families(villageId), gotraFilter],
    queryFn: () => familyService.listFamilies(villageId, 0, gotraFilter),
    enabled: !!villageId,
    staleTime: 3 * 60 * 1000,
  });
}

export function useAllFamilies() {
  return useQuery({
    queryKey: QUERY_KEYS.allFamilies,
    queryFn: () => familyService.listAllFamilies(0),
    staleTime: 3 * 60 * 1000,
  });
}

export function useFamily(familyId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.family(familyId),
    queryFn: () => familyService.getFamily(familyId),
    enabled: !!familyId,
  });
}

export function useRecentFamilies(villageId?: string, limit = 5) {
  return useQuery({
    queryKey: QUERY_KEYS.recentFamilies(villageId),
    queryFn: () => familyService.getRecentFamilies(limit, villageId),
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateFamily() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ familyData, villageName }: { familyData: FamilyFormData; villageName: string }) => {
      const family = await familyService.createFamily({
        ...familyData,
        villageName,
      } as any);
      // Automatically update village totalFamilies and totalMembers counts
      await villageService.updateVillageStats(family.villageId);
      return family;
    },
    onSuccess: (family) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.families(family.villageId) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.allFamilies });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.recentFamilies(family.villageId) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.villages });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.village(family.villageId) });
    },
  });
}

export function useUpdateFamily() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FamilyFormData> }) =>
      familyService.updateFamily(id, data),
    onSuccess: (family) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.family(family.$id) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.families(family.villageId) });
    },
  });
}

export function useDeleteFamily() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ familyId, villageId }: { familyId: string; villageId: string }) => {
      await familyService.deleteFamily(familyId);
      // Automatically update village stats after deletion
      await villageService.updateVillageStats(villageId);
    },
    onSuccess: (_, { villageId }) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.families(villageId) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.allFamilies });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.villages });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.village(villageId) });
    },
  });
}

// ─── Member Hooks ─────────────────────────────────────────────────────────────

export function useMembers(familyId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.members(familyId),
    queryFn: () => memberService.listMembers(familyId),
    enabled: !!familyId,
  });
}

export function useCreateMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: MemberFormData) => {
      const member = await memberService.createMember(data);
      // Recalculate member count for family
      const members = await memberService.listMembers(data.familyId);
      await familyService.updateMemberCount(data.familyId, members.length);
      
      // Update global village stats
      const family = await familyService.getFamily(data.familyId);
      await villageService.updateVillageStats(family.villageId);
      
      return member;
    },
    onSuccess: (member) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.members(member.familyId) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.family(member.familyId) });
      // Invalidate village/villages queries to refresh the live metrics
      qc.invalidateQueries({ queryKey: QUERY_KEYS.villages });
    },
  });
}

export function useUpdateMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MemberFormData> }) =>
      memberService.updateMember(id, data),
    onSuccess: (member) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.members(member.familyId) });
    },
  });
}

export function useDeleteMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ memberId, familyId }: { memberId: string; familyId: string }) => {
      await memberService.deleteMember(memberId);
      // Recalculate member count for family
      const members = await memberService.listMembers(familyId);
      await familyService.updateMemberCount(familyId, members.length);
      
      // Update global village stats
      const family = await familyService.getFamily(familyId);
      await villageService.updateVillageStats(family.villageId);
    },
    onSuccess: (_, { familyId }) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.members(familyId) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.family(familyId) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.villages });
    },
  });
}
