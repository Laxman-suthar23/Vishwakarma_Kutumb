import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore, useIsSuperAdmin } from '@store/auth.store';
import { Avatar } from '@components/ui/Avatar';
import { Card } from '@components/ui/Card';
import { COLORS } from '@constants/colors';
import i18n from '@services/i18n.service';
import { useLanguageStore } from '@store/language.store';
import { useConfirm } from '@store/confirm.store';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const isSuperAdmin = useIsSuperAdmin();
  const locale = useLanguageStore((s) => s.locale); // dynamic listener
  const { setLocale } = useLanguageStore(); // language toggle action

  const { confirm } = useConfirm();

  const handleLogout = () => {
    confirm({
      title: locale === 'en' ? '🚪 Sign Out' : '🚪 लॉग आउट',
      message: locale === 'en' 
        ? 'Are you sure you want to sign out of Vishwakarma Kutumb?' 
        : 'क्या आप वाकई विश्वकर्मा कुटुंब से लॉग आउट करना चाहते हैं?',
      confirmText: locale === 'en' ? 'Sign Out' : 'लॉग आउट',
      cancelText: locale === 'en' ? 'Cancel' : 'रद्द करें',
      isDestructive: true,
      onConfirm: async () => {
        await logout();
        router.replace('/(tabs)');
      },
    });
  };

  const LanguageSelectorCard = () => (
    <Card variant="bordered">
      <Text style={styles.sectionTitle}>🌐 {locale === 'en' ? 'Language / भाषा' : 'भाषा / Language'}</Text>
      <View style={styles.langSelectorRow}>
        <TouchableOpacity
          style={[
            styles.langButton,
            locale === 'en' && styles.langButtonActive
          ]}
          onPress={() => setLocale('en')}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.langButtonText,
            locale === 'en' && styles.langButtonTextActive
          ]}>🇬🇧 English</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.langButton,
            locale === 'hi' && styles.langButtonActive
          ]}
          onPress={() => setLocale('hi')}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.langButtonText,
            locale === 'hi' && styles.langButtonTextActive
          ]}>🇮🇳 हिंदी</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.cream[50] }}>
        <LinearGradient colors={['#3D0C11', '#6B1414']} style={styles.headerGrad}>
          <SafeAreaView edges={['top']}>
            <View style={styles.headerContent}>
              <Avatar name="Guest User" size="xl" isHead />
              <Text style={styles.userName}>
                {locale === 'en' ? 'Guest User' : 'अतिथि दर्शक'}
              </Text>
              <Text style={styles.userEmail}>
                {locale === 'en' ? 'Public Directory Access' : 'सार्वजनिक निर्देशिका पहुँच'}
              </Text>
              <View style={styles.rolePill}>
                <Text style={styles.roleText}>
                  {locale === 'en' ? '👤 Public Viewer' : '👤 अतिथि दर्शन'}
                </Text>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Language Selection Card */}
          <LanguageSelectorCard />

          {/* Administrator Login card */}
          <Card variant="elevated">
            <Text style={styles.sectionTitle}>
              {locale === 'en' ? '⚙️ Administrator Access' : '⚙️ एडमिनिस्ट्रेटर लॉगिन'}
            </Text>
            <Text style={{ fontSize: 13, color: COLORS.sandal[600], lineHeight: 18, marginBottom: 12 }}>
              {locale === 'en' 
                ? 'Are you a Village or Super Admin? Log in with your admin account to register new families, update members, and manage your village directory.'
                : 'क्या आप गाँव या सुपर एडमिन हैं? नए परिवारों को पंजीकृत करने, सदस्यों को अपडेट करने और अपने गाँव की निर्देशिका को प्रबंधित करने के लिए अपने एडमिन खाते से लॉग इन करें।'
              }
            </Text>
            
            <TouchableOpacity
              onPress={() => router.push('/auth/login')}
              style={{ borderRadius: 12, overflow: 'hidden' }}
            >
              <LinearGradient
                colors={['#D4A017', '#9A6E00']}
                style={{ paddingVertical: 14, alignItems: 'center' }}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14, letterSpacing: 0.3 }}>
                  {locale === 'en' ? '🔑 Admin Log In' : '🔑 एडमिन लॉग इन'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Card>

          {/* App Info */}
          <Card variant="bordered">
            <Text style={styles.sectionTitle}>
              {locale === 'en' ? 'ℹ️ About Directory' : 'ℹ️ निर्देशिका के बारे में'}
            </Text>
            <InfoRow label={locale === 'en' ? "App Name" : "ऐप का नाम"} value="Vishwakarma Kutumb" />
            <InfoRow label={locale === 'en' ? "Version" : "संस्करण"} value="1.0.0" />
            <InfoRow label={locale === 'en' ? "Purpose" : "उद्देश्य"} value={locale === 'en' ? "Village Family Heritage Directory" : "ग्रामीण पारिवारिक विरासत निर्देशिका"} />
          </Card>

          {/* Footer ornament */}
          <View style={styles.footerOrnament}>
            <View style={styles.ornLine} />
            <Text style={styles.ornDot}>❋</Text>
            <View style={styles.ornLine} />
          </View>
          <Text style={styles.footer}>विश्वकर्मा कुटुंब · Vishwakarma Kutumb</Text>
          <View style={{ height: 8 }} />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.cream[50] }}>
      <LinearGradient colors={['#3D0C11', '#6B1414']} style={styles.headerGrad}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <Avatar name={user.name} size="xl" isHead />
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <View style={styles.rolePill}>
              <Text style={styles.roleText}>
                {isSuperAdmin 
                  ? (locale === 'en' ? '👑 Super Admin' : '👑 सुपर एडमिन') 
                  : (locale === 'en' ? '🏘️ Village Admin' : '🏘️ गाँव एडमिन')
                }
              </Text>
            </View>
            {!isSuperAdmin && user.assignedVillageName && (
              <Text style={styles.villageName}>📍 {user.assignedVillageName}</Text>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Language Selection Card */}
        <LanguageSelectorCard />

        {/* Admin Dashboard Links */}
        <Card variant="elevated">
          <Text style={styles.sectionTitle}>
            {locale === 'en' ? '⚙️ Administration' : '⚙️ प्रशासनिक टूल्स'}
          </Text>
          {isSuperAdmin ? (
            <>
              <MenuRow
                emoji="👑"
                label={locale === 'en' ? "Super Admin Dashboard" : "सुपर एडमिन डैशबोर्ड"}
                onPress={() => router.push('/admin/super')}
              />
              <MenuRow
                emoji="🏘️"
                label={locale === 'en' ? "Manage Villages" : "गाँव प्रबंधन"}
                onPress={() => router.push('/admin/super')}
              />
              <MenuRow
                emoji="👮"
                label={locale === 'en' ? "Manage Admins" : "एडमिन प्रबंधन"}
                onPress={() => router.push('/admin/super')}
              />
            </>
          ) : (
            <>
              <MenuRow
                emoji="📋"
                label={locale === 'en' ? "Village Dashboard" : "गाँव डैशबोर्ड"}
                onPress={() => router.push('/admin/village')}
              />
              <MenuRow
                emoji="🏠"
                label={locale === 'en' ? "Manage Families" : "परिवार प्रबंधन"}
                onPress={() => router.push('/admin/village')}
              />
              <MenuRow
                emoji="➕"
                label={locale === 'en' ? "Add New Family" : "नया परिवार जोड़ें"}
                onPress={() => router.push('/village/family/add')}
              />
            </>
          )}
        </Card>

        {/* Account Info */}
        <Card variant="bordered">
          <Text style={styles.sectionTitle}>
            {locale === 'en' ? '👤 Account Details' : '👤 खाता विवरण'}
          </Text>
          <InfoRow label={locale === 'en' ? "Full Name" : "पूरा नाम"} value={user.name} />
          <InfoRow label={locale === 'en' ? "Email" : "ईमेल"} value={user.email} />
          {user.mobile && <InfoRow label={locale === 'en' ? "Mobile" : "मोबाइल"} value={user.mobile} />}
          <InfoRow 
            label={locale === 'en' ? "Role" : "भूमिका"} 
            value={isSuperAdmin 
              ? (locale === 'en' ? 'Super Admin' : 'सुपर एडमिन') 
              : (locale === 'en' ? 'Village Admin' : 'गाँव एडमिन')
            } 
          />
          {!isSuperAdmin && user.assignedVillageName && (
            <InfoRow label={locale === 'en' ? "Assigned Village" : "सौंपा गया गाँव"} value={user.assignedVillageName} />
          )}
        </Card>

        {/* App Info */}
        <Card variant="bordered">
          <Text style={styles.sectionTitle}>
            {locale === 'en' ? 'ℹ️ About' : 'ℹ️ ऐप के बारे में'}
          </Text>
          <InfoRow label={locale === 'en' ? "App Name" : "ऐप का नाम"} value="Vishwakarma Kutumb" />
          <InfoRow label={locale === 'en' ? "Version" : "संस्करण"} value="1.0.0" />
          <InfoRow label={locale === 'en' ? "Purpose" : "उद्देश्य"} value={locale === 'en' ? "Village Family Heritage Directory" : "ग्रामीण पारिवारिक विरासत निर्देशिका"} />
        </Card>

        {/* Logout */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <LinearGradient
            colors={['#C62828', '#B71C1C']}
            style={styles.logoutGrad}
          >
            <Text style={styles.logoutText}>
              {locale === 'en' ? '🚪 Sign Out' : '🚪 लॉग आउट'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Footer ornament */}
        <View style={styles.footerOrnament}>
          <View style={styles.ornLine} />
          <Text style={styles.ornDot}>❋</Text>
          <View style={styles.ornLine} />
        </View>
        <Text style={styles.footer}>विश्वकर्मा कुटुंब · Vishwakarma Kutumb</Text>
        <View style={{ height: 8 }} />
      </ScrollView>
    </View>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const MenuRow = ({
  emoji,
  label,
  onPress,
}: {
  emoji: string;
  label: string;
  onPress: () => void;
}) => (
  <TouchableOpacity onPress={onPress} style={styles.menuRow} activeOpacity={0.7}>
    <Text style={styles.menuEmoji}>{emoji}</Text>
    <Text style={styles.menuLabel}>{label}</Text>
    <Text style={styles.menuArrow}>›</Text>
  </TouchableOpacity>
);

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  headerGrad: {
    paddingBottom: 24,
  },
  headerContent: {
    alignItems: 'center',
    paddingTop: 16,
    gap: 6,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FEFDF8',
    letterSpacing: 0.3,
    marginTop: 8,
  },
  userEmail: {
    fontSize: 13,
    color: 'rgba(245,208,110,0.7)',
  },
  rolePill: {
    backgroundColor: 'rgba(212,160,23,0.2)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(212,160,23,0.4)',
    marginTop: 4,
  },
  roleText: {
    color: COLORS.gold[300],
    fontSize: 13,
    fontWeight: '600',
  },
  villageName: {
    color: 'rgba(245,208,110,0.6)',
    fontSize: 12,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.maroon[800],
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cream[200],
    gap: 12,
  },
  menuEmoji: {
    fontSize: 20,
    width: 28,
    textAlign: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: COLORS.maroon[800],
    fontWeight: '500',
  },
  menuArrow: {
    fontSize: 22,
    color: COLORS.gold[500],
    fontWeight: '300',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cream[200],
  },
  infoLabel: {
    fontSize: 13,
    color: COLORS.sandal[500],
    flex: 1,
  },
  infoValue: {
    fontSize: 13,
    color: COLORS.maroon[800],
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  logoutBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 4,
  },
  logoutGrad: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  langSelectorRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
    marginBottom: 6,
  },
  langButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cream[300],
    backgroundColor: '#FEFDF8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3D0C11',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  langButtonActive: {
    borderColor: COLORS.gold[400],
    backgroundColor: COLORS.maroon[700],
  },
  langButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.maroon[900],
  },
  langButtonTextActive: {
    color: '#FEFDF8',
    fontWeight: '700',
  },
  footerOrnament: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  ornLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.cream[300],
  },
  ornDot: {
    color: COLORS.gold[400],
    fontSize: 14,
    marginHorizontal: 10,
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.sandal[400],
    letterSpacing: 1,
  },
});
