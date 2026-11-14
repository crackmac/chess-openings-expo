/**
 * Difficulty Rating Component
 * Anki-style rating buttons for opening difficulty
 */

import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useAppTheme } from '../../theme';

interface DifficultyRatingProps {
  visible: boolean;
  currentRating?: 'hard' | 'good' | 'easy';
  onRate: (rating: 'hard' | 'good' | 'easy') => void;
  onSkip?: () => void;
  openingName?: string;
}

export const DifficultyRating: React.FC<DifficultyRatingProps> = ({
  visible,
  currentRating,
  onRate,
  onSkip,
  openingName,
}) => {
  const { theme } = useAppTheme();

  const getButtonStyle = (rating: 'hard' | 'good' | 'easy') => {
    const isSelected = currentRating === rating;
    switch (rating) {
      case 'hard':
        return [
          styles.button,
          { backgroundColor: 'rgba(239, 68, 68, 0.16)', borderColor: theme.colors.danger },
          isSelected && styles.buttonSelected,
        ];
      case 'good':
        return [
          styles.button,
          { backgroundColor: 'rgba(74, 158, 255, 0.18)', borderColor: theme.colors.info },
          isSelected && styles.buttonSelected,
        ];
      case 'easy':
        return [
          styles.button,
          { backgroundColor: 'rgba(46, 204, 113, 0.16)', borderColor: theme.colors.success },
          isSelected && styles.buttonSelected,
        ];
    }
  };

  const getButtonTextStyle = (rating: 'hard' | 'good' | 'easy') => {
    const isSelected = currentRating === rating;
    return [
      styles.buttonText,
      { color: theme.colors.textPrimary },
      isSelected && styles.buttonTextSelected,
    ];
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onSkip}
    >
      <View style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}> 
        <View style={[styles.container, { backgroundColor: theme.colors.bgSecondary, borderColor: theme.colors.borderSubtle }]}> 
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Rate Recall</Text>
          {openingName && (
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{openingName}</Text>
          )}
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}> 
            How difficult was this opening to remember?
          </Text>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={getButtonStyle('hard')}
              onPress={() => onRate('hard')}
              activeOpacity={0.7}
            >
              <Text style={getButtonTextStyle('hard')}>Hard</Text>
              <Text style={[styles.buttonHint, { color: theme.colors.textSecondary }]}> 
                Difficult to remember
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={getButtonStyle('good')}
              onPress={() => onRate('good')}
              activeOpacity={0.7}
            >
              <Text style={getButtonTextStyle('good')}>Good</Text>
              <Text style={[styles.buttonHint, { color: theme.colors.textSecondary }]}> 
                Manageable with effort
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={getButtonStyle('easy')}
              onPress={() => onRate('easy')}
              activeOpacity={0.7}
            >
              <Text style={getButtonTextStyle('easy')}>Easy</Text>
              <Text style={[styles.buttonHint, { color: theme.colors.textSecondary }]}> 
                Easy to remember
              </Text>
            </TouchableOpacity>
          </View>

          {onSkip && (
            <TouchableOpacity
              style={styles.skipButton}
              onPress={onSkip}
            >
              <Text style={[styles.skipButtonText, { color: theme.colors.textMuted }]}>Skip</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonsContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  buttonSelected: {
    borderWidth: 3,
    transform: [{ scale: 1.02 }],
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  buttonTextSelected: {
    fontSize: 20,
  },
  buttonHint: {
    fontSize: 12,
    textAlign: 'center',
  },
  skipButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipButtonText: {
    fontSize: 14,
  },
});
