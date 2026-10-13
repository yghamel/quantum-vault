import { attempt } from './attempt';
import { convertDuration } from './time';

const passwordAttemptsStorageKey = 'quantum-vault-password-attempts';
const freeFailedAttempts = 5;
const lockoutDurationsMs: ReadonlyArray<number> = [
  convertDuration(30, 's', 'ms'),
  convertDuration(1, 'min', 'ms'),
  convertDuration(2, 'min', 'ms'),
  convertDuration(5, 'min', 'ms')
];

type PasswordAttemptState = {
  failures: number;
  lockedUntil: number;
};

type AttemptStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

const emptyAttemptState: PasswordAttemptState = { failures: 0, lockedUntil: 0 };

const isPasswordAttemptState = (
  value: unknown
): value is PasswordAttemptState =>
  typeof value === 'object' &&
  value !== null &&
  typeof Reflect.get(value, 'failures') === 'number' &&
  typeof Reflect.get(value, 'lockedUntil') === 'number';

const readAttemptState = (storage: AttemptStorage): PasswordAttemptState => {
  const raw = storage.getItem(passwordAttemptsStorageKey);
  if (raw === null) {
    return emptyAttemptState;
  }

  const parsed = attempt((): unknown => JSON.parse(raw));
  if ('error' in parsed || !isPasswordAttemptState(parsed.data)) {
    return emptyAttemptState;
  }

  return parsed.data;
};

export const getPasswordLockoutRemainingMs = (
  now: number = Date.now(),
  storage: AttemptStorage = localStorage
): number => Math.max(0, readAttemptState(storage).lockedUntil - now);

export const recordFailedPasswordAttempt = (
  now: number = Date.now(),
  storage: AttemptStorage = localStorage
): void => {
  const failures = readAttemptState(storage).failures + 1;
  const lockoutIndex = Math.min(
    failures - freeFailedAttempts,
    lockoutDurationsMs.length - 1
  );
  const lockedUntil =
    failures >= freeFailedAttempts ? now + lockoutDurationsMs[lockoutIndex] : 0;

  storage.setItem(
    passwordAttemptsStorageKey,
    JSON.stringify({ failures, lockedUntil })
  );
};

export const resetPasswordAttempts = (
  storage: AttemptStorage = localStorage
): void => {
  storage.removeItem(passwordAttemptsStorageKey);
};

export const formatLockoutRemaining = (remainingMs: number): string => {
  const seconds = Math.ceil(convertDuration(remainingMs, 'ms', 's'));
  return seconds >= 60
    ? `${Math.ceil(convertDuration(seconds, 's', 'min'))} min`
    : `${seconds} s`;
};
