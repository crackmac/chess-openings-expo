import { useCallback, useEffect, useState } from 'react';
import { AppPreferences, DEFAULT_PREFERENCES } from '../types/preferences';
import { PreferencesTracker } from '../services/preferences/preferencesTracker';

interface UsePreferencesReturn {
  preferences: AppPreferences;
  loading: boolean;
  refreshPreferences: () => Promise<void>;
  updatePreferences: (updates: Partial<AppPreferences>) => Promise<void>;
}

export const usePreferences = (): UsePreferencesReturn => {
  const [preferences, setPreferences] = useState<AppPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);

  const refreshPreferences = useCallback(async () => {
    setLoading(true);
    const next = await PreferencesTracker.getPreferences();
    setPreferences(next);
    setLoading(false);
  }, []);

  const updatePreferences = useCallback(async (updates: Partial<AppPreferences>) => {
    const next = await PreferencesTracker.updatePreferences(updates);
    setPreferences(next);
  }, []);

  useEffect(() => {
    refreshPreferences();
  }, [refreshPreferences]);

  return {
    preferences,
    loading,
    refreshPreferences,
    updatePreferences,
  };
};
