import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { useAuthStore } from '@store/auth.store';
import { authService } from '@services/auth.service';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { COLORS } from '@constants/colors';

export default function LoginScreen() {
  const { login, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Animations
  const cardOpacity = useSharedValue(0);
  const cardTranslate = useSharedValue(40);

  useEffect(() => {
    cardOpacity.value = withDelay(200, withTiming(1, { duration: 700 }));
    cardTranslate.value = withDelay(200, withTiming(0, { duration: 700 }));
  }, []);

  const cardAnimStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardTranslate.value }],
  }));

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }

    try {
      await login({ email: email.trim(), password });
      router.replace('/(tabs)');
    } catch (err: any) {
      // Auto-heal active session conflicts by clearing the session and retrying
      if (
        err.message?.includes('prohibited') ||
        err.message?.includes('session is active') ||
        err.message?.includes('active session')
      ) {
        try {
          await authService.logout();
          await login({ email: email.trim(), password });
          router.replace('/(tabs)');
          return;
        } catch (retryErr: any) {
          Alert.alert('Login Failed', retryErr.message || 'Invalid credentials. Please try again.');
          return;
        }
      }
      Alert.alert('Login Failed', err.message || 'Invalid credentials. Please try again.');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Full screen gradient background */}
      <LinearGradient
        colors={['#1A0505', '#3D0C11', '#6B1414']}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative top pattern */}
      <View style={styles.topPattern}>
        <Text style={styles.patternText}>卐 ॐ 卐 ॐ 卐 ॐ 卐 ॐ 卐 ॐ 卐</Text>
      </View>

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Logo section */}
            <View style={styles.header}>
              <View style={styles.logoCircle}>
                <LinearGradient
                  colors={['#D4A017', '#9A6E00']}
                  style={styles.logoGrad}
                >
                  <Text style={{ fontSize: 36 }}>🏛️</Text>
                </LinearGradient>
              </View>
              <Text style={styles.appName}>ग्राम परिवार</Text>
              <Text style={styles.appSub}>Gram Parivar</Text>
            </View>

            {/* Login Card */}
            <Animated.View style={[styles.card, cardAnimStyle]}>
              {/* Card decorative top border */}
              <LinearGradient
                colors={['#D4A017', '#B8860B', '#9A6E00']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.cardTopBorder}
              />

              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Welcome Back</Text>
                <Text style={styles.cardSubtitle}>Sign in to manage your village directory</Text>

                {/* Ornament */}
                <View style={styles.ornament}>
                  <View style={styles.ornamentLine} />
                  <Text style={styles.ornamentDot}>◆</Text>
                  <View style={styles.ornamentLine} />
                </View>

                {/* Form */}
                <Input
                  label="Email Address"
                  placeholder="admin@gramparivar.com"
                  value={email}
                  onChangeText={(t) => { setEmail(t); clearError(); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  required
                />

                <Input
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={(t) => { setPassword(t); clearError(); }}
                  secureTextEntry={!showPassword}
                  required
                  rightIcon={
                    <Text style={{ fontSize: 16 }}>{showPassword ? '🙈' : '👁️'}</Text>
                  }
                  onRightIconPress={() => setShowPassword((p) => !p)}
                />

                {error && (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>⚠️ {error}</Text>
                  </View>
                )}

                <Button
                  title="Sign In"
                  onPress={handleLogin}
                  isLoading={isLoading}
                  fullWidth
                  size="lg"
                  style={{ marginTop: 8 }}
                />
              </View>
            </Animated.View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                🔐 Secure admin portal for authorized personnel only
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  topPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 50,
    paddingHorizontal: 10,
    overflow: 'hidden',
  },
  patternText: {
    color: 'rgba(212,160,23,0.12)',
    fontSize: 14,
    letterSpacing: 4,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: COLORS.gold[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  logoGrad: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.gold.light,
    letterSpacing: 1.5,
  },
  appSub: {
    fontSize: 13,
    color: 'rgba(245,208,110,0.6)',
    letterSpacing: 4,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#FEFDF8',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#1A0505',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  cardTopBorder: {
    height: 3,
  },
  cardContent: {
    padding: 24,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.maroon[900],
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: COLORS.sandal[500],
    marginBottom: 16,
  },
  ornament: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  ornamentLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.cream[300],
  },
  ornamentDot: {
    color: COLORS.gold[500],
    fontSize: 10,
    marginHorizontal: 8,
  },
  errorBox: {
    backgroundColor: '#FFEBEE',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.error,
  },
  errorText: {
    color: '#C62828',
    fontSize: 13,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    color: 'rgba(253,248,236,0.5)',
    fontSize: 12,
    textAlign: 'center',
  },
});
