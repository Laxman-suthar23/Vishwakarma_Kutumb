import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Linking,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useFamily,
  useMembers,
  useDeleteFamily,
  useDeleteMember,
  useCreateMember,
  useUpdateMember,
} from '@hooks/useQueries';
import { useIsSuperAdmin, useIsVillageAdmin, useAssignedVillage } from '@store/auth.store';
import { MemberCard } from '@components/family/MemberCard';
import { Avatar } from '@components/ui/Avatar';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';
import { EmptyState } from '@components/ui/EmptyState';
import { COLORS } from '@constants/colors';
import { RELATION_LABELS, EDUCATION_TYPES, SCHOOL_STANDARDS } from '@constants/config';
import { formatMobile } from '@utils/helpers';
import type { Member, MemberFormData, RelationType, EducationType, Gender } from '@/types';
import i18n from '@services/i18n.service';
import { useLanguageStore } from '@store/language.store';
import { useConfirm } from '@store/confirm.store';
import { useToast } from '@store/toast.store';
import { Ionicons } from '@expo/vector-icons';

const emptyMemberForm: Partial<MemberFormData> = {
  name: '',
  relation: 'SON',
  gender: 'MALE',
  dateOfBirth: '',
  mobile: '',
  occupation: '',
  educationType: 'SCHOOL',
  educationStatus: 'STUDYING',
  schoolOrCollegeName: '',
  degree: '',
};

