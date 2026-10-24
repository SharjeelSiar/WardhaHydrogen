import {
  useRef,
  type RefObject,
  type PointerEvent,
  type MouseEvent,
} from 'react';

/** Native touch scrolling for rails, pointer swipes for slides, and mouse dragging
 * for both. A drag never follows the product/banner link beneath the pointer. */
export function useMouseDrag({
  scrollRef,
  onSwipe,
}: {
  scrollRef?: RefObject<HTMLElement | null>;
  onSwipe?: (direction: 1 | -1) => void;
}) {
  const gesture = useRef<{
    id: number;
    x: number;
    y: number;
    scroll: number;
    dragged: boolean;
    horizontal?: boolean;
    snap: string;
  } | null>(null);
  const suppressClick = useRef(false);
  function finish(e: PointerEvent<HTMLElement>, cancelled = false) {
    const g = gesture.current;
    if (!g || g.id !== e.pointerId) return;
    if (!cancelled && g.dragged && onSwipe && Math.abs(e.clientX - g.x) > 45)
      onSwipe(e.clientX < g.x ? 1 : -1);
    if (scrollRef?.current) scrollRef.current.style.scrollSnapType = g.snap;
    e.currentTarget.classList.remove('is-dragging');
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);
    gesture.current = null;
  }
  return {
    events: {
      onDragStart: (e: React.DragEvent<HTMLElement>) => e.preventDefault(),
      onPointerDown: (e: PointerEvent<HTMLElement>) => {
        suppressClick.current = false;
        if (
          !e.isPrimary ||
          e.button !== 0 ||
          (scrollRef && e.pointerType !== 'mouse') ||
          (e.target as HTMLElement).closest('button,input,select,textarea')
        )
          return;
        gesture.current = {
          id: e.pointerId,
          x: e.clientX,
          y: e.clientY,
          scroll: scrollRef?.current?.scrollLeft || 0,
          dragged: false,
          snap: scrollRef?.current?.style.scrollSnapType || '',
        };
      },
      onPointerMove: (e: PointerEvent<HTMLElement>) => {
        const g = gesture.current;
        if (!g || g.id !== e.pointerId) return;
        const dx = e.clientX - g.x;
        if (
          g.horizontal === undefined &&
          Math.max(Math.abs(dx), Math.abs(e.clientY - g.y)) > 7
        )
          g.horizontal = Math.abs(dx) > Math.abs(e.clientY - g.y);
        if (!g.horizontal || Math.abs(dx) < 7) return;
        if (!g.dragged) {
          g.dragged = true;
          suppressClick.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          e.currentTarget.classList.add('is-dragging');
        }
        e.preventDefault();
        if (scrollRef?.current) {
          scrollRef.current.style.scrollSnapType = 'none';
          scrollRef.current.scrollLeft = g.scroll - dx;
        }
      },
      onPointerUp: (e: PointerEvent<HTMLElement>) => finish(e),
      onPointerCancel: (e: PointerEvent<HTMLElement>) => finish(e, true),
      onLostPointerCapture: (e: PointerEvent<HTMLElement>) => {
        if (gesture.current) finish(e, true);
      },
      onClickCapture: (e: MouseEvent<HTMLElement>) => {
        if (suppressClick.current && e.detail !== 0) {
          e.preventDefault();
          e.stopPropagation();
        }
      },
    },
  };
}
