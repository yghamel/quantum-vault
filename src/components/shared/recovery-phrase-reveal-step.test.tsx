import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@project-eleven/libqc', () => ({}));

import { RecoveryPhraseRevealStep } from './recovery-phrase-reveal-step';

const mnemonic = new TextEncoder().encode(
  Array.from({ length: 24 }, (_, index) => `word${index + 1}`).join(' ')
);

const renderRevealStep = () =>
  renderToStaticMarkup(
    <RecoveryPhraseRevealStep
      mnemonic={mnemonic}
      title='Your Recovery Phrase'
      description='Write these 24 words down in order.'
      missingPhraseDescription='Missing'
      missingPhraseMessage='Missing'
      finalActionLabel='I Wrote It Down'
      onNext={() => undefined}
      onBack={() => undefined}
    />
  );

describe('RecoveryPhraseRevealStep', () => {
  it('lays out all 24 word slots on a single screen', () => {
    const markup = renderRevealStep();

    expect(markup.match(/----/g)).toHaveLength(24);
    expect(markup).toContain('>24</span>');
    expect(markup).not.toContain('Next');
  });

  it('keeps the real phrase out of the DOM until revealed', () => {
    expect(renderRevealStep()).not.toContain('word1');
  });
});
