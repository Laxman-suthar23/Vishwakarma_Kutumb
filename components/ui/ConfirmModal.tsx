import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Modal } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { useConfirmStore } from '@store/confirm.store';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export function ConfirmModal() {
  const {
    visible,
    title,
    message,
    confirmText,
    cancelText,
    isDestructive,
    triggerConfirm,
    triggerCancel,
  } = useConfirmStore();

  const [rendered, setRendered] = useState(false);
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setRendered(true);
      scale.value = withSpring(1, { damping: 15, stiffness: 120 });
      opacity.value = withTiming(1, { duration: 250 });
    } else {
      scale.value = withTiming(0.9, { duration: 200 });
      opacity.value = withTiming(0, { duration: 150 }, () => {
        runOnJS(setRendered)(false);
      });
    }
  }, [visible]);

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!visible && !rendered) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={triggerCancel}>
      <View style={styles.overlay}>
        {/* Animated Glassmorphic Backdrop */}
        <AnimatedBlurView
          intensity={40}
          tint="dark"
          style={[StyleSheet.absoluteFillObject, styles.backdrop, backdropStyle]}
        >
          <TouchableOpacity activeOpacity={1} onPress={triggerCancel} style={StyleSheet.absoluteFillObject} />
        </AnimatedBlurView>

        {/* Animated Modal Container */}
        <Animated.View style={[styles.modalContainer, modalStyle]}>
          <View style={styles.modalContent}>
            {/* Elegant Header Ornament */}
            <View style={styles.ornamentLine}>
              <View style={styles.line} />
              <Text style={styles.ornamentDot}>✦</Text>
              <View style={styles.line} />
            </View>

            <Text style={styles.titleText}>{title}</Text>
            <Text style={styles.messageText}>{message}</Text>

            {/* Premium Button Action Row */}
            <View style={styles.buttonRow}>
              {/* Cancel Button */}
              <TouchableOpacity onPress={triggerCancel} style={styles.cancelBtn} activeOpacity={0.7}>
                <Text style={styles.cancelText}>{cancelText}</Text>
              </TouchableOpacity>

              {/* Confirm Button with dynamic gradient */}
              <TouchableOpacity onPress={triggerConfirm} style={styles.confirmBtn} activeOpacity={0.8}>
                <LinearGradient
                  colors={isDestructive ? ['#EF5350', '#C62828'] : ['#D4A017', '#9A6E00']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientBtn}
                >
                  <Text style={styles.confirmText}>{confirmText}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: {
    backgroundColor: 'rgba(10, 2, 2, 0.65)',
  },
  modalContainer: {
    width: width * 0.88,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 15,
    elevation: 10,
    backgroundColor: '#3D0C11', // Majestic dark temple red
    borderWidth: 1,
    borderColor: 'rgba(212, 160, 23, 0.25)', // Gold border
  },
  modalContent: {
    padding: 24,
    alignItems: 'center',
  },
  ornamentLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    width: '60%',
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(212, 160, 23, 0.3)',
  },
  ornamentDot: {
    color: '#D4A017',
    fontSize: 10,
    marginHorizontal: 8,
  },
  titleText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#D4A017', // Gold text
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  messageText: {
    fontSize: 14,
    color: '#FDF8EC', // Cream text
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    opacity: 0.9,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(253, 248, 236, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  cancelText: {
    color: '#FDF8EC',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  gradientBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
