/**
 * Opening Detail Screen
 * Shows detailed information about an opening and allows starting practice
 */

import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type OpeningDetailRouteProp = RouteProp<RootStackParamList, 'OpeningDetail'>;

export const OpeningDetailScreen: React.FC = () => {
  const route = useRoute<OpeningDetailRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { opening } = route.params;
  const [selectedColor, setSelectedColor] = useState<'white' | 'black'>(
    opening.color || 'white'
  );

  // Ensure back button works by setting navigation options
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ paddingLeft: 16, paddingRight: 16 }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={{ fontSize: 16, color: '#2196f3', fontWeight: '600' }}>
            Back
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

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

  const formatMoves = (moves: typeof opening.mainLine) => {
    const formatted: string[] = [];
    let moveNumber = 1;
    let currentPair = '';

    moves.forEach((move, index) => {
      if (move.color === 'white') {
        currentPair = `${moveNumber}. ${move.san}`;
        if (index === moves.length - 1 || moves[index + 1]?.color === 'white') {
          // White move not followed by black move - add "... (any)" to indicate black can play any move
          currentPair += ' ... (any)';
          formatted.push(currentPair);
          moveNumber++;
        }
      } else {
        currentPair += ` ${move.san}`;
        formatted.push(currentPair);
        moveNumber++;
      }
    });

    return formatted.join(' ');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={true}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{opening.name}</Text>
        <View style={styles.meta}>
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
          <Text style={styles.eco}>ECO: {opening.eco}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{opening.description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Main Line</Text>
        <View style={styles.movesContainer}>
          <Text style={styles.movesText}>{formatMoves(opening.mainLine)}</Text>
        </View>
      </View>

      {opening.alternateLines.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Variations ({opening.alternateLines.length})
          </Text>
          {opening.alternateLines.map((line, index) => (
            <View key={index} style={styles.variation}>
              <Text style={styles.variationName}>{line.name}</Text>
              {line.description && (
                <Text style={styles.variationDescription}>{line.description}</Text>
              )}
              <Text style={styles.variationMoves}>
                {formatMoves(line.moves)}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tags</Text>
        <View style={styles.tags}>
          {opening.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Choose Your Side</Text>
        <View style={styles.colorSelector}>
          <TouchableOpacity
            style={[
              styles.colorButton,
              selectedColor === 'white' && styles.colorButtonActive,
            ]}
            onPress={() => setSelectedColor('white')}
          >
            <Text
              style={[
                styles.colorButtonText,
                selectedColor === 'white' && styles.colorButtonTextActive,
              ]}
            >
              White
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.colorButton,
              selectedColor === 'black' && styles.colorButtonActive,
            ]}
            onPress={() => setSelectedColor('black')}
          >
            <Text
              style={[
                styles.colorButtonText,
                selectedColor === 'black' && styles.colorButtonTextActive,
              ]}
            >
              Black
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.startButton}
        onPress={() =>
          navigation.navigate('Game', {
            opening,
            userColor: selectedColor,
          })
        }
      >
        <Text style={styles.startButtonText}>Start Practice</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 12,
  },
  difficultyText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  eco: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  movesContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
  },
  movesText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'monospace',
  },
  variation: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  variationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  variationDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  variationMoves: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'monospace',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#1976d2',
  },
  colorSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  colorButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorButtonActive: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
  },
  colorButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  colorButtonTextActive: {
    color: '#2196f3',
    fontWeight: 'bold',
  },
  startButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

