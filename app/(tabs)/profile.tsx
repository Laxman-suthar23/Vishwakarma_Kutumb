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

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const isSuperAdmin = useIsSuperAdmin();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of Gram Parivar?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.cream[50] }}>
        <LinearGradient colors={['#3D0C11', '#6B1414']} style={styles.headerGrad}>
          <SafeAreaView edges={['top']}>
            <View style={styles.headerContent}>
              <Avatar name="Guest User" size="xl" isHead />
              <Text style={styles.userName}>Guest User</Text>
              <Text style={styles.userEmail}>Public Directory Access</Text>
              <View style={styles.rolePill}>
                <Text style={styles.roleText}>👤 Public Viewer</Text>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Administrator Login card */}
          <Card variant="elevated">
            <Text style={styles.sectionTitle}>⚙️ Administrator Access</Text>
            <Text style={{ fontSize: 13, color: COLORS.sandal[600], lineHeight: 18, marginBottom: 12 }}>
              Are you a Village or Super Admin? Log in with your admin account to register new families, update members, and manage your village directory.
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
                  🔑 Admin Log In
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Card>

          {/* App Info */}
          <Card variant="bordered">
            <Text style={styles.sectionTitle}>ℹ️ About Directory</Text>
            <InfoRow label="App Name" value="Gram Parivar" />
            <InfoRow label="Version" value="1.0.0" />
            <InfoRow label="Purpose" value="Village Family Heritage Directory" />
          </Card>

          {/* Footer ornament */}
          <View style={styles.footerOrnament}>
            <View style={styles.ornLine} />
            <Text style={styles.ornDot}>❋</Text>
            <View style={styles.ornLine} />
          </View>
          <Text style={styles.footer}>ग्राम परिवार · Gram Parivar</Text>
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
                {isSuperAdmin ? '👑 Super Admin' : '🏘️ Village Admin'}
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
        {/* Admin Dashboard Links */}
        <Card variant="elevated">
          <Text style={styles.sectionTitle}>⚙️ Administration</Text>
          {isSuperAdmin ? (
            <>
              <MenuRow
                emoji="👑"
                label="Super Admin Dashboard"
                onPress={() => router.push('/admin/super')}
              />
              <MenuRow
                emoji="🏘️"
                label="Manage Villages"
                onPress={() => router.push('/admin/super')}
              />
              <MenuRow
                emoji="👮"
                label="Manage Admins"
                onPress={() => router.push('/admin/super')}
              />
            </>
          ) : (
            <>
              <MenuRow
                emoji="📋"
                label="Village Dashboard"
                onPress={() => router.push('/admin/village')}
              />
              <MenuRow
                emoji="🏠"
                label="Manage Families"
                onPress={() => router.push('/admin/village')}
              />
              <MenuRow
                emoji="➕"
                label="Add New Family"
                onPress={() => router.push('/village/family/add')}
              />
            </>
          )}
        </Card>

        {/* Account Info */}
        <Card variant="bordered">
          <Text style={styles.sectionTitle}>👤 Account Details</Text>
          <InfoRow label="Full Name" value={user.name} />
          <InfoRow label="Email" value={user.email} />
          {user.mobile && <InfoRow label="Mobile" value={user.mobile} />}
          <InfoRow label="Role" value={isSuperAdmin ? 'Super Admin' : 'Village Admin'} />
          {!isSuperAdmin && user.assignedVillageName && (
            <InfoRow label="Assigned Village" value={user.assignedVillageName} />
          )}
        </Card>

        {/* App Info */}
        <Card variant="bordered">
          <Text style={styles.sectionTitle}>ℹ️ About</Text>
          <InfoRow label="App Name" value="Gram Parivar" />
          <InfoRow label="Version" value="1.0.0" />
          <InfoRow label="Purpose" value="Village Family Heritage Directory" />
        </Card>

        {/* Logout */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <LinearGradient
            colors={['#C62828', '#B71C1C']}
            style={styles.logoutGrad}
          >
            <Text style={styles.logoutText}>🚪 Sign Out</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Footer ornament */}
        <View style={styles.footerOrnament}>
          <View style={styles.ornLine} />
          <Text style={styles.ornDot}>❋</Text>
          <View style={styles.ornLine} />
        </View>
        <Text style={styles.footer}>ग्राम परिवार · Gram Parivar</Text>
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
