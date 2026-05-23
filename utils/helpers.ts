import { differenceInYears, differenceInMonths, parseISO, format } from 'date-fns';
import type { Member, EducationType } from '@types/index';
import { ACADEMIC_YEAR_START_MONTH } from '@constants/config';

// ─── Age Utilities ────────────────────────────────────────────────────────────

/**
 * Dynamically calculate age from date of birth
 */
export function calculateAge(dateOfBirth: string): number {
  const dob = parseISO(dateOfBirth);
  return differenceInYears(new Date(), dob);
}

/**
 * Calculate age with months for infants
 */
export function calculateAgeDetailed(dateOfBirth: string): string {
  const dob = parseISO(dateOfBirth);
  const now = new Date();
  const years = differenceInYears(now, dob);

  if (years < 2) {
    const months = differenceInMonths(now, dob);
    if (months < 1) return 'Newborn';
    return `${months} Month${months > 1 ? 's' : ''}`;
  }

  return `${years} Year${years > 1 ? 's' : ''}`;
}

/**
 * Format date of birth for display
 */
export function formatDOB(dateOfBirth: string): string {
  return format(parseISO(dateOfBirth), 'dd MMMM yyyy');
}

// ─── Education Display Utilities ──────────────────────────────────────────────

/**
 * Get a human-readable education description for a member
 */
export function getEducationDisplay(member: Member): string {
  const { educationType, educationStatus, currentStandard, academicYear, degree, occupation, schoolOrCollegeName } = member;

  switch (educationType) {
    case 'SCHOOL': {
      if (educationStatus === 'STUDYING' && currentStandard) {
        return `Class ${currentStandard} Student`;
      }
      if (educationStatus === 'COMPLETED') return 'School Graduate';
      if (educationStatus === 'DROPPED') return 'School Dropped Out';
      return 'School Student';
    }

    case 'COLLEGE': {
      if (educationStatus === 'STUDYING') {
        return degree ? `${degree} Student` : 'College Student';
      }
      if (educationStatus === 'COMPLETED') {
        return degree ? `${degree} Graduate` : 'College Graduate';
      }
      return 'College';
    }

    case 'GRADUATED': {
      return degree ? `${degree} Graduate` : 'Graduate';
    }

    case 'WORKING': {
      return occupation || 'Working Professional';
    }

    case 'BUSINESS': {
      return occupation || 'Business';
    }

    case 'OTHER': {
      return occupation || 'Other';
    }

    default:
      return '';
  }
}

/**
 * Get education badge color based on type
 */
export function getEducationColor(educationType: EducationType): {
  bg: string;
  text: string;
} {
  const colorMap: Record<EducationType, { bg: string; text: string }> = {
    SCHOOL: { bg: '#FFF3E0', text: '#E65100' },
    COLLEGE: { bg: '#E8F5E9', text: '#1B5E20' },
    GRADUATED: { bg: '#E3F2FD', text: '#0D47A1' },
    WORKING: { bg: '#F3E5F5', text: '#4A148C' },
    BUSINESS: { bg: '#FFF8E1', text: '#F57F17' },
    OTHER: { bg: '#F5F5F5', text: '#424242' },
  };
  return colorMap[educationType] || colorMap['OTHER'];
}

// ─── Auto-Promotion Calculation ───────────────────────────────────────────────

/**
 * Calculate what class a student is in now based on stored academic year
 */
export function getEffectiveStandard(
  storedStandard: number,
  storedAcademicYear: number
): { standard: number; academicYear: number } {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // After June: we are in the new academic year
  const effectiveCurrentYear =
    currentMonth >= ACADEMIC_YEAR_START_MONTH ? currentYear : currentYear - 1;

  const yearsElapsed = Math.max(0, effectiveCurrentYear - storedAcademicYear);
  const newStandard = Math.min(storedStandard + yearsElapsed, 12);

  return {
    standard: newStandard,
    academicYear: effectiveCurrentYear,
  };
}

// ─── Format Utilities ─────────────────────────────────────────────────────────

/**
 * Format Indian phone number
 */
export function formatMobile(mobile: string): string {
  const digits = mobile.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return mobile;
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('');
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Get gender icon
 */
export function getGenderIcon(gender: string): string {
  switch (gender) {
    case 'MALE': return '👨';
    case 'FEMALE': return '👩';
    default: return '🧑';
  }
}
