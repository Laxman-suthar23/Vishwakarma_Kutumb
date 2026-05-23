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
import { useLanguageStore } from '@store/language.store';
import { useToast } from '@store/toast.store';
import { Ionicons } from '@expo/vector-icons';

export default function AddAdminScreen() {
  const { adminId, editMode } = useLocalSearchParams<{ adminId?: string; editMode?: string }>();
  const isEdit = editMode === 'true';
  const locale = useLanguageStore((s) => s.locale); // dynamic language listener
  const { showToast } = useToast();

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
    if (!name.trim()) { 
      showToast({
        type: 'warning',
        title: locale === 'en' ? 'Missing Info' : 'अपूर्ण जानकारी',
        message: locale === 'en' ? 'Name is required.' : 'नाम आवश्यक है।',
      });
      return; 
    }
    if (!email.trim()) { 
      showToast({
        type: 'warning',
        title: locale === 'en' ? 'Missing Info' : 'अपूर्ण जानकारी',
        message: locale === 'en' ? 'Email is required.' : 'ईमेल आवश्यक है।',
      });
      return; 
    }
    if (!mobile.trim() || mobile.length < 10) { 
      showToast({
        type: 'warning',
        title: locale === 'en' ? 'Missing Info' : 'अपूर्ण जानकारी',
        message: locale === 'en' ? 'Valid mobile number required.' : 'वैध मोबाइल नंबर आवश्यक है।',
      });
      return; 
    }
    if (!isEdit && !password.trim()) { 
      showToast({
        type: 'warning',
        title: locale === 'en' ? 'Missing Info' : 'अपूर्ण जानकारी',
        message: locale === 'en' ? 'Password is required.' : 'पासवर्ड आवश्यक है।',
      });
      return; 
    }
    if (!selectedVillageId) { 
      showToast({
        type: 'warning',
        title: locale === 'en' ? 'Missing Info' : 'अपूर्ण जानकारी',
        message: locale === 'en' ? 'Please assign a village to this admin.' : 'कृपया इस एडमिन को एक गाँव आवंटित करें।',
      });
      return; 
    }

    setIsSaving(true);
    try {
      if (isEdit && adminId) {
        await authService.updateAdmin(adminId, {
          name,
          mobile,
          assignedVillageId: selectedVillageId,
          assignedVillageName: selectedVillageName,
        });
        showToast({
          type: 'success',
          title: locale === 'en' ? 'Admin Updated' : 'एडमिन अपडेट हो गया',
          message: locale === 'en' ? `${name}'s details have been updated.` : `${name} का विवरण अपडेट कर दिया गया है।`,
        });
        router.back();
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
        showToast({
          type: 'success',
          title: locale === 'en' ? 'Admin Created' : 'एडमिन बन गया',
          message: locale === 'en' 
            ? `${name} has been added as Village Admin for ${selectedVillageName}.` 
            : `${name} को ${selectedVillageName} के लिए गाँव एडमिन के रूप में जोड़ दिया गया है।`,
        });
        router.back();
      }
    } catch (err: any) {
      showToast({
        type: 'error',
        title: locale === 'en' ? 'Error' : 'त्रुटि',
        message: err.message || (locale === 'en' ? 'Failed to save admin.' : 'एडमिन सहेजने में विफल।'),
      });
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
              <Ionicons name="close" size={20} color={COLORS.gold.light} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {isEdit 
                ? (locale === 'en' ? 'Edit Admin' : 'एडमिन संपादित करें') 
                : (locale === 'en' ? 'Add Village Admin' : 'गाँव एडमिन जोड़ें')
              }
            </Text>
            <View style={{ width: 36 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">

          {/* Info banner */}
          <View style={styles.infoBanner}>
            <Text style={{ fontSize: 18 }}>👮</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>
                {locale === 'en' ? 'Village Admin Account' : 'गाँव एडमिन खाता'}
              </Text>
              <Text style={styles.infoSub}>
                {locale === 'en' 
                  ? 'This admin can manage families and members of their assigned village only.' 
                  : 'यह एडमिन केवल अपने आवंटित गाँव के परिवारों और सदस्यों का प्रबंधन कर सकता है।'
                }
              </Text>
            </View>
          </View>

          <Input 
            label={locale === 'en' ? 'Full Name' : 'पूरा नाम'} 
            placeholder={locale === 'en' ? "Admin's full name" : 'एडमिन का पूरा नाम'} 
            value={name} 
            onChangeText={setName} 
            required 
          />
          <Input 
            label={locale === 'en' ? 'Email Address' : 'ईमेल पता'} 
            placeholder="admin@example.com" 
            value={email} 
            onChangeText={setEmail}
            keyboardType="email-address" 
            autoCapitalize="none" 
            required 
          />
          <Input 
            label={locale === 'en' ? 'Mobile Number' : 'मोबाइल नंबर'} 
            placeholder={locale === 'en' ? '10-digit mobile' : '10-अंकीय मोबाइल'} 
            value={mobile} 
            onChangeText={setMobile}
            keyboardType="phone-pad" 
            maxLength={10} 
            required 
          />

          {!isEdit && (
            <Input
              label={locale === 'en' ? 'Password' : 'पासवर्ड'}
              placeholder={locale === 'en' ? 'Set login password' : 'लॉगिन पासवर्ड सेट करें'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              required
              rightIcon={<Text style={{ fontSize: 16 }}>{showPassword ? '🙈' : '👁️'}</Text>}
              onRightIconPress={() => setShowPassword((p) => !p)}
              hint={locale === 'en' ? 'Minimum 8 characters recommended' : 'कम से कम 8 अक्षर अनुशंसित हैं'}
            />
          )}

          {/* Village Assignment */}
          <Text style={styles.sectionLabel}>
            {locale === 'en' ? 'Assign Village' : 'गाँव आवंटित करें'} <Text style={{ color: COLORS.saffron[500] }}>*</Text>
          </Text>
          <Text style={styles.sectionHint}>
            {locale === 'en' ? 'Select the village this admin will manage' : 'वह गाँव चुनें जिसका यह एडमिन प्रबंधन करेगा'}
          </Text>

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
              <Text style={styles.noVillageText}>
                {locale === 'en' 
                  ? '⚠️ No villages exist yet. Add a village first before creating a village admin.' 
                  : '⚠️ अभी कोई गाँव मौजूद नहीं है। गाँव एडमिन बनाने से पहले एक गाँव जोड़ें।'
                }
              </Text>
            </View>
          )}

          {/* Role badge */}
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>
              {locale === 'en' ? '🔑 Role: Village Admin' : '🔑 भूमिका: गाँव एडमिन'}
            </Text>
            <Text style={styles.roleBadgeSub}>
              {locale === 'en' 
                ? 'Can add/edit/delete families and members in assigned village only' 
                : 'केवल आवंटित गाँव में परिवारों और सदस्यों को जोड़/संपादित/हटा सकते हैं'
              }
            </Text>
          </View>
        </ScrollView>

        <View style={styles.bottomBar}>
          <Button
            title={
              isSaving 
                ? (locale === 'en' ? 'Saving...' : 'सहेज रहा है...') 
                : isEdit 
                  ? (locale === 'en' ? '✅ Update Admin' : '✅ एडमिन अपडेट करें') 
                  : (locale === 'en' ? '✅ Create Admin' : '✅ एडमिन बनाएं')
            }
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
  closeBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 18,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
