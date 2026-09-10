import type { LibQCStorage } from '@project-eleven/libqc';
import { Capacitor } from '@capacitor/core';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

const LIBQC_STORAGE_PREFIX = 'vault_';

/**
 * Capacitor / iOS Keychain-backed `LibQCStorage`.
 *
 * Implements the libqc storage seam without modifying libqc. Values are opaque
 * JSON from libqc's perspective (encryption happens in the SDK state layer).
 *
 * Production iOS: Keychain via `capacitor-secure-storage-plugin`.
 * Non-native (unit tests / Vite web preview): in-memory Map only — never
 * silently persist vault material to `localStorage` in this adapter.
 */
export class CapacitorLibQCStorage implements LibQCStorage {
  private readonly prefix: string;
  private readonly memory = new Map<string, string>();
  private readonly useNativeSecureStorage: boolean;

  constructor(prefix = LIBQC_STORAGE_PREFIX) {
    this.prefix = prefix;
    this.useNativeSecureStorage = Capacitor.isNativePlatform();
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  async get<V>(key: string): Promise<V | null> {
    const storageKey = this.getKey(key);
    try {
      const raw = this.useNativeSecureStorage
        ? await this.nativeGet(storageKey)
        : (this.memory.get(storageKey) ?? null);

      if (raw === null) {
        return null;
      }

      return JSON.parse(raw) as V;
    } catch (error) {
      throw new Error(
        `Error getting key from secure storage: ${String(error)}`
      );
    }
  }

  async put<V>(key: string, value: V): Promise<void> {
    const storageKey = this.getKey(key);
    try {
      const serialized = JSON.stringify(value);
      if (this.useNativeSecureStorage) {
        await SecureStoragePlugin.set({ key: storageKey, value: serialized });
        return;
      }
      this.memory.set(storageKey, serialized);
    } catch (error) {
      throw new Error(
        `Failed to store value in secure storage: ${String(error)}`
      );
    }
  }

  async delete(key: string): Promise<void> {
    const storageKey = this.getKey(key);
    try {
      if (this.useNativeSecureStorage) {
        await this.nativeRemove(storageKey);
        return;
      }
      this.memory.delete(storageKey);
    } catch (error) {
      throw new Error(
        `Failed to delete key from secure storage: ${String(error)}`
      );
    }
  }

  async has(key: string): Promise<boolean> {
    const storageKey = this.getKey(key);
    try {
      if (this.useNativeSecureStorage) {
        return (await this.nativeGet(storageKey)) !== null;
      }
      return this.memory.has(storageKey);
    } catch (error) {
      throw new Error(
        `Failed to check key in secure storage: ${String(error)}`
      );
    }
  }

  async clear(): Promise<void> {
    try {
      if (this.useNativeSecureStorage) {
        const { value: keys } = await SecureStoragePlugin.keys();
        const prefixed = keys.filter(key => key.startsWith(this.prefix));
        await Promise.all(
          prefixed.map(key =>
            SecureStoragePlugin.remove({ key }).catch(() => undefined)
          )
        );
        return;
      }
      for (const key of [...this.memory.keys()]) {
        if (key.startsWith(this.prefix)) {
          this.memory.delete(key);
        }
      }
    } catch (error) {
      throw new Error(`Failed to clear secure storage: ${String(error)}`);
    }
  }

  private async nativeGet(storageKey: string): Promise<string | null> {
    try {
      const { value } = await SecureStoragePlugin.get({ key: storageKey });
      return value;
    } catch {
      // Plugin throws when the key is missing; treat as absent.
      return null;
    }
  }

  private async nativeRemove(storageKey: string): Promise<void> {
    try {
      await SecureStoragePlugin.remove({ key: storageKey });
    } catch {
      // Missing key is fine for delete semantics.
    }
  }
}
