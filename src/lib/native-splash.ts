import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';

const nativeSplashFadeOutMs = 150;

/**
 * Hides the native iOS launch screen once the first app screen is ready.
 * `capacitor.config.ts` caps how long the splash can stay up, so a boot that
 * never reaches this call still reveals the web view.
 */
export const hideNativeSplash = () => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  void SplashScreen.hide({ fadeOutDuration: nativeSplashFadeOutMs });
};
