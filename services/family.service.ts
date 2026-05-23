import { databases, ID, Query } from './appwrite';
import { APPWRITE_CONFIG, PAGINATION } from '@constants/config';
import type { Family, FamilyFormData } from '@types/index';

// ─── Family Service ───────────────────────────────────────────────────────────

export const familyService = {
  /**
   * List families for a village
   */
  async listFamilies(
    villageId: string,
    page = 0,
    gotraFilter?: string
  ): Promise<{ families: Family[]; total: number }> {
    const offset = page * PAGINATION.familiesPerPage;
    const queries = [
      Query.equal('villageId', villageId),
      Query.orderDesc('$createdAt'),
      Query.limit(PAGINATION.familiesPerPage),
      Query.offset(offset),
    ];

    if (gotraFilter) {
      queries.push(Query.equal('gotra', gotraFilter));
    }

    const result = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.families,
      queries
    );

    return {
      families: result.documents as unknown as Family[],
      total: result.total,
    };
  },

  /**
   * Get all families (for super admin or search)
   */
  async listAllFamilies(page = 0): Promise<{ families: Family[]; total: number }> {
    const offset = page * PAGINATION.familiesPerPage;

    const result = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.families,
      [
        Query.orderDesc('$createdAt'),
        Query.limit(PAGINATION.familiesPerPage),
        Query.offset(offset),
      ]
    );

    return {
      families: result.documents as unknown as Family[],
      total: result.total,
    };
  },

  /**
   * Get a single family
   */
  async getFamily(familyId: string): Promise<Family> {
    const doc = await databases.getDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.families,
      familyId
    );
    return doc as unknown as Family;
  },

  /**
   * Create a new family
   */
  async createFamily(data: FamilyFormData): Promise<Family> {
    const doc = await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.families,
      ID.unique(),
      {
        villageId: data.villageId,
        villageName: '', // Will be set by caller
        headName: data.headName,
        fatherName: data.fatherName || '',
        mobile: data.mobile,
        altMobile: data.altMobile || '',
        gotra: data.gotra,
        address: data.address,
        headImageUrl: data.headImageUrl || null,
        totalMembers: 0,
      }
    );
    return doc as unknown as Family;
  },

  /**
   * Update a family
   */
  async updateFamily(familyId: string, data: Partial<FamilyFormData>): Promise<Family> {
    const doc = await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.families,
      familyId,
      data
    );
    return doc as unknown as Family;
  },

  /**
   * Delete a family and all its members
   */
  async deleteFamily(familyId: string): Promise<void> {
    // Delete all members first
    const members = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.members,
      [Query.equal('familyId', familyId), Query.limit(200)]
    );

    for (const member of members.documents) {
      await databases.deleteDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.members,
        member.$id
      );
    }

    // Delete the family
    await databases.deleteDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.families,
      familyId
    );
  },

  /**
   * Search families by name, gotra, mobile
   */
  async searchFamilies(query: string, villageId?: string): Promise<Family[]> {
    const queries: string[] = [Query.limit(30)];

    if (villageId) {
      queries.push(Query.equal('villageId', villageId));
    }

    // Search by head name
    const byName = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.families,
      [...queries, Query.search('headName', query)]
    );

    // Search by mobile
    const byMobile = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.families,
      [...queries, Query.search('mobile', query)]
    );

    // Merge and deduplicate
    const allDocs = [...byName.documents, ...byMobile.documents];
    const unique = Array.from(new Map(allDocs.map((d) => [d.$id, d])).values());

    return unique as unknown as Family[];
  },

  /**
   * Get recently added families
   */
  async getRecentFamilies(limit = 5, villageId?: string): Promise<Family[]> {
    const queries = [Query.orderDesc('$createdAt'), Query.limit(limit)];
    if (villageId) {
      queries.push(Query.equal('villageId', villageId));
    }

    const result = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.families,
      queries
    );
    return result.documents as unknown as Family[];
  },

  /**
   * Update family member count
   */
  async updateMemberCount(familyId: string, count: number): Promise<void> {
    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.families,
      familyId,
      { totalMembers: count }
    );
  },
};
