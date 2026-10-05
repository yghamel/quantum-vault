import { describe, expect, it } from 'vitest';

import { computeVisualViewportKeyboardInset } from './use-visual-viewport-keyboard-inset';

describe('computeVisualViewportKeyboardInset', () => {
  it('is zero when the visual viewport fills the window', () => {
    expect(
      computeVisualViewportKeyboardInset({
        windowInnerHeight: 800,
        visualViewportHeight: 800,
        visualViewportOffsetTop: 0
      })
    ).toBe(0);
  });

  it('returns the overlapped height when the keyboard shrinks the viewport', () => {
    expect(
      computeVisualViewportKeyboardInset({
        windowInnerHeight: 800,
        visualViewportHeight: 500,
        visualViewportOffsetTop: 0
      })
    ).toBe(300);
  });
});
