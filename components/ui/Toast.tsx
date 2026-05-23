import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { useToastStore, ToastType } from '@store/toast.store';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const TOAST_ICONS: Record<ToastType, string> = {
  success: '✨',
  error: '❌',
  info: 'ℹ️',
  warning: '⚠️',
};

const TOAST_BORDER_COLORS: Record<ToastType, string> = {
  success: '#4CAF50',
  error: '#EF5350',
  info: '#42A5F5',
  warning: '#FFB74D',
};

export function Toast() {
  const { visible, message, title, type, hideToast } = useToastStore();
  const [rendered, setRendered] = useState(false);

  const translateY = useSharedValue(-150);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setRendered(true);
      translateY.value = withSpring(0, { damping: 15, stiffness: 100 });
      opacity.value = withTiming(1, { duration: 250 });
    } else {
      translateY.value = withTiming(-150, { duration: 250 });
      opacity.value = withTiming(0, { duration: 200 }, () => {
        runOnJS(setRendered)(false);
      });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!visible && !rendered) return null;

  return (
    <SafeAreaView style={styles.safeArea} pointerEvents="box-none">
      <Animated.View style={[styles.container, animatedStyle]}>
        <BlurView intensity={80} tint="dark" style={[styles.blurView, { borderLeftColor: TOAST_BORDER_COLORS[type] }]}>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>{TOAST_ICONS[type]}</Text>
            </View>
            <View style={styles.textContainer}>
              {title ? <Text style={styles.titleText}>{title}</Text> : null}
              <Text style={styles.messageText}>{message}</Text>
            </View>
            <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 99999,
    alignItems: 'center',
  },
  container: {
    width: width * 0.92,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
    marginTop: 10,
  },
  blurView: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(26, 5, 5, 0.85)',
    borderLeftWidth: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 16,
  },
  textContainer: {
    flex: 1,
  },
  titleText: {
    color: '#D4A017',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  messageText: {
    color: '#FDF8EC',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  closeButton: {
    padding: 8,
    marginLeft: 8,
  },
  closeText: {
    color: 'rgba(253, 248, 236, 0.5)',
    fontSize: 14,
  },
});
