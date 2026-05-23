import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@constants/colors';
import { Button } from './Button';

// ─── Empty State Component ────────────────────────────────────────────────────

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '🏛️',
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <View style={styles.container}>
      {/* Decorative top border */}
      <View style={styles.ornament}>
        <View style={styles.ornamentLine} />
        <Text style={styles.ornamentDot}>◆</Text>
        <View style={styles.ornamentLine} />
      </View>

      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}

      {actionLabel && onAction && (
        <View style={{ marginTop: 20 }}>
          <Button title={actionLabel} onPress={onAction} size="md" />
        </View>
      )}

      {/* Decorative bottom border */}
      <View style={[styles.ornament, { marginTop: 24 }]}>
        <View style={styles.ornamentLine} />
        <Text style={styles.ornamentDot}>◆</Text>
        <View style={styles.ornamentLine} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  ornament: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '60%',
    marginBottom: 24,
  },
  ornamentLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.gold[300],
  },
  ornamentDot: {
    color: COLORS.gold[500],
    fontSize: 10,
    marginHorizontal: 8,
  },
  icon: {
    fontSize: 56,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.maroon[800],
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  description: {
    fontSize: 14,
    color: COLORS.sandal[500],
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default EmptyState;
