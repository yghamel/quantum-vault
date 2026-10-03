import { XIcon } from 'lucide-react';
import type { MouseEvent } from 'react';

import { cn } from '@/lib/utils';

type RecoveryPhraseChipProps = {
  number: number;
  word: string;
  isInvalid?: boolean;
  onRemove: () => void;
};

export const RecoveryPhraseChip = ({
  number,
  word,
  isInvalid = false,
  onRemove
}: RecoveryPhraseChipProps) => {
  const handleRemoveClick = (event: MouseEvent<HTMLButtonElement>) => {
    // Prevent bubbling to the input container, which would refocus the input
    // and conflict with the caret positioning we rely on for typing flow.
    event.stopPropagation();
    onRemove();
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 border bg-background px-2 py-0.5',
        isInvalid ? 'border-destructive text-destructive' : 'border-border'
      )}
      data-testid='recovery-phrase-chip'
      data-invalid={isInvalid || undefined}
    >
      <span
        className={cn(
          'text-xs font-medium leading-tight',
          isInvalid ? 'text-destructive' : 'text-foreground'
        )}
      >
        {number}. {word}
      </span>
      <button
        type='button'
        onClick={handleRemoveClick}
        className='text-foreground hover:text-muted-foreground focus-visible:ring-ring/50 transition-colors outline-none focus-visible:ring-[3px]'
        aria-label={`Remove word ${number}`}
      >
        <XIcon className='size-3' />
      </button>
    </div>
  );
};
