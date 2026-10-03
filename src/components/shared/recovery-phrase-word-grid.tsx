import { cn } from '@/lib/utils';

type RecoveryPhraseWordGridProps = {
  words: string[];
  isRevealed: boolean;
  startIndex?: number;
};

export const RecoveryPhraseWordGrid = ({
  words,
  isRevealed,
  startIndex = 0
}: RecoveryPhraseWordGridProps) => (
  <div
    className={cn(
      'grid grid-cols-3 gap-1.5 transition-[filter] duration-200',
      !isRevealed && 'blur'
    )}
    aria-hidden={!isRevealed}
  >
    {words.map((word, index) => (
      <div
        key={startIndex + index}
        className='flex h-9 min-w-0 items-center gap-1 border border-border bg-input px-1.5'
      >
        <span className='w-5 shrink-0 text-right text-xs tabular-nums text-muted-foreground'>
          {startIndex + index + 1}
        </span>
        <span className='whitespace-nowrap text-sm font-medium'>{word}</span>
      </div>
    ))}
  </div>
);
