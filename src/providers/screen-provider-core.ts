import { match } from '@/lib/match';
import type { ScreenKey } from '@/screens';

import type { WalletHydrationState } from './wallet-queries';

/** Only an existing password makes the lock screen a usable destination. */
export const resolveScreenAfterSessionEnd = ({
  hasPassword,
  isOnboardingSeen
}: {
  hasPassword: boolean;
  isOnboardingSeen: boolean;
}): ScreenKey => {
  if (hasPassword) {
    return 'lock';
  }

  return isOnboardingSeen ? 'initial' : 'onboarding';
};

export const resolveHydrationScreen = ({
  hydrationState,
  isOnboardingSeen
}: {
  hydrationState: WalletHydrationState;
  isOnboardingSeen: boolean;
}): ScreenKey => {
  if (hydrationState.kind === 'no-password') {
    return isOnboardingSeen ? 'initial' : 'onboarding';
  }

  // Launch offers Log In alongside Create / Recover instead of jumping
  // straight to the password prompt.
  if (hydrationState.kind === 'locked') {
    return 'initial';
  }

  return match(hydrationState.initWalletResult, {
    ready: () => 'home',
    degraded: () => 'home',
    ignored: () => 'lock'
  });
};
