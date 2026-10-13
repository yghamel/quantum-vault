import { sessionTimeoutMs } from '@/lib/session';
import type { ScreenKey } from '@/screens';
import { useEffect, useRef } from 'react';

export const vaultSessionStateChangedEventName =
  'p11:vault-session-state-changed';

const activityEvents: ReadonlyArray<keyof WindowEventMap> = [
  'mousedown',
  'keydown',
  'touchstart',
  'scroll'
];

type SessionTrackingPolicy = 'always' | 'when-unlocked' | 'never';
const untrackedSessionPolicy: SessionTrackingPolicy = 'never';

const screenSessionTrackingPolicy: Record<ScreenKey, SessionTrackingPolicy> = {
  initial: untrackedSessionPolicy,
  onboarding: untrackedSessionPolicy,
  lock: untrackedSessionPolicy,
  'vault-withdraw': 'always',
  'legal-document': 'when-unlocked',
  'wallet-recovery': 'always',
  home: 'always',
  'vault-detail': 'always',
  receive: 'always',
  settings: 'always',
  'settings-currency': 'always',
  'settings-lock-wallet': 'always',
  'settings-delete-wallet': 'always',
  'export-recovery-phrase': 'always',
  'wallet-creation': 'when-unlocked'
};

const sessionTrackingEvaluators: Record<
  SessionTrackingPolicy,
  (isVaultUnlocked: boolean) => boolean
> = {
  always: () => true,
  'when-unlocked': isVaultUnlocked => isVaultUnlocked,
  never: () => false
};

type UseSessionTimeoutInput = {
  activeScreen: ScreenKey;
  isVaultUnlocked: () => boolean;
  onTimeout: () => void;
};

export const notifyVaultSessionStateChanged = () => {
  window.dispatchEvent(new Event(vaultSessionStateChangedEventName));
};

let activeSessionHoldCount = 0;

/**
 * Defers idle lock while an operation that must not be interrupted (a
 * withdrawal broadcast) is in flight. A timeout that expires during a hold is
 * dropped; releasing the hold restarts a full idle window.
 */
export const holdSessionTimeout = (): (() => void) => {
  activeSessionHoldCount += 1;
  let isReleased = false;

  return () => {
    if (isReleased) {
      return;
    }
    isReleased = true;
    activeSessionHoldCount -= 1;
    notifyVaultSessionStateChanged();
  };
};

export const isSessionTimeoutHeld = (): boolean => activeSessionHoldCount > 0;

type SessionTimeoutEventTarget = {
  addEventListener(
    type: string,
    listener: EventListener,
    options?: AddEventListenerOptions
  ): void;
  removeEventListener(type: string, listener: EventListener): void;
};

type SessionTimeoutControllerInput = {
  activeScreen: ScreenKey;
  eventTarget?: SessionTimeoutEventTarget;
  isVaultUnlocked: () => boolean;
  onTimeout: () => void;
};

type SessionTimeoutController = {
  dispose: () => void;
};

export const shouldTrackSessionForScreen = ({
  activeScreen,
  isVaultUnlocked
}: {
  activeScreen: ScreenKey;
  isVaultUnlocked: boolean;
}): boolean =>
  sessionTrackingEvaluators[screenSessionTrackingPolicy[activeScreen]](
    isVaultUnlocked
  );

export const createSessionTimeoutController = ({
  activeScreen,
  eventTarget = window,
  isVaultUnlocked,
  onTimeout
}: SessionTimeoutControllerInput): SessionTimeoutController => {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const clearTimer = () => {
    if (timer === null) {
      return;
    }

    clearTimeout(timer);
    timer = null;
  };

  if (screenSessionTrackingPolicy[activeScreen] === untrackedSessionPolicy) {
    clearTimer();
    return { dispose: clearTimer };
  }

  const shouldTrackSession = () =>
    shouldTrackSessionForScreen({
      activeScreen,
      isVaultUnlocked: isVaultUnlocked()
    });

  const scheduleTimeout = () => {
    clearTimer();
    timer = setTimeout(() => {
      timer = null;
      if (isSessionTimeoutHeld()) {
        return;
      }
      onTimeout();
    }, sessionTimeoutMs);
  };

  const syncTimerWithSessionState = () => {
    if (!shouldTrackSession()) {
      clearTimer();
      return;
    }

    if (timer === null) {
      scheduleTimeout();
    }
  };

  const resetTimerFromActivity = () => {
    if (!shouldTrackSession()) {
      clearTimer();
      return;
    }

    scheduleTimeout();
  };

  syncTimerWithSessionState();

  for (const event of activityEvents) {
    eventTarget.addEventListener(event, resetTimerFromActivity, {
      passive: true
    });
  }
  eventTarget.addEventListener(
    vaultSessionStateChangedEventName,
    syncTimerWithSessionState
  );

  return {
    dispose: () => {
      clearTimer();

      for (const event of activityEvents) {
        eventTarget.removeEventListener(event, resetTimerFromActivity);
      }
      eventTarget.removeEventListener(
        vaultSessionStateChangedEventName,
        syncTimerWithSessionState
      );
    }
  };
};

/**
 * Locks the wallet after 10 minutes of inactivity.
 * Active on security-sensitive screens as defined by
 * `screenSessionTrackingPolicy`. User interaction resets the timer.
 */
export const useSessionTimeout = ({
  activeScreen,
  isVaultUnlocked,
  onTimeout
}: UseSessionTimeoutInput) => {
  const onTimeoutRef = useRef(onTimeout);
  const isVaultUnlockedRef = useRef(isVaultUnlocked);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  useEffect(() => {
    isVaultUnlockedRef.current = isVaultUnlocked;
  }, [isVaultUnlocked]);

  useEffect(() => {
    // Keep controller creation keyed only by `activeScreen`; refs provide
    // latest callbacks without resetting the inactivity timer every render.
    const controller = createSessionTimeoutController({
      activeScreen,
      isVaultUnlocked: () => isVaultUnlockedRef.current(),
      onTimeout: () => onTimeoutRef.current()
    });

    return () => {
      controller.dispose();
    };
  }, [activeScreen]);
};
