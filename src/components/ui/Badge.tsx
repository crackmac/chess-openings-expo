import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { useAppTheme } from '../../theme';

type BadgeTone =
  | 'neutral'
  | 'accent'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'traps';

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const toneStyles = {
  neutral: { background: 'bgElevated', text: 'textSecondary' },
  accent: { background: 'accentGoldMuted', text: 'accentGold' },
  info: { background: 'bgElevated', text: 'info' },
  success: { background: 'bgElevated', text: 'success' },
  warning: { background: 'bgElevated', text: 'warning' },
  danger: { background: 'bgElevated', text: 'danger' },
  beginner: { background: 'bgElevated', text: 'beginner' },
  intermediate: { background: 'bgElevated', text: 'intermediate' },
  advanced: { background: 'bgElevated', text: 'advanced' },
  traps: { background: 'bgElevated', text: 'traps' },
} as const;

export const Badge: React.FC<BadgeProps> = ({ label, tone = 'neutral', style, textStyle }) => {
  const { theme } = useAppTheme();
  const palette = toneStyles[tone];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: theme.colors[palette.background],
          borderColor: theme.colors.borderSubtle,
          borderRadius: theme.radius.pill,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          {
            color: theme.colors[palette.text],
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
});
