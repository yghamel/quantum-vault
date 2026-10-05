import { Capacitor } from '@capacitor/core';

import { hasSeenOnboarding } from './onboarding';

const installMarkerStorageKey = 'quantum-vault-native-install-marker';
const installMarkerValue = '1';

export type ClearableVaultStorage = {
  clear(): Promise<void>;
};

type InstallStorage = Pick<Storage, 'getItem' | 'setItem'>;

/**
 * Keychain items survive app deletion but WebView localStorage does not, so a
 * native launch with neither the install marker nor the onboarding flag is a
 * reinstall sitting on an orphaned vault. Every vault owner has seen
 * onboarding, which keeps installs that predate the marker intact.
 */
export const reconcileVaultStorageOnFreshInstall = async ({
  vaultStorage,
  isNativePlatform = Capacitor.isNativePlatform(),
  getInstallStorage = () => localStorage
}: {
  vaultStorage: ClearableVaultStorage;
  isNativePlatform?: boolean;
  getInstallStorage?: () => InstallStorage;
}): Promise<{ clearedOrphanedVault: boolean }> => {
  if (!isNativePlatform) {
    return { clearedOrphanedVault: false };
  }

  const installStorage = getInstallStorage();
  const isKnownInstall =
    installStorage.getItem(installMarkerStorageKey) === installMarkerValue ||
    hasSeenOnboarding(installStorage);

  if (!isKnownInstall) {
    await vaultStorage.clear();
  }
  installStorage.setItem(installMarkerStorageKey, installMarkerValue);

  return { clearedOrphanedVault: !isKnownInstall };
};
