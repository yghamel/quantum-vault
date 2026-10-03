import { useState } from 'react';
import { toast } from 'sonner';

import { CancelConfirmationModal } from '@/components/shared/cancel-confirmation-modal';
import { ScrollableQuantumVaultAbout } from '@/components/shared/quantum-vault-about';
import { QuantumVaultMark } from '@/components/shared/quantum-vault-mark';
import { useScreen } from '@/hooks/use-screen';
import { useWallet } from '@/hooks/use-wallet';
import { attempt } from '@/lib/attempt';
import { appCreditLine, toastMessages } from '@/lib/content';
import { useHasPasswordQuery } from '@/providers/wallet-queries';

import { Screen } from './screen';
import { Button } from './ui/button';

type VaultRemovalAction = 'replace' | 'reset';

const vaultRemovalModalCopy = {
  replace: {
    title: 'Replace existing vault?',
    description:
      'A vault already exists on this device. Creating a new one permanently removes it. Make sure you have its recovery phrase before continuing.'
  },
  reset: {
    title: 'Reset wallet?',
    description:
      'This permanently removes the vault from this device. You can only get it back with its recovery phrase.'
  }
} as const satisfies Record<
  VaultRemovalAction,
  { title: string; description: string }
>;

export const InitialScreen = () => {
  const { navigate } = useScreen();
  const { vault, deleteWalletData } = useWallet();
  const hasPasswordQuery = useHasPasswordQuery({ vault });
  const hasExistingVault = hasPasswordQuery.data === true;
  const [pendingRemoval, setPendingRemoval] =
    useState<VaultRemovalAction | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleCreateClick = () => {
    if (hasExistingVault) {
      setPendingRemoval('replace');
      return;
    }
    navigate('wallet-creation');
  };

  const handleRemovalConfirm = async () => {
    if (isRemoving || pendingRemoval === null) {
      return;
    }

    const action = pendingRemoval;
    setIsRemoving(true);
    const deleteResult = await attempt(() => deleteWalletData());
    setIsRemoving(false);
    setPendingRemoval(null);

    if ('error' in deleteResult) {
      toast.error(toastMessages.unexpectedError);
      return;
    }

    if (action === 'replace') {
      navigate('wallet-creation');
      return;
    }

    toast.success(toastMessages.walletReset);
    void hasPasswordQuery.refetch();
  };

  const secondaryVariant = hasExistingVault ? 'secondary' : undefined;

  return (
    <>
      <Screen className='sharp overflow-hidden pt-8'>
        <div className='flex min-h-0 flex-1 flex-col gap-4'>
          <QuantumVaultMark
            data-testid='initial-logo'
            className='size-10 shrink-0 text-foreground'
          />
          <ScrollableQuantumVaultAbout className='flex-1' />

          <div className='flex shrink-0 flex-col gap-3'>
            <div className='flex flex-col gap-2'>
              {hasExistingVault && (
                <Button
                  size='flow'
                  data-testid='initial-log-in-button'
                  onClick={() => navigate('lock')}
                >
                  Log In
                </Button>
              )}
              <Button
                size='flow'
                variant={secondaryVariant}
                data-testid='initial-create-button'
                onClick={handleCreateClick}
              >
                Create a Vault Account
              </Button>
              <Button
                size='flow'
                variant={secondaryVariant}
                data-testid='initial-recover-button'
                onClick={() => navigate('wallet-recovery')}
              >
                Recover a Vault Account
              </Button>
              {hasExistingVault && (
                <Button
                  size='flow'
                  variant='destructive'
                  data-testid='initial-reset-button'
                  onClick={() => setPendingRemoval('reset')}
                >
                  Reset Wallet
                </Button>
              )}
            </div>
            <p className='text-footer-muted text-center text-xs leading-snug'>
              {appCreditLine}
            </p>
          </div>
        </div>
      </Screen>

      <CancelConfirmationModal
        open={pendingRemoval !== null}
        onConfirm={() => void handleRemovalConfirm()}
        onDismiss={() => setPendingRemoval(null)}
        isConfirmDisabled={isRemoving}
        title={vaultRemovalModalCopy[pendingRemoval ?? 'reset'].title}
        description={
          vaultRemovalModalCopy[pendingRemoval ?? 'reset'].description
        }
      />
    </>
  );
};
