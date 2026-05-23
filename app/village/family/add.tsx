import React, { useState, useEffect } from 'react';
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
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useCreateFamily, useCreateMember, useFamily, useUpdateFamily, useVillages } from '@hooks/useQueries';
import { cloudinaryService } from '@services/cloudinary.service';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';
import { Avatar } from '@components/ui/Avatar';
import { COLORS } from '@constants/colors';
import { COMMON_GOTRAS, EDUCATION_TYPES, RELATION_LABELS, SCHOOL_STANDARDS } from '@constants/config';
import type { FamilyFormData, MemberFormData, RelationType, EducationType, Gender } from '@/types';
import i18n from '@services/i18n.service';
import { useLanguageStore } from '@store/language.store';
import { useAuthStore } from '@store/auth.store';
import { useToast } from '@store/toast.store';
import { Ionicons } from '@expo/vector-icons';

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
  const locale = useLanguageStore((s) => s.locale); // dynamic listener
  const { showToast } = useToast();

  const createFamily = useCreateFamily();
  const createMember = useCreateMember();
  const updateFamily = useUpdateFamily();

  const { user } = useAuthStore();
  const { data: villagesList } = useVillages();
  const [selectedVillageId, setSelectedVillageId] = useState<string>('');

  // Fallback and map villageId
  useEffect(() => {
    if (params.villageId) {
      setFamilyData((p) => ({ ...p, villageId: params.villageId }));
    } else if (user?.role === 'VILLAGE_ADMIN' && user.assignedVillageId) {
      setFamilyData((p) => ({ ...p, villageId: user.assignedVillageId }));
    }
  }, [params.villageId, user]);

  const handleVillageChange = (vId: string) => {
    setSelectedVillageId(vId);
    setFamilyData((p) => ({ ...p, villageId: vId }));
  };

  // Fetch existing family data in edit mode
  const { data: existingFamily, isLoading: isFamilyLoading } = useFamily(
    params.editMode === 'true' && params.familyId ? params.familyId : ''
  );

  useEffect(() => {
    if (params.editMode === 'true' && existingFamily) {
      setFamilyData({
        headName: existingFamily.headName || '',
        fatherName: existingFamily.fatherName || '',
        mobile: existingFamily.mobile || '',
        altMobile: existingFamily.altMobile || '',
        gotra: existingFamily.gotra || '',
        address: existingFamily.address || '',
        headImageUrl: existingFamily.headImageUrl || '',
        villageId: existingFamily.villageId || '',
      });
    }
  }, [existingFamily, params.editMode]);

  if (params.editMode === 'true' && isFamilyLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.cream[50], gap: 12 }}>
        <ActivityIndicator size="large" color={COLORS.maroon[800]} />
        <Text style={{ color: COLORS.maroon[800], fontSize: 16, fontWeight: '600' }}>
          {locale === 'en' ? 'Loading family details...' : 'परिवार विवरण लोड हो रहा है...'}
        </Text>
      </View>
    );
  }

  const dynamicSteps = [
    { number: 1, label: locale === 'en' ? 'Family Head' : 'परिवार मुखिया', emoji: '👤' },
    { number: 2, label: locale === 'en' ? 'Members' : 'परिवार सदस्य', emoji: '👥' },
    { number: 3, label: locale === 'en' ? 'Preview' : 'पूर्वावलोकन', emoji: '📋' },
  ];

  // ── Image Upload ──────────────────────────────────────────────────────────

  const handleImagePick = async () => {
    try {
      setIsUploading(true);
      const result = await cloudinaryService.pickAndUpload('gram-parivar/family-heads');
      if (result) {
        setFamilyData((p) => ({ ...p, headImageUrl: result.secureUrl }));
      }
    } catch (err: any) {
      Alert.alert(
        locale === 'en' ? 'Upload Failed' : 'अपलोड विफल', 
        err.message || (locale === 'en' ? 'Could not upload image.' : 'छवि अपलोड नहीं की जा सकी।')
      );
    } finally {
      setIsUploading(false);
    }
  };

  // ── Navigation ────────────────────────────────────────────────────────────

  const validateStep1 = () => {
    if (!familyData.headName?.trim()) {
      return locale === 'en' ? 'Head name is required.' : 'मुखिया का नाम आवश्यक है।';
    }
    if (!familyData.mobile?.trim() || familyData.mobile.length < 10) {
      return locale === 'en' ? 'Valid 10-digit mobile number is required.' : 'वैध 10-अंकीय मोबाइल नंबर आवश्यक है।';
    }
    if (!familyData.gotra?.trim()) {
      return locale === 'en' ? 'Gotra is required.' : 'गोत्र आवश्यक है।';
    }
    if (!familyData.address?.trim()) {
      return locale === 'en' ? 'Address is required.' : 'पता आवश्यक है।';
    }
    return null;
  };

  const goNext = () => {
    if (step === 1) {
      const error = validateStep1();
      if (error) { 
        showToast({
          type: 'warning',
          title: locale === 'en' ? 'Missing Info' : 'अपूर्ण जानकारी',
          message: error,
        });
        return; 
      }
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
      if (params.editMode === 'true' && params.familyId) {
        await updateFamily.mutateAsync({
          id: params.familyId,
          data: familyData,
        });

        showToast({
          type: 'success',
          title: locale === 'en' ? 'Changes Saved' : 'बदलाव सहेजे गए',
          message: locale === 'en'
            ? `${familyData.headName}'s family details have been successfully updated.`
            : `${familyData.headName} का परिवार विवरण सफलतापूर्वक अपडेट कर दिया गया है।`,
        });
        router.back();
        return;
      }

      const villageIdToUse = params.villageId || familyData.villageId || (user?.role === 'VILLAGE_ADMIN' ? user.assignedVillageId : '');
      const villageNameToUse = params.villageName || (villagesList?.villages?.find(v => v.$id === villageIdToUse)?.name) || (user?.role === 'VILLAGE_ADMIN' ? user.assignedVillageName : '');

      if (!villageIdToUse) {
        showToast({
          type: 'warning',
          title: locale === 'en' ? 'Select Village' : 'गाँव चुनें',
          message: locale === 'en' ? 'Please select a village to add the family to.' : 'कृपया परिवार जोड़ने के लिए एक गाँव का चयन करें।',
        });
        return;
      }

      const family = await createFamily.mutateAsync({
        familyData: {
          ...familyData,
          villageId: villageIdToUse,
        } as FamilyFormData,
        villageName: villageNameToUse || '',
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

      showToast({
        type: 'success',
        title: locale === 'en' ? 'Family Added' : 'परिवार जोड़ा गया',
        message: locale === 'en'
          ? `${familyData.headName}'s family has been added to ${villageNameToUse}.`
          : `${familyData.headName} का परिवार सफलतापूर्वक ${villageNameToUse} में जोड़ दिया गया है।`,
      });
      router.back();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: locale === 'en' ? 'Error' : 'त्रुटि',
        message: err.message || (locale === 'en' ? 'Failed to save family. Please try again.' : 'परिवार सहेजने में विफल। कृपया पुनः प्रयास करें।'),
      });
    }
  };

  const isSubmitting = createFamily.isPending || createMember.isPending || updateFamily.isPending;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.cream[50] }}>
      {/* Header */}
      <LinearGradient colors={['#3D0C11', '#6B1414']} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={goBack} style={styles.closeBtn}>
              <Ionicons
                name={step === 1 ? 'close' : 'chevron-back'}
                size={20}
                color={COLORS.gold.light}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {params.editMode === 'true' 
                ? (locale === 'en' ? 'Edit Family' : 'परिवार संपादित करें') 
                : (locale === 'en' ? 'Add New Family' : 'नया परिवार जोड़ें')
              }
            </Text>
            <View style={{ width: 36 }} />
          </View>

          {/* Step indicator */}
          {params.editMode !== 'true' && (
            <View style={styles.stepRow}>
              {dynamicSteps.map((s, i) => (
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
                  {i < dynamicSteps.length - 1 && (
                    <View style={[styles.stepLine, step > s.number && styles.stepLineActive]} />
                  )}
                </React.Fragment>
              ))}
            </View>
          )}
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
          {params.editMode === 'true' ? (
            <Step1
              data={familyData}
              onChange={(k, v) => setFamilyData((p) => ({ ...p, [k]: v }))}
              isUploading={isUploading}
              onPickImage={handleImagePick}
              showVillagePicker={!params.villageId && user?.role === 'SUPER_ADMIN'}
              villages={villagesList?.villages || []}
              selectedVillageId={familyData.villageId || ''}
              onSelectVillage={handleVillageChange}
            />
          ) : (
            <>
              {/* ── STEP 1: Family Head ───────────────── */}
              {step === 1 && (
                <Step1
                  data={familyData}
                  onChange={(k, v) => setFamilyData((p) => ({ ...p, [k]: v }))}
                  isUploading={isUploading}
                  onPickImage={handleImagePick}
                  showVillagePicker={!params.villageId && user?.role === 'SUPER_ADMIN'}
                  villages={villagesList?.villages || []}
                  selectedVillageId={familyData.villageId || ''}
                  onSelectVillage={handleVillageChange}
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
            </>
          )}
        </ScrollView>

        {/* Bottom action bar */}
        <View style={styles.bottomBar}>
          {params.editMode === 'true' ? (
            <Button
              title={isSubmitting 
                ? (locale === 'en' ? 'Saving...' : 'सहेज रहा है...') 
                : (locale === 'en' ? '💾 Save Changes' : '💾 बदलाव सहेजें')
              }
              onPress={handleSubmit}
              isLoading={isSubmitting}
              variant="gold"
              fullWidth
              size="lg"
            />
          ) : step < 3 ? (
            <Button
              title={step === 2 
                ? (locale === 'en' ? 'Preview →' : 'पूर्वावलोकन →') 
                : (locale === 'en' ? 'Next →' : 'आगे →')
              }
              onPress={goNext}
              fullWidth
              size="lg"
            />
          ) : (
            <Button
              title={isSubmitting 
                ? (locale === 'en' ? 'Saving...' : 'सहेज रहा है...') 
                : (locale === 'en' ? '✅ Save Family' : '✅ परिवार सहेजें')
              }
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
  showVillagePicker,
  villages,
  selectedVillageId,
  onSelectVillage,
}: {
  data: Partial<FamilyFormData>;
  onChange: (key: string, value: string) => void;
  isUploading: boolean;
  onPickImage: () => void;
  showVillagePicker?: boolean;
  villages: any[];
  selectedVillageId: string;
  onSelectVillage: (villageId: string) => void;
}) {
  const locale = useLanguageStore((s) => s.locale);
  return (
    <View>
      <SectionTitle emoji="👤" title={locale === 'en' ? 'Family Head Details' : 'परिवार मुखिया का विवरण'} />

      {/* Village Picker for Super Admin when adding family directly */}
      {showVillagePicker && (
        <View style={{ marginBottom: 16 }}>
          <Text style={styles.fieldLabel}>
            {locale === 'en' ? 'Select Village' : 'गाँव चुनें'}{' '}
            <Text style={{ color: COLORS.saffron[500] }}>*</Text>
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8, marginBottom: 8 }}>
            <View style={styles.gotraRow}>
              {villages.map((v: any) => (
                <TouchableOpacity
                  key={v.$id}
                  onPress={() => onSelectVillage(v.$id)}
                  style={[styles.gotraChip, selectedVillageId === v.$id && styles.gotraChipActive]}
                >
                  <Text style={[styles.gotraChipText, selectedVillageId === v.$id && styles.gotraChipTextActive]}>
                    🏛️ {v.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

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

              </>
            )}
          </View>
        )}
        {data.headImageUrl && (
          <View style={styles.photoEditBadge}>
            <Text style={{ color: '#fff', fontSize: 10 }}>
              {locale === 'en' ? '✏️ Change' : '✏️ बदलें'}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <Input 
        label={locale === 'en' ? 'Head Name' : 'मुखिया का नाम'} 
        placeholder={locale === 'en' ? 'e.g., Ramesh Kumar Sharma' : 'उदा. रमेश कुमार शर्मा'} 
        value={data.headName || ''}
        onChangeText={(v) => onChange('headName', v)} 
        required 
      />
      <Input 
        label={locale === 'en' ? "Father's Name" : "पिता का नाम"} 
        placeholder={locale === 'en' ? 'e.g., Suresh Kumar Sharma' : 'उदा. सुरेश कुमार शर्मा'} 
        value={data.fatherName || ''}
        onChangeText={(v) => onChange('fatherName', v)} 
      />
      <Input 
        label={locale === 'en' ? 'Mobile Number' : 'मोबाइल नंबर'} 
        placeholder={locale === 'en' ? '10-digit mobile' : '10-अंकीय मोबाइल'} 
        value={data.mobile || ''}
        onChangeText={(v) => onChange('mobile', v)} 
        keyboardType="phone-pad" 
        maxLength={10} 
        required 
      />
      <Input 
        label={locale === 'en' ? 'Alternate Mobile' : 'वैकल्पिक मोबाइल'} 
        placeholder={locale === 'en' ? 'Optional' : 'वैकल्पिक'} 
        value={data.altMobile || ''}
        onChangeText={(v) => onChange('altMobile', v)} 
        keyboardType="phone-pad" 
        maxLength={10} 
      />

      {/* Gotra picker */}
      <Text style={styles.fieldLabel}>
        {locale === 'en' ? 'Gotra' : 'गोत्र'}{' '}
        <Text style={{ color: COLORS.saffron[500] }}>*</Text>
      </Text>
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
      <Input 
        label={locale === 'en' ? 'Custom Gotra' : 'कस्टम गोत्र'} 
        placeholder={locale === 'en' ? 'Or type gotra here' : 'या यहाँ गोत्र टाइप करें'} 
        value={data.gotra || ''}
        onChangeText={(v) => onChange('gotra', v)} 
      />

      <Input 
        label={locale === 'en' ? 'Full Address' : 'पूरा पता'} 
        placeholder={locale === 'en' ? 'House No., Street, Village, Dist.' : 'मकान नंबर, गली, गाँव, जिला'} 
        value={data.address || ''}
        onChangeText={(v) => onChange('address', v)} 
        multiline 
        numberOfLines={3} 
        required 
      />
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
  const locale = useLanguageStore((s) => s.locale);
  return (
    <View>
      <SectionTitle emoji="👥" title={locale === 'en' ? 'Family Members' : 'परिवार के सदस्य'} />
      <Text style={styles.stepHint}>
        {locale === 'en' 
          ? 'Add all members of this family (skip head — already added)' 
          : 'इस परिवार के सभी सदस्यों को जोड़ें (मुखिया को छोड़ दें — पहले से ही जोड़ा जा चुका है)'
        }
      </Text>

      {members.map((member, index) => (
        <MemberForm key={index} index={index} member={member} onUpdate={onUpdate} onRemove={onRemove} />
      ))}

      <TouchableOpacity onPress={onAdd} style={styles.addMemberBtn}>
        <Text style={styles.addMemberText}>
          {locale === 'en' ? '+ Add Member' : '+ सदस्य जोड़ें'}
        </Text>
      </TouchableOpacity>

      {members.length === 0 && (
        <View style={styles.emptyMembersHint}>
          <Text style={styles.emptyMembersIcon}>👨‍👩‍👧‍👦</Text>
          <Text style={styles.emptyMembersText}>
            {locale === 'en' ? 'Tap "Add Member" to add family members' : 'परिवार के सदस्यों को जोड़ने के लिए "सदस्य जोड़ें" पर टैप करें'}
          </Text>
          <Text style={styles.emptyMembersSubText}>
            {locale === 'en' ? 'You can skip this step and add members later' : 'आप इस चरण को छोड़ सकते हैं और बाद में सदस्य जोड़ सकते हैं'}
          </Text>
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
  const [showPicker, setShowPicker] = useState(false);
  const locale = useLanguageStore((s) => s.locale);

  const getRelationLabel = (rel: string) => {
    if (locale === 'hi') {
      if (rel === 'SON') return 'पुत्र';
      if (rel === 'DAUGHTER') return 'पुत्री';
      if (rel === 'SPOUSE') return 'जीवनसाथी';
      if (rel === 'FATHER') return 'पिता';
      if (rel === 'MOTHER') return 'माता';
      if (rel === 'BROTHER') return 'भाई';
      if (rel === 'SISTER') return 'बहन';
      if (rel === 'GRANDFATHER') return 'दादा/नाना';
      if (rel === 'GRANDMOTHED' || rel === 'GRANDMOTHER') return 'दादी/नानी';
      return 'अन्य';
    }
    return RELATION_LABELS[rel] || rel;
  };

  const getEducationLabel = (edu: string) => {
    if (locale === 'hi') {
      if (edu === 'SCHOOL') return 'स्कूल';
      if (edu === 'COLLEGE') return 'कॉलेज';
      if (edu === 'GRADUATED') return 'स्नातक';
      if (edu === 'WORKING') return 'कार्यरत';
      if (edu === 'BUSINESS') return 'व्यवसाय';
      return 'अन्य';
    }
    return (EDUCATION_TYPES as any)[edu] || edu;
  };

  return (
    <View style={styles.memberFormCard}>
      <TouchableOpacity
        style={styles.memberFormHeader}
        onPress={() => setExpanded((e) => !e)}
      >
        <Text style={styles.memberFormTitle}>
          {locale === 'en' 
            ? `👤 Member ${index + 1}: ${member.name || 'New Member'}`
            : `👤 सदस्य ${index + 1}: ${member.name || 'नया सदस्य'}`
          }
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
          <Input 
            label={locale === 'en' ? 'Full Name' : 'पूरा नाम'} 
            placeholder={locale === 'en' ? 'Member name' : 'सदस्य का नाम'} 
            value={member.name || ''}
            onChangeText={(v) => onUpdate(index, 'name', v)} 
            required 
          />

          {/* Relation picker */}
          <Text style={styles.fieldLabel}>
            {locale === 'en' ? 'Relation' : 'संबंध'}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            <View style={styles.gotraRow}>
              {['SON', 'DAUGHTER', 'SPOUSE', 'FATHER', 'MOTHER', 'BROTHER', 'SISTER', 'GRANDFATHER', 'GRANDMOTHER', 'OTHER'].map((rel) => (
                <TouchableOpacity
                  key={rel}
                  onPress={() => onUpdate(index, 'relation', rel)}
                  style={[styles.gotraChip, member.relation === rel && styles.gotraChipActive]}
                >
                  <Text style={[styles.gotraChipText, member.relation === rel && styles.gotraChipTextActive]}>
                    {getRelationLabel(rel)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Gender */}
          <Text style={styles.fieldLabel}>
            {locale === 'en' ? 'Gender' : 'लिंग'}
          </Text>
          <View style={styles.genderRow}>
            {(['MALE', 'FEMALE', 'OTHER'] as Gender[]).map((g) => (
              <TouchableOpacity
                key={g}
                onPress={() => onUpdate(index, 'gender', g)}
                style={[styles.genderChip, member.gender === g && styles.genderChipActive]}
              >
                <Text style={styles.genderChipText}>
                  {g === 'MALE' 
                    ? (locale === 'en' ? '👨 Male' : '👨 पुरुष') 
                    : g === 'FEMALE' 
                      ? (locale === 'en' ? '👩 Female' : '👩 महिला') 
                      : (locale === 'en' ? '🧑 Other' : '🧑 अन्य')
                  }
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity onPress={() => setShowPicker(true)}>
            <View pointerEvents="none">
              <Input 
                label={locale === 'en' ? 'Date of Birth' : 'जन्म तिथि'} 
                placeholder={locale === 'en' ? 'Select Date of Birth' : 'जन्म तिथि चुनें'} 
                value={member.dateOfBirth || ''}
                editable={false}
                required 
              />
            </View>
          </TouchableOpacity>

          {showPicker && (
            <DateTimePicker
              value={
                member.dateOfBirth && !isNaN(new Date(member.dateOfBirth).getTime())
                  ? new Date(member.dateOfBirth)
                  : new Date(2000, 0, 1)
              }
              mode="date"
              display="calendar"
              maximumDate={new Date()}
              onChange={(event, selectedDate) => {
                setShowPicker(false);
                if (selectedDate) {
                  const year = selectedDate.getFullYear();
                  const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                  const day = String(selectedDate.getDate()).padStart(2, '0');
                  const formattedDate = `${year}-${month}-${day}`;
                  onUpdate(index, 'dateOfBirth', formattedDate);
                }
              }}
            />
          )}

          {/* Education type */}
          <Text style={styles.fieldLabel}>
            {locale === 'en' ? 'Education / Occupation Type' : 'शिक्षा / व्यवसाय का प्रकार'}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            <View style={styles.gotraRow}>
              {(Object.entries(EDUCATION_TYPES) as [EducationType, string][]).map(([key, label]) => (
                <TouchableOpacity
                  key={key}
                  onPress={() => onUpdate(index, 'educationType', key)}
                  style={[styles.gotraChip, member.educationType === key && styles.gotraChipActive]}
                >
                  <Text style={[styles.gotraChipText, member.educationType === key && styles.gotraChipTextActive]}>
                    {getEducationLabel(key)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Conditional fields */}
          {member.educationType === 'SCHOOL' && (
            <>
              <Text style={styles.fieldLabel}>
                {locale === 'en' ? 'Current Standard / Class' : 'वर्तमान कक्षा'}
              </Text>
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
              <Input 
                label={locale === 'en' ? 'School Name' : 'स्कूल का नाम'} 
                placeholder={locale === 'en' ? 'School or college name' : 'स्कूल या कॉलेज का नाम'} 
                value={member.schoolOrCollegeName || ''}
                onChangeText={(v) => onUpdate(index, 'schoolOrCollegeName', v)} 
              />
            </>
          )}

          {(member.educationType === 'COLLEGE' || member.educationType === 'GRADUATED') && (
            <>
              <Input 
                label={locale === 'en' ? 'Degree / Course' : 'डिग्री / कोर्स'} 
                placeholder={locale === 'en' ? 'e.g., B.Com, M.Sc, B.Tech' : 'उदा. B.Com, M.Sc, B.Tech'} 
                value={member.degree || ''}
                onChangeText={(v) => onUpdate(index, 'degree', v)} 
              />
              <Input 
                label={locale === 'en' ? 'College Name' : 'कॉलेज का नाम'} 
                placeholder={locale === 'en' ? 'College or university name' : 'कॉलेज या विश्वविद्यालय का नाम'} 
                value={member.schoolOrCollegeName || ''}
                onChangeText={(v) => onUpdate(index, 'schoolOrCollegeName', v)} 
              />
            </>
          )}

          {(member.educationType === 'WORKING' || member.educationType === 'BUSINESS' || member.educationType === 'OTHER') && (
            <Input 
              label={locale === 'en' ? 'Occupation / Business' : 'व्यवसाय / नौकरी'} 
              placeholder={locale === 'en' ? 'e.g., Farming, Furniture Business, Teacher' : 'उदा. खेती, फर्नीचर व्यवसाय, शिक्षक'} 
              value={member.occupation || ''}
              onChangeText={(v) => onUpdate(index, 'occupation', v)} 
            />
          )}

          <Input 
            label={locale === 'en' ? 'Mobile (Optional)' : 'मोबाइल (वैकल्पिक)'} 
            placeholder={locale === 'en' ? "Member's phone number" : 'सदस्य का फोन नंबर'} 
            value={member.mobile || ''}
            onChangeText={(v) => onUpdate(index, 'mobile', v)} 
            keyboardType="phone-pad" 
            maxLength={10} 
          />
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
  const locale = useLanguageStore((s) => s.locale);

  const getRelationLabel = (rel: string) => {
    if (locale === 'hi') {
      if (rel === 'SON') return 'पुत्र';
      if (rel === 'DAUGHTER') return 'पुत्री';
      if (rel === 'SPOUSE') return 'जीवनसाथी';
      if (rel === 'FATHER') return 'पिता';
      if (rel === 'MOTHER') return 'माता';
      if (rel === 'BROTHER') return 'भाई';
      if (rel === 'SISTER') return 'बहन';
      if (rel === 'GRANDFATHER') return 'दादा/नाना';
      if (rel === 'GRANDMOTHER') return 'दादी/नानी';
      return 'अन्य';
    }
    return RELATION_LABELS[rel] || rel;
  };

  const getEducationLabel = (edu: string) => {
    if (locale === 'hi') {
      if (edu === 'SCHOOL') return 'स्कूल';
      if (edu === 'COLLEGE') return 'कॉलेज';
      if (edu === 'GRADUATED') return 'स्नातक';
      if (edu === 'WORKING') return 'कार्यरत';
      if (edu === 'BUSINESS') return 'व्यवसाय';
      return 'अन्य';
    }
    return (EDUCATION_TYPES as any)[edu] || edu;
  };

  return (
    <View>
      <SectionTitle emoji="📋" title={locale === 'en' ? 'Review & Confirm' : 'समीक्षा और पुष्टि करें'} />

      {/* Family summary */}
      <View style={styles.previewCard}>
        <LinearGradient colors={['#D4A017', '#9A6E00']} style={{ height: 3 }} />
        <View style={{ padding: 16 }}>
          {familyData.headImageUrl && (
            <Image source={{ uri: familyData.headImageUrl }} style={styles.previewImage} contentFit="cover" />
          )}
          <PreviewRow label={locale === 'en' ? 'Head Name' : 'मुखिया का नाम'} value={familyData.headName || '—'} />
          <PreviewRow label={locale === 'en' ? "Father's Name" : "पिता का नाम"} value={familyData.fatherName || '—'} />
          <PreviewRow label={locale === 'en' ? 'Village' : 'गाँव'} value={villageName || '—'} />
          <PreviewRow label={locale === 'en' ? 'Gotra' : 'गोत्र'} value={familyData.gotra || '—'} />
          <PreviewRow label={locale === 'en' ? 'Mobile' : 'मोबाइल'} value={familyData.mobile || '—'} />
          <PreviewRow label={locale === 'en' ? 'Address' : 'पता'} value={familyData.address || '—'} />
        </View>
      </View>

      {members.length > 0 && (
        <>
          <Text style={styles.memberPreviewTitle}>
            {locale === 'en' 
              ? `👥 ${members.length} Member(s) to be added`
              : `👥 ${members.length} सदस्य जोड़े जाएंगे`
            }
          </Text>
          {members.map((m, i) => (
            <View key={i} style={styles.memberPreviewCard}>
              <Text style={styles.memberPreviewName}>
                {m.name || (locale === 'en' ? `Member ${i + 1}` : `सदस्य ${i + 1}`)}
              </Text>
              <Text style={styles.memberPreviewMeta}>
                {getRelationLabel(m.relation as string)} · {m.gender === 'MALE' ? (locale === 'en' ? 'Male' : 'पुरुष') : m.gender === 'FEMALE' ? (locale === 'en' ? 'Female' : 'महिला') : (locale === 'en' ? 'Other' : 'अन्य')} · {locale === 'en' ? 'DOB' : 'जन्म तिथि'}: {m.dateOfBirth || '—'}
              </Text>
              <Text style={styles.memberPreviewEdu}>
                📚 {getEducationLabel(m.educationType as EducationType)}
                {m.currentStandard ? ` · ${locale === 'en' ? `Class ${m.currentStandard}` : `कक्षा ${m.currentStandard}`}` : ''}
                {m.degree ? ` · ${m.degree}` : ''}
              </Text>
            </View>
          ))}
        </>
      )}

      <View style={styles.confirmNote}>
        <Text style={styles.confirmNoteText}>
          {locale === 'en'
            ? '🙏 Please verify all information before saving. This will be recorded in the village directory.'
            : '🙏 कृपया सहेजने से पहले सभी जानकारी सत्यापित करें। यह गाँव की निर्देशिका में दर्ज किया जाएगा।'
          }
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
    borderRadius: 18,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
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
