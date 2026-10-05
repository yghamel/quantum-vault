import { useRef, useState, type RefObject } from 'react';
import type { PasswordValidationResult } from '@project-eleven/libqc';
import { Loader2Icon } from 'lucide-react';

import { FlowStepFooter } from '@/components/shared/flow-step-footer';
import { FlowStepHeader } from '@/components/shared/flow-step-header';
import { PasswordForm } from '@/components/shared/password-form';
import { readPasswordFieldValues } from '@/components/shared/password-field-dom';
import type { PasswordSubmitAttempt } from '@/components/shared/password-form-validation';
import { Button } from '@/components/ui/button';
import { useVisualViewportKeyboardInset } from '@/hooks/use-visual-viewport-keyboard-inset';

type PasswordStepProps = {
  passwordsMatch: boolean;
  passwordValidation: PasswordValidationResult;
  isSubmitting: boolean;
  isPasswordReady: () => boolean;
  onPasswordChange: (value: string) => void;
  onPasswordConfirmationChange: (value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  passwordInputRef?: RefObject<HTMLInputElement | null>;
  passwordConfirmationInputRef?: RefObject<HTMLInputElement | null>;
};

const passwordStepTitle = 'Create a Password';
const passwordStepDescription =
  "This password unlocks Quantum Vault on this device. It can't recover your wallet if you lose it.";

/**
 * Shared new-password step used by every flow that needs to collect a
 * passphrase (wallet creation, wallet recovery). Flow-specific wrappers
 * translate their feature context into this shell's validation metadata while
 * keeping plaintext secret bytes out of the component API and preserving a
 * consistent reveal/validation UX.
 */
export const PasswordStep = ({
  passwordsMatch,
  passwordValidation,
  isSubmitting,
  isPasswordReady,
  onPasswordChange,
  onPasswordConfirmationChange,
  onSubmit,
  onBack,
  passwordInputRef,
  passwordConfirmationInputRef
}: PasswordStepProps) => {
  const fallbackPasswordInputRef = useRef<HTMLInputElement>(null);
  const fallbackPasswordConfirmationInputRef = useRef<HTMLInputElement>(null);
  const resolvedPasswordInputRef = passwordInputRef ?? fallbackPasswordInputRef;
  const resolvedPasswordConfirmationInputRef =
    passwordConfirmationInputRef ?? fallbackPasswordConfirmationInputRef;
  const [submitAttempt, setSubmitAttempt] = useState<PasswordSubmitAttempt>();
  const keyboardInset = useVisualViewportKeyboardInset();

  const handlePasswordChange = (value: string) => {
    setSubmitAttempt(undefined);
    onPasswordChange(value);
  };

  const handlePasswordConfirmationChange = (value: string) => {
    setSubmitAttempt(undefined);
    onPasswordConfirmationChange(value);
  };

  const handleSubmit = () => {
    if (isSubmitting) {
      return;
    }

    const { password, passwordConfirmation } = readPasswordFieldValues({
      passwordInputRef: resolvedPasswordInputRef,
      passwordConfirmationInputRef: resolvedPasswordConfirmationInputRef
    });
    onPasswordChange(password);
    onPasswordConfirmationChange(passwordConfirmation);
    if (!isPasswordReady()) {
      setSubmitAttempt({
        hasPassword: password.length > 0,
        hasPasswordConfirmation: passwordConfirmation.length > 0
      });
      return;
    }
    onSubmit();
  };

  return (
    <div
      data-testid='password-step'
      className='flex h-full min-h-0 flex-1 flex-col overflow-hidden'
      style={keyboardInset > 0 ? { paddingBottom: keyboardInset } : undefined}
    >
      <div className='min-h-0 flex-1 overflow-y-auto overscroll-contain'>
        <FlowStepHeader
          title={passwordStepTitle}
          description={passwordStepDescription}
          onBack={onBack}
          backDisabled={isSubmitting}
        />

        <div className='mt-8 pb-2'>
          <PasswordForm
            passwordsMatch={passwordsMatch}
            passwordValidation={passwordValidation}
            onPasswordChange={handlePasswordChange}
            onPasswordConfirmationChange={handlePasswordConfirmationChange}
            onSubmit={handleSubmit}
            submitAttempt={submitAttempt}
            passwordInputRef={resolvedPasswordInputRef}
            passwordConfirmationInputRef={resolvedPasswordConfirmationInputRef}
          />
        </div>
      </div>

      <FlowStepFooter className='shrink-0 bg-background'>
        <Button
          size='flow'
          data-testid='password-continue-button'
          disabled={isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? <Loader2Icon className='animate-spin' /> : 'Continue'}
        </Button>
      </FlowStepFooter>
    </div>
  );
};
