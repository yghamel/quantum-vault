import { describe, expect, it } from 'vitest';

import {
  findInvalidWordPositions,
  isRecoveryWord
} from './recovery-word-check';

describe('recovery word check', () => {
  it('accepts words from the BIP-39 English list', () => {
    expect(isRecoveryWord('abandon')).toBe(true);
    expect(isRecoveryWord('zoo')).toBe(true);
  });

  it('rejects misspelled or truncated words', () => {
    expect(isRecoveryWord('mushro')).toBe(false);
    expect(isRecoveryWord('abandn')).toBe(false);
  });

  it('reports 1-based positions of unknown words', () => {
    expect(
      findInvalidWordPositions(['abandon', 'abandn', 'zoo', 'mushro'])
    ).toEqual([2, 4]);
  });
});
