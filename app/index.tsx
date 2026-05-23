import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { useAuthStore } from '@store/auth.store';
import { Image } from 'expo-image';

const AnimatedImage = Animated.createAnimatedComponent(Image);

export default function IndexScreen() {
  const { isRestoring } = useAuthStore();

  // Animation values
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.95);
  const overlayOpacity = useSharedValue(0);

  const navigate = () => {
    router.replace('/(tabs)');
  };

  useEffect(() => {
    if (isRestoring) return;

    // Smooth logo entrance scale-up
    logoOpacity.value = withTiming(1, { duration: 900 });
    logoScale.value = withTiming(1, { duration: 900 });

    // Premium cross-fade transition and navigate
    overlayOpacity.value = withDelay(
      2000,
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

  const overlayAnimStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* Background color matching the splash theme */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#3D0C11' }]} />

      {/* Full screen / centered high-quality branding image */}
      <AnimatedImage
        source={require('../assets/images/adaptive-icon.png')}
        style={[styles.fullScreenImage, logoAnimStyle]}
        contentFit="contain"
      />

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
    backgroundColor: '#3D0C11',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
});
