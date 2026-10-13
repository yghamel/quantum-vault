import { useState } from 'react';

import { Screen } from '@/components/screen';
import { ArrowScrollArea } from '@/components/shared/arrow-scroll-area';
import { BackButton } from '@/components/ui/back-button';
import { useScreen } from '@/hooks/use-screen';
import {
  legalDocumentOrder,
  legalDocuments,
  type LegalDocumentKey
} from '@/lib/legal-content';
import { cn } from '@/lib/utils';

/** Privacy Policy, Terms of Use and licence notices, one tab each. */
export const LegalDocumentScreen = () => {
  const { navigate, previousScreen } = useScreen();
  const [returnScreen] = useState(previousScreen ?? 'initial');
  const [activeDocumentKey, setActiveDocumentKey] =
    useState<LegalDocumentKey>('privacy');
  const activeDocument = legalDocuments[activeDocumentKey];

  return (
    <Screen className='sharp gap-4'>
      <BackButton
        testId='legal-back-button'
        onClick={() => navigate(returnScreen, { direction: 'back' })}
      />

      <div role='tablist' aria-label='Legal documents' className='flex gap-2'>
        {legalDocumentOrder.map(documentKey => {
          const isActive = documentKey === activeDocumentKey;

          return (
            <button
              key={documentKey}
              type='button'
              role='tab'
              aria-selected={isActive}
              data-testid={`legal-tab-${documentKey}`}
              className={cn(
                'type-footnote flex-1 border px-2 py-2 transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                isActive
                  ? 'border-foreground text-foreground'
                  : 'border-divider text-muted-foreground'
              )}
              onClick={() => setActiveDocumentKey(documentKey)}
            >
              {legalDocuments[documentKey].tabLabel}
            </button>
          );
        })}
      </div>

      <div className='flex shrink-0 flex-col gap-1'>
        <h1
          data-testid='legal-document-title'
          className='type-heading-lg m-0 text-foreground'
        >
          {activeDocument.title}
        </h1>
        <p className='type-footnote m-0 text-muted-foreground'>
          Last updated {activeDocument.lastUpdated}
        </p>
      </div>

      <ArrowScrollArea testIdPrefix='legal' resetKey={activeDocumentKey}>
        {activeDocument.sections.map(section => (
          <section key={section.heading} className='flex flex-col gap-2'>
            <h2 className='type-body m-0 font-medium text-foreground'>
              {section.heading}
            </h2>
            {section.paragraphs.map(paragraph => (
              <p
                key={paragraph}
                className='type-footnote m-0 text-muted-foreground'
              >
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </ArrowScrollArea>
    </Screen>
  );
};
