/**
 * Opening Detail Screen
 * Shows detailed information about an opening and allows starting practice
 */

import React, { useState } from 'react';
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
import { useAppTheme } from '../theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type OpeningDetailRouteProp = RouteProp<RootStackParamList, 'OpeningDetail'>;

export const OpeningDetailScreen: React.FC = () => {
  const route = useRoute<OpeningDetailRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { opening } = route.params;
  const { theme } = useAppTheme();
  const [selectedColor, setSelectedColor] = useState<'white' | 'black'>(
    opening.color || 'white'
  );

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
      style={[styles.container, { backgroundColor: theme.colors.bgPrimary }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={true}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{opening.name}</Text>
        <View style={styles.meta}>
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
          <Text style={[styles.eco, { color: theme.colors.textSecondary }]}>ECO: {opening.eco}</Text>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.surfaceCard, borderColor: theme.colors.borderSubtle }]}> 
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Description</Text>
        <Text style={[styles.description, { color: theme.colors.textSecondary }]}>{opening.description}</Text>
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.surfaceCard, borderColor: theme.colors.borderSubtle }]}> 
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Main Line</Text>
        <View style={[styles.movesContainer, { backgroundColor: theme.colors.bgSecondary }]}> 
          <Text style={[styles.movesText, { color: theme.colors.textPrimary }]}>{formatMoves(opening.mainLine)}</Text>
        </View>
      </View>

      {opening.alternateLines.length > 0 && (
        <View style={[styles.section, { backgroundColor: theme.colors.surfaceCard, borderColor: theme.colors.borderSubtle }]}> 
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}> 
            Variations ({opening.alternateLines.length})
          </Text>
          {opening.alternateLines.map((line, index) => (
            <View key={index} style={[styles.variation, { borderBottomColor: theme.colors.borderSubtle }]}> 
              <Text style={[styles.variationName, { color: theme.colors.textPrimary }]}>{line.name}</Text>
              {line.description && (
                <Text style={[styles.variationDescription, { color: theme.colors.textSecondary }]}>{line.description}</Text>
              )}
              <Text style={[styles.variationMoves, { color: theme.colors.textPrimary }]}> 
                {formatMoves(line.moves)}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={[styles.section, { backgroundColor: theme.colors.surfaceCard, borderColor: theme.colors.borderSubtle }]}> 
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Tags</Text>
        <View style={styles.tags}>
          {opening.tags.map((tag, index) => (
            <View key={index} style={[styles.tag, { backgroundColor: theme.colors.accentGoldMuted }]}> 
              <Text style={[styles.tagText, { color: theme.colors.accentGold }]}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.surfaceCard, borderColor: theme.colors.borderSubtle }]}> 
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Choose Your Side</Text>
        <View style={styles.colorSelector}>
          <TouchableOpacity
            style={[
              styles.colorButton,
              { backgroundColor: theme.colors.bgSecondary, borderColor: 'transparent' },
              selectedColor === 'white' && { backgroundColor: '#E2E8F0', borderColor: theme.colors.info },
            ]}
            onPress={() => setSelectedColor('white')}
          >
            <Text
              style={[
                styles.colorButtonText,
                { color: theme.colors.textSecondary },
                selectedColor === 'white' && { color: '#0F172A', fontWeight: '700' },
              ]}
            >
              White
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.colorButton,
              { backgroundColor: theme.colors.bgSecondary, borderColor: 'transparent' },
              selectedColor === 'black' && { backgroundColor: '#111827', borderColor: theme.colors.info },
            ]}
            onPress={() => setSelectedColor('black')}
          >
            <Text
              style={[
                styles.colorButtonText,
                { color: theme.colors.textSecondary },
                selectedColor === 'black' && { color: '#E2E8F0', fontWeight: '700' },
              ]}
            >
              Black
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.startButton, { backgroundColor: theme.colors.accentGold, ...theme.shadow.soft }]}
        onPress={() =>
          navigation.navigate('Game', {
            opening,
            userColor: selectedColor,
          })
        }
      >
        <Text style={[styles.startButtonText, { color: theme.colors.textOnAccent }]}>Start Practice</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '700',
  },
  eco: {
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  movesContainer: {
    borderRadius: 8,
    padding: 12,
  },
  movesText: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  variation: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  variationName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  variationDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  variationMoves: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  colorSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  colorButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
  },
  colorButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  startButton: {
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
});
