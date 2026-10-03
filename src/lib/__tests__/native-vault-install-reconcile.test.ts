import { describe, expect, it, vi } from 'vitest';

vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: () => false }
}));

import { reconcileVaultStorageOnFreshInstall } from '../native-vault-install-reconcile';

const createInstallStorage = (initial: Record<string, string> = {}) => {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    }
  };
};

describe('reconcileVaultStorageOnFreshInstall', () => {
  it('clears an orphaned vault once on a fresh native install', async () => {
    const vaultStorage = { clear: vi.fn(async () => {}) };
    const installStorage = createInstallStorage();
    const reconcile = () =>
      reconcileVaultStorageOnFreshInstall({
        vaultStorage,
        isNativePlatform: true,
        getInstallStorage: () => installStorage
      });

    await expect(reconcile()).resolves.toEqual({ clearedOrphanedVault: true });
    await expect(reconcile()).resolves.toEqual({
      clearedOrphanedVault: false
    });
    expect(vaultStorage.clear).toHaveBeenCalledTimes(1);
  });

  it('keeps the vault for installs that predate the marker', async () => {
    const vaultStorage = { clear: vi.fn(async () => {}) };

    const result = await reconcileVaultStorageOnFreshInstall({
      vaultStorage,
      isNativePlatform: true,
      getInstallStorage: () =>
        createInstallStorage({ 'quantum-vault-onboarding-seen': '1' })
    });

    expect(result).toEqual({ clearedOrphanedVault: false });
    expect(vaultStorage.clear).not.toHaveBeenCalled();
  });

  it('leaves the marker unset when clearing fails so the next launch retries', async () => {
    const installStorage = createInstallStorage();
    const vaultStorage = {
      clear: vi.fn(async () => {
        throw new Error('keychain unavailable');
      })
    };
    const reconcile = () =>
      reconcileVaultStorageOnFreshInstall({
        vaultStorage,
        isNativePlatform: true,
        getInstallStorage: () => installStorage
      });

    await expect(reconcile()).rejects.toThrow('keychain unavailable');
    await expect(reconcile()).rejects.toThrow('keychain unavailable');
    expect(vaultStorage.clear).toHaveBeenCalledTimes(2);
  });

  it('does nothing off native', async () => {
    const vaultStorage = { clear: vi.fn(async () => {}) };
    const getInstallStorage = vi.fn(createInstallStorage);

    const result = await reconcileVaultStorageOnFreshInstall({
      vaultStorage,
      getInstallStorage
    });

    expect(result).toEqual({ clearedOrphanedVault: false });
    expect(vaultStorage.clear).not.toHaveBeenCalled();
    expect(getInstallStorage).not.toHaveBeenCalled();
  });
});
