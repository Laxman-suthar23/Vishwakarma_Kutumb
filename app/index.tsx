import { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import { useAuthStore } from '@store/auth.store';
import { COLORS } from '@constants/colors';

const { width, height } = Dimensions.get('window');

export default function IndexScreen() {
  const { isAuthenticated, isRestoring } = useAuthStore();

  // Animation values
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const titleOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const overlayOpacity = useSharedValue(0);

  const navigate = () => {
    router.replace('/(tabs)');
  };

  useEffect(() => {
    if (isRestoring) return;

    // Logo entrance
    logoOpacity.value = withTiming(1, { duration: 800 });
    logoScale.value = withTiming(1, { duration: 800 });

    // Title entrance
    titleOpacity.value = withDelay(500, withTiming(1, { duration: 700 }));

    // Subtitle
    subtitleOpacity.value = withDelay(900, withTiming(1, { duration: 600 }));

    // Fade out and navigate
    overlayOpacity.value = withDelay(
      2400,
      withTiming(1, { duration: 500 }, (finished) => {
        if (finished) {
          runOnJS(navigate)();
        }
      })
    );
  }, [isRestoring]);

  const logoAnimStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const titleAnimStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  const subtitleAnimStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const overlayAnimStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* Background gradient - temple color */}
      <LinearGradient
        colors={['#1A0505', '#3D0C11', '#6B1414', '#8B1A1A']}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative mandala pattern overlay */}
      <View style={styles.mandalaContainer}>
        <Text style={styles.mandala}>☸</Text>
      </View>

      {/* Gold shimmer overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(212,160,23,0.08)', 'transparent']}
        style={[StyleSheet.absoluteFill, { top: height * 0.2 }]}
      />

      {/* Logo Area */}
      <Animated.View style={[styles.logoArea, logoAnimStyle]}>
        <View style={styles.logoCircle}>
          <LinearGradient
            colors={['#D4A017', '#B8860B', '#9A6E00']}
            style={styles.logoGradient}
          >
            <Text style={styles.logoEmoji}>🏛️</Text>
          </LinearGradient>
        </View>

        {/* Gold ring around logo */}
        <View style={styles.logoRing} />
      </Animated.View>

      {/* App Name */}
      <Animated.View style={[styles.titleArea, titleAnimStyle]}>
        <Text style={styles.appName}>ग्राम परिवार</Text>
        <Text style={styles.appNameEn}>Gram Parivar</Text>
      </Animated.View>

      {/* Tagline */}
      <Animated.View style={[styles.subtitleArea, subtitleAnimStyle]}>
        {/* Ornament line */}
        <View style={styles.ornamentRow}>
          <View style={styles.ornamentLine} />
          <Text style={styles.ornamentDiamond}>◆</Text>
          <View style={styles.ornamentLine} />
        </View>

        <Text style={styles.tagline}>Digital Village Family Heritage Directory</Text>

        <View style={[styles.ornamentRow, { marginTop: 12 }]}>
          <View style={styles.ornamentLine} />
          <Text style={styles.ornamentDiamond}>◆</Text>
          <View style={styles.ornamentLine} />
        </View>
      </Animated.View>

      {/* Fade to next screen overlay */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: '#3D0C11' },
          overlayAnimStyle,
        ]}
        pointerEvents="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mandalaContainer: {
    position: 'absolute',
    top: height * 0.05,
    left: 0,
    right: 0,
    alignItems: 'center',
    opacity: 0.06,
  },
  mandala: {
    fontSize: width * 0.9,
    color: COLORS.gold[400],
  },
  logoArea: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 32,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    zIndex: 1,
  },
  logoGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: {
    fontSize: 48,
  },
  logoRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1.5,
    borderColor: 'rgba(212,160,23,0.5)',
    zIndex: 0,
  },
  titleArea: {
    alignItems: 'center',
    marginBottom: 24,
  },
  appName: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.gold.light,
    letterSpacing: 2,
    textShadowColor: 'rgba(212,160,23,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  appNameEn: {
    fontSize: 18,
    fontWeight: '300',
    color: 'rgba(245,208,110,0.8)',
    letterSpacing: 6,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  subtitleArea: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  ornamentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
  },
  ornamentLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(212,160,23,0.4)',
  },
  ornamentDiamond: {
    color: COLORS.gold[500],
    fontSize: 10,
    marginHorizontal: 8,
  },
  tagline: {
    color: 'rgba(253,248,236,0.7)',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 14,
    letterSpacing: 0.5,
    lineHeight: 20,
  },
});