export default function FamilyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [refreshing, setRefreshing] = useState(false);
  const locale = useLanguageStore((s) => s.locale); // dynamic listener
  const { confirm } = useConfirm();
  const { showToast } = useToast();

  // Modal States
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [memberForm, setMemberForm] = useState<Partial<MemberFormData>>(emptyMemberForm);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Queries & Mutations
  const { data: family, isLoading: isFamilyLoading, refetch: refetchFamily } = useFamily(id!);
  const { data: members, isLoading: isMembersLoading, refetch: refetchMembers } = useMembers(id!);
  
  const deleteFamilyMutation = useDeleteFamily();
  const deleteMemberMutation = useDeleteMember();
  const createMemberMutation = useCreateMember();
  const updateMemberMutation = useUpdateMember();

  // Admin Permissions
  const isSuperAdmin = useIsSuperAdmin();
  const isVillageAdmin = useIsVillageAdmin();
  const { villageId: assignedVillageId } = useAssignedVillage();
  const canManage = isSuperAdmin || (isVillageAdmin && assignedVillageId === family?.villageId);

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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchFamily(), refetchMembers()]);
    setRefreshing(false);
  }, [id, refetchFamily, refetchMembers]);

  const handleDeleteFamily = () => {
    confirm({
      title: locale === 'en' ? '🚨 Delete Family' : '🚨 परिवार हटाएं',
      message: locale === 'en'
        ? `Are you sure you want to delete ${family?.headName}'s family and all associated members? This action is permanent.`
        : `क्या आप वाकई ${family?.headName} का परिवार और उससे जुड़े सभी सदस्यों को हटाना चाहते हैं? यह क्रिया स्थायी है।`,
      confirmText: locale === 'en' ? 'Delete' : 'हटाएं',
      cancelText: locale === 'en' ? 'Cancel' : 'रद्द करें',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await deleteFamilyMutation.mutateAsync({
            familyId: id!,
            villageId: family?.villageId || '',
          });
          Alert.alert(
            locale === 'en' ? 'Deleted' : 'हटाया गया',
            locale === 'en' ? 'Family deleted successfully.' : 'परिवार सफलतापूर्वक हटा दिया गया।'
          );
          router.back();
        } catch (err: any) {
          Alert.alert(
            locale === 'en' ? 'Error' : 'त्रुटि',
            err.message || (locale === 'en' ? 'Failed to delete family.' : 'परिवार हटाने में विफल।')
          );
        }
      },
    });
  };

  const handleDeleteMember = (memberId: string) => {
    const memberName = members?.find((m) => m.$id === memberId)?.name || 'this member';
    confirm({
      title: locale === 'en' ? '🗑️ Delete Member' : '🗑️ सदस्य हटाएं',
      message: locale === 'en'
        ? `Are you sure you want to delete ${memberName} from this family directory?`
        : `क्या आप वाकई इस परिवार निर्देशिका से ${memberName} को हटाना चाहते हैं?`,
      confirmText: locale === 'en' ? 'Delete' : 'हटाएं',
      cancelText: locale === 'en' ? 'Cancel' : 'रद्द करें',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await deleteMemberMutation.mutateAsync({
            memberId,
            familyId: id!,
          });
          Alert.alert(
            locale === 'en' ? 'Deleted' : 'हटाया गया',
            locale === 'en' ? 'Member deleted successfully.' : 'सदस्य सफलतापूर्वक हटा दिया गया।'
          );
        } catch (err: any) {
          Alert.alert(
            locale === 'en' ? 'Error' : 'त्रुटि',
            err.message || (locale === 'en' ? 'Failed to delete member.' : 'सदस्य हटाने में विफल।')
          );
        }
      },
    });
  };

  const handleOpenAddModal = () => {
    setEditingMember(null);
    setMemberForm({
      ...emptyMemberForm,
      familyId: id!,
    });
    setModalVisible(true);
  };

  const handleOpenEditModal = (member: Member) => {
    setEditingMember(member);
    setMemberForm({
      familyId: id!,
      name: member.name,
      relation: member.relation,
      gender: member.gender,
      dateOfBirth: member.dateOfBirth,
      mobile: member.mobile || '',
      occupation: member.occupation || '',
      educationType: member.educationType,
      educationStatus: member.educationStatus || 'STUDYING',
      currentStandard: member.currentStandard,
      schoolOrCollegeName: member.schoolOrCollegeName || '',
      degree: member.degree || '',
    });
    setModalVisible(true);
  };

  const validateMemberForm = () => {
    if (!memberForm.name?.trim()) {
      return locale === 'en' ? 'Name is required.' : 'नाम आवश्यक है।';
    }
    if (!memberForm.dateOfBirth?.trim()) {
      return locale === 'en' ? 'Date of Birth is required.' : 'जन्म तिथि आवश्यक है।';
    }
    
    // Quick YYYY-MM-DD check
    const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dobRegex.test(memberForm.dateOfBirth)) {
      return locale === 'en' ? 'Date of Birth must be in YYYY-MM-DD format.' : 'जन्म तिथि YYYY-MM-DD प्रारूप में होनी चाहिए।';
    }

    return null;
  };

  const handleSaveMember = async () => {
    const validationError = validateMemberForm();
    if (validationError) {
      showToast({
        type: 'warning',
        title: locale === 'en' ? 'Validation Error' : 'सत्यापन त्रुटि',
        message: validationError,
      });
      return;
    }

    try {
      if (editingMember) {
        await updateMemberMutation.mutateAsync({
          id: editingMember.$id,
          data: memberForm,
        });
        showToast({
          type: 'success',
          title: locale === 'en' ? 'Success' : 'सफलता',
          message: locale === 'en' ? 'Member updated successfully.' : 'सदस्य सफलतापूर्वक अपडेट किया गया।',
        });
      } else {
        await createMemberMutation.mutateAsync(memberForm as MemberFormData);
        showToast({
          type: 'success',
          title: locale === 'en' ? 'Success' : 'सफलता',
          message: locale === 'en' ? 'Member added successfully.' : 'सदस्य सफलतापूर्वक जोड़ा गया।',
        });
      }
      setModalVisible(false);
    } catch (err: any) {
      showToast({
        type: 'error',
        title: locale === 'en' ? 'Error' : 'त्रुटि',
        message: err.message || (locale === 'en' ? 'Failed to save member details.' : 'सदस्य विवरण सहेजने में विफल।'),
      });
    }
  };

  const renderHeader = () => {
    if (isFamilyLoading || !family) return null;

    return (
      <View style={styles.headerContainer}>
        {/* Family Summary Header */}
        <View style={styles.headSummary}>
          <Avatar
            name={family.headName}
            imageUrl={family.headImageUrl}
            size="lg"
            isHead
          />
          <View style={styles.headTextContainer}>
            <Text style={styles.headTitle}>{family.headName}</Text>
            {family.fatherName && (
              <Text style={styles.fatherName}>
                {locale === 'en' ? `S/o Shri ${family.fatherName}` : `पुत्र श्री ${family.fatherName}`}
              </Text>
            )}
            <View style={styles.badgeRow}>
              <View style={styles.gotraBadge}>
                <Text style={styles.gotraText}>
                  {locale === 'en' ? `Gotra: ${family.gotra}` : `गोत्र: ${family.gotra}`}
                </Text>
              </View>
              <View style={styles.villageBadge}>
                <Text style={styles.villageText}>📍 {family.villageName}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Contact & Address Details Card */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardHeaderTitle}>
            {locale === 'en' ? 'Contact & Location' : 'संपर्क और स्थान'}
          </Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailEmoji}>📱</Text>
            <View style={styles.detailTextWrapper}>
              <Text style={styles.detailLabel}>
                {locale === 'en' ? 'Primary Contact' : 'प्राथमिक संपर्क'}
              </Text>
              <Text style={styles.detailVal}>{formatMobile(family.mobile)}</Text>
            </View>
            <TouchableOpacity
              onPress={() => Linking.openURL(`tel:${family.mobile}`)}
              style={styles.callActionButton}
            >
              <Text style={styles.callIconText}>
                {locale === 'en' ? '📞 Call' : '📞 कॉल'}
              </Text>
            </TouchableOpacity>
          </View>

          {family.altMobile ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailEmoji}>📞</Text>
              <View style={styles.detailTextWrapper}>
                <Text style={styles.detailLabel}>
                  {locale === 'en' ? 'Alternate Contact' : 'वैकल्पिक संपर्क'}
                </Text>
                <Text style={styles.detailVal}>{formatMobile(family.altMobile)}</Text>
              </View>
              <TouchableOpacity
                onPress={() => Linking.openURL(`tel:${family.altMobile}`)}
                style={styles.callActionButton}
              >
                <Text style={styles.callIconText}>
                  {locale === 'en' ? '📞 Call' : '📞 कॉल'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <View style={styles.detailDivider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailEmoji}>📍</Text>
            <View style={styles.detailTextWrapper}>
              <Text style={styles.detailLabel}>
                {locale === 'en' ? 'Address' : 'पता'}
              </Text>
              <Text style={styles.addressVal}>{family.address}</Text>
            </View>
          </View>
        </View>

        {/* Admin actions row */}
        {canManage && (
          <View style={styles.adminActions}>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: '/village/family/add',
                  params: {
                    villageId: family.villageId,
                    villageName: family.villageName,
                    familyId: family.$id,
                    editMode: 'true',
                  },
                })
              }
              style={styles.editBtn}
            >
              <Text style={styles.editBtnText}>
                {locale === 'en' ? '✏️ Edit Family' : '✏️ परिवार संपादित करें'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDeleteFamily} style={styles.deleteBtn}>
              <Text style={styles.deleteBtnText}>
                {locale === 'en' ? '🗑️ Delete Family' : '🗑️ परिवार हटाएं'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Members section header */}
        <View style={styles.membersHeaderRow}>
          <Text style={styles.membersSectionTitle}>
            {locale === 'en' ? 'Family Members' : 'परिवार के सदस्य'}
          </Text>
          {canManage && (
            <TouchableOpacity onPress={handleOpenAddModal} style={styles.addMemberBtn}>
              <Text style={styles.addMemberBtnText}>
                {locale === 'en' ? '+ Add Member' : '+ सदस्य जोड़ें'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (isFamilyLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.maroon[800]} />
        <Text style={styles.loadingText}>
          {locale === 'en' ? 'Loading family profile...' : 'परिवार प्रोफ़ाइल लोड हो रही है...'}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.cream[50] }}>
      {/* Dynamic Header */}
      <LinearGradient colors={['#3D0C11', '#6B1414']} style={styles.navigationHeader}>
        <SafeAreaView edges={['top']}>
          <View style={styles.navHeaderRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={20} color={COLORS.gold.light} />
            </TouchableOpacity>
            <Text style={styles.navHeaderTitle} numberOfLines={1}>
              {locale === 'en' ? `${family?.headName}'s Family` : `${family?.headName} का परिवार`}
            </Text>
            <View style={{ width: 36 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Main List */}
      <FlatList
        data={members ?? []}
        keyExtractor={(item) => item.$id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.gold[500]}
          />
        }
        renderItem={({ item, index }) => (
          <View style={styles.memberCardContainer}>
            <MemberCard
              member={item}
              index={index}
              isAdmin={canManage}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteMember}
            />
          </View>
        )}
        ListEmptyComponent={
          isMembersLoading ? (
            <ActivityIndicator size="small" color={COLORS.gold[500]} style={{ padding: 24 }} />
          ) : (
            <View style={{ padding: 20 }}>
              <EmptyState
                icon="👥"
                title={locale === 'en' ? 'No Members Registered' : 'कोई सदस्य पंजीकृत नहीं है'}
                description={locale === 'en' ? 'No additional family members are listed. Register other family members below.' : 'कोई अतिरिक्त परिवार के सदस्य सूचीबद्ध नहीं हैं। नीचे अन्य सदस्यों को पंजीकृत करें।'}
                actionLabel={canManage ? (locale === 'en' ? 'Add First Member' : 'पहला सदस्य जोड़ें') : undefined}
                onAction={canManage ? handleOpenAddModal : undefined}
              />
            </View>
          )
        }
      />

      {/* Premium slide-up member form modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalKeyboardAvoiding}
          >
            <View style={styles.modalContainer}>
              {/* Gold Top line */}
              <View style={styles.modalGoldAccent} />

              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingMember 
                    ? (locale === 'en' ? '✏️ Edit Member' : '✏️ सदस्य संपादित करें') 
                    : (locale === 'en' ? '👥 Add Family Member' : '👥 परिवार सदस्य जोड़ें')
                  }
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
                  <Text style={styles.modalCloseBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={{ flexShrink: 1 }} contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">
                <Input
                  label={locale === 'en' ? 'Full Name' : 'पूरा नाम'}
                  placeholder={locale === 'en' ? 'e.g. Ramesh Suthar' : 'उदा. रमेश सुथार'}
                  value={memberForm.name || ''}
                  onChangeText={(v) => setMemberForm((p) => ({ ...p, name: v }))}
                  required
                />

                {/* Relation picker */}
                <Text style={styles.fieldLabel}>
                  {locale === 'en' ? 'Relation with Head' : 'मुखिया के साथ संबंध'}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                  <View style={styles.chipsRow}>
                    {Object.keys(RELATION_LABELS).map((rel) => {
                      const isActive = memberForm.relation === rel;
                      return (
                        <TouchableOpacity
                          key={rel}
                          onPress={() => setMemberForm((p) => ({ ...p, relation: rel as RelationType }))}
                          style={[styles.gotraChip, isActive && styles.gotraChipActive]}
                        >
                          <Text style={[styles.gotraChipText, isActive && styles.gotraChipTextActive]}>
                            {getRelationLabel(rel)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>

                {/* Gender selector */}
                <Text style={styles.fieldLabel}>
                  {locale === 'en' ? 'Gender' : 'लिंग'}
                </Text>
                <View style={styles.genderRow}>
                  {(['MALE', 'FEMALE', 'OTHER'] as Gender[]).map((g) => {
                    const isActive = memberForm.gender === g;
                    return (
                      <TouchableOpacity
                        key={g}
                        onPress={() => setMemberForm((p) => ({ ...p, gender: g }))}
                        style={[styles.genderChip, isActive && styles.genderChipActive]}
                      >
                        <Text style={[styles.genderChipText, isActive && styles.genderChipTextActive]}>
                          {g === 'MALE' 
                            ? (locale === 'en' ? '👨 Male' : '👨 पुरुष') 
                            : g === 'FEMALE' 
                              ? (locale === 'en' ? '👩 Female' : '👩 महिला') 
                              : (locale === 'en' ? '🧑 Other' : '🧑 अन्य')
                          }
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                  <View pointerEvents="none">
                    <Input
                      label={locale === 'en' ? 'Date of Birth' : 'जन्म तिथि'}
                      placeholder={locale === 'en' ? 'Select Date of Birth' : 'जन्म तिथि चुनें'}
                      value={memberForm.dateOfBirth || ''}
                      editable={false}
                      required
                    />
                  </View>
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={
                      memberForm.dateOfBirth && !isNaN(new Date(memberForm.dateOfBirth).getTime())
                        ? new Date(memberForm.dateOfBirth)
                        : new Date(2000, 0, 1)
                    }
                    mode="date"
                    display="calendar"
                    maximumDate={new Date()}
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) {
                        const year = selectedDate.getFullYear();
                        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                        const day = String(selectedDate.getDate()).padStart(2, '0');
                        const formattedDate = `${year}-${month}-${day}`;
                        setMemberForm((p) => ({ ...p, dateOfBirth: formattedDate }));
                      }
                    }}
                  />
                )}

                <Input
                  label={locale === 'en' ? 'Mobile Number (Optional)' : 'मोबाइल नंबर (वैकल्पिक)'}
                  placeholder={locale === 'en' ? '10-digit number' : '10-अंकीय मोबाइल'}
                  value={memberForm.mobile || ''}
                  onChangeText={(v) => setMemberForm((p) => ({ ...p, mobile: v }))}
                  keyboardType="phone-pad"
                  maxLength={10}
                />

                {/* Education type selector */}
                <Text style={styles.fieldLabel}>
                  {locale === 'en' ? 'Education / Occupation Status' : 'शिक्षा / व्यवसाय की स्थिति'}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                  <View style={styles.chipsRow}>
                    {Object.keys(EDUCATION_TYPES).map((edu) => {
                      const isActive = memberForm.educationType === edu;
                      return (
                        <TouchableOpacity
                          key={edu}
                          onPress={() =>
                            setMemberForm((p) => ({
                              ...p,
                              educationType: edu as EducationType,
                              // Reset conditional fields
                              schoolOrCollegeName: '',
                              degree: '',
                              occupation: '',
                            }))
                          }
                          style={[styles.gotraChip, isActive && styles.gotraChipActive]}
                        >
                          <Text style={[styles.gotraChipText, isActive && styles.gotraChipTextActive]}>
                            {getEducationLabel(edu)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>

                {/* Conditional Fields based on Education type */}
                {memberForm.educationType === 'SCHOOL' ? (
                  <>
                    <Text style={styles.fieldLabel}>
                      {locale === 'en' ? 'Current Standard / Class' : 'वर्तमान कक्षा'}
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                      <View style={styles.chipsRow}>
                        {SCHOOL_STANDARDS.map((s) => {
                          const isActive = memberForm.currentStandard === s.value;
                          return (
                            <TouchableOpacity
                              key={s.value}
                              onPress={() => setMemberForm((p) => ({ ...p, currentStandard: s.value }))}
                              style={[styles.gotraChip, isActive && styles.gotraChipActive]}
                            >
                              <Text style={[styles.gotraChipText, isActive && styles.gotraChipTextActive]}>
                                {s.label}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </ScrollView>
                    <Input
                      label={locale === 'en' ? 'School Name' : 'स्कूल का नाम'}
                      placeholder={locale === 'en' ? 'e.g. Govt Sr Sec School' : 'उदा. राजकीय उच्च माध्यमिक विद्यालय'}
                      value={memberForm.schoolOrCollegeName || ''}
                      onChangeText={(v) => setMemberForm((p) => ({ ...p, schoolOrCollegeName: v }))}
                    />
                  </>
                ) : null}

                {memberForm.educationType === 'COLLEGE' || memberForm.educationType === 'GRADUATED' ? (
                  <>
                    <Input
                      label={locale === 'en' ? 'Degree / Course Name' : 'डिग्री / कोर्स का नाम'}
                      placeholder={locale === 'en' ? 'e.g. B.Tech / MBA / B.Sc' : 'उदा. B.Tech / MBA / B.Sc'}
                      value={memberForm.degree || ''}
                      onChangeText={(v) => setMemberForm((p) => ({ ...p, degree: v }))}
                    />
                    <Input
                      label={locale === 'en' ? 'College / University Name' : 'कॉलेज / विश्वविद्यालय का नाम'}
                      placeholder={locale === 'en' ? 'e.g. Rajasthan University' : 'उदा. राजस्थान विश्वविद्यालय'}
                      value={memberForm.schoolOrCollegeName || ''}
                      onChangeText={(v) => setMemberForm((p) => ({ ...p, schoolOrCollegeName: v }))}
                    />
                  </>
                ) : null}

                {memberForm.educationType === 'WORKING' ||
                memberForm.educationType === 'BUSINESS' ||
                memberForm.educationType === 'OTHER' ? (
                  <Input
                    label={locale === 'en' ? 'Occupation / Business description' : 'व्यवसाय / नौकरी का विवरण'}
                    placeholder={locale === 'en' ? 'e.g. Software Engineer / Furniture Shop Owners' : 'उदा. सॉफ्टवेयर इंजीनियर / फर्नीचर दुकान मालिक'}
                    value={memberForm.occupation || ''}
                    onChangeText={(v) => setMemberForm((p) => ({ ...p, occupation: v }))}
                  />
                ) : null}
              </ScrollView>

              <View style={styles.modalBottomActions}>
                <Button
                  title={locale === 'en' ? 'Cancel' : 'रद्द करें'}
                  onPress={() => setModalVisible(false)}
                  variant="secondary"
                  size="md"
                  style={{ flex: 1 }}
                />
                <Button
                  title={
                    createMemberMutation.isPending || updateMemberMutation.isPending
                      ? (locale === 'en' ? 'Saving...' : 'सहेज रहा है...')
                      : (locale === 'en' ? '✅ Save Details' : '✅ विवरण सहेजें')
                  }
                  onPress={handleSaveMember}
                  isLoading={createMemberMutation.isPending || updateMemberMutation.isPending}
                  variant="gold"
                  size="md"
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.cream[50],
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: COLORS.maroon[800],
    fontSize: 16,
    fontWeight: '600',
  },
  navigationHeader: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  navHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 18,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gold.light,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  headerContainer: {
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  headSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  headTextContainer: {
    flex: 1,
    gap: 4,
  },
  headTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.maroon[900],
    letterSpacing: 0.3,
  },
  fatherName: {
    fontSize: 13,
    color: COLORS.sandal[500],
    fontStyle: 'italic',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  gotraBadge: {
    backgroundColor: COLORS.cream[200],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gold[300],
  },
  gotraText: {
    fontSize: 11,
    color: COLORS.maroon[700],
    fontWeight: '600',
  },
  villageBadge: {
    backgroundColor: '#FFF0E6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  villageText: {
    fontSize: 11,
    color: COLORS.saffron[700],
    fontWeight: '500',
  },
  detailsCard: {
    backgroundColor: '#FEFDF8',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#3D0C11',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(212,160,23,0.1)',
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.maroon[900],
    marginBottom: 14,
    letterSpacing: 0.2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 6,
  },
  detailEmoji: {
    fontSize: 20,
  },
  detailTextWrapper: {
    flex: 1,
    gap: 2,
  },
  detailLabel: {
    fontSize: 11,
    color: COLORS.sandal[400],
    fontWeight: '500',
  },
  detailVal: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.maroon[800],
  },
  addressVal: {
    fontSize: 13,
    color: COLORS.sandal[600],
    lineHeight: 18,
  },
  callActionButton: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  callIconText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.success,
  },
  detailDivider: {
    height: 1.5,
    backgroundColor: COLORS.cream[100],
    marginVertical: 10,
  },
  adminActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  editBtn: {
    flex: 1,
    backgroundColor: COLORS.cream[100],
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gold[300],
  },
  editBtnText: {
    fontSize: 13,
    color: COLORS.maroon[700],
    fontWeight: '600',
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  deleteBtnText: {
    fontSize: 13,
    color: '#C62828',
    fontWeight: '600',
  },
  membersHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 8,
  },
  membersSectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.maroon[900],
  },
  addMemberBtn: {
    backgroundColor: COLORS.maroon[700],
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addMemberBtnText: {
    color: COLORS.gold.light,
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 32,
  },
  memberCardContainer: {
    paddingHorizontal: 16,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalKeyboardAvoiding: {
    width: '100%',
    maxHeight: '90%',
  },
  modalContainer: {
    backgroundColor: COLORS.cream[50],
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    flexShrink: 1,
  },
  modalGoldAccent: {
    height: 4,
    backgroundColor: COLORS.gold[500],
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cream[200],
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.maroon[900],
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalCloseBtnText: {
    fontSize: 18,
    color: COLORS.sandal[500],
    fontWeight: '700',
  },
  modalScroll: {
    padding: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.maroon[800],
    marginBottom: 8,
    marginTop: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 16,
    paddingBottom: 4,
  },
  gotraChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: COLORS.cream[100],
    borderWidth: 1,
    borderColor: COLORS.cream[300],
  },
  gotraChipActive: {
    backgroundColor: COLORS.maroon[700],
    borderColor: COLORS.maroon[700],
  },
  gotraChipText: {
    fontSize: 12,
    color: COLORS.sandal[600],
    fontWeight: '500',
  },
  gotraChipTextActive: {
    color: COLORS.gold.light,
    fontWeight: '700',
  },
  genderRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  genderChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.cream[100],
    borderWidth: 1,
    borderColor: COLORS.cream[300],
    alignItems: 'center',
  },
  genderChipActive: {
    backgroundColor: COLORS.saffron[50],
    borderColor: COLORS.saffron[500],
  },
  genderChipText: {
    fontSize: 13,
    color: COLORS.sandal[600],
    fontWeight: '500',
  },
  genderChipTextActive: {
    color: COLORS.saffron[700],
    fontWeight: '700',
  },
  modalBottomActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.cream[200],
  },
});
