/**
 * Opening Browser Screen
 * Browse and search chess openings by difficulty
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OpeningCard } from '../components/OpeningCard/OpeningCard';
import { OpeningDatabase } from '../services/chess/openingDatabase';
import { allOpenings } from '../data/openings';
import { Opening } from '../types';
import { useProgress } from '../hooks/useProgress';
import { RootStackParamList } from '../navigation/AppNavigator';
import { OpeningRoulette } from '../services/gamification/openingRoulette';
import { useAppTheme } from '../theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type DifficultyFilter = 'all' | 'beginner' | 'intermediate' | 'advanced';

export const OpeningBrowserScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { getOpeningProgress, progress } = useProgress();
  const { theme } = useAppTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] =
    useState<DifficultyFilter>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [rouletteInstance] = useState(() => new OpeningRoulette());
  const [openingDatabase] = useState(() => {
    const db = new OpeningDatabase();
    db.loadOpenings(allOpenings);
    return db;
  });

  const filteredOpenings = useMemo(() => {
    let openings = allOpenings;

    // Filter by difficulty
    if (difficultyFilter !== 'all') {
      openings = openingDatabase.getOpeningsByDifficulty(difficultyFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      openings = openings.filter((opening) =>
        opening.name.toLowerCase().includes(query) ||
        opening.eco.toLowerCase().includes(query) ||
        opening.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return openings;
  }, [searchQuery, difficultyFilter, openingDatabase]);

  // Calculate recommended openings (top 10 weighted by difficulty rating)
  // Independent of search/filter - always shows intelligent selection from ALL openings
  const recommendedOpenings = useMemo(() => {
    return rouletteInstance.selectTopOpenings(10, allOpenings, progress);
  }, [rouletteInstance, progress, refreshKey]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Force recalculation by updating refresh key
    // This triggers useMemo to select a new random set
    await new Promise(resolve => setTimeout(resolve, 500));
    setRefreshKey(prev => prev + 1);
    setRefreshing(false);
  }, []);

  const handleOpeningPress = (opening: Opening) => {
    navigation.navigate('OpeningDetail', { opening });
  };

  const handleRoulettePress = useCallback(() => {
    if (filteredOpenings.length === 0) {
      return;
    }

    const selectedOpening = rouletteInstance.selectOpening(filteredOpenings, progress);

    navigation.navigate('Game', {
      opening: selectedOpening,
      userColor: selectedOpening.color,
    });
  }, [filteredOpenings, progress, navigation, rouletteInstance]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bgPrimary }]}> 
      <View style={[styles.header, { backgroundColor: theme.colors.bgSecondary, borderBottomColor: theme.colors.borderSubtle }]}> 
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Chess Openings</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}> 
          {filteredOpenings.length} opening{filteredOpenings.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: theme.colors.bgSecondary, borderBottomColor: theme.colors.borderSubtle }]}> 
        <TextInput
          style={[styles.searchInput, { backgroundColor: theme.colors.bgElevated, color: theme.colors.textPrimary }]}
          placeholder="Search by name, ECO code, or tag..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={theme.colors.textMuted}
        />
      </View>

      <View style={[styles.filterContainer, { backgroundColor: theme.colors.bgSecondary, borderBottomColor: theme.colors.borderSubtle }]}> 
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              { backgroundColor: theme.colors.bgElevated },
              difficultyFilter === 'all' && { backgroundColor: theme.colors.accentGold },
            ]}
            onPress={() => setDifficultyFilter('all')}
          >
            <Text
              style={[
                styles.filterButtonText,
                { color: theme.colors.textSecondary },
                difficultyFilter === 'all' && { color: theme.colors.textOnAccent },
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              { backgroundColor: theme.colors.bgElevated },
              difficultyFilter === 'beginner' && { backgroundColor: theme.colors.beginner },
            ]}
            onPress={() => setDifficultyFilter('beginner')}
          >
            <Text
              style={[
                styles.filterButtonText,
                { color: theme.colors.textSecondary },
                difficultyFilter === 'beginner' && { color: theme.colors.textOnAccent },
              ]}
            >
              Beginner
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              { backgroundColor: theme.colors.bgElevated },
              difficultyFilter === 'intermediate' && { backgroundColor: theme.colors.intermediate },
            ]}
            onPress={() => setDifficultyFilter('intermediate')}
          >
            <Text
              style={[
                styles.filterButtonText,
                { color: theme.colors.textSecondary },
                difficultyFilter === 'intermediate' && { color: theme.colors.textOnAccent },
              ]}
            >
              Intermediate
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              { backgroundColor: theme.colors.bgElevated },
              difficultyFilter === 'advanced' && { backgroundColor: theme.colors.advanced },
            ]}
            onPress={() => setDifficultyFilter('advanced')}
          >
            <Text
              style={[
                styles.filterButtonText,
                { color: theme.colors.textSecondary },
                difficultyFilter === 'advanced' && { color: theme.colors.textOnAccent },
              ]}
            >
              Advanced
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Random Opening Button */}
      <TouchableOpacity
        style={[styles.rouletteButton, { backgroundColor: theme.colors.accentGold, ...theme.shadow.soft }]}
        onPress={handleRoulettePress}
        disabled={filteredOpenings.length === 0}
      >
        <Text style={[styles.rouletteIcon, { color: theme.colors.textOnAccent }]}>♞</Text>
        <Text style={[styles.rouletteText, { color: theme.colors.textOnAccent }]}>Quick Drill</Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.openingsList}
        contentContainerStyle={styles.openingsListContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.accentGold}
          />
        }
      >
        {/* Recommended for You Section */}
        {recommendedOpenings.length > 0 && (
          <View style={[styles.recommendedSection, { backgroundColor: theme.colors.surfaceCard, borderColor: theme.colors.borderSubtle, ...theme.shadow.soft }]}> 
            <View style={styles.recommendedHeader}>
              <Text style={[styles.recommendedTitle, { color: theme.colors.textPrimary }]}>Recommended for You</Text>
              <Text style={[styles.recommendedSubtitle, { color: theme.colors.textSecondary }]}> 
                Intelligent selection based on your progress
              </Text>
            </View>
            {recommendedOpenings.map((opening) => (
              <OpeningCard
                key={opening.id}
                opening={opening}
                onPress={() => handleOpeningPress(opening)}
                progress={getOpeningProgress(opening.id)}
              />
            ))}
          </View>
        )}

        {/* All Openings Section */}
        <View style={styles.allOpeningsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}> 
            {searchQuery || difficultyFilter !== 'all'
              ? 'Search Results'
              : 'All Openings'}
          </Text>
        </View>

        {filteredOpenings.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: theme.colors.textPrimary }]}>No openings found</Text>
            <Text style={[styles.emptyStateSubtext, { color: theme.colors.textMuted }]}> 
              Try adjusting your search or filter
            </Text>
          </View>
        ) : (
          filteredOpenings.map((opening) => (
            <OpeningCard
              key={opening.id}
              opening={opening}
              onPress={() => handleOpeningPress(opening)}
              progress={getOpeningProgress(opening.id)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 56,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
  },
  searchInput: {
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  filterContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  rouletteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  rouletteIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  rouletteText: {
    fontSize: 18,
    fontWeight: '700',
  },
  openingsList: {
    flex: 1,
  },
  openingsListContent: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
  },
  recommendedSection: {
    marginBottom: 24,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  recommendedHeader: {
    marginBottom: 12,
  },
  recommendedTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  recommendedSubtitle: {
    fontSize: 13,
    marginBottom: 12,
  },
  allOpeningsSection: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
});
