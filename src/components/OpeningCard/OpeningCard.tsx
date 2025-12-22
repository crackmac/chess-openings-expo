/**
 * Opening Card Component
 * Displays opening information in a card format
 */

import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Opening } from '../../types';
import { OpeningProgress } from '../../types/progress';

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
  const getDifficultyColor = () => {
    switch (opening.difficulty) {
      case 'beginner':
        return '#4caf50';
      case 'intermediate':
        return '#ff9800';
      case 'advanced':
        return '#f44336';
      default:
        return '#757575';
    }
  };

  const renderStars = (level: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Text key={i} style={styles.star}>
          {i < level ? '★' : '☆'}
        </Text>
      );
    }
    return stars;
  };

  const getRatingColor = (rating?: 'hard' | 'good' | 'easy') => {
    switch (rating) {
      case 'hard':
        return '#f44336';
      case 'good':
        return '#2196f3';
      case 'easy':
        return '#4caf50';
      default:
        return '#999';
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

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={styles.name}>{opening.name}</Text>
          <Text style={styles.eco}>{opening.eco}</Text>
        </View>
        <View
          style={[
            styles.difficultyBadge,
            { backgroundColor: getDifficultyColor() },
          ]}
        >
          <Text style={styles.difficultyText}>
            {opening.difficulty.toUpperCase()}
          </Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {opening.description}
      </Text>

      <View style={styles.tags}>
        {opening.tags.slice(0, 3).map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      {progress && (
        <View style={styles.progress}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Practiced:</Text>
            <Text style={styles.progressValue}>{progress.timesPracticed}x</Text>
          </View>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Best:</Text>
            <Text style={styles.progressValue}>
              {progress.bestAccuracy.toFixed(0)}%
            </Text>
          </View>
          {progress.difficultyRating && (
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Rating:</Text>
              <View
                style={[
                  styles.ratingBadge,
                  { backgroundColor: getRatingColor(progress.difficultyRating) },
                ]}
              >
                <Text style={styles.ratingText}>
                  {getRatingLabel(progress.difficultyRating)}
                </Text>
              </View>
            </View>
          )}
          <View style={styles.mastery}>
            <Text style={styles.masteryLabel}>Mastery:</Text>
            <View style={styles.stars}>{renderStars(progress.masteryLevel)}</View>
          </View>
        </View>
      )}

      {!progress && (
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>New</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleSection: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  eco: {
    fontSize: 14,
    color: '#666',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  difficultyText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#1976d2',
  },
  progress: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
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
    color: '#666',
  },
  progressValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  mastery: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  masteryLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  stars: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 14,
    color: '#ffc107',
    marginRight: 2,
  },
  newBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 8,
  },
  newBadgeText: {
    fontSize: 12,
    color: '#4caf50',
    fontWeight: 'bold',
  },
  ratingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
});

