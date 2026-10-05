import { EyeIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

import { FlowStepFooter } from '@/components/shared/flow-step-footer';
import { FlowStepHeader } from '@/components/shared/flow-step-header';
import { flowStepContainerClassName } from '@/components/shared/flow-step-layout';
import { Button } from '@/components/ui/button';
import { useBoolean } from '@/hooks/use-boolean';
import { cn } from '@/lib/utils';
import { RecoveryPhraseWordGrid } from '@/components/shared/recovery-phrase-word-grid';
import { RevealedRecoveryPhrasePage } from '@/components/shared/revealed-recovery-phrase-page';
import { recoveryPhraseWordCount } from '@/components/shared/recovery-phrase-bytes';

// `defaultSecretPhraseTestId` keeps the historical id stable for the
// onboarding/wallet-recovery flows so existing E2E selectors continue to
// match. New flows (e.g. export) should pass a scoped id so concurrent
// matches across mounted screens cannot become ambiguous.
const defaultSecretPhraseTestId = 'secret-phrase';

type RecoveryPhraseRevealStepProps = {
  mnemonic: Uint8Array | undefined;
  title: string;
  description: string;
  missingPhraseDescription: string;
  missingPhraseMessage: string;
  finalActionLabel: string;
  onNext: () => void;
  onBack: () => void;
  isSubmitting?: boolean;
  backTestId?: string;
  secretPhraseTestId?: string;
  className?: string;
};

// Render placeholder dashes under the blur layer instead of the real
// mnemonic so the actual phrase never reaches the DOM until the user
// explicitly reveals it. CSS blur is trivially defeated in DevTools.
const hiddenWords = Array.from(
  { length: recoveryPhraseWordCount },
  () => '----'
);

export const RecoveryPhraseRevealStep = ({
  mnemonic,
  title,
  description,
  missingPhraseDescription,
  missingPhraseMessage,
  finalActionLabel,
  onNext,
  onBack,
  isSubmitting = false,
  backTestId,
  secretPhraseTestId = defaultSecretPhraseTestId,
  className
}: RecoveryPhraseRevealStepProps) => {
  const hasReportedMissingMnemonicRef = useRef(false);
  const hasReceivedMnemonicRef = useRef(mnemonic !== undefined);

  useEffect(() => {
    if (mnemonic !== undefined) {
      hasReceivedMnemonicRef.current = true;
      return;
    }

    if (
      hasReceivedMnemonicRef.current ||
      hasReportedMissingMnemonicRef.current
    ) {
      return;
    }

    hasReportedMissingMnemonicRef.current = true;
    toast.error(missingPhraseMessage);
  }, [missingPhraseMessage, mnemonic]);

  const [isRevealed, revealed] = useBoolean();

  // Defensive reset: if the parent clears the mnemonic (e.g. on cancel,
  // session timeout, or screen registry remount), hide the phrase so a
  // re-entry never inherits a previously revealed state.
  useEffect(() => {
    if (mnemonic === undefined) {
      revealed.unset();
    }
  }, [mnemonic, revealed]);

  if (mnemonic === undefined) {
    return (
      <div className={cn(flowStepContainerClassName, className)}>
        <div>
          <FlowStepHeader
            title={title}
            description={missingPhraseDescription}
            onBack={onBack}
            backDisabled={isSubmitting}
            backTestId={backTestId}
          />
        </div>

        <FlowStepFooter className='gap-2'>
          <Button size='flow' onClick={onBack} disabled={isSubmitting}>
            Go Back
          </Button>
        </FlowStepFooter>
      </div>
    );
  }

  return (
    <div className={cn(flowStepContainerClassName, className)}>
      <div>
        <FlowStepHeader
          title={title}
          description={description}
          onBack={onBack}
          backDisabled={isSubmitting}
          backTestId={backTestId}
        />

        <div className='mt-6 flex flex-col gap-3'>
          <div data-testid={secretPhraseTestId}>
            {isRevealed ? (
              <RevealedRecoveryPhrasePage
                mnemonic={mnemonic}
                startIndex={0}
                wordsPerPage={recoveryPhraseWordCount}
              />
            ) : (
              <RecoveryPhraseWordGrid words={hiddenWords} isRevealed={false} />
            )}
          </div>
          <p className='text-destructive text-center text-xs'>
            Never share it with anyone
          </p>
        </div>
      </div>

      <FlowStepFooter className='gap-2'>
        {isRevealed ? (
          <>
            <Button size='flow' onClick={onNext} disabled={isSubmitting}>
              {finalActionLabel}
            </Button>
            <Button
              variant='secondary'
              size='flow'
              onClick={revealed.unset}
              disabled={isSubmitting}
            >
              Hide Phrase
            </Button>
          </>
        ) : (
          <Button
            variant='secondary'
            size='flow'
            type='button'
            onClick={revealed.set}
            disabled={isSubmitting}
          >
            <EyeIcon className='size-4' />
            Click to Reveal
          </Button>
        )}
      </FlowStepFooter>
    </div>
  );
};
