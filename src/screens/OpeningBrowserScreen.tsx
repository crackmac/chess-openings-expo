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

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type DifficultyFilter = 'all' | 'beginner' | 'intermediate' | 'advanced';

export const OpeningBrowserScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { getOpeningProgress, progress } = useProgress();
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
      openings = openingDatabase.searchOpenings(searchQuery.trim());
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

    // Randomly assign user color (50/50 chance)
    const userColor = Math.random() < 0.5 ? 'white' : 'black';

    // Navigate directly to game
    navigation.navigate('Game', {
      opening: selectedOpening,
      userColor,
    });
  }, [filteredOpenings, progress, navigation, rouletteInstance]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chess Openings</Text>
        <Text style={styles.subtitle}>
          {filteredOpenings.length} opening{filteredOpenings.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, ECO code, or tag..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              difficultyFilter === 'all' && styles.filterButtonActive,
            ]}
            onPress={() => setDifficultyFilter('all')}
          >
            <Text
              style={[
                styles.filterButtonText,
                difficultyFilter === 'all' && styles.filterButtonTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              difficultyFilter === 'beginner' && styles.filterButtonActive,
            ]}
            onPress={() => setDifficultyFilter('beginner')}
          >
            <Text
              style={[
                styles.filterButtonText,
                difficultyFilter === 'beginner' && styles.filterButtonTextActive,
              ]}
            >
              Beginner
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              difficultyFilter === 'intermediate' && styles.filterButtonActive,
            ]}
            onPress={() => setDifficultyFilter('intermediate')}
          >
            <Text
              style={[
                styles.filterButtonText,
                difficultyFilter === 'intermediate' && styles.filterButtonTextActive,
              ]}
            >
              Intermediate
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              difficultyFilter === 'advanced' && styles.filterButtonActive,
            ]}
            onPress={() => setDifficultyFilter('advanced')}
          >
            <Text
              style={[
                styles.filterButtonText,
                difficultyFilter === 'advanced' && styles.filterButtonTextActive,
              ]}
            >
              Advanced
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Random Opening Button */}
      <TouchableOpacity
        style={styles.rouletteButton}
        onPress={handleRoulettePress}
        disabled={filteredOpenings.length === 0}
      >
        <Text style={styles.rouletteIcon}>🎲</Text>
        <Text style={styles.rouletteText}>Random Opening</Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.openingsList}
        contentContainerStyle={styles.openingsListContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#2196f3"
          />
        }
      >
        {/* Recommended for You Section */}
        {recommendedOpenings.length > 0 && (
          <View style={styles.recommendedSection}>
            <View style={styles.recommendedHeader}>
              <Text style={styles.recommendedTitle}>✨ Recommended for You</Text>
              <Text style={styles.recommendedSubtitle}>
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
          <Text style={styles.sectionTitle}>
            {searchQuery || difficultyFilter !== 'all'
              ? 'Search Results'
              : 'All Openings'}
          </Text>
        </View>

        {filteredOpenings.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No openings found</Text>
            <Text style={styles.emptyStateSubtext}>
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  filterContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#2196f3',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  rouletteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rouletteIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  rouletteText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
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
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
  },
  recommendedSection: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendedHeader: {
    marginBottom: 12,
  },
  recommendedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  recommendedSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  allOpeningsSection: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
});

