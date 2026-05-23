// ─── Auth Types ───────────────────────────────────────────────────────────────

export type UserRole = 'SUPER_ADMIN' | 'VILLAGE_ADMIN';

export interface AppUser {
  $id: string;
  name: string;
  email: string;
  mobile?: string;
  role: UserRole;
  assignedVillageId?: string;
  assignedVillageName?: string;
  createdAt: string;
}

export interface AuthState {
  user: AppUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// ─── Village Types ────────────────────────────────────────────────────────────

export interface Village {
  $id: string;
  name: string;
  description?: string;
  coverImageUrl?: string;
  totalFamilies: number;
  totalMembers: number;
  createdAt: string;
  updatedAt: string;
}

export interface VillageFormData {
  name: string;
  description?: string;
  coverImageUrl?: string;
}

// ─── Family Types ─────────────────────────────────────────────────────────────

export interface Family {
  $id: string;
  villageId: string;
  villageName: string;
  headName: string;
  fatherName?: string;
  mobile: string;
  altMobile?: string;
  gotra: string;
  address: string;
  headImageUrl?: string;
  totalMembers: number;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyFormData {
  villageId: string;
  headName: string;
  fatherName?: string;
  mobile: string;
  altMobile?: string;
  gotra: string;
  address: string;
  headImageUrl?: string;
}

// ─── Member Types ─────────────────────────────────────────────────────────────

export type EducationType =
  | 'SCHOOL'
  | 'COLLEGE'
  | 'GRADUATED'
  | 'WORKING'
  | 'BUSINESS'
  | 'OTHER';

export type EducationStatus = 'STUDYING' | 'COMPLETED' | 'DROPPED';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export type RelationType =
  | 'SELF'
  | 'SPOUSE'
  | 'SON'
  | 'DAUGHTER'
  | 'FATHER'
  | 'MOTHER'
  | 'BROTHER'
  | 'SISTER'
  | 'GRANDFATHER'
  | 'GRANDMOTHER'
  | 'GRANDSON'
  | 'GRANDDAUGHTER'
  | 'DAUGHTER_IN_LAW'
  | 'SON_IN_LAW'
  | 'UNCLE'
  | 'AUNT'
  | 'OTHER';

export interface Member {
  $id: string;
  familyId: string;
  name: string;
  relation: RelationType;
  gender: Gender;
  dateOfBirth: string; // ISO date string YYYY-MM-DD
  mobile?: string;
  occupation?: string;
  educationType: EducationType;
  educationStatus?: EducationStatus;
  currentStandard?: number; // For SCHOOL type
  academicYear?: number; // For SCHOOL type
  schoolOrCollegeName?: string;
  degree?: string; // For COLLEGE/GRADUATED
  createdAt: string;
  updatedAt: string;
}

export interface MemberFormData {
  familyId: string;
  name: string;
  relation: RelationType;
  gender: Gender;
  dateOfBirth: string;
  mobile?: string;
  occupation?: string;
  educationType: EducationType;
  educationStatus?: EducationStatus;
  currentStandard?: number;
  academicYear?: number;
  schoolOrCollegeName?: string;
  degree?: string;
}

// ─── Admin Types ──────────────────────────────────────────────────────────────

export interface Admin {
  $id: string;
  userId: string;
  name: string;
  mobile: string;
  email: string;
  role: UserRole;
  assignedVillageId?: string;
  assignedVillageName?: string;
  isActive: boolean;
  createdAt: string;
}

export interface AdminFormData {
  name: string;
  mobile: string;
  email: string;
  password: string;
  role: UserRole;
  assignedVillageId?: string;
}

// ─── Search & Filter Types ────────────────────────────────────────────────────

export interface SearchFilters {
  villageId?: string;
  gotra?: string;
  educationType?: EducationType;
  currentStandard?: number;
  occupation?: string;
  ageMin?: number;
  ageMax?: number;
  minFamilySize?: number;
  maxFamilySize?: number;
}

export interface SearchResult {
  type: 'family' | 'member' | 'village';
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  villageId?: string;
  villageName?: string;
  familyId?: string;
}

// ─── UI Types ─────────────────────────────────────────────────────────────────

export interface TabItem {
  name: string;
  title: string;
  icon: string;
  activeIcon: string;
}

export interface StepFormState {
  currentStep: number;
  totalSteps: number;
  familyData: Partial<FamilyFormData>;
  members: Partial<MemberFormData>[];
}
