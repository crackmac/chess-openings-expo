/**
 * Progress Screen
 * Displays user statistics and opening progress
 */

import React, { useMemo } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useProgress } from '../hooks/useProgress';
import { allOpenings } from '../data/openings';
import { Opening } from '../types';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ProgressScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { progress, loading, getUserStats, refreshProgress } = useProgress();

  // Refresh progress when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      refreshProgress();
    }, [refreshProgress])
  );

  const userStats = getUserStats();

  // Get openings with progress
  const openingsWithProgress = useMemo(() => {
    return allOpenings.map((opening) => ({
      opening,
      progress: progress[opening.id] || null,
    }));
  }, [progress]);

  // Sort by mastery level and times practiced
  const sortedOpenings = useMemo(() => {
    return [...openingsWithProgress].sort((a, b) => {
      const aLevel = a.progress?.masteryLevel || 0;
      const bLevel = b.progress?.masteryLevel || 0;
      if (bLevel !== aLevel) {
        return bLevel - aLevel;
      }
      const aPracticed = a.progress?.timesPracticed || 0;
      const bPracticed = b.progress?.timesPracticed || 0;
      return bPracticed - aPracticed;
    });
  }, [openingsWithProgress]);

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
        return 'Not Rated';
    }
  };

  const handleOpeningPress = (opening: Opening) => {
    navigation.navigate('OpeningDetail', { opening });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Progress</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading progress...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Progress</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>

      {/* Overall Statistics */}
      <View style={styles.statsCard}>
        <Text style={styles.sectionTitle}>Overall Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{userStats.totalSessions}</Text>
            <Text style={styles.statLabel}>Total Sessions</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{userStats.totalOpeningsPracticed}</Text>
            <Text style={styles.statLabel}>Openings Practiced</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {userStats.averageAccuracy.toFixed(0)}%
            </Text>
            <Text style={styles.statLabel}>Avg Accuracy</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{userStats.currentStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </View>
      </View>

      {/* Opening Progress List */}
      <View style={styles.progressCard}>
        <Text style={styles.sectionTitle}>Opening Progress</Text>
        {sortedOpenings.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No openings practiced yet
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Start practicing to track your progress!
            </Text>
          </View>
        ) : (
          sortedOpenings.map(({ opening, progress }) => (
            <TouchableOpacity
              key={opening.id}
              style={styles.openingItem}
              onPress={() => handleOpeningPress(opening)}
              activeOpacity={0.7}
            >
              <View style={styles.openingHeader}>
                <View style={styles.openingInfo}>
                  <Text style={styles.openingName}>{opening.name}</Text>
                  <Text style={styles.openingEco}>{opening.eco}</Text>
                </View>
                {progress?.difficultyRating && (
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
                )}
              </View>

              {progress ? (
                <View style={styles.progressDetails}>
                  <View style={styles.progressRow}>
                    <Text style={styles.progressLabel}>Practiced:</Text>
                    <Text style={styles.progressValue}>
                      {progress.timesPracticed}x
                    </Text>
                  </View>
                  <View style={styles.progressRow}>
                    <Text style={styles.progressLabel}>Best Accuracy:</Text>
                    <Text style={styles.progressValue}>
                      {progress.bestAccuracy.toFixed(0)}%
                    </Text>
                  </View>
                  <View style={styles.progressRow}>
                    <Text style={styles.progressLabel}>Avg Accuracy:</Text>
                    <Text style={styles.progressValue}>
                      {progress.averageAccuracy.toFixed(0)}%
                    </Text>
                  </View>
                  <View style={styles.masteryRow}>
                    <Text style={styles.progressLabel}>Mastery:</Text>
                    <View style={styles.stars}>
                      {renderStars(progress.masteryLevel)}
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.noProgress}>
                  <Text style={styles.noProgressText}>Not practiced yet</Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
      </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
    paddingTop: 0,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statBox: {
    width: '48%',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196f3',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  progressCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  openingItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 16,
  },
  openingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  openingInfo: {
    flex: 1,
  },
  openingName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  openingEco: {
    fontSize: 14,
    color: '#666',
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
  progressDetails: {
    marginTop: 8,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  masteryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  stars: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  star: {
    fontSize: 16,
    color: '#ffc107',
    marginRight: 2,
  },
  noProgress: {
    marginTop: 8,
  },
  noProgressText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
  },
});

