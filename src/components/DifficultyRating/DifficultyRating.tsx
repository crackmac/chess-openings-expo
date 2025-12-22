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
  const getButtonStyle = (rating: 'hard' | 'good' | 'easy') => {
    const isSelected = currentRating === rating;
    switch (rating) {
      case 'hard':
        return [
          styles.button,
          styles.hardButton,
          isSelected && styles.buttonSelected,
        ];
      case 'good':
        return [
          styles.button,
          styles.goodButton,
          isSelected && styles.buttonSelected,
        ];
      case 'easy':
        return [
          styles.button,
          styles.easyButton,
          isSelected && styles.buttonSelected,
        ];
    }
  };

  const getButtonTextStyle = (rating: 'hard' | 'good' | 'easy') => {
    const isSelected = currentRating === rating;
    switch (rating) {
      case 'hard':
        return [styles.buttonText, isSelected && styles.buttonTextSelected];
      case 'good':
        return [styles.buttonText, isSelected && styles.buttonTextSelected];
      case 'easy':
        return [styles.buttonText, isSelected && styles.buttonTextSelected];
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onSkip}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Rate Opening Difficulty</Text>
          {openingName && (
            <Text style={styles.subtitle}>{openingName}</Text>
          )}
          <Text style={styles.description}>
            How difficult was this opening to remember?
          </Text>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={getButtonStyle('hard')}
              onPress={() => onRate('hard')}
              activeOpacity={0.7}
            >
              <Text style={getButtonTextStyle('hard')}>Hard</Text>
              <Text style={styles.buttonHint}>
                Difficult to remember
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={getButtonStyle('good')}
              onPress={() => onRate('good')}
              activeOpacity={0.7}
            >
              <Text style={getButtonTextStyle('good')}>Good</Text>
              <Text style={styles.buttonHint}>
                Manageable with effort
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={getButtonStyle('easy')}
              onPress={() => onRate('easy')}
              activeOpacity={0.7}
            >
              <Text style={getButtonTextStyle('easy')}>Easy</Text>
              <Text style={styles.buttonHint}>
                Easy to remember
              </Text>
            </TouchableOpacity>
          </View>

          {onSkip && (
            <TouchableOpacity
              style={styles.skipButton}
              onPress={onSkip}
            >
              <Text style={styles.skipButtonText}>Skip</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: '#666',
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
    borderColor: 'transparent',
    alignItems: 'center',
  },
  hardButton: {
    backgroundColor: '#ffebee',
    borderColor: '#f44336',
  },
  goodButton: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
  },
  easyButton: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4caf50',
  },
  buttonSelected: {
    borderWidth: 3,
    transform: [{ scale: 1.02 }],
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  buttonTextSelected: {
    fontSize: 20,
  },
  buttonHint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  skipButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipButtonText: {
    fontSize: 14,
    color: '#999',
  },
});

