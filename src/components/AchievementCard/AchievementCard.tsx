/**
 * Achievement Card Component
 *
 * Displays an achievement with icon, name, description, and progress
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Achievement } from '../../types/gamification';

interface AchievementCardProps {
  achievement: Achievement;
  unlocked: boolean;
  progress?: number; // 0-1 scale
  compact?: boolean;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  unlocked,
  progress = 0,
  compact = false,
}) => {
  const progressPercentage = Math.min(progress * 100, 100);

  // Get tier color
  const getTierColor = () => {
    switch (achievement.tier) {
      case 'bronze':
        return '#CD7F32';
      case 'silver':
        return '#C0C0C0';
      case 'gold':
        return '#FFD700';
      case 'platinum':
        return '#E5E4E2';
      default:
        return '#999';
    }
  };

  return (
    <View
      style={[
        styles.card,
        !unlocked && styles.cardLocked,
        compact && styles.cardCompact,
      ]}
    >
      <Text style={[styles.icon, !unlocked && styles.iconLocked]}>
        {achievement.icon}
      </Text>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text
            style={[
              styles.name,
              !unlocked && styles.nameLocked,
              compact && styles.nameCompact,
            ]}
          >
            {achievement.name}
          </Text>
          <View
            style={[styles.tierBadge, { backgroundColor: getTierColor() }]}
          >
            <Text style={styles.tierText}>
              {achievement.tier.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text
          style={[
            styles.description,
            !unlocked && styles.descriptionLocked,
            compact && styles.descriptionCompact,
          ]}
        >
          {achievement.description}
        </Text>

        {!unlocked && progress > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progressPercentage}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {Math.floor(progressPercentage)}%
            </Text>
          </View>
        )}

        {!compact && (
          <Text style={styles.reward}>+{achievement.xpReward} XP</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardLocked: {
    opacity: 0.6,
  },
  cardCompact: {
    padding: 12,
    marginBottom: 8,
  },
  icon: {
    fontSize: 40,
    marginRight: 16,
  },
  iconLocked: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  nameLocked: {
    color: '#999',
  },
  nameCompact: {
    fontSize: 14,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  descriptionLocked: {
    color: '#AAA',
  },
  descriptionCompact: {
    fontSize: 12,
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  tierText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    width: 40,
    textAlign: 'right',
  },
  reward: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
});
