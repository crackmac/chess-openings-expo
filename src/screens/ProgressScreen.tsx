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
import { useGamification } from '../hooks/useGamification';
import { allOpenings } from '../data/openings';
import { Opening } from '../types';
import { RootStackParamList } from '../navigation/AppNavigator';
import { XPProgressBar } from '../components/XPProgressBar';
import { AchievementCard } from '../components/AchievementCard';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ProgressScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const {
    progress,
    sessionHistory,
    loading,
    getUserStats,
    refreshProgress,
    refreshSessionHistory,
  } = useProgress();

  const {
    gamificationData,
    getUnlockedAchievements,
    refreshGamification,
  } = useGamification();

  // Refresh progress and session history when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      refreshProgress();
      refreshSessionHistory();
      refreshGamification();
    }, [refreshProgress, refreshSessionHistory, refreshGamification])
  );

  const userStats = getUserStats();
  const unlockedAchievements = getUnlockedAchievements();

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

  // Get opening name by ID
  const getOpeningName = (openingId: string): string => {
    const opening = allOpenings.find((o) => o.id === openingId);
    return opening?.name || openingId;
  };

  // Format date for display
  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    // For older dates, show actual date
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  // Format duration
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (secs === 0) return `${mins}m`;
    return `${mins}m ${secs}s`;
  };

  // Get accuracy color
  const getAccuracyColor = (accuracy: number): string => {
    if (accuracy >= 80) return '#4caf50';
    if (accuracy >= 60) return '#ff9800';
    return '#f44336';
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

      {/* XP/Level Card */}
      {gamificationData && (
        <View style={styles.xpCard}>
          <XPProgressBar
            level={gamificationData.level}
            currentXP={gamificationData.totalXP}
            xpForNextLevel={gamificationData.xpForNextLevel}
          />
        </View>
      )}

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
            <View style={styles.streakContainer}>
              <Text style={styles.streakIcon}>🔥</Text>
              <Text style={styles.statValue}>
                {gamificationData?.currentStreak || userStats.currentStreak}
              </Text>
            </View>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </View>
      </View>

      {/* Recent Achievements */}
      {gamificationData && unlockedAchievements.length > 0 && (
        <View style={styles.achievementsCard}>
          <Text style={styles.sectionTitle}>Recent Achievements</Text>
          {unlockedAchievements.slice(0, 3).map((achievement) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              unlocked={true}
              compact={true}
            />
          ))}
          {unlockedAchievements.length > 3 && (
            <Text style={styles.viewMoreText}>
              +{unlockedAchievements.length - 3} more achievements unlocked
            </Text>
          )}
        </View>
      )}

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

      {/* Session History */}
      <View style={styles.progressCard}>
        <Text style={styles.sectionTitle}>Recent Sessions</Text>
        {sessionHistory.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No practice sessions yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Complete a practice session to see your history here
            </Text>
          </View>
        ) : (
          sessionHistory.slice(0, 10).map((session) => (
            <View key={session.sessionId} style={styles.sessionItem}>
              <View style={styles.sessionHeader}>
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionOpeningName}>
                    {getOpeningName(session.openingId)}
                  </Text>
                  <Text style={styles.sessionDate}>
                    {formatDate(session.date)}
                  </Text>
                </View>
                <View
                  style={[
                    styles.accuracyBadge,
                    { backgroundColor: getAccuracyColor(session.accuracy) },
                  ]}
                >
                  <Text style={styles.accuracyText}>
                    {session.accuracy.toFixed(0)}%
                  </Text>
                </View>
              </View>
              <View style={styles.sessionDetails}>
                <View style={styles.sessionDetailRow}>
                  <Text style={styles.sessionDetailLabel}>Moves:</Text>
                  <Text style={styles.sessionDetailValue}>
                    {session.correctMoves}/{session.totalMoves}
                  </Text>
                </View>
                <View style={styles.sessionDetailRow}>
                  <Text style={styles.sessionDetailLabel}>Duration:</Text>
                  <Text style={styles.sessionDetailValue}>
                    {formatDuration(session.duration)}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
        {sessionHistory.length > 10 && (
          <Text style={styles.moreSessionsText}>
            Showing 10 most recent sessions
          </Text>
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
  xpCard: {
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
  achievementsCard: {
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
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakIcon: {
    fontSize: 20,
    marginRight: 4,
  },
  viewMoreText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
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
  sessionItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 16,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionOpeningName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  sessionDate: {
    fontSize: 12,
    color: '#666',
  },
  accuracyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 50,
    alignItems: 'center',
  },
  accuracyText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  sessionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sessionDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionDetailLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 4,
  },
  sessionDetailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  moreSessionsText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});

