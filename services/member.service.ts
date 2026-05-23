import { databases, ID, Query } from './appwrite';
import { APPWRITE_CONFIG, ACADEMIC_YEAR_START_MONTH, MAX_SCHOOL_STANDARD } from '@constants/config';
import type { Member, MemberFormData } from '@types/index';

// ─── Member Service ───────────────────────────────────────────────────────────

export const memberService = {
  /**
   * List all members of a family
   */
  async listMembers(familyId: string): Promise<Member[]> {
    const result = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.members,
      [
        Query.equal('familyId', familyId),
        Query.orderAsc('$createdAt'),
        Query.limit(100),
      ]
    );
    return result.documents.map(processAutoPromotion) as unknown as Member[];
  },

  /**
   * Get a single member
   */
  async getMember(memberId: string): Promise<Member> {
    const doc = await databases.getDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.members,
      memberId
    );
    return processAutoPromotion(doc) as unknown as Member;
  },

  /**
   * Create a new member
   */
  async createMember(data: MemberFormData): Promise<Member> {
    const doc = await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.members,
      ID.unique(),
      {
        familyId: data.familyId,
        name: data.name,
        relation: data.relation,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
        mobile: data.mobile || null,
        occupation: data.occupation || null,
        educationType: data.educationType,
        educationStatus: data.educationStatus || null,
        currentStandard: data.currentStandard || null,
        academicYear: data.academicYear || null,
        schoolOrCollegeName: data.schoolOrCollegeName || null,
        degree: data.degree || null,
      }
    );
    return doc as unknown as Member;
  },

  /**
   * Update a member
   */
  async updateMember(memberId: string, data: Partial<MemberFormData>): Promise<Member> {
    const doc = await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.members,
      memberId,
      data
    );
    return doc as unknown as Member;
  },

  /**
   * Delete a member
   */
  async deleteMember(memberId: string): Promise<void> {
    await databases.deleteDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.members,
      memberId
    );
  },

  /**
   * Search members across all families (or within a village)
   */
  async searchMembers(query: string, villageId?: string): Promise<Member[]> {
    const queries = [Query.search('name', query), Query.limit(30)];

    const result = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.members,
      queries
    );

    return result.documents.map(processAutoPromotion) as unknown as Member[];
  },

  /**
   * Run class promotion for all school students
   * Should be triggered every June
   */
  async runAnnualPromotion(villageId?: string): Promise<number> {
    const now = new Date();
    const currentYear = now.getFullYear();

    // Get all school students whose academic_year < current year
    const queries = [
      Query.equal('educationType', 'SCHOOL'),
      Query.equal('educationStatus', 'STUDYING'),
      Query.lessThan('academicYear', currentYear),
      Query.limit(500),
    ];

    const result = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.members,
      queries
    );

    let promoted = 0;
    for (const member of result.documents) {
      const currentStandard = member.currentStandard || 1;
      const newStandard = currentStandard + 1;

      if (newStandard > MAX_SCHOOL_STANDARD) {
        // Graduate them
        await databases.updateDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.members,
          member.$id,
          {
            educationType: 'GRADUATED',
            educationStatus: 'COMPLETED',
            currentStandard: null,
            academicYear: null,
          }
        );
      } else {
        await databases.updateDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.members,
          member.$id,
          {
            currentStandard: newStandard,
            academicYear: currentYear,
          }
        );
      }
      promoted++;
    }

    return promoted;
  },
};

// ─── Auto Promotion Logic (Client-side) ───────────────────────────────────────

/**
 * Applies auto-promotion logic to a member document without saving.
 * This gives the latest computed standard even without running the server job.
 */
function processAutoPromotion(member: any): any {
  if (
    member.educationType !== 'SCHOOL' ||
    member.educationStatus !== 'STUDYING' ||
    !member.academicYear ||
    !member.currentStandard
  ) {
    return member;
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  // Academic year is considered "new" after June
  const effectiveYear =
    currentMonth >= ACADEMIC_YEAR_START_MONTH ? currentYear : currentYear - 1;

  const yearsPassed = effectiveYear - member.academicYear;

  if (yearsPassed <= 0) return member;

  const newStandard = Math.min(
    member.currentStandard + yearsPassed,
    MAX_SCHOOL_STANDARD
  );

  return {
    ...member,
    currentStandard: newStandard,
    academicYear: effectiveYear,
    _autoPromoted: true,
  };
}
