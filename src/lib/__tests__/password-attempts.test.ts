import { describe, expect, it } from 'vitest';

import {
  formatLockoutRemaining,
  getPasswordLockoutRemainingMs,
  recordFailedPasswordAttempt,
  resetPasswordAttempts
} from '../password-attempts';

const createMemoryStorage = (): Storage => {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: key => values.get(key) ?? null,
    key: index => [...values.keys()][index] ?? null,
    removeItem: key => {
      values.delete(key);
    },
    setItem: (key, value) => {
      values.set(key, value);
    }
  };
};

const thirtySecondsMs = 30_000;
const oneMinuteMs = 60_000;
const fiveMinutesMs = 300_000;

describe('password attempts', () => {
  it('allows five failures before locking out', () => {
    const storage = createMemoryStorage();
    const now = 1_000_000;

    for (let failure = 1; failure < 5; failure += 1) {
      recordFailedPasswordAttempt(now, storage);
      expect(getPasswordLockoutRemainingMs(now, storage)).toBe(0);
    }

    recordFailedPasswordAttempt(now, storage);
    expect(getPasswordLockoutRemainingMs(now, storage)).toBe(thirtySecondsMs);
    expect(getPasswordLockoutRemainingMs(now + thirtySecondsMs, storage)).toBe(
      0
    );
  });

  it('escalates the lockout and caps it at five minutes', () => {
    const storage = createMemoryStorage();
    const now = 1_000_000;

    for (let failure = 0; failure < 6; failure += 1) {
      recordFailedPasswordAttempt(now, storage);
    }
    expect(getPasswordLockoutRemainingMs(now, storage)).toBe(oneMinuteMs);

    for (let failure = 0; failure < 10; failure += 1) {
      recordFailedPasswordAttempt(now, storage);
    }
    expect(getPasswordLockoutRemainingMs(now, storage)).toBe(fiveMinutesMs);
  });

  it('clears the lockout after a successful password', () => {
    const storage = createMemoryStorage();
    const now = 1_000_000;
    for (let failure = 0; failure < 5; failure += 1) {
      recordFailedPasswordAttempt(now, storage);
    }

    resetPasswordAttempts(storage);
    expect(getPasswordLockoutRemainingMs(now, storage)).toBe(0);
  });

  it('ignores corrupt stored state', () => {
    const storage = createMemoryStorage();
    storage.setItem('quantum-vault-password-attempts', '{not json');
    expect(getPasswordLockoutRemainingMs(1_000_000, storage)).toBe(0);
  });

  it('formats remaining time in seconds or whole minutes', () => {
    expect(formatLockoutRemaining(thirtySecondsMs)).toBe('30 s');
    expect(formatLockoutRemaining(fiveMinutesMs)).toBe('5 min');
  });
});
