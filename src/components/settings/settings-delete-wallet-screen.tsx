import { useState } from 'react';
import { toast } from 'sonner';

import { PasswordConfirmField } from '@/components/shared/password-confirm-field';
import { usePasswordConfirmation } from '@/components/shared/use-password-confirmation';
import { Button } from '@/components/ui/button';
import { useScreen } from '@/hooks/use-screen';
import { useWallet } from '@/hooks/use-wallet';
import { attempt } from '@/lib/attempt';
import { toastMessages } from '@/lib/content';

import { SettingsPage } from './settings-page';

export const SettingsDeleteWalletScreen = () => {
  const { navigate } = useScreen();
  const { deleteWalletData } = useWallet();
  const [isDeleting, setIsDeleting] = useState(false);
  const passwordConfirmation = usePasswordConfirmation();
  const isBusy = isDeleting || passwordConfirmation.isChecking;

  const handleDelete = async () => {
    if (isBusy) {
      return;
    }

    // A rejected password is reported inline by the password field.
    const isPasswordConfirmed = await passwordConfirmation.verify();
    if (!isPasswordConfirmed) {
      return;
    }

    setIsDeleting(true);
    const deleteResult = await attempt(() => deleteWalletData());
    setIsDeleting(false);

    if ('error' in deleteResult) {
      toast.error(toastMessages.unexpectedError);
      navigate('lock', { direction: 'back', type: 'fade' });
      return;
    }

    navigate('initial', { direction: 'back', type: 'fade' });
  };

  return (
    <SettingsPage
      title='Delete Quantum Vault'
      titleClassName='text-destructive'
      onBack={() => navigate('settings', { direction: 'back' })}
      footer={
        <>
          <Button
            size='flow'
            variant='destructive'
            disabled={isBusy}
            data-testid='confirm-delete-wallet-button'
            onClick={() => void handleDelete()}
          >
            DELETE QUANTUM VAULT
          </Button>
          <Button
            size='flow'
            variant='secondary'
            disabled={isBusy}
            onClick={() => navigate('settings', { direction: 'back' })}
          >
            BACK
          </Button>
        </>
      }
    >
      <div className='px-4 pt-5 text-base font-normal leading-normal text-foreground'>
        <p>This will permanently remove all wallet data from this device.</p>
        <p className='mt-8 text-destructive'>
          Make sure you have backed up your recovery phrase before proceeding.
        </p>
        <p className='mt-8'>This action cannot be undone.</p>
        <div className='mt-8'>
          <PasswordConfirmField
            confirmation={passwordConfirmation}
            label='Enter your password to confirm'
            testId='delete-wallet-password'
            onSubmit={() => void handleDelete()}
          />
        </div>
      </div>
    </SettingsPage>
  );
};
