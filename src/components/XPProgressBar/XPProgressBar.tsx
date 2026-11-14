/**
 * XP Progress Bar Component
 *
 * Displays user's level and progress toward next level
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../../theme';

interface XPProgressBarProps {
  level: number;
  currentXP: number;
  xpForNextLevel: number;
  compact?: boolean;
}

export const XPProgressBar: React.FC<XPProgressBarProps> = ({
  level,
  currentXP,
  xpForNextLevel,
  compact = false,
}) => {
  const { theme } = useAppTheme();

  // Calculate progress percentage (0-100)
  const progress = Math.min((currentXP / xpForNextLevel) * 100, 100);

  return (
    <View style={compact ? styles.containerCompact : styles.container}>
      <View style={styles.header}>
        <View style={[styles.levelBadge, { backgroundColor: theme.colors.accentGold }]}> 
          <Text style={[styles.levelText, { color: theme.colors.textOnAccent }]}>LV {level}</Text>
        </View>
        <Text style={[styles.xpText, { color: theme.colors.textSecondary }]}>
          {currentXP} / {xpForNextLevel} XP
        </Text>
      </View>

      <View style={[styles.barBackground, { backgroundColor: theme.colors.borderSubtle }]}> 
        <View style={[styles.barFill, { width: `${progress}%`, backgroundColor: theme.colors.accentGold }]} />
      </View>

      {!compact && (
        <Text style={[styles.progressText, { color: theme.colors.textMuted }]}>
          {Math.floor(progress)}% to next level
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  containerCompact: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '700',
  },
  xpText: {
    fontSize: 14,
    fontWeight: '600',
  },
  barBackground: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
});
