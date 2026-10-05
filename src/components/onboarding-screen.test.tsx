import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { quantumVaultAbout } from '@/lib/content';

vi.mock('@project-eleven/libqc', () => ({}));

vi.mock('@/hooks/use-screen', () => ({
  useScreen: () => ({ navigate: () => {} })
}));

import { OnboardingScreen } from './onboarding-screen';

const escapeHtml = (text: string) =>
  text.replaceAll('&', '&amp;').replaceAll("'", '&#x27;');

describe('OnboardingScreen', () => {
  it('shows the Quantum Vault title and every paragraph word for word', () => {
    const html = renderToStaticMarkup(<OnboardingScreen />);

    expect(html).toContain(`>${quantumVaultAbout.title}</h1>`);
    for (const paragraph of quantumVaultAbout.paragraphs) {
      expect(html).toContain(`>${escapeHtml(paragraph)}</p>`);
    }
  });

  it('offers a single GET STARTED action', () => {
    const html = renderToStaticMarkup(<OnboardingScreen />);

    expect(html).toContain('data-testid="onboarding-get-started-button"');
    expect(html).not.toContain('NEXT');
  });
});
