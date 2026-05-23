// ─── Appwrite Configuration ───────────────────────────────────────────────────
export const APPWRITE_CONFIG = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || '',
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || '',

  // Collection IDs
  collections: {
    villages: process.env.EXPO_PUBLIC_COLLECTION_VILLAGES || 'villages',
    families: process.env.EXPO_PUBLIC_COLLECTION_FAMILIES || 'families',
    members: process.env.EXPO_PUBLIC_COLLECTION_MEMBERS || 'members',
    admins: process.env.EXPO_PUBLIC_COLLECTION_ADMINS || 'admins',
  },
} as const;

// ─── Cloudinary Configuration ─────────────────────────────────────────────────
export const CLOUDINARY_CONFIG = {
  cloudName: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
  uploadPreset: process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '',
  uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || ''}/image/upload`,
} as const;

// ─── Storage Keys ─────────────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  userSession: 'gram_parivar_session',
  userProfile: 'gram_parivar_user',
  recentlyViewed: 'gram_parivar_recently_viewed',
  cachedVillages: 'gram_parivar_villages_cache',
  cachedFamilies: 'gram_parivar_families_cache',
} as const;

// ─── Pagination ───────────────────────────────────────────────────────────────
export const PAGINATION = {
  villagesPerPage: 10,
  familiesPerPage: 20,
  membersPerPage: 50,
  searchResultsPerPage: 20,
} as const;

// ─── Education Constants ──────────────────────────────────────────────────────
export const EDUCATION_TYPES = {
  SCHOOL: 'School',
  COLLEGE: 'College',
  GRADUATED: 'Graduated',
  WORKING: 'Working',
  BUSINESS: 'Business',
  OTHER: 'Other',
} as const;

export const EDUCATION_STATUS = {
  STUDYING: 'Studying',
  COMPLETED: 'Completed',
  DROPPED: 'Dropped',
} as const;

export const SCHOOL_STANDARDS = Array.from({ length: 12 }, (_, i) => ({
  label: `Class ${i + 1}`,
  value: i + 1,
}));

// ─── Relation Labels ──────────────────────────────────────────────────────────
export const RELATION_LABELS: Record<string, string> = {
  SELF: 'Self (Head)',
  SPOUSE: 'Spouse',
  SON: 'Son',
  DAUGHTER: 'Daughter',
  FATHER: 'Father',
  MOTHER: 'Mother',
  BROTHER: 'Brother',
  SISTER: 'Sister',
  GRANDFATHER: 'Grandfather',
  GRANDMOTHER: 'Grandmother',
  GRANDSON: 'Grandson',
  GRANDDAUGHTER: 'Granddaughter',
  DAUGHTER_IN_LAW: 'Daughter-in-law',
  SON_IN_LAW: 'Son-in-law',
  UNCLE: 'Uncle',
  AUNT: 'Aunt',
  OTHER: 'Other',
};

// ─── Common Gotra List ────────────────────────────────────────────────────────
export const COMMON_GOTRAS = [
  'Bharadwaj', 'Kashyap', 'Vashisht', 'Gautam', 'Atri',
  'Vishwamitra', 'Jamadagni', 'Angiras', 'Agastya', 'Bhrigu',
  'Garg', 'Kaushik', 'Parashar', 'Sandilya', 'Mudgal',
  'Mankad', 'Shrivatsa', 'Vatsa', 'Upamanyu', 'Harita',
];

// ─── Animation Durations ──────────────────────────────────────────────────────
export const ANIMATION = {
  splash: 2500,
  fadeIn: 300,
  slideIn: 400,
  expand: 250,
  press: 100,
} as const;

// ─── Image Constraints ────────────────────────────────────────────────────────
export const IMAGE_CONFIG = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.85,
  allowsEditing: true,
  aspect: [1, 1] as [number, number],
} as const;

// ─── Academic Year Logic ──────────────────────────────────────────────────────
// New academic year starts in June
export const ACADEMIC_YEAR_START_MONTH = 5; // June (0-indexed)
export const MAX_SCHOOL_STANDARD = 12;
