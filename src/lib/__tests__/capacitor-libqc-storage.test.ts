import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: () => false,
    getPlatform: () => 'web'
  }
}));

vi.mock('capacitor-secure-storage-plugin', () => ({
  SecureStoragePlugin: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
    keys: vi.fn()
  }
}));

import { CapacitorLibQCStorage } from '../capacitor-libqc-storage';

describe('CapacitorLibQCStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('stores and reads JSON values in memory on non-native platforms', async () => {
    const storage = new CapacitorLibQCStorage();
    await storage.put('state', { locked: true });
    await expect(storage.get<{ locked: boolean }>('state')).resolves.toEqual({
      locked: true
    });
    await expect(storage.has('state')).resolves.toBe(true);
  });

  it('clears only vault-prefixed keys', async () => {
    const storage = new CapacitorLibQCStorage();
    await storage.put('a', 1);
    await storage.put('b', 2);
    await storage.clear();
    await expect(storage.has('a')).resolves.toBe(false);
    await expect(storage.has('b')).resolves.toBe(false);
  });

  it('does not use localStorage for vault material', async () => {
    const localStorageMock = {
      setItem: vi.fn(),
      getItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      key: vi.fn(),
      length: 0
    };
    vi.stubGlobal('localStorage', localStorageMock);
    const storage = new CapacitorLibQCStorage();
    await storage.put('state', { cipher: 'opaque' });
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
