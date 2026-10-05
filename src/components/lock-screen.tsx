import { Capacitor } from '@capacitor/core';
import { NoPasswordSetError, VaultCorruptedError } from '@project-eleven/libqc';
import { Loader2Icon } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { readPasswordFieldValues } from '@/components/shared/password-field-dom';
import { PasswordRevealToggle } from '@/components/shared/password-reveal-toggle';
import { QuantumVaultMark } from '@/components/shared/quantum-vault-mark';
import { BackButton } from '@/components/ui/back-button';
import { HelpButton } from '@/components/shared/help-button';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { useBoolean } from '@/hooks/use-boolean';
import { useScreen } from '@/hooks/use-screen';
import { useVisualViewportKeyboardInset } from '@/hooks/use-visual-viewport-keyboard-inset';
import { useWallet } from '@/hooks/use-wallet';
import { attempt } from '@/lib/attempt';
import { toastMessages } from '@/lib/content';
import { match } from '@/lib/match';
import { toExistingVaultPasswordBytes } from '@/lib/password';
import { withZeroed } from '@/lib/secrets-zeroing';
import { clearSecretRef, replaceSecretRef, zeroOut } from '@/lib/utils';

import { Screen } from './screen';

const textEncoder = new TextEncoder();

// Focusing on mount raises the iOS keyboard over the Unlock button before the
// user asks for it.
const shouldAutoFocus = !Capacitor.isNativePlatform();

export const LockScreen = () => {
  const { navigate } = useScreen();
  const { initWallet, vault, clearWalletState } = useWallet();
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<Uint8Array>(new Uint8Array());
  const keyboardInset = useVisualViewportKeyboardInset();

  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordRevealed, passwordReveal] = useBoolean();
  const [isPasswordMissing, setIsPasswordMissing] = useState(false);

  const clearPassword = useCallback(() => {
    clearSecretRef(passwordRef);
  }, []);

  const setPassword = useCallback((password: string) => {
    replaceSecretRef(passwordRef, textEncoder.encode(password));
  }, []);

  const handlePasswordChange = (password: string) => {
    setIsPasswordMissing(false);
    setPassword(password);
  };

  const unlock = async () => {
    if (isLoading) {
      return;
    }

    setPassword(readPasswordFieldValues({ passwordInputRef }).password);
    if (passwordRef.current.length === 0) {
      setIsPasswordMissing(true);
      return;
    }

    zeroOut(passwordInputRef);
    setIsLoading(true);
    const unlockResult = await attempt(async () => {
      const existingPassword = toExistingVaultPasswordBytes(
        passwordRef.current
      );
      await withZeroed(existingPassword, () => vault.unlock(existingPassword));
    });
    clearPassword();

    if ('error' in unlockResult) {
      setIsLoading(false);
      if (unlockResult.error instanceof NoPasswordSetError) {
        navigate('wallet-creation');
        return;
      }
      if (unlockResult.error instanceof VaultCorruptedError) {
        navigate('wallet-recovery');
        return;
      }
      toast.error(toastMessages.invalidPassword);
      return;
    }

    const initWalletResult = await attempt(() => initWallet());
    if ('error' in initWalletResult) {
      void clearWalletState();
      setIsLoading(false);
      toast.error(toastMessages.unexpectedError);
      return;
    }

    setIsLoading(false);
    match(initWalletResult.data, {
      ready: () => navigate('home', { type: 'fade' }),
      degraded: () => navigate('home', { type: 'fade' }),
      ignored: () => {
        void clearWalletState();
        toast.error(toastMessages.unexpectedError);
        navigate('lock', { type: 'fade' });
      }
    });
  };

  const handleRecoverClick = () => {
    if (isLoading) {
      return;
    }

    clearPassword();
    zeroOut(passwordInputRef);
    void clearWalletState();
    navigate('wallet-recovery');
  };

  const handleBackClick = () => {
    if (isLoading) {
      return;
    }

    clearPassword();
    zeroOut(passwordInputRef);
    navigate('initial', { direction: 'back' });
  };

  useEffect(() => {
    return () => {
      zeroOut(passwordInputRef);
      clearPassword();
    };
  }, [clearPassword]);

  return (
    <Screen className='sharp'>
      <div
        className='flex min-h-0 flex-1 flex-col overflow-hidden'
        style={keyboardInset > 0 ? { paddingBottom: keyboardInset } : undefined}
      >
        <div className='min-h-0 flex-1 overflow-y-auto overscroll-contain'>
          <div className='mb-6 flex items-center justify-between'>
            <BackButton
              onClick={handleBackClick}
              disabled={isLoading}
              label='Back to start'
              testId='lock-back-button'
            />
            <HelpButton />
          </div>
          <div className='flex flex-col gap-8 text-foreground'>
            <QuantumVaultMark className='size-10' />
            <div className='flex flex-col gap-3'>
              <h1 className='type-heading-lg'>Welcome Back</h1>
              <p className='type-body text-muted-foreground'>
                Enter your password to unlock
              </p>
            </div>
          </div>

          <div className='mt-8 flex flex-col gap-3'>
            <Field
              label='Password'
              type={isPasswordRevealed ? 'text' : 'password'}
              onChange={handlePasswordChange}
              placeholder='Enter your password'
              autoFocus={shouldAutoFocus}
              autoComplete='current-password'
              error={isPasswordMissing ? 'Password is required.' : undefined}
              inputRef={passwordInputRef}
              onSubmit={() => void unlock()}
              trailingAddon={
                <PasswordRevealToggle
                  isRevealed={isPasswordRevealed}
                  onToggle={passwordReveal.toggle}
                />
              }
            />
            <p className='type-body-sm text-muted-foreground'>
              Forgot password?{' '}
              <button
                type='button'
                onClick={handleRecoverClick}
                disabled={isLoading}
                className='underline underline-offset-2 transition-colors hover:text-muted-foreground/80 disabled:pointer-events-none disabled:opacity-50'
              >
                Use recovery phrase
              </button>
            </p>
          </div>
        </div>

        <div className='flex shrink-0 flex-col gap-4 bg-background pt-4'>
          <Button
            size='flow'
            onClick={() => void unlock()}
            disabled={isLoading}
            data-testid='unlock-wallet-button'
          >
            {isLoading ? <Loader2Icon className='animate-spin' /> : 'Unlock'}
          </Button>
        </div>
      </div>
    </Screen>
  );
};
