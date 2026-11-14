/**
 * Opening Card Component
 * Displays opening information in a card format
 */

import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Opening } from '../../types';
import { OpeningProgress } from '../../types/progress';
import { useAppTheme } from '../../theme';

interface OpeningCardProps {
  opening: Opening;
  onPress: () => void;
  progress?: OpeningProgress | null;
}

export const OpeningCard: React.FC<OpeningCardProps> = ({
  opening,
  onPress,
  progress,
}) => {
  const { theme } = useAppTheme();

  const getDifficultyColor = () => {
    switch (opening.difficulty) {
      case 'beginner':
        return theme.colors.beginner;
      case 'intermediate':
        return theme.colors.intermediate;
      case 'advanced':
        return theme.colors.advanced;
      default:
        return theme.colors.traps;
    }
  };

  const getColorBadge = () => {
    if (opening.color === 'white') {
      return { label: 'WHITE', bg: '#E2E8F0', fg: '#0F172A' };
    }
    return { label: 'BLACK', bg: '#0F172A', fg: '#E2E8F0' };
  };

  const renderStars = (level: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Text key={i} style={[styles.star, { color: theme.colors.accentGold }]}> 
          {i < level ? '★' : '☆'}
        </Text>
      );
    }
    return stars;
  };

  const getRatingColor = (rating?: 'hard' | 'good' | 'easy') => {
    switch (rating) {
      case 'hard':
        return theme.colors.danger;
      case 'good':
        return theme.colors.info;
      case 'easy':
        return theme.colors.success;
      default:
        return theme.colors.textMuted;
    }
  };

  const getRatingLabel = (rating?: 'hard' | 'good' | 'easy') => {
    switch (rating) {
      case 'hard':
        return 'Hard';
      case 'good':
        return 'Good';
      case 'easy':
        return 'Easy';
      default:
        return null;
    }
  };

  const colorBadge = getColorBadge();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surfaceCard,
          borderColor: theme.colors.borderSubtle,
          ...theme.shadow.soft,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={[styles.name, { color: theme.colors.textPrimary }]}>
            {opening.name}
          </Text>
          <Text style={[styles.eco, { color: theme.colors.textSecondary }]}>
            {opening.eco}
          </Text>
        </View>

        <View style={styles.badgesColumn}>
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor() },
            ]}
          >
            <Text style={[styles.difficultyText, { color: theme.colors.textOnAccent }]}>
              {opening.difficulty.toUpperCase()}
            </Text>
          </View>

          <View style={[styles.colorBadge, { backgroundColor: colorBadge.bg }]}> 
            <Text style={[styles.colorBadgeText, { color: colorBadge.fg }]}>
              {colorBadge.label}
            </Text>
          </View>
        </View>
      </View>

      <Text
        style={[styles.description, { color: theme.colors.textSecondary }]}
        numberOfLines={2}
      >
        {opening.description}
      </Text>

      <View style={styles.tags}>
        {opening.tags.slice(0, 3).map((tag, index) => (
          <View
            key={index}
            style={[styles.tag, { backgroundColor: theme.colors.accentGoldMuted }]}
          >
            <Text style={[styles.tagText, { color: theme.colors.accentGold }]}>
              {tag}
            </Text>
          </View>
        ))}
      </View>

      {progress && (
        <View style={[styles.progress, { borderTopColor: theme.colors.borderSubtle }]}>
          <View style={styles.progressRow}>
            <Text style={[styles.progressLabel, { color: theme.colors.textMuted }]}>Practiced:</Text>
            <Text style={[styles.progressValue, { color: theme.colors.textPrimary }]}>
              {progress.timesPracticed}x
            </Text>
          </View>
          <View style={styles.progressRow}>
            <Text style={[styles.progressLabel, { color: theme.colors.textMuted }]}>Best:</Text>
            <Text style={[styles.progressValue, { color: theme.colors.textPrimary }]}>
              {progress.bestAccuracy.toFixed(0)}%
            </Text>
          </View>
          {progress.difficultyRating && (
            <View style={styles.progressRow}>
              <Text style={[styles.progressLabel, { color: theme.colors.textMuted }]}>Recall:</Text>
              <View
                style={[
                  styles.ratingBadge,
                  { backgroundColor: getRatingColor(progress.difficultyRating) },
                ]}
              >
                <Text style={[styles.ratingText, { color: theme.colors.white }]}>
                  {getRatingLabel(progress.difficultyRating)}
                </Text>
              </View>
            </View>
          )}
          <View style={styles.mastery}>
            <Text style={[styles.masteryLabel, { color: theme.colors.textMuted }]}>Mastery:</Text>
            <View style={styles.stars}>{renderStars(progress.masteryLevel)}</View>
          </View>
        </View>
      )}

      {!progress && (
        <View style={[styles.newBadge, { backgroundColor: 'rgba(46, 204, 113, 0.2)' }]}> 
          <Text style={[styles.newBadgeText, { color: theme.colors.success }]}>New</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleSection: {
    flex: 1,
    paddingRight: 12,
  },
  badgesColumn: {
    alignItems: 'flex-end',
    gap: 6,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  eco: {
    fontSize: 14,
    fontWeight: '500',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '700',
  },
  colorBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.25)',
  },
  colorBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progress: {
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 8,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  mastery: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  masteryLabel: {
    fontSize: 12,
    marginRight: 8,
  },
  stars: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 14,
    marginRight: 2,
  },
  newBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
  },
  newBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  ratingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
