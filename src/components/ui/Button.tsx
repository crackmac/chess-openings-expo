import React from 'react';
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import { useAppTheme } from '../../theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'icon';

interface ButtonProps {
  label: string;
  variant?: ButtonVariant;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  variant = 'primary',
  onPress,
  disabled = false,
  loading = false,
  style,
}) => {
  const { theme } = useAppTheme();

  const palette = {
    primary: {
      background: theme.colors.accentGold,
      text: theme.colors.textOnAccent,
      border: theme.colors.accentGold,
    },
    secondary: {
      background: theme.colors.info,
      text: theme.colors.white,
      border: theme.colors.info,
    },
    ghost: {
      background: 'transparent',
      text: theme.colors.textPrimary,
      border: theme.colors.borderSubtle,
    },
    icon: {
      background: theme.colors.bgElevated,
      text: theme.colors.textPrimary,
      border: theme.colors.borderSubtle,
    },
  }[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: palette.background,
          borderColor: palette.border,
          borderRadius: variant === 'icon' ? theme.radius.pill : theme.radius.md,
          opacity: disabled ? 0.45 : pressed ? 0.82 : 1,
          minWidth: variant === 'icon' ? 44 : 120,
          paddingHorizontal: variant === 'icon' ? 12 : 16,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={palette.text} />
      ) : (
        <Text style={[styles.label, { color: palette.text }]}>{label}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    paddingVertical: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
  },
});
