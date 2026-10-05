import type { RefObject } from 'react';

/** iOS password autofill can fill inputs without firing change events. */
export const readPasswordFieldValues = ({
  passwordInputRef,
  passwordConfirmationInputRef
}: {
  passwordInputRef?: RefObject<HTMLInputElement | null>;
  passwordConfirmationInputRef?: RefObject<HTMLInputElement | null>;
}): { password: string; passwordConfirmation: string } => ({
  password: passwordInputRef?.current?.value ?? '',
  passwordConfirmation: passwordConfirmationInputRef?.current?.value ?? ''
});
