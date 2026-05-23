import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@constants/colors';

// ─── Screen Header ────────────────────────────────────────────────────────────

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: {
    label: string;
    onPress: () => void;
    icon?: string;
    variant?: 'gold' | 'ghost';
  };
  gradient?: string[];
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  showBack = true,
  onBack,
  rightAction,
  gradient = ['#3D0C11', '#6B1414'],
}) => {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={gradient[0]} />
      <LinearGradient colors={gradient as [string, string, ...string[]]} style={styles.container}>
        <SafeAreaView edges={['top']}>
          <View style={styles.row}>
            {/* Back Button */}
            {showBack ? (
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Text style={styles.backIcon}>←</Text>
                <Text style={styles.backText}>Back</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.placeholder} />
            )}

            {/* Title */}
            <View style={styles.titleContainer}>
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
              {subtitle && (
                <Text style={styles.subtitle} numberOfLines={1}>
                  {subtitle}
                </Text>
              )}
            </View>

            {/* Right Action */}
            {rightAction ? (
              <TouchableOpacity
                onPress={rightAction.onPress}
                style={[
                  styles.rightButton,
                  rightAction.variant === 'gold' && styles.rightButtonGold,
                ]}
              >
                {rightAction.icon && (
                  <Text style={styles.rightButtonIcon}>{rightAction.icon}</Text>
                )}
                <Text
                  style={[
                    styles.rightButtonText,
                    rightAction.variant === 'gold' && styles.rightButtonTextGold,
                  ]}
                >
                  {rightAction.label}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.placeholder} />
            )}
          </View>

          {/* Gold ornament line */}
          <View style={styles.ornamentRow}>
            <View style={styles.ornamentLine} />
            <Text style={styles.ornamentDiamond}>◆</Text>
            <View style={styles.ornamentLine} />
          </View>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
};

// ─── Tab Screen Header (no back button) ──────────────────────────────────────

interface TabHeaderProps {
  title: string;
  subtitle?: string;
  rightContent?: React.ReactNode;
}

export const TabScreenHeader: React.FC<TabHeaderProps> = ({
  title,
  subtitle,
  rightContent,
}) => {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#3D0C11" />
      <LinearGradient colors={['#3D0C11', '#6B1414']} style={styles.tabHeader}>
        <SafeAreaView edges={['top']}>
          <View style={styles.tabHeaderRow}>
            <View>
              <Text style={styles.tabTitle}>{title}</Text>
              {subtitle && <Text style={styles.tabSubtitle}>{subtitle}</Text>}
            </View>
            {rightContent && <View>{rightContent}</View>}
          </View>

          {/* Decorative mandala */}
          <View style={styles.mandalaDecor}>
            <Text style={styles.mandalaText}>☸</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    width: 80,
  },
  backIcon: {
    color: COLORS.gold.light,
    fontSize: 14,
    fontWeight: '700',
  },
  backText: {
    color: COLORS.gold.light,
    fontSize: 13,
    fontWeight: '600',
  },
  placeholder: {
    width: 80,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FEFDF8',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 11,
    color: 'rgba(245,208,110,0.65)',
    textAlign: 'center',
    marginTop: 2,
    letterSpacing: 0.3,
  },
  rightButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    width: 80,
    justifyContent: 'center',
  },
  rightButtonGold: {
    backgroundColor: COLORS.gold[500],
  },
  rightButtonIcon: {
    fontSize: 13,
  },
  rightButtonText: {
    color: COLORS.gold.light,
    fontSize: 12,
    fontWeight: '600',
  },
  rightButtonTextGold: {
    color: '#FFFFFF',
  },
  ornamentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
  },
  ornamentLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(212,160,23,0.25)',
  },
  ornamentDiamond: {
    color: 'rgba(212,160,23,0.5)',
    fontSize: 8,
    marginHorizontal: 8,
  },

  // Tab header
  tabHeader: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  tabHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  tabTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FEFDF8',
    letterSpacing: 0.3,
  },
  tabSubtitle: {
    fontSize: 13,
    color: 'rgba(245,208,110,0.65)',
    marginTop: 3,
  },
  mandalaDecor: {
    position: 'absolute',
    right: -20,
    top: -10,
    opacity: 0.05,
  },
  mandalaText: {
    fontSize: 120,
    color: COLORS.gold[400],
  },
});

export default ScreenHeader;
