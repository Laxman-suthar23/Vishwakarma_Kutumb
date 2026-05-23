import { databases, ID, Query } from './appwrite';
import { APPWRITE_CONFIG, PAGINATION } from '@constants/config';
import type { Village, VillageFormData } from '@types/index';

// ─── Village Service ──────────────────────────────────────────────────────────

export const villageService = {
  /**
   * List all villages with pagination
   */
  async listVillages(page = 0): Promise<{ villages: Village[]; total: number }> {
    const offset = page * PAGINATION.villagesPerPage;

    const result = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.villages,
      [
        Query.orderDesc('$createdAt'),
        Query.limit(PAGINATION.villagesPerPage),
        Query.offset(offset),
      ]
    );

    return {
      villages: result.documents as unknown as Village[],
      total: result.total,
    };
  },

  /**
   * Get a single village by ID
   */
  async getVillage(villageId: string): Promise<Village> {
    const doc = await databases.getDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.villages,
      villageId
    );
    return doc as unknown as Village;
  },

  /**
   * Create a new village (SUPER_ADMIN only)
   */
  async createVillage(data: VillageFormData): Promise<Village> {
    const doc = await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.villages,
      ID.unique(),
      {
        name: data.name,
        description: data.description || '',
        coverImageUrl: data.coverImageUrl || null,
        totalFamilies: 0,
        totalMembers: 0,
      }
    );
    return doc as unknown as Village;
  },

  /**
   * Update a village
   */
  async updateVillage(villageId: string, data: Partial<VillageFormData>): Promise<Village> {
    const doc = await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.villages,
      villageId,
      data
    );
    return doc as unknown as Village;
  },

  /**
   * Delete a village and all associated data
   */
  async deleteVillage(villageId: string): Promise<void> {
    // First delete all families and members
    await this.deleteVillageData(villageId);

    // Then delete the village
    await databases.deleteDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.villages,
      villageId
    );
  },

  /**
   * Delete all families and members belonging to a village
   */
  async deleteVillageData(villageId: string): Promise<void> {
    // Get all families
    const families = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.families,
      [Query.equal('villageId', villageId), Query.limit(100)]
    );

    // Delete each family's members and then the family
    for (const family of families.documents) {
      const members = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.members,
        [Query.equal('familyId', family.$id), Query.limit(100)]
      );

      for (const member of members.documents) {
        await databases.deleteDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.members,
          member.$id
        );
      }

      await databases.deleteDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.families,
        family.$id
      );
    }
  },

  /**
   * Update village stats (called after family/member changes)
   */
  async updateVillageStats(villageId: string): Promise<void> {
    const families = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.families,
      [Query.equal('villageId', villageId), Query.limit(1000)]
    );

    let totalMembers = 0;
    for (const fam of families.documents) {
      totalMembers += (fam as any).totalMembers || 0;
    }

    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.villages,
      villageId,
      {
        totalFamilies: families.total,
        totalMembers,
      }
    );
  },

  /**
   * Search villages by name
   */
  async searchVillages(query: string): Promise<Village[]> {
    const result = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.villages,
      [Query.search('name', query), Query.limit(20)]
    );
    return result.documents as unknown as Village[];
  },
};
