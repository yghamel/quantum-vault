import { convertDuration } from '@/lib/time';
import type { ScreenKey } from '@/screens';
import { useEffect, useRef } from 'react';

export const autoBalanceRefreshIntervalMs = convertDuration(30, 's', 'ms');

// Withdraw is excluded so balances don't shift under an in-progress review.
const autoRefreshScreens: ReadonlySet<ScreenKey> = new Set<ScreenKey>([
  'home',
  'vault-detail',
  'account',
  'receive'
]);

export const shouldAutoRefreshBalancesOnScreen = (
  activeScreen: ScreenKey
): boolean => autoRefreshScreens.has(activeScreen);

type VisibilityTarget = {
  readonly visibilityState: DocumentVisibilityState;
  addEventListener(type: 'visibilitychange', listener: () => void): void;
  removeEventListener(type: 'visibilitychange', listener: () => void): void;
};

type AutoBalanceRefreshControllerInput = {
  activeScreen: ScreenKey;
  isVaultUnlocked: () => boolean;
  refreshBalances: () => Promise<void>;
  intervalMs?: number;
  visibilityTarget?: VisibilityTarget;
};

type AutoBalanceRefreshController = {
  dispose: () => void;
};

export const createAutoBalanceRefreshController = ({
  activeScreen,
  isVaultUnlocked,
  refreshBalances,
  intervalMs = autoBalanceRefreshIntervalMs,
  visibilityTarget = document
}: AutoBalanceRefreshControllerInput): AutoBalanceRefreshController => {
  if (!shouldAutoRefreshBalancesOnScreen(activeScreen)) {
    return { dispose: () => undefined };
  }

  let inFlight: Promise<void> | null = null;

  const refreshIfIdle = () => {
    if (
      inFlight !== null ||
      visibilityTarget.visibilityState !== 'visible' ||
      !isVaultUnlocked()
    ) {
      return;
    }

    // Background refreshes stay silent; the manual button reports failures.
    inFlight = refreshBalances()
      .catch(() => undefined)
      .finally(() => {
        inFlight = null;
      });
  };

  const refreshWhenVisible = () => {
    if (visibilityTarget.visibilityState === 'visible') {
      refreshIfIdle();
    }
  };

  const timer = setInterval(refreshIfIdle, intervalMs);
  visibilityTarget.addEventListener('visibilitychange', refreshWhenVisible);

  return {
    dispose: () => {
      clearInterval(timer);
      visibilityTarget.removeEventListener(
        'visibilitychange',
        refreshWhenVisible
      );
    }
  };
};

/**
 * Refreshes vault balances every 30 seconds while an unlocked balance screen
 * is visible, and again whenever the app becomes visible.
 */
export const useAutoBalanceRefresh = ({
  activeScreen,
  isVaultUnlocked,
  refreshBalances
}: Omit<
  AutoBalanceRefreshControllerInput,
  'intervalMs' | 'visibilityTarget'
>) => {
  const isVaultUnlockedRef = useRef(isVaultUnlocked);
  const refreshBalancesRef = useRef(refreshBalances);

  useEffect(() => {
    isVaultUnlockedRef.current = isVaultUnlocked;
    refreshBalancesRef.current = refreshBalances;
  }, [isVaultUnlocked, refreshBalances]);

  useEffect(() => {
    const controller = createAutoBalanceRefreshController({
      activeScreen,
      isVaultUnlocked: () => isVaultUnlockedRef.current(),
      refreshBalances: () => refreshBalancesRef.current()
    });

    return () => {
      controller.dispose();
    };
  }, [activeScreen]);
};
