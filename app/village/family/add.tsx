import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useCreateFamily, useCreateMember } from '@hooks/useQueries';
import { cloudinaryService } from '@services/cloudinary.service';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';
import { Avatar } from '@components/ui/Avatar';
import { COLORS } from '@constants/colors';
import { COMMON_GOTRAS, EDUCATION_TYPES, RELATION_LABELS, SCHOOL_STANDARDS } from '@constants/config';
import type { FamilyFormData, MemberFormData, RelationType, EducationType, Gender } from '@types/index';

// ─── Step indicators ──────────────────────────────────────────────────────────

const STEPS = [
  { number: 1, label: 'Family Head', emoji: '👤' },
  { number: 2, label: 'Members', emoji: '👥' },
  { number: 3, label: 'Preview', emoji: '📋' },
];

// ─── Initial state ────────────────────────────────────────────────────────────

const emptyFamily: Partial<FamilyFormData> = {
  headName: '',
  fatherName: '',
  mobile: '',
  altMobile: '',
  gotra: '',
  address: '',
  headImageUrl: '',
};

const emptyMember: Partial<MemberFormData> = {
  name: '',
  relation: 'SON',
  gender: 'MALE',
  dateOfBirth: '',
  occupation: '',
  educationType: 'SCHOOL',
};

