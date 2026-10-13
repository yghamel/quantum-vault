import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import {
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type WheelEvent as ReactWheelEvent
} from 'react';

import { cn } from '@/lib/utils';

/** Share of the visible height moved per arrow tap. */
const arrowStepRatio = 0.8;

type DragState = {
  pointerId: number;
  startY: number;
  startOffset: number;
};

const arrowButtonClassName =
  'flex size-8 items-center justify-center border border-popover text-foreground transition-opacity disabled:opacity-25 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50';

type ArrowScrollAreaProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  /** Prefix for `-scroll`, `-scroll-up` and `-scroll-down` test ids. */
  testIdPrefix: string;
  /** Changing this value scrolls back to the top. */
  resetKey?: string;
};

/**
 * Vertical scroller driven by up/down arrows, finger drag and mouse wheel.
 *
 * Movement is a transform rather than native overflow scrolling, which does
 * not respond to touch in the iOS WKWebView shell.
 */
export const ArrowScrollArea = ({
  children,
  className,
  contentClassName,
  testIdPrefix,
  resetKey
}: ArrowScrollAreaProps) => {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const [offset, setOffset] = useState(0);
  const [maxOffset, setMaxOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastResetKey, setLastResetKey] = useState(resetKey);

  if (resetKey !== lastResetKey) {
    setLastResetKey(resetKey);
    setOffset(0);
  }

  const clampOffset = (value: number) =>
    Math.min(Math.max(value, 0), maxOffset);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content) {
      return;
    }

    const measure = () => {
      const nextMax = Math.max(0, content.offsetHeight - viewport.clientHeight);
      setMaxOffset(nextMax);
      setOffset(current => Math.min(current, nextMax));
    };

    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(viewport);
    resizeObserver.observe(content);
    void document.fonts?.ready.then(measure);

    return () => resizeObserver.disconnect();
  }, []);

  const scrollByStep = (direction: 1 | -1) => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }
    setOffset(current =>
      clampOffset(current + direction * viewport.clientHeight * arrowStepRatio)
    );
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragRef.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startOffset: offset
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }
    setOffset(clampOffset(drag.startOffset + (drag.startY - event.clientY)));
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) {
      return;
    }
    dragRef.current = null;
    setIsDragging(false);
  };

  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    setOffset(current => clampOffset(current + event.deltaY));
  };

  const canScrollUp = offset > 0;
  const canScrollDown = offset < maxOffset;
  const hasOverflow = maxOffset > 0;

  return (
    <div className={cn('flex min-h-0 flex-1 gap-2', className)}>
      <div
        ref={viewportRef}
        data-testid={`${testIdPrefix}-scroll`}
        className='relative min-h-0 flex-1 touch-none overflow-hidden select-none'
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onWheel={handleWheel}
      >
        <div
          ref={contentRef}
          className={cn(
            'flex flex-col gap-4 pb-4 text-foreground',
            !isDragging && 'transition-transform duration-200 ease-out',
            contentClassName
          )}
          style={{ transform: `translateY(${-offset}px)` }}
        >
          {children}
        </div>

        {canScrollDown ? (
          <div
            aria-hidden='true'
            className='pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-background to-transparent'
          />
        ) : null}
      </div>

      {hasOverflow ? (
        <div className='flex shrink-0 flex-col justify-between'>
          <button
            type='button'
            aria-label='Scroll up'
            data-testid={`${testIdPrefix}-scroll-up`}
            className={arrowButtonClassName}
            disabled={!canScrollUp}
            onClick={() => scrollByStep(-1)}
          >
            <ChevronUpIcon className='size-5' aria-hidden='true' />
          </button>
          <button
            type='button'
            aria-label='Scroll down'
            data-testid={`${testIdPrefix}-scroll-down`}
            className={arrowButtonClassName}
            disabled={!canScrollDown}
            onClick={() => scrollByStep(1)}
          >
            <ChevronDownIcon className='size-5' aria-hidden='true' />
          </button>
        </div>
      ) : null}
    </div>
  );
};
