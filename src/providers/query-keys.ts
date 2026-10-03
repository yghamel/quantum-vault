import type { CurrencyCode } from '@/lib/currency';
import { queryNamespace, type QuerySessionScope } from '@/lib/query-keys';

const providerQueryKeyDomains = {
  boot: 'boot',
  hasPassword: 'has-password',
  summary: 'summary'
} as const;

export type ProviderSummaryMode = 'full' | 'inventory-only';

type QuerySessionCurrencyModeScope = QuerySessionScope & {
  currency: CurrencyCode;
  mode: ProviderSummaryMode;
};

export const providerQueryKeys = {
  boot: () => [queryNamespace, providerQueryKeyDomains.boot] as const,
  hasPassword: () =>
    [queryNamespace, providerQueryKeyDomains.hasPassword] as const,
  summary: ({ sessionId, currency, mode }: QuerySessionCurrencyModeScope) =>
    [
      queryNamespace,
      providerQueryKeyDomains.summary,
      sessionId,
      currency,
      mode
    ] as const
} as const;
