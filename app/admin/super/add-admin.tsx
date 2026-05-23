import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVillages } from '@hooks/useQueries';
import { authService } from '@services/auth.service';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';
import { COLORS } from '@constants/colors';
import type { UserRole } from '@types/index';

export default function AddAdminScreen() {
  const { adminId, editMode } = useLocalSearchParams<{ adminId?: string; editMode?: string }>();
  const isEdit = editMode === 'true';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [role] = useState<UserRole>('VILLAGE_ADMIN');
  const [selectedVillageId, setSelectedVillageId] = useState('');
  const [selectedVillageName, setSelectedVillageName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { data: villagesData } = useVillages();
  const villages = villagesData?.villages ?? [];

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Missing Info', 'Name is required.'); return; }
    if (!email.trim()) { Alert.alert('Missing Info', 'Email is required.'); return; }
    if (!mobile.trim() || mobile.length < 10) { Alert.alert('Missing Info', 'Valid mobile number required.'); return; }
    if (!isEdit && !password.trim()) { Alert.alert('Missing Info', 'Password is required.'); return; }
    if (!selectedVillageId) { Alert.alert('Missing Info', 'Please assign a village to this admin.'); return; }

    setIsSaving(true);
    try {
      if (isEdit && adminId) {
        await authService.updateAdmin(adminId, {
          name,
          mobile,
          assignedVillageId: selectedVillageId,
          assignedVillageName: selectedVillageName,
        });
        Alert.alert('✅ Admin Updated!', `${name}'s details have been updated.`, [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        await authService.createAdmin({
          name,
          email,
          mobile,
          password,
          role: 'VILLAGE_ADMIN',
          assignedVillageId: selectedVillageId,
          assignedVillageName: selectedVillageName,
        });
        Alert.alert('✅ Admin Created!', `${name} has been added as Village Admin for ${selectedVillageName}.`, [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save admin.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.cream[50] }}>
      <LinearGradient colors={['#3D0C11', '#6B1414']} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕ Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {isEdit ? 'Edit Admin' : 'Add Village Admin'}
            </Text>
            <View style={{ width: 70 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">

          {/* Info banner */}
          <View style={styles.infoBanner}>
            <Text style={{ fontSize: 18 }}>👮</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>Village Admin Account</Text>
              <Text style={styles.infoSub}>This admin can manage families and members of their assigned village only.</Text>
            </View>
          </View>

          <Input label="Full Name" placeholder="Admin's full name" value={name} onChangeText={setName} required />
          <Input label="Email Address" placeholder="admin@example.com" value={email} onChangeText={setEmail}
            keyboardType="email-address" autoCapitalize="none" required />
          <Input label="Mobile Number" placeholder="10-digit mobile" value={mobile} onChangeText={setMobile}
            keyboardType="phone-pad" maxLength={10} required />

          {!isEdit && (
            <Input
              label="Password"
              placeholder="Set login password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              required
              rightIcon={<Text style={{ fontSize: 16 }}>{showPassword ? '🙈' : '👁️'}</Text>}
              onRightIconPress={() => setShowPassword((p) => !p)}
              hint="Minimum 8 characters recommended"
            />
          )}

          {/* Village Assignment */}
          <Text style={styles.sectionLabel}>Assign Village <Text style={{ color: COLORS.saffron[500] }}>*</Text></Text>
          <Text style={styles.sectionHint}>Select the village this admin will manage</Text>

          <View style={styles.villageGrid}>
            {villages.map((v) => (
              <TouchableOpacity
                key={v.$id}
                onPress={() => { setSelectedVillageId(v.$id); setSelectedVillageName(v.name); }}
                style={[styles.villageChip, selectedVillageId === v.$id && styles.villageChipActive]}
              >
                <Text style={styles.villageChipEmoji}>🏘️</Text>
                <Text style={[styles.villageChipText, selectedVillageId === v.$id && styles.villageChipTextActive]}
                  numberOfLines={1}>
                  {v.name}
                </Text>
                {selectedVillageId === v.$id && <Text style={{ color: COLORS.gold[300], fontSize: 12 }}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>

          {villages.length === 0 && (
            <View style={styles.noVillageNote}>
              <Text style={styles.noVillageText}>⚠️ No villages exist yet. Add a village first before creating a village admin.</Text>
            </View>
          )}

          {/* Role badge */}
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>🔑 Role: Village Admin</Text>
            <Text style={styles.roleBadgeSub}>Can add/edit/delete families and members in assigned village only</Text>
          </View>
        </ScrollView>

        <View style={styles.bottomBar}>
          <Button
            title={isSaving ? 'Saving...' : isEdit ? '✅ Update Admin' : '✅ Create Admin'}
            onPress={handleSave}
            isLoading={isSaving}
            fullWidth
            size="lg"
            disabled={villages.length === 0}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingBottom: 16 },
  headerRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingTop: 12,
  },
  closeBtn: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  closeBtnText: { color: COLORS.gold.light, fontSize: 13, fontWeight: '600' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#FEFDF8' },
  form: { padding: 16, paddingBottom: 32 },
  infoBanner: {
    flexDirection: 'row', gap: 12, alignItems: 'flex-start',
    backgroundColor: '#FFF8E1', borderRadius: 14, padding: 14,
    marginBottom: 20, borderLeftWidth: 3, borderLeftColor: COLORS.gold[500],
  },
  infoTitle: { fontSize: 14, fontWeight: '700', color: COLORS.maroon[800] },
  infoSub: { fontSize: 12, color: COLORS.sandal[500], marginTop: 2, lineHeight: 18 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: COLORS.maroon[800], marginBottom: 4 },
  sectionHint: { fontSize: 12, color: COLORS.sandal[400], marginBottom: 12 },
  villageGrid: { gap: 8, marginBottom: 16 },
  villageChip: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1.5, borderColor: COLORS.cream[300],
    borderRadius: 14, padding: 12, backgroundColor: '#FEFDF8',
  },
  villageChipActive: { borderColor: COLORS.maroon[700], backgroundColor: COLORS.maroon[900] },
  villageChipEmoji: { fontSize: 18 },
  villageChipText: { flex: 1, fontSize: 14, color: COLORS.sandal[500], fontWeight: '500' },
  villageChipTextActive: { color: COLORS.gold.light, fontWeight: '700' },
  noVillageNote: {
    backgroundColor: '#FFF3E0', borderRadius: 12, padding: 14, marginBottom: 16,
    borderLeftWidth: 3, borderLeftColor: COLORS.saffron[500],
  },
  noVillageText: { color: '#E65100', fontSize: 13 },
  roleBadge: {
    backgroundColor: COLORS.cream[100], borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: COLORS.gold[300], marginBottom: 8,
  },
  roleBadgeText: { fontSize: 14, fontWeight: '700', color: COLORS.maroon[800] },
  roleBadgeSub: { fontSize: 12, color: COLORS.sandal[400], marginTop: 4 },
  bottomBar: {
    padding: 16, paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    backgroundColor: '#FEFDF8', borderTopWidth: 1, borderTopColor: COLORS.cream[200],
  },
});
