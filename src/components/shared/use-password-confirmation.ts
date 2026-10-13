import { useEffect, useRef, useState } from 'react';

import { readPasswordFieldValues } from '@/components/shared/password-field-dom';
import { useWallet } from '@/hooks/use-wallet';
import { attempt } from '@/lib/attempt';
import { toExistingVaultPasswordBytes } from '@/lib/password';
import {
  formatLockoutRemaining,
  getPasswordLockoutRemainingMs,
  recordFailedPasswordAttempt,
  resetPasswordAttempts
} from '@/lib/password-attempts';
import { withZeroed } from '@/lib/secrets-zeroing';
import { clearSecretRef, replaceSecretRef, zeroOut } from '@/lib/utils';

const textEncoder = new TextEncoder();

export const passwordConfirmCopy = {
  required: 'Password is required.',
  incorrect: 'Incorrect password.',
  lockedOut: (remaining: string) =>
    `Too many incorrect attempts. Try again in ${remaining}.`
} as const;

/**
 * Re-confirms the wallet password for a sensitive action without changing the
 * vault's lock state. Password bytes are held in a ref and zeroed after use.
 */
export const usePasswordConfirmation = () => {
  const { vault } = useWallet();
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<Uint8Array>(new Uint8Array());
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const clearPassword = () => {
    clearSecretRef(passwordRef);
    zeroOut(passwordInputRef);
  };

  const reset = () => {
    clearPassword();
    setError(null);
  };

  const onChange = (value: string) => {
    setError(null);
    replaceSecretRef(passwordRef, textEncoder.encode(value));
  };

  const verify = async (): Promise<boolean> => {
    const lockoutRemainingMs = getPasswordLockoutRemainingMs();
    if (lockoutRemainingMs > 0) {
      clearPassword();
      setError(
        passwordConfirmCopy.lockedOut(
          formatLockoutRemaining(lockoutRemainingMs)
        )
      );
      return false;
    }

    replaceSecretRef(
      passwordRef,
      textEncoder.encode(readPasswordFieldValues({ passwordInputRef }).password)
    );
    if (passwordRef.current.length === 0) {
      setError(passwordConfirmCopy.required);
      return false;
    }

    setIsChecking(true);
    const result = await attempt(async () => {
      const password = toExistingVaultPasswordBytes(passwordRef.current);
      return withZeroed(password, () => vault.checkPassword(password));
    });
    clearPassword();
    setIsChecking(false);

    if ('error' in result || !result.data) {
      recordFailedPasswordAttempt();
      setError(passwordConfirmCopy.incorrect);
      return false;
    }

    resetPasswordAttempts();
    return true;
  };

  useEffect(
    () => () => {
      clearSecretRef(passwordRef);
      zeroOut(passwordInputRef);
    },
    []
  );

  return {
    error,
    isChecking,
    onChange,
    passwordInputRef,
    reset,
    verify
  };
};

export type PasswordConfirmation = ReturnType<typeof usePasswordConfirmation>;
