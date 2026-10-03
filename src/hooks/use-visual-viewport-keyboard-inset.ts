import { useEffect, useState } from 'react';

export const computeVisualViewportKeyboardInset = ({
  windowInnerHeight,
  visualViewportHeight,
  visualViewportOffsetTop
}: {
  windowInnerHeight: number;
  visualViewportHeight: number;
  visualViewportOffsetTop: number;
}): number =>
  Math.max(
    0,
    windowInnerHeight - visualViewportHeight - visualViewportOffsetTop
  );

/**
 * Soft-keyboard overlap in CSS pixels, from the Visual Viewport API. WKWebView
 * scrolls the pinned document when an input focuses, so the scroll is reset to
 * keep the shell aligned.
 */
export const useVisualViewportKeyboardInset = (): number => {
  const [keyboardInset, setKeyboardInset] = useState(0);

  useEffect(() => {
    const visualViewport = window.visualViewport;
    if (!visualViewport) {
      return;
    }

    const update = () => {
      setKeyboardInset(
        computeVisualViewportKeyboardInset({
          windowInnerHeight: window.innerHeight,
          visualViewportHeight: visualViewport.height,
          visualViewportOffsetTop: visualViewport.offsetTop
        })
      );
      if (window.scrollX !== 0 || window.scrollY !== 0) {
        window.scrollTo(0, 0);
      }
    };

    update();
    visualViewport.addEventListener('resize', update);
    visualViewport.addEventListener('scroll', update);
    window.addEventListener('resize', update);

    return () => {
      visualViewport.removeEventListener('resize', update);
      visualViewport.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return keyboardInset;
};
