import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { useEffect, useState } from 'react';

/**
 * Full-screen privacy cover shown while the app is inactive so iOS
 * app-switcher snapshots do not reveal balances, addresses, or recovery UI.
 */
export const PrivacyCover = () => {
  const [isCovered, setIsCovered] = useState(false);

  useEffect(() => {
    const show = () => setIsCovered(true);
    const hide = () => setIsCovered(false);

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        show();
      } else {
        hide();
      }
    };

    document.addEventListener('visibilitychange', onVisibility);

    let removeCapacitorListener: (() => void) | undefined;
    if (Capacitor.isNativePlatform()) {
      void App.addListener('appStateChange', ({ isActive }) => {
        if (isActive) {
          hide();
        } else {
          show();
        }
      }).then(handle => {
        removeCapacitorListener = () => {
          void handle.remove();
        };
      });
    }

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      removeCapacitorListener?.();
    };
  }, []);

  if (!isCovered) {
    return null;
  }

  return (
    <div
      aria-hidden='true'
      data-testid='privacy-cover'
      className='fixed inset-0 z-100 flex items-center justify-center bg-background'
    >
      <p className='text-2xl text-foreground'>Quantum Vault</p>
    </div>
  );
};
