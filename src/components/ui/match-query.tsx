import { ensurePresent } from '@/lib/assert';
import { match } from '@/lib/match';
import type { UseQueryResult } from '@tanstack/react-query';
import type { ReactNode } from 'react';

type MatchQueryProps<TData, TError> = {
  value: UseQueryResult<TData, TError>;
  loading(): ReactNode;
  success(data: TData): ReactNode;
  error?(): ReactNode;
};

export const MatchQuery = <TData, TError>({
  value,
  loading,
  success,
  error
}: MatchQueryProps<TData, TError>) =>
  match(value.status, {
    pending: loading,
    // A failed background refetch keeps the last good data on screen.
    error: () =>
      value.data === undefined ? (error?.() ?? null) : success(value.data),
    success: () => success(ensurePresent(value.data, 'query.data'))
  });
