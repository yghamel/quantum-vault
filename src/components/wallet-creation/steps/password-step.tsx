import type { RefObject } from 'react';

import { PasswordStep as SharedPasswordStep } from '@/components/shared/password-step';

import { useWalletCreationContext } from '../wallet-creation-context';

type PasswordStepProps = {
  onSubmit: () => void;
  onBack: () => void;
  passwordInputRef?: RefObject<HTMLInputElement | null>;
  passwordConfirmationInputRef?: RefObject<HTMLInputElement | null>;
};

export const PasswordStep = ({
  onSubmit,
  onBack,
  passwordInputRef,
  passwordConfirmationInputRef
}: PasswordStepProps) => {
  const {
    passwordValidation,
    passwordsMatch,
    isSettingPassword,
    isPasswordReady,
    setPassword,
    setPasswordConfirmation
  } = useWalletCreationContext();

  return (
    <SharedPasswordStep
      passwordsMatch={passwordsMatch}
      passwordValidation={passwordValidation}
      isSubmitting={isSettingPassword}
      isPasswordReady={isPasswordReady}
      onPasswordChange={setPassword}
      onPasswordConfirmationChange={setPasswordConfirmation}
      onSubmit={onSubmit}
      onBack={onBack}
      passwordInputRef={passwordInputRef}
      passwordConfirmationInputRef={passwordConfirmationInputRef}
    />
  );
};
