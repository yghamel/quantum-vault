import { ArrowScrollArea } from '@/components/shared/arrow-scroll-area';
import { quantumVaultAbout } from '@/lib/content';
import { cn } from '@/lib/utils';

type ScrollableQuantumVaultAboutProps = {
  className?: string;
};

/**
 * About text for the start screen, first-launch screen, and help sheet: a
 * fixed title above paragraphs that move with up/down arrows on the right.
 */
export const ScrollableQuantumVaultAbout = ({
  className
}: ScrollableQuantumVaultAboutProps) => (
  <div className={cn('flex min-h-0 flex-col gap-4', className)}>
    <h1
      data-testid='about-title'
      className='type-heading-xl m-0 shrink-0 text-foreground'
    >
      {quantumVaultAbout.title}
    </h1>

    <ArrowScrollArea testIdPrefix='about'>
      {quantumVaultAbout.paragraphs.map(paragraph => (
        <p
          key={paragraph}
          className='type-body m-0 shrink-0 text-muted-foreground'
        >
          {paragraph}
        </p>
      ))}
    </ArrowScrollArea>
  </div>
);
