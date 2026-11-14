import * as Haptics from 'expo-haptics';
import { setAudioModeAsync } from 'expo-audio';
import { PreferencesTracker } from '../preferences/preferencesTracker';

export type FeedbackEvent =
  | 'move'
  | 'capture'
  | 'check'
  | 'mistake'
  | 'drillComplete';

class SensoryFeedbackService {
  private audioModeConfigured = false;

  private async ensureAudioMode(): Promise<void> {
    if (this.audioModeConfigured) {
      return;
    }

    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
      });
      this.audioModeConfigured = true;
    } catch (error) {
      console.error('Error configuring audio mode:', error);
    }
  }

  private async triggerHaptic(event: FeedbackEvent): Promise<void> {
    switch (event) {
      case 'move':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        return;
      case 'capture':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        return;
      case 'check':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        return;
      case 'mistake':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      case 'drillComplete':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        return;
      default:
        return;
    }
  }

  // Placeholder audio routing for Phase 6.4 - sound files are wired in a later slice.
  private async triggerAudio(): Promise<void> {
    await this.ensureAudioMode();
  }

  async trigger(event: FeedbackEvent): Promise<void> {
    try {
      const preferences = await PreferencesTracker.getPreferences();

      if (preferences.hapticsEnabled) {
        await this.triggerHaptic(event);
      }

      if (preferences.soundEnabled) {
        await this.triggerAudio();
      }
    } catch (error) {
      console.error('Error triggering sensory feedback:', error);
    }
  }
}

export const sensoryFeedback = new SensoryFeedbackService();
