import { describe, expect, it, vi } from 'vitest';

vi.mock('@project-eleven/libqc', () => ({
  validatePassword: (bytes: Uint8Array) => ({ valid: bytes.length >= 8 })
}));

import { isNewPasswordReady } from '../password';

const encode = (value: string) => new TextEncoder().encode(value);

describe('isNewPasswordReady', () => {
  it('rejects an empty password', () => {
    expect(isNewPasswordReady(encode(''), encode(''))).toBe(false);
  });

  it('rejects a password that fails validation', () => {
    expect(isNewPasswordReady(encode('short'), encode('short'))).toBe(false);
  });

  it('rejects a mismatched confirmation', () => {
    expect(
      isNewPasswordReady(encode('ValidPass123!'), encode('ValidPass123?'))
    ).toBe(false);
  });

  it('accepts a valid password with a matching confirmation', () => {
    expect(
      isNewPasswordReady(encode('ValidPass123!'), encode('ValidPass123!'))
    ).toBe(true);
  });
});
