/**
 * XP Progress Bar Component
 *
 * Displays user's level and progress toward next level
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

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
  // Calculate progress percentage (0-100)
  const progress = Math.min((currentXP / xpForNextLevel) * 100, 100);

  return (
    <View style={compact ? styles.containerCompact : styles.container}>
      <View style={styles.header}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>LV {level}</Text>
        </View>
        <Text style={styles.xpText}>
          {currentXP} / {xpForNextLevel} XP
        </Text>
      </View>

      <View style={styles.barBackground}>
        <View style={[styles.barFill, { width: `${progress}%` }]} />
      </View>

      {!compact && (
        <Text style={styles.progressText}>{Math.floor(progress)}% to next level</Text>
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
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  xpText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  barBackground: {
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    textAlign: 'right',
  },
});
