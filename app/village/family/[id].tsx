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

  // Modal States
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [memberForm, setMemberForm] = useState<Partial<MemberFormData>>(emptyMemberForm);

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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchFamily(), refetchMembers()]);
    setRefreshing(false);
  }, [id, refetchFamily, refetchMembers]);

  const handleDeleteFamily = () => {
    Alert.alert(
      '🚨 Delete Family',
      `Are you sure you want to delete ${family?.headName}'s family and all associated members? This action is permanent.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteFamilyMutation.mutateAsync({
                familyId: id!,
                villageId: family?.villageId || '',
              });
              Alert.alert('Success', 'Family deleted successfully.');
              router.back();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete family.');
            }
          },
        },
      ]
    );
  };

  const handleDeleteMember = (memberId: string) => {
    const memberName = members?.find((m) => m.$id === memberId)?.name || 'this member';
    Alert.alert(
      'Delete Member',
      `Are you sure you want to delete ${memberName} from this family directory?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMemberMutation.mutateAsync({
                memberId,
                familyId: id!,
              });
              Alert.alert('Success', 'Member deleted successfully.');
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete member.');
            }
          },
        },
      ]
    );
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
    if (!memberForm.name?.trim()) return 'Name is required.';
    if (!memberForm.dateOfBirth?.trim()) return 'Date of Birth is required.';
    
    // Quick YYYY-MM-DD check
    const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dobRegex.test(memberForm.dateOfBirth)) {
      return 'Date of Birth must be in YYYY-MM-DD format.';
    }

    return null;
  };

  const handleSaveMember = async () => {
    const validationError = validateMemberForm();
    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }

    try {
      if (editingMember) {
        await updateMemberMutation.mutateAsync({
          id: editingMember.$id,
          data: memberForm,
        });
        Alert.alert('Success', 'Member updated successfully.');
      } else {
        await createMemberMutation.mutateAsync(memberForm as MemberFormData);
        Alert.alert('Success', 'Member added successfully.');
      }
      setModalVisible(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save member details.');
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
              <Text style={styles.fatherName}>S/o Shri {family.fatherName}</Text>
            )}
            <View style={styles.badgeRow}>
              <View style={styles.gotraBadge}>
                <Text style={styles.gotraText}>Gotra: {family.gotra}</Text>
              </View>
              <View style={styles.villageBadge}>
                <Text style={styles.villageText}>📍 {family.villageName}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Contact & Address Details Card */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardHeaderTitle}>Contact & Location</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailEmoji}>📱</Text>
            <View style={styles.detailTextWrapper}>
              <Text style={styles.detailLabel}>Primary Contact</Text>
              <Text style={styles.detailVal}>{formatMobile(family.mobile)}</Text>
            </View>
            <TouchableOpacity
              onPress={() => Linking.openURL(`tel:${family.mobile}`)}
              style={styles.callActionButton}
            >
              <Text style={styles.callIconText}>📞 Call</Text>
            </TouchableOpacity>
          </View>

          {family.altMobile ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailEmoji}>📞</Text>
              <View style={styles.detailTextWrapper}>
                <Text style={styles.detailLabel}>Alternate Contact</Text>
                <Text style={styles.detailVal}>{formatMobile(family.altMobile)}</Text>
              </View>
              <TouchableOpacity
                onPress={() => Linking.openURL(`tel:${family.altMobile}`)}
                style={styles.callActionButton}
              >
                <Text style={styles.callIconText}>📞 Call</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <View style={styles.detailDivider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailEmoji}>📍</Text>
            <View style={styles.detailTextWrapper}>
              <Text style={styles.detailLabel}>Address</Text>
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
              <Text style={styles.editBtnText}>✏️ Edit Family</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDeleteFamily} style={styles.deleteBtn}>
              <Text style={styles.deleteBtnText}>🗑️ Delete Family</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Members section header */}
        <View style={styles.membersHeaderRow}>
          <Text style={styles.membersSectionTitle}>Family Members</Text>
          {canManage && (
            <TouchableOpacity onPress={handleOpenAddModal} style={styles.addMemberBtn}>
              <Text style={styles.addMemberBtnText}>+ Add Member</Text>
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
        <Text style={styles.loadingText}>Loading family profile...</Text>
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
              <Text style={styles.backBtnText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.navHeaderTitle} numberOfLines={1}>
              {family?.headName}'s Family
            </Text>
            <View style={{ width: 64 }} />
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
                title="No Members Registered"
                description="No additional family members are listed. Register other family members below."
                actionLabel={canManage ? 'Add First Member' : undefined}
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
                  {editingMember ? '✏️ Edit Member' : '👥 Add Family Member'}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
                  <Text style={styles.modalCloseBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">
                <Input
                  label="Full Name"
                  placeholder="e.g. Ramesh Suthar"
                  value={memberForm.name || ''}
                  onChangeText={(v) => setMemberForm((p) => ({ ...p, name: v }))}
                  required
                />

                {/* Relation picker */}
                <Text style={styles.fieldLabel}>Relation with Head</Text>
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
                            {RELATION_LABELS[rel]}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>

                {/* Gender selector */}
                <Text style={styles.fieldLabel}>Gender</Text>
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
                          {g === 'MALE' ? '👨 Male' : g === 'FEMALE' ? '👩 Female' : '🧑 Other'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Input
                  label="Date of Birth"
                  placeholder="YYYY-MM-DD (e.g. 1996-12-05)"
                  value={memberForm.dateOfBirth || ''}
                  onChangeText={(v) => setMemberForm((p) => ({ ...p, dateOfBirth: v }))}
                  keyboardType="numeric"
                  required
                />

                <Input
                  label="Mobile Number (Optional)"
                  placeholder="10-digit number"
                  value={memberForm.mobile || ''}
                  onChangeText={(v) => setMemberForm((p) => ({ ...p, mobile: v }))}
                  keyboardType="phone-pad"
                  maxLength={10}
                />

                {/* Education type selector */}
                <Text style={styles.fieldLabel}>Education / Occupation Status</Text>
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
                            {EDUCATION_TYPES[edu as EducationType]}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>

                {/* Conditional Fields based on Education type */}
                {memberForm.educationType === 'SCHOOL' ? (
                  <>
                    <Text style={styles.fieldLabel}>Current Standard / Class</Text>
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
                      label="School Name"
                      placeholder="e.g. Govt Sr Sec School"
                      value={memberForm.schoolOrCollegeName || ''}
                      onChangeText={(v) => setMemberForm((p) => ({ ...p, schoolOrCollegeName: v }))}
                    />
                  </>
                ) : null}

                {memberForm.educationType === 'COLLEGE' || memberForm.educationType === 'GRADUATED' ? (
                  <>
                    <Input
                      label="Degree / Course Name"
                      placeholder="e.g. B.Tech / MBA / B.Sc"
                      value={memberForm.degree || ''}
                      onChangeText={(v) => setMemberForm((p) => ({ ...p, degree: v }))}
                    />
                    <Input
                      label="College / University Name"
                      placeholder="e.g. Rajasthan University"
                      value={memberForm.schoolOrCollegeName || ''}
                      onChangeText={(v) => setMemberForm((p) => ({ ...p, schoolOrCollegeName: v }))}
                    />
                  </>
                ) : null}

                {memberForm.educationType === 'WORKING' ||
                memberForm.educationType === 'BUSINESS' ||
                memberForm.educationType === 'OTHER' ? (
                  <Input
                    label="Occupation / Business description"
                    placeholder="e.g. Software Engineer / Furniture Shop Owners"
                    value={memberForm.occupation || ''}
                    onChangeText={(v) => setMemberForm((p) => ({ ...p, occupation: v }))}
                  />
                ) : null}
              </ScrollView>

              <View style={styles.modalBottomActions}>
                <Button
                  title="Cancel"
                  onPress={() => setModalVisible(false)}
                  variant="secondary"
                  size="md"
                  style={{ flex: 1 }}
                />
                <Button
                  title={
                    createMemberMutation.isPending || updateMemberMutation.isPending
                      ? 'Saving...'
                      : '✅ Save Details'
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
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  backBtnText: {
    color: COLORS.gold.light,
    fontSize: 13,
    fontWeight: '600',
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
