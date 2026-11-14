import React from 'react';
import { View, StyleSheet, Text, Switch, ScrollView } from 'react-native';
import { usePreferences } from '../hooks/usePreferences';
import { useAppTheme } from '../theme';

export const SettingsScreen: React.FC = () => {
  const { preferences, updatePreferences, loading } = usePreferences();
  const { theme } = useAppTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.bgPrimary }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Settings</Text>

      <View style={[styles.section, { backgroundColor: theme.colors.bgElevated, borderColor: theme.colors.borderSubtle }]}> 
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Feedback</Text>

        <View style={styles.row}>
          <View style={styles.rowTextGroup}>
            <Text style={[styles.rowTitle, { color: theme.colors.textPrimary }]}>Haptics</Text>
            <Text style={[styles.rowSubtitle, { color: theme.colors.textSecondary }]}>Vibration feedback for moves and outcomes</Text>
          </View>
          <Switch
            value={preferences.hapticsEnabled}
            disabled={loading}
            onValueChange={(value) => {
              void updatePreferences({ hapticsEnabled: value });
            }}
            trackColor={{ false: theme.colors.borderSubtle, true: theme.colors.accentGold }}
            thumbColor={preferences.hapticsEnabled ? theme.colors.textOnAccent : theme.colors.white}
          />
        </View>

        <View style={[styles.separator, { backgroundColor: theme.colors.borderSubtle }]} />

        <View style={styles.row}>
          <View style={styles.rowTextGroup}>
            <Text style={[styles.rowTitle, { color: theme.colors.textPrimary }]}>Sound</Text>
            <Text style={[styles.rowSubtitle, { color: theme.colors.textSecondary }]}>Move, capture, check, and completion audio</Text>
          </View>
          <Switch
            value={preferences.soundEnabled}
            disabled={loading}
            onValueChange={(value) => {
              void updatePreferences({ soundEnabled: value });
            }}
            trackColor={{ false: theme.colors.borderSubtle, true: theme.colors.accentGold }}
            thumbColor={preferences.soundEnabled ? theme.colors.textOnAccent : theme.colors.white}
          />
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.bgElevated, borderColor: theme.colors.borderSubtle }]}> 
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Appearance (Coming Soon)</Text>
        <Text style={[styles.comingSoonText, { color: theme.colors.textSecondary }]}>Board Theme and Piece Set selectors will land in Phase 9.</Text>
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.bgElevated, borderColor: theme.colors.borderSubtle }]}> 
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Premium (Coming Soon)</Text>
        <Text style={[styles.comingSoonText, { color: theme.colors.textSecondary }]}>Restore Purchases and premium access controls will land in Phase 8.</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  section: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowTextGroup: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  rowSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  separator: {
    height: 1,
    marginVertical: 12,
  },
  comingSoonText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
