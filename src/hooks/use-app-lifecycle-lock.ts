import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { useEffect, useRef } from 'react';

type UseAppLifecycleLockInput = {
  onLock: () => void;
};

/**
 * Locks the vault when the iOS app leaves the foreground.
 *
 * Extension popups wiped RAM on close; Capacitor apps stay resident, so
 * background/inactive must call the same lock path as idle timeout
 * (`clearWalletState` → `vault.lock()` → navigate to lock).
 */
export const useAppLifecycleLock = ({ onLock }: UseAppLifecycleLockInput) => {
  const onLockRef = useRef(onLock);

  useEffect(() => {
    onLockRef.current = onLock;
  }, [onLock]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    let wasActive = true;

    const listenerPromise = App.addListener(
      'appStateChange',
      ({ isActive }) => {
        if (wasActive && !isActive) {
          onLockRef.current();
        }
        wasActive = isActive;
      }
    );

    return () => {
      void listenerPromise.then(handle => handle.remove());
    };
  }, []);
};
