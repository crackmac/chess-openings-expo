import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppPreferences, DEFAULT_PREFERENCES } from '../../types/preferences';

const PREFERENCES_STORAGE_KEY = '@chess_openings:preferences';

export class PreferencesTracker {
  static async getPreferences(): Promise<AppPreferences> {
    try {
      const data = await AsyncStorage.getItem(PREFERENCES_STORAGE_KEY);
      if (!data) {
        return { ...DEFAULT_PREFERENCES };
      }

      const parsed = JSON.parse(data) as Partial<AppPreferences>;
      return {
        ...DEFAULT_PREFERENCES,
        ...parsed,
      };
    } catch (error) {
      console.error('Error loading preferences:', error);
      return { ...DEFAULT_PREFERENCES };
    }
  }

  static async savePreferences(preferences: AppPreferences): Promise<void> {
    try {
      await AsyncStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving preferences:', error);
      throw error;
    }
  }

  static async updatePreferences(updates: Partial<AppPreferences>): Promise<AppPreferences> {
    const current = await this.getPreferences();
    const next = {
      ...current,
      ...updates,
    };
    await this.savePreferences(next);
    return next;
  }

  static async resetPreferences(): Promise<AppPreferences> {
    const defaults = { ...DEFAULT_PREFERENCES };
    await this.savePreferences(defaults);
    return defaults;
  }
}
