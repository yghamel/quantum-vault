import { PasswordRevealToggle } from '@/components/shared/password-reveal-toggle';
import type { PasswordConfirmation } from '@/components/shared/use-password-confirmation';
import { Field } from '@/components/ui/field';
import { useBoolean } from '@/hooks/use-boolean';

type PasswordConfirmFieldProps = {
  confirmation: PasswordConfirmation;
  label?: string;
  testId: string;
  onSubmit: () => void;
};

export const PasswordConfirmField = ({
  confirmation,
  label = 'Password',
  testId,
  onSubmit
}: PasswordConfirmFieldProps) => {
  const [isPasswordRevealed, passwordReveal] = useBoolean();

  return (
    <div data-testid={testId}>
      <Field
        label={label}
        type={isPasswordRevealed ? 'text' : 'password'}
        onChange={confirmation.onChange}
        disabled={confirmation.isChecking}
        placeholder='Enter your password'
        autoComplete='current-password'
        error={confirmation.error ?? undefined}
        inputRef={confirmation.passwordInputRef}
        onSubmit={onSubmit}
        trailingAddon={
          <PasswordRevealToggle
            isRevealed={isPasswordRevealed}
            onToggle={passwordReveal.toggle}
            disabled={confirmation.isChecking}
          />
        }
      />
    </div>
  );
};
