import { Fragment, type ReactNode } from 'react';
import { toast } from 'sonner';

import { BackButton } from '@/components/ui/back-button';
import { Button } from '@/components/ui/button';
import { RecoveryPhraseWordGrid } from '@/components/shared/recovery-phrase-word-grid';
import { RevealedRecoveryPhrasePage } from '@/components/shared/revealed-recovery-phrase-page';
import { recoveryPhraseWordCount } from '@/components/shared/recovery-phrase-bytes';
import { useBoolean } from '@/hooks/use-boolean';

import { exportRecoveryPhraseCopy } from '../export-recovery-phrase-copy';
import { useExportRecoveryPhraseContext } from '../export-recovery-phrase-context';

type RecoveryPhraseRevealStepProps = {
  onExit: () => void;
};

const hiddenWords = Array.from(
  { length: recoveryPhraseWordCount },
  () => '----'
);

type RecoveryPhraseAction = {
  id: string;
  isVisible: boolean;
  render: () => ReactNode;
};

export const RecoveryPhraseRevealStep = ({
  onExit
}: RecoveryPhraseRevealStepProps) => {
  const { recoveryPhrase, isSubmittingPassword } =
    useExportRecoveryPhraseContext();
  const [isRevealed, revealed] = useBoolean();

  const handleConfirmWrittenDown = () => {
    if (recoveryPhrase === undefined) {
      toast.error(exportRecoveryPhraseCopy.missingPhrase.message);
      return;
    }
    // Recovery phrases must never be copied to the clipboard.
    onExit();
  };

  const revealPhrase = () => {
    if (recoveryPhrase === undefined) {
      toast.error(exportRecoveryPhraseCopy.missingPhrase.message);
      return;
    }

    revealed.set();
  };

  const phraseActions: ReadonlyArray<RecoveryPhraseAction> = [
    {
      id: 'confirm-written',
      isVisible: isRevealed,
      render: () => (
        <Button
          size='flow'
          disabled={isSubmittingPassword}
          onClick={handleConfirmWrittenDown}
          data-testid='confirm-recovery-phrase-written'
        >
          {exportRecoveryPhraseCopy.reveal.copyAction}
        </Button>
      )
    },
    {
      id: 'reveal',
      isVisible: !isRevealed,
      render: () => (
        <Button
          size='flow'
          disabled={isSubmittingPassword}
          onClick={revealPhrase}
        >
          {exportRecoveryPhraseCopy.reveal.revealAction}
        </Button>
      )
    },
    {
      id: 'back',
      isVisible: true,
      render: () => (
        <Button
          size='flow'
          variant='secondary'
          disabled={isSubmittingPassword}
          onClick={onExit}
        >
          {exportRecoveryPhraseCopy.reveal.exitAction}
        </Button>
      )
    }
  ];

  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      <div className='min-h-0 flex-1 overflow-y-auto pb-4'>
        <BackButton
          onClick={onExit}
          disabled={isSubmittingPassword}
          testId='export-recovery-phrase-back-button'
        />

        <div className='pt-3'>
          <h1 className='text-2xl font-normal leading-8 text-foreground'>
            {exportRecoveryPhraseCopy.reveal.title}
          </h1>
          <p className='pt-5 text-base font-normal leading-normal text-foreground'>
            {exportRecoveryPhraseCopy.reveal.description}
          </p>
          <p className='pt-4 text-xs font-normal leading-normal text-destructive'>
            {exportRecoveryPhraseCopy.reveal.warning}
          </p>
        </div>

        {isRevealed && (
          <div className='pt-4'>
            <p className='pb-2 text-xs font-normal leading-none text-foreground'>
              {exportRecoveryPhraseCopy.reveal.phraseLabel}
            </p>
            <div data-testid='export-secret-phrase'>
              {recoveryPhrase === undefined ? (
                <RecoveryPhraseWordGrid
                  words={hiddenWords}
                  isRevealed={false}
                />
              ) : (
                <RevealedRecoveryPhrasePage
                  mnemonic={recoveryPhrase}
                  startIndex={0}
                  wordsPerPage={recoveryPhraseWordCount}
                />
              )}
            </div>
          </div>
        )}
      </div>

      <div className='flex shrink-0 flex-col gap-4 pt-4'>
        {phraseActions
          .filter(action => action.isVisible)
          .map(action => (
            <Fragment key={action.id}>{action.render()}</Fragment>
          ))}
      </div>
    </div>
  );
};
