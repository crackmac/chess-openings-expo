import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../../theme';

interface SegmentItem {
  id: string;
  label: string;
}

interface SegmentedPillsProps {
  items: SegmentItem[];
  selectedId: string;
  onChange: (id: string) => void;
}

export const SegmentedPills: React.FC<SegmentedPillsProps> = ({
  items,
  selectedId,
  onChange,
}) => {
  const { theme } = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: theme.colors.borderSubtle,
          backgroundColor: theme.colors.bgSecondary,
          borderRadius: theme.radius.pill,
        },
      ]}
    >
      {items.map((item) => {
        const isSelected = item.id === selectedId;

        return (
          <Pressable
            key={item.id}
            onPress={() => onChange(item.id)}
            style={[
              styles.pill,
              {
                backgroundColor: isSelected ? theme.colors.accentGoldMuted : 'transparent',
                borderRadius: theme.radius.pill,
              },
            ]}
          >
            <Text
              style={[
                styles.label,
                {
                  color: isSelected ? theme.colors.accentGold : theme.colors.textSecondary,
                },
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: 1,
    padding: 3,
    alignSelf: 'flex-start',
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
});
