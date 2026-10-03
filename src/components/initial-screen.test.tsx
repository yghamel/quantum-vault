import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const hasPasswordQuery = vi.hoisted(() => ({
  data: undefined as boolean | undefined
}));

vi.mock('@project-eleven/libqc', () => ({}));

vi.mock('@/hooks/use-screen', () => ({
  useScreen: () => ({ navigate: () => {} })
}));

vi.mock('@/hooks/use-wallet', () => ({
  useWallet: () => ({ vault: {}, deleteWalletData: async () => {} })
}));

vi.mock('@/providers/wallet-queries', () => ({
  useHasPasswordQuery: () => hasPasswordQuery
}));

import { quantumVaultAbout } from '@/lib/content';

import { InitialScreen } from './initial-screen';

const logInTestId = 'data-testid="initial-log-in-button"';
const createTestId = 'data-testid="initial-create-button"';
const recoverTestId = 'data-testid="initial-recover-button"';
const resetTestId = 'data-testid="initial-reset-button"';

describe('InitialScreen', () => {
  beforeEach(() => {
    hasPasswordQuery.data = undefined;
  });

  it('offers log in, create, recover, and reset when a vault exists', () => {
    hasPasswordQuery.data = true;

    const html = renderToStaticMarkup(<InitialScreen />);

    expect(html).toContain(logInTestId);
    expect(html).toContain(createTestId);
    expect(html).toContain(recoverTestId);
    expect(html).toContain(resetTestId);
  });

  it('shows the Quantum Vault about text word for word', () => {
    const html = renderToStaticMarkup(<InitialScreen />);

    expect(html).toContain(`>${quantumVaultAbout.title}</h1>`);
    for (const paragraph of quantumVaultAbout.paragraphs) {
      expect(html).toContain(`>${paragraph.replaceAll("'", '&#x27;')}</p>`);
    }
  });

  it('keeps the logo and title outside the scrolling text', () => {
    const html = renderToStaticMarkup(<InitialScreen />);
    const scrollAreaStart = html.indexOf('data-testid="about-scroll"');

    for (const testId of ['initial-logo', 'about-title']) {
      const position = html.indexOf(`data-testid="${testId}"`);
      expect(position).toBeGreaterThan(-1);
      expect(position).toBeLessThan(scrollAreaStart);
    }
  });

  it('offers only create and recover when no vault exists', () => {
    hasPasswordQuery.data = false;

    const html = renderToStaticMarkup(<InitialScreen />);

    expect(html).not.toContain(logInTestId);
    expect(html).not.toContain(resetTestId);
    expect(html).toContain(createTestId);
    expect(html).toContain(recoverTestId);
  });
});