export default function AddFamilyScreen() {
  const params = useLocalSearchParams<{
    villageId: string;
    villageName: string;
    familyId?: string;
    editMode?: string;
  }>();

  const [step, setStep] = useState(1);
  const [familyData, setFamilyData] = useState<Partial<FamilyFormData>>(emptyFamily);
  const [members, setMembers] = useState<Partial<MemberFormData>[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const createFamily = useCreateFamily();
  const createMember = useCreateMember();

  // ── Image Upload ──────────────────────────────────────────────────────────

  const handleImagePick = async () => {
    try {
      setIsUploading(true);
      const result = await cloudinaryService.pickAndUpload('gram-parivar/family-heads');
      if (result) {
        setFamilyData((p) => ({ ...p, headImageUrl: result.secureUrl }));
      }
    } catch (err: any) {
      Alert.alert('Upload Failed', err.message || 'Could not upload image.');
    } finally {
      setIsUploading(false);
    }
  };

  // ── Navigation ────────────────────────────────────────────────────────────

  const validateStep1 = () => {
    if (!familyData.headName?.trim()) return 'Head name is required.';
    if (!familyData.mobile?.trim() || familyData.mobile.length < 10)
      return 'Valid 10-digit mobile number is required.';
    if (!familyData.gotra?.trim()) return 'Gotra is required.';
    if (!familyData.address?.trim()) return 'Address is required.';
    return null;
  };

  const goNext = () => {
    if (step === 1) {
      const error = validateStep1();
      if (error) { Alert.alert('Missing Info', error); return; }
    }
    setStep((s) => Math.min(s + 1, 3));
  };

  const goBack = () => {
    if (step === 1) { router.back(); return; }
    setStep((s) => s - 1);
  };

  const addMember = () => {
    setMembers((m) => [...m, { ...emptyMember, familyId: params.villageId }]);
  };

  const updateMember = (index: number, field: string, value: any) => {
    setMembers((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    );
  };

  const removeMember = (index: number) => {
    setMembers((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Final Submit ──────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    try {
      const family = await createFamily.mutateAsync({
        familyData: {
          ...familyData,
          villageId: params.villageId,
        } as FamilyFormData,
        villageName: params.villageName || '',
      });

      // Create members
      for (const member of members) {
        if (member.name?.trim()) {
          await createMember.mutateAsync({
            ...member,
            familyId: family.$id,
          } as MemberFormData);
        }
      }

      Alert.alert(
        '✅ Family Added!',
        `${familyData.headName}'s family has been added to ${params.villageName}.`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save family. Please try again.');
    }
  };

  const isSubmitting = createFamily.isPending || createMember.isPending;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.cream[50] }}>
      {/* Header */}
      <LinearGradient colors={['#3D0C11', '#6B1414']} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={goBack} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>
                {step === 1 ? '✕ Cancel' : '← Back'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {params.editMode ? 'Edit Family' : 'Add New Family'}
            </Text>
            <View style={{ width: 70 }} />
          </View>

          {/* Step indicator */}
          <View style={styles.stepRow}>
            {STEPS.map((s, i) => (
              <React.Fragment key={s.number}>
                <View style={styles.stepItem}>
                  <View style={[styles.stepCircle, step >= s.number && styles.stepCircleActive]}>
                    <Text style={[styles.stepNum, step >= s.number && styles.stepNumActive]}>
                      {step > s.number ? '✓' : s.emoji}
                    </Text>
                  </View>
                  <Text style={[styles.stepLabel, step >= s.number && styles.stepLabelActive]}>
                    {s.label}
                  </Text>
                </View>
                {i < STEPS.length - 1 && (
                  <View style={[styles.stepLine, step > s.number && styles.stepLineActive]} />
                )}
              </React.Fragment>
            ))}
          </View>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.formContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── STEP 1: Family Head ───────────────── */}
          {step === 1 && (
            <Step1
              data={familyData}
              onChange={(k, v) => setFamilyData((p) => ({ ...p, [k]: v }))}
              isUploading={isUploading}
              onPickImage={handleImagePick}
            />
          )}

          {/* ── STEP 2: Members ───────────────────── */}
          {step === 2 && (
            <Step2
              members={members}
              onAdd={addMember}
              onUpdate={updateMember}
              onRemove={removeMember}
            />
          )}

          {/* ── STEP 3: Preview ───────────────────── */}
          {step === 3 && (
            <Step3
              familyData={familyData}
              members={members}
              villageName={params.villageName}
            />
          )}
        </ScrollView>

        {/* Bottom action bar */}
        <View style={styles.bottomBar}>
          {step < 3 ? (
            <Button
              title={step === 2 ? 'Preview →' : 'Next →'}
              onPress={goNext}
              fullWidth
              size="lg"
            />
          ) : (
            <Button
              title={isSubmitting ? 'Saving...' : '✅ Save Family'}
              onPress={handleSubmit}
              isLoading={isSubmitting}
              variant="gold"
              fullWidth
              size="lg"
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Step 1: Family Head Form ─────────────────────────────────────────────────

function Step1({
  data,
  onChange,
  isUploading,
  onPickImage,
}: {
  data: Partial<FamilyFormData>;
  onChange: (key: string, value: string) => void;
  isUploading: boolean;
  onPickImage: () => void;
}) {
  return (
    <View>
      <SectionTitle emoji="👤" title="Family Head Details" />

      {/* Photo picker */}
      <TouchableOpacity onPress={onPickImage} style={styles.photoPicker} disabled={isUploading}>
        {data.headImageUrl ? (
          <Image
            source={{ uri: data.headImageUrl }}
            style={styles.photoPreview}
            contentFit="cover"
          />
        ) : (
          <View style={styles.photoPlaceholder}>
            {isUploading ? (
              <ActivityIndicator color={COLORS.gold[500]} />
            ) : (
              <>
                <Text style={styles.photoIcon}>📷</Text>
                <Text style={styles.photoText}>Tap to add photo</Text>
              </>
            )}
          </View>
        )}
        {data.headImageUrl && (
          <View style={styles.photoEditBadge}>
            <Text style={{ color: '#fff', fontSize: 10 }}>✏️ Change</Text>
          </View>
        )}
      </TouchableOpacity>

      <Input label="Head Name" placeholder="e.g., Ramesh Kumar Sharma" value={data.headName || ''}
        onChangeText={(v) => onChange('headName', v)} required />
      <Input label="Father's Name" placeholder="e.g., Suresh Kumar Sharma" value={data.fatherName || ''}
        onChangeText={(v) => onChange('fatherName', v)} />
      <Input label="Mobile Number" placeholder="10-digit mobile" value={data.mobile || ''}
        onChangeText={(v) => onChange('mobile', v)} keyboardType="phone-pad" maxLength={10} required />
      <Input label="Alternate Mobile" placeholder="Optional" value={data.altMobile || ''}
        onChangeText={(v) => onChange('altMobile', v)} keyboardType="phone-pad" maxLength={10} />

      {/* Gotra picker */}
      <Text style={styles.fieldLabel}>Gotra <Text style={{ color: COLORS.saffron[500] }}>*</Text></Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        <View style={styles.gotraRow}>
          {COMMON_GOTRAS.map((g) => (
            <TouchableOpacity
              key={g}
              onPress={() => onChange('gotra', g)}
              style={[styles.gotraChip, data.gotra === g && styles.gotraChipActive]}
            >
              <Text style={[styles.gotraChipText, data.gotra === g && styles.gotraChipTextActive]}>
                {g}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <Input label="Custom Gotra" placeholder="Or type gotra here" value={data.gotra || ''}
        onChangeText={(v) => onChange('gotra', v)} />

      <Input label="Full Address" placeholder="House No., Street, Village, Dist." value={data.address || ''}
        onChangeText={(v) => onChange('address', v)} multiline numberOfLines={3} required />
    </View>
  );
}

// ─── Step 2: Members Form ─────────────────────────────────────────────────────

function Step2({
  members,
  onAdd,
  onUpdate,
  onRemove,
}: {
  members: Partial<MemberFormData>[];
  onAdd: () => void;
  onUpdate: (index: number, field: string, value: any) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <View>
      <SectionTitle emoji="👥" title="Family Members" />
      <Text style={styles.stepHint}>Add all members of this family (skip head — already added)</Text>

      {members.map((member, index) => (
        <MemberForm key={index} index={index} member={member} onUpdate={onUpdate} onRemove={onRemove} />
      ))}

      <TouchableOpacity onPress={onAdd} style={styles.addMemberBtn}>
        <Text style={styles.addMemberText}>+ Add Member</Text>
      </TouchableOpacity>

      {members.length === 0 && (
        <View style={styles.emptyMembersHint}>
          <Text style={styles.emptyMembersIcon}>👨‍👩‍👧‍👦</Text>
          <Text style={styles.emptyMembersText}>Tap "Add Member" to add family members</Text>
          <Text style={styles.emptyMembersSubText}>You can skip this step and add members later</Text>
        </View>
      )}
    </View>
  );
}

function MemberForm({
  index,
  member,
  onUpdate,
  onRemove,
}: {
  index: number;
  member: Partial<MemberFormData>;
  onUpdate: (index: number, field: string, value: any) => void;
  onRemove: (index: number) => void;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <View style={styles.memberFormCard}>
      <TouchableOpacity
        style={styles.memberFormHeader}
        onPress={() => setExpanded((e) => !e)}
      >
        <Text style={styles.memberFormTitle}>
          👤 Member {index + 1}: {member.name || 'New Member'}
        </Text>
        <View style={styles.memberFormActions}>
          <Text style={styles.expandIcon}>{expanded ? '▲' : '▼'}</Text>
          <TouchableOpacity onPress={() => onRemove(index)}>
            <Text style={styles.removeMemberBtn}>✕</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.memberFormBody}>
          <Input label="Full Name" placeholder="Member name" value={member.name || ''}
            onChangeText={(v) => onUpdate(index, 'name', v)} required />

          {/* Relation picker */}
          <Text style={styles.fieldLabel}>Relation</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            <View style={styles.gotraRow}>
              {['SON', 'DAUGHTER', 'SPOUSE', 'FATHER', 'MOTHER', 'BROTHER', 'SISTER', 'GRANDFATHER', 'GRANDMOTHER', 'OTHER'].map((rel) => (
                <TouchableOpacity
                  key={rel}
                  onPress={() => onUpdate(index, 'relation', rel)}
                  style={[styles.gotraChip, member.relation === rel && styles.gotraChipActive]}
                >
                  <Text style={[styles.gotraChipText, member.relation === rel && styles.gotraChipTextActive]}>
                    {RELATION_LABELS[rel] || rel}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Gender */}
          <Text style={styles.fieldLabel}>Gender</Text>
          <View style={styles.genderRow}>
            {(['MALE', 'FEMALE', 'OTHER'] as Gender[]).map((g) => (
              <TouchableOpacity
                key={g}
                onPress={() => onUpdate(index, 'gender', g)}
                style={[styles.genderChip, member.gender === g && styles.genderChipActive]}
              >
                <Text style={styles.genderChipText}>
                  {g === 'MALE' ? '👨 Male' : g === 'FEMALE' ? '👩 Female' : '🧑 Other'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input label="Date of Birth" placeholder="YYYY-MM-DD (e.g., 1995-06-15)" value={member.dateOfBirth || ''}
            onChangeText={(v) => onUpdate(index, 'dateOfBirth', v)} keyboardType="numeric" required />

          {/* Education type */}
          <Text style={styles.fieldLabel}>Education / Occupation Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            <View style={styles.gotraRow}>
              {(Object.entries(EDUCATION_TYPES) as [EducationType, string][]).map(([key, label]) => (
                <TouchableOpacity
                  key={key}
                  onPress={() => onUpdate(index, 'educationType', key)}
                  style={[styles.gotraChip, member.educationType === key && styles.gotraChipActive]}
                >
                  <Text style={[styles.gotraChipText, member.educationType === key && styles.gotraChipTextActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Conditional fields */}
          {member.educationType === 'SCHOOL' && (
            <>
              <Text style={styles.fieldLabel}>Current Standard / Class</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                <View style={styles.gotraRow}>
                  {SCHOOL_STANDARDS.map((s) => (
                    <TouchableOpacity
                      key={s.value}
                      onPress={() => {
                        onUpdate(index, 'currentStandard', s.value);
                        onUpdate(index, 'academicYear', new Date().getFullYear());
                      }}
                      style={[styles.gotraChip, member.currentStandard === s.value && styles.gotraChipActive]}
                    >
                      <Text style={[styles.gotraChipText, member.currentStandard === s.value && styles.gotraChipTextActive]}>
                        {s.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              <Input label="School Name" placeholder="School or college name" value={member.schoolOrCollegeName || ''}
                onChangeText={(v) => onUpdate(index, 'schoolOrCollegeName', v)} />
            </>
          )}

          {(member.educationType === 'COLLEGE' || member.educationType === 'GRADUATED') && (
            <>
              <Input label="Degree / Course" placeholder="e.g., B.Com, M.Sc, B.Tech" value={member.degree || ''}
                onChangeText={(v) => onUpdate(index, 'degree', v)} />
              <Input label="College Name" placeholder="College or university name" value={member.schoolOrCollegeName || ''}
                onChangeText={(v) => onUpdate(index, 'schoolOrCollegeName', v)} />
            </>
          )}

          {(member.educationType === 'WORKING' || member.educationType === 'BUSINESS' || member.educationType === 'OTHER') && (
            <Input label="Occupation / Business" placeholder="e.g., Farming, Furniture Business, Teacher" value={member.occupation || ''}
              onChangeText={(v) => onUpdate(index, 'occupation', v)} />
          )}

          <Input label="Mobile (Optional)" placeholder="Member's phone number" value={member.mobile || ''}
            onChangeText={(v) => onUpdate(index, 'mobile', v)} keyboardType="phone-pad" maxLength={10} />
        </View>
      )}
    </View>
  );
}

// ─── Step 3: Preview ──────────────────────────────────────────────────────────

function Step3({
  familyData,
  members,
  villageName,
}: {
  familyData: Partial<FamilyFormData>;
  members: Partial<MemberFormData>[];
  villageName?: string;
}) {
  return (
    <View>
      <SectionTitle emoji="📋" title="Review & Confirm" />

      {/* Family summary */}
      <View style={styles.previewCard}>
        <LinearGradient colors={['#D4A017', '#9A6E00']} style={{ height: 3 }} />
        <View style={{ padding: 16 }}>
          {familyData.headImageUrl && (
            <Image source={{ uri: familyData.headImageUrl }} style={styles.previewImage} contentFit="cover" />
          )}
          <PreviewRow label="Head Name" value={familyData.headName || '—'} />
          <PreviewRow label="Father's Name" value={familyData.fatherName || '—'} />
          <PreviewRow label="Village" value={villageName || '—'} />
          <PreviewRow label="Gotra" value={familyData.gotra || '—'} />
          <PreviewRow label="Mobile" value={familyData.mobile || '—'} />
          <PreviewRow label="Address" value={familyData.address || '—'} />
        </View>
      </View>

      {members.length > 0 && (
        <>
          <Text style={styles.memberPreviewTitle}>
            👥 {members.length} Member(s) to be added
          </Text>
          {members.map((m, i) => (
            <View key={i} style={styles.memberPreviewCard}>
              <Text style={styles.memberPreviewName}>
                {m.name || `Member ${i + 1}`}
              </Text>
              <Text style={styles.memberPreviewMeta}>
                {RELATION_LABELS[m.relation as string] || m.relation} · {m.gender} · DOB: {m.dateOfBirth || '—'}
              </Text>
              <Text style={styles.memberPreviewEdu}>
                📚 {EDUCATION_TYPES[m.educationType as EducationType] || m.educationType}
                {m.currentStandard ? ` · Class ${m.currentStandard}` : ''}
                {m.degree ? ` · ${m.degree}` : ''}
              </Text>
            </View>
          ))}
        </>
      )}

      <View style={styles.confirmNote}>
        <Text style={styles.confirmNoteText}>
          🙏 Please verify all information before saving. This will be recorded in the village directory.
        </Text>
      </View>
    </View>
  );
}

// ─── Helper components ────────────────────────────────────────────────────────

const SectionTitle = ({ emoji, title }: { emoji: string; title: string }) => (
  <View style={styles.sectionTitle}>
    <Text style={styles.sectionEmoji}>{emoji}</Text>
    <Text style={styles.sectionTitleText}>{title}</Text>
  </View>
);

const PreviewRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.previewRow}>
    <Text style={styles.previewLabel}>{label}</Text>
    <Text style={styles.previewValue}>{value}</Text>
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FEFDF8',
  },
  closeBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  closeBtnText: {
    color: COLORS.gold.light,
    fontSize: 13,
    fontWeight: '600',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepItem: {
    alignItems: 'center',
    gap: 4,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(212,160,23,0.3)',
  },
  stepCircleActive: {
    backgroundColor: COLORS.gold[500],
    borderColor: COLORS.gold[400],
  },
  stepNum: {
    color: 'rgba(245,208,110,0.7)',
    fontSize: 14,
  },
  stepNumActive: {
    color: '#FFFFFF',
  },
  stepLabel: {
    color: 'rgba(245,208,110,0.5)',
    fontSize: 10,
    fontWeight: '500',
  },
  stepLabelActive: {
    color: COLORS.gold[300],
    fontWeight: '700',
  },
  stepLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: 'rgba(212,160,23,0.2)',
    marginBottom: 16,
  },
  stepLineActive: {
    backgroundColor: COLORS.gold[500],
  },
  formContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  sectionEmoji: {
    fontSize: 22,
  },
  sectionTitleText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.maroon[900],
  },
  photoPicker: {
    alignSelf: 'center',
    width: 110,
    height: 110,
    borderRadius: 55,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: COLORS.gold[400],
    position: 'relative',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.cream[200],
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  photoIcon: {
    fontSize: 28,
  },
  photoText: {
    fontSize: 10,
    color: COLORS.sandal[500],
    textAlign: 'center',
  },
  photoEditBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(61,12,17,0.8)',
    alignItems: 'center',
    paddingVertical: 4,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.maroon[800],
    marginBottom: 8,
  },
  gotraRow: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 8,
  },
  gotraChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.cream[100],
    borderWidth: 1.5,
    borderColor: COLORS.cream[300],
  },
  gotraChipActive: {
    backgroundColor: COLORS.maroon[700],
    borderColor: COLORS.maroon[700],
  },
  gotraChipText: {
    fontSize: 13,
    color: COLORS.sandal[500],
    fontWeight: '500',
  },
  gotraChipTextActive: {
    color: COLORS.gold.light,
    fontWeight: '700',
  },
  genderRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  genderChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.cream[100],
    borderWidth: 1.5,
    borderColor: COLORS.cream[300],
    alignItems: 'center',
  },
  genderChipActive: {
    backgroundColor: COLORS.saffron[100],
    borderColor: COLORS.saffron[500],
  },
  genderChipText: {
    fontSize: 13,
    color: COLORS.sandal[500],
    fontWeight: '500',
  },
  stepHint: {
    fontSize: 13,
    color: COLORS.sandal[400],
    marginBottom: 16,
    fontStyle: 'italic',
  },
  addMemberBtn: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.gold[400],
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: COLORS.cream[100],
  },
  addMemberText: {
    color: COLORS.maroon[700],
    fontWeight: '700',
    fontSize: 15,
  },
  emptyMembersHint: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyMembersIcon: {
    fontSize: 40,
  },
  emptyMembersText: {
    fontSize: 15,
    color: COLORS.sandal[500],
    textAlign: 'center',
  },
  emptyMembersSubText: {
    fontSize: 12,
    color: COLORS.sandal[400],
    textAlign: 'center',
  },
  memberFormCard: {
    backgroundColor: '#FEFDF8',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.cream[300],
    shadowColor: '#3D0C11',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  memberFormHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: COLORS.cream[100],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cream[200],
  },
  memberFormTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.maroon[800],
    flex: 1,
  },
  memberFormActions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  expandIcon: {
    color: COLORS.gold[500],
    fontSize: 11,
    fontWeight: '700',
  },
  removeMemberBtn: {
    color: '#C62828',
    fontSize: 16,
    fontWeight: '700',
  },
  memberFormBody: {
    padding: 14,
  },
  previewCard: {
    backgroundColor: '#FEFDF8',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#3D0C11',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignSelf: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: COLORS.gold[400],
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cream[200],
  },
  previewLabel: {
    fontSize: 13,
    color: COLORS.sandal[400],
    flex: 1,
  },
  previewValue: {
    fontSize: 13,
    color: COLORS.maroon[800],
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  memberPreviewTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.maroon[800],
    marginBottom: 10,
  },
  memberPreviewCard: {
    backgroundColor: '#FEFDF8',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.saffron[400],
  },
  memberPreviewName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.maroon[900],
  },
  memberPreviewMeta: {
    fontSize: 12,
    color: COLORS.sandal[500],
    marginTop: 2,
  },
  memberPreviewEdu: {
    fontSize: 12,
    color: COLORS.saffron[600],
    marginTop: 3,
  },
  confirmNote: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#2D7A3A',
  },
  confirmNoteText: {
    fontSize: 13,
    color: '#1B5E20',
    lineHeight: 20,
  },
  bottomBar: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    backgroundColor: '#FEFDF8',
    borderTopWidth: 1,
    borderTopColor: COLORS.cream[200],
    shadowColor: '#3D0C11',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
});
