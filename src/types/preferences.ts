export interface AppPreferences {
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  boardThemeId: string;
  pieceSetId: string;
}

export const DEFAULT_PREFERENCES: AppPreferences = {
  hapticsEnabled: true,
  soundEnabled: true,
  boardThemeId: 'classic-walnut',
  pieceSetId: 'staunton-classic',
};
