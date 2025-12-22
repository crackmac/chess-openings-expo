/**
 * Opening Browser Screen
 * Browse and search chess openings by difficulty
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OpeningCard } from '../components/OpeningCard/OpeningCard';
import { OpeningDatabase } from '../services/chess/openingDatabase';
import { allOpenings } from '../data/openings';
import { Opening } from '../types';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type DifficultyFilter = 'all' | 'beginner' | 'intermediate' | 'advanced';

export const OpeningBrowserScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] =
    useState<DifficultyFilter>('all');
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

  const handleOpeningPress = (opening: Opening) => {
    navigation.navigate('OpeningDetail', { opening });
  };

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

      <ScrollView
        style={styles.openingsList}
        contentContainerStyle={styles.openingsListContent}
      >
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
});

