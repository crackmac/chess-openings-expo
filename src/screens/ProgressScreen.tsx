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
import { useAppTheme } from '../theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ProgressScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useAppTheme();
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
    if (accuracy >= 80) return theme.colors.success;
    if (accuracy >= 60) return theme.colors.warning;
    return theme.colors.danger;
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.bgPrimary }]}> 
        <View style={[styles.header, { backgroundColor: theme.colors.bgSecondary, borderBottomColor: theme.colors.borderSubtle }]}> 
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Progress</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Loading progress...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bgPrimary }]}> 
      <View style={[styles.header, { backgroundColor: theme.colors.bgSecondary, borderBottomColor: theme.colors.borderSubtle }]}> 
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Your Progress</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {/* XP/Level Card */}
        {gamificationData && (
          <View style={[styles.xpCard, { backgroundColor: theme.colors.surfaceCard, borderColor: theme.colors.borderSubtle, ...theme.shadow.soft }]}> 
            <XPProgressBar
              level={gamificationData.level}
              currentXP={gamificationData.totalXP}
              xpForNextLevel={gamificationData.xpForNextLevel}
            />
          </View>
        )}

        {/* Overall Statistics */}
        <View style={[styles.statsCard, { backgroundColor: theme.colors.surfaceCard, borderColor: theme.colors.borderSubtle, ...theme.shadow.soft }]}> 
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Overall Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statBox, { backgroundColor: theme.colors.bgSecondary }]}> 
              <Text style={[styles.statValue, { color: theme.colors.accentGold }]}>{userStats.totalSessions}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Total Sessions</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: theme.colors.bgSecondary }]}> 
              <Text style={[styles.statValue, { color: theme.colors.accentGold }]}>{userStats.totalOpeningsPracticed}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Openings Practiced</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: theme.colors.bgSecondary }]}> 
              <Text style={[styles.statValue, { color: theme.colors.accentGold }]}> 
                {userStats.averageAccuracy.toFixed(0)}%
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Avg Accuracy</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: theme.colors.bgSecondary }]}> 
              <View style={styles.streakContainer}>
                <Text style={styles.streakIcon}>🔥</Text>
                <Text style={[styles.statValue, { color: theme.colors.accentGold }]}> 
                  {gamificationData?.currentStreak || userStats.currentStreak}
                </Text>
              </View>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Day Streak</Text>
            </View>
          </View>
        </View>

        {/* Recent Achievements */}
        {gamificationData && unlockedAchievements.length > 0 && (
          <View style={[styles.achievementsCard, { backgroundColor: theme.colors.surfaceCard, borderColor: theme.colors.borderSubtle, ...theme.shadow.soft }]}> 
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Recent Achievements</Text>
            {unlockedAchievements.slice(0, 3).map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                unlocked={true}
                compact={true}
              />
            ))}
            {unlockedAchievements.length > 3 && (
              <Text style={[styles.viewMoreText, { color: theme.colors.textSecondary }]}> 
                +{unlockedAchievements.length - 3} more achievements unlocked
              </Text>
            )}
          </View>
        )}

        {/* Opening Progress List */}
        <View style={[styles.progressCard, { backgroundColor: theme.colors.surfaceCard, borderColor: theme.colors.borderSubtle, ...theme.shadow.soft }]}> 
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Opening Progress</Text>
          {sortedOpenings.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyStateText, { color: theme.colors.textPrimary }]}> 
                No openings practiced yet
              </Text>
              <Text style={[styles.emptyStateSubtext, { color: theme.colors.textSecondary }]}> 
                Start practicing to track your progress!
              </Text>
            </View>
          ) : (
            sortedOpenings.map(({ opening, progress: openingProgress }) => (
              <TouchableOpacity
                key={opening.id}
                style={[styles.openingItem, { borderBottomColor: theme.colors.borderSubtle }]}
                onPress={() => handleOpeningPress(opening)}
                activeOpacity={0.7}
              >
                <View style={styles.openingHeader}>
                  <View style={styles.openingInfo}>
                    <Text style={[styles.openingName, { color: theme.colors.textPrimary }]}>{opening.name}</Text>
                    <Text style={[styles.openingEco, { color: theme.colors.textSecondary }]}>{opening.eco}</Text>
                  </View>
                  {openingProgress?.difficultyRating && (
                    <View
                      style={[
                        styles.ratingBadge,
                        { backgroundColor: getRatingColor(openingProgress.difficultyRating) },
                      ]}
                    >
                      <Text style={styles.ratingText}> 
                        {getRatingLabel(openingProgress.difficultyRating)}
                      </Text>
                    </View>
                  )}
                </View>

                {openingProgress ? (
                  <View style={styles.progressDetails}>
                    <View style={styles.progressRow}>
                      <Text style={[styles.progressLabel, { color: theme.colors.textSecondary }]}>Practiced:</Text>
                      <Text style={[styles.progressValue, { color: theme.colors.textPrimary }]}> 
                        {openingProgress.timesPracticed}x
                      </Text>
                    </View>
                    <View style={styles.progressRow}>
                      <Text style={[styles.progressLabel, { color: theme.colors.textSecondary }]}>Best Accuracy:</Text>
                      <Text style={[styles.progressValue, { color: theme.colors.textPrimary }]}> 
                        {openingProgress.bestAccuracy.toFixed(0)}%
                      </Text>
                    </View>
                    <View style={styles.progressRow}>
                      <Text style={[styles.progressLabel, { color: theme.colors.textSecondary }]}>Avg Accuracy:</Text>
                      <Text style={[styles.progressValue, { color: theme.colors.textPrimary }]}> 
                        {openingProgress.averageAccuracy.toFixed(0)}%
                      </Text>
                    </View>
                    <View style={styles.masteryRow}>
                      <Text style={[styles.progressLabel, { color: theme.colors.textSecondary }]}>Mastery:</Text>
                      <View style={styles.stars}>
                        {renderStars(openingProgress.masteryLevel)}
                      </View>
                    </View>
                  </View>
                ) : (
                  <View style={styles.noProgress}>
                    <Text style={[styles.noProgressText, { color: theme.colors.textMuted }]}>Not practiced yet</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Session History */}
        <View style={[styles.progressCard, { backgroundColor: theme.colors.surfaceCard, borderColor: theme.colors.borderSubtle, ...theme.shadow.soft }]}> 
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Recent Sessions</Text>
          {sessionHistory.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyStateText, { color: theme.colors.textPrimary }]}>No practice sessions yet</Text>
              <Text style={[styles.emptyStateSubtext, { color: theme.colors.textSecondary }]}> 
                Complete a practice session to see your history here
              </Text>
            </View>
          ) : (
            sessionHistory.slice(0, 10).map((session) => (
              <View key={session.sessionId} style={[styles.sessionItem, { borderBottomColor: theme.colors.borderSubtle }]}> 
                <View style={styles.sessionHeader}>
                  <View style={styles.sessionInfo}>
                    <Text style={[styles.sessionOpeningName, { color: theme.colors.textPrimary }]}> 
                      {getOpeningName(session.openingId)}
                    </Text>
                    <Text style={[styles.sessionDate, { color: theme.colors.textSecondary }]}> 
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
                    <Text style={[styles.sessionDetailLabel, { color: theme.colors.textSecondary }]}>Moves:</Text>
                    <Text style={[styles.sessionDetailValue, { color: theme.colors.textPrimary }]}> 
                      {session.correctMoves}/{session.totalMoves}
                    </Text>
                  </View>
                  <View style={styles.sessionDetailRow}>
                    <Text style={[styles.sessionDetailLabel, { color: theme.colors.textSecondary }]}>Duration:</Text>
                    <Text style={[styles.sessionDetailValue, { color: theme.colors.textPrimary }]}> 
                      {formatDuration(session.duration)}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
          {sessionHistory.length > 10 && (
            <Text style={[styles.moreSessionsText, { color: theme.colors.textMuted }]}> 
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
  },
  content: {
    padding: 20,
    paddingTop: 0,
  },
  header: {
    padding: 20,
    paddingTop: 56,
    borderBottomWidth: 1,
    marginBottom: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
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
  },
  xpCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
  },
  statsCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
  },
  achievementsCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statBox: {
    width: '48%',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
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
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  progressCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
  },
  openingItem: {
    borderBottomWidth: 1,
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
    fontWeight: '700',
    marginBottom: 4,
  },
  openingEco: {
    fontSize: 14,
  },
  ratingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '700',
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
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '700',
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
    marginRight: 2,
  },
  noProgress: {
    marginTop: 8,
  },
  noProgressText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  sessionItem: {
    borderBottomWidth: 1,
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
    marginBottom: 4,
  },
  sessionDate: {
    fontSize: 12,
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
    fontWeight: '700',
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
    marginRight: 4,
  },
  sessionDetailValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  moreSessionsText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
