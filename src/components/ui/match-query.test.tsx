import type { UseQueryResult } from '@tanstack/react-query';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { MatchQuery } from './match-query';

const renderQuery = (value: Partial<UseQueryResult<string, Error>>) =>
  renderToStaticMarkup(
    <MatchQuery
      value={value as UseQueryResult<string, Error>}
      loading={() => 'loading'}
      success={data => `data:${data}`}
      error={() => 'failed'}
    />
  );

describe('MatchQuery', () => {
  it('renders the error state when the first load fails', () => {
    expect(renderQuery({ status: 'error', data: undefined })).toBe('failed');
  });

  it('keeps showing data when a background refetch fails', () => {
    expect(renderQuery({ status: 'error', data: 'cached' })).toBe(
      'data:cached'
    );
  });
});
