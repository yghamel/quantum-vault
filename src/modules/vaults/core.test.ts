import { homeSectionOrder, vaultStatuses } from './core';

describe('vaults core', () => {
  it('keeps canonical home section order', () => {
    expect(homeSectionOrder).toEqual([
      'vulnerable',
      'unknown',
      'safe',
      'withdrawn'
    ]);
    expect(vaultStatuses).toEqual(homeSectionOrder);
  });
});
