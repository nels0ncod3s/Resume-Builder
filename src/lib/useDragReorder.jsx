import { useEffect, useLayoutEffect, useRef, useState } from "react";

const SCROLL_EDGE_ZONE = 60; // px from the container edge that triggers auto-scroll
const SCROLL_MAX_SPEED = 18; // px per animation frame right at the edge

// Walks up from a drag handle to find the nearest scrollable ancestor —
// the editor column is overflow-y-auto on desktop but the whole page
// scrolls instead on mobile (see BuilderPage.jsx), so this can't be
// hardcoded to one element; it has to be resolved at drag-start time.
function getScrollParent(node) {
  let el = node?.parentElement;
  while (el && el !== document.body) {
    const style = getComputedStyle(el);
    if ((style.overflowY === "auto" || style.overflowY === "scroll") && el.scrollHeight > el.clientHeight) {
      return el;
    }
    el = el.parentElement;
  }
  return document.scrollingElement || document.documentElement;
}

/**
 * Generic drag-to-reorder for a flat list of unique string keys. Used for
 * both the CV's section order and for reordering entries inside a section
 * (education items, experience items, etc.) — same mechanics either way.
 *
 * Built on Pointer Events rather than HTML5 drag-and-drop: the native DnD
 * API doesn't fire on touch devices at all, and behaves inconsistently
 * enough across desktop browsers that it isn't worth relying on. Pointer
 * Events unify mouse, trackpad, touch, and pen through one code path.
 *
 * Three things make this feel smooth rather than janky:
 *  - The item being dragged doesn't try to reposition itself in the flow.
 *    It stays in place (dimmed) as a placeholder, while a small floating
 *    "ghost" tracks the pointer directly (see DragGhost) — that's the
 *    piece that's actually supposed to follow your cursor.
 *  - The *other* items animate into their new slot with a FLIP transform
 *    (invert the jump, then transition it away) instead of snapping
 *    instantly, so a reorder reads as a slide rather than a jump-cut.
 *  - New position is decided by comparing the pointer against each other
 *    item's vertical midpoint, not "whichever item's box contains the
 *    pointer" — the latter flickers back and forth near a boundary
 *    whenever items are different heights.
 *
 * It also auto-scrolls the nearest scrollable ancestor when the pointer
 * sits near its top/bottom edge, via a requestAnimationFrame loop that
 * keeps running even if the pointer itself stops moving — otherwise a
 * drag that starts mid-list could never reach an item above/below the
 * visible area.
 *
 * @param {string[]} order - current order of keys
 * @param {(next: string[]) => void} onReorder - called with the full
 *   reordered array whenever the drag crosses another item's midpoint
 */
export function useDragReorder(order, onReorder) {
  const [draggedKey, setDraggedKey] = useState(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const pointerRef = useRef({ x: 0, y: 0 });
  const nodesRef = useRef(new Map());
  const orderRef = useRef(order);
  const flipRectsRef = useRef(null);
  const scrollParentRef = useRef(null);
  orderRef.current = order;

  const registerNode = (key) => (node) => {
    if (node) nodesRef.current.set(key, node);
    else nodesRef.current.delete(key);
  };

  // FLIP for siblings: whenever a reorder is about to happen, snapshot
  // every node's current rect first; once React has re-rendered in the
  // new order, invert each node from its old position to its new one via
  // a transform, then release the transform with a transition so it
  // glides rather than jumps. Runs after every render (cheap no-op) but
  // only does anything when a snapshot was actually captured.
  useLayoutEffect(() => {
    const firstRects = flipRectsRef.current;
    if (!firstRects) return;
    flipRectsRef.current = null;

    for (const [key, node] of nodesRef.current) {
      if (key === draggedKey) continue;
      const first = firstRects.get(key);
      if (!first) continue;
      const last = node.getBoundingClientRect();
      const deltaY = first.top - last.top;
      if (Math.abs(deltaY) < 1) continue;
      node.style.transition = "none";
      node.style.transform = `translateY(${deltaY}px)`;
      node.getBoundingClientRect(); // force reflow so the transition below actually animates
      requestAnimationFrame(() => {
        node.style.transition = "transform 200ms ease";
        node.style.transform = "";
      });
    }
  });

  useEffect(() => {
    if (!draggedKey) return;

    function recomputeOrder(clientY) {
      const current = orderRef.current;
      const others = current.filter((k) => k !== draggedKey);
      let index = others.length;
      for (let i = 0; i < others.length; i++) {
        const node = nodesRef.current.get(others[i]);
        if (!node) continue;
        const rect = node.getBoundingClientRect();
        if (clientY < rect.top + rect.height / 2) {
          index = i;
          break;
        }
      }
      others.splice(index, 0, draggedKey);

      const changed = others.some((key, i) => key !== current[i]);
      if (!changed) return;

      const rects = new Map();
      for (const [key, node] of nodesRef.current) rects.set(key, node.getBoundingClientRect());
      flipRectsRef.current = rects;
      onReorder(others);
    }

    function handlePointerMove(e) {
      pointerRef.current = { x: e.clientX, y: e.clientY };
      setPointer(pointerRef.current);
      recomputeOrder(e.clientY);
    }

    // Runs continuously while dragging (not just on pointermove) so that
    // holding the pointer still against the top/bottom edge keeps
    // scrolling instead of stalling until the next tiny mouse jiggle.
    let rafId;
    function autoScrollTick() {
      const scrollParent = scrollParentRef.current;
      if (scrollParent) {
        const isWindow =
          scrollParent === document.scrollingElement || scrollParent === document.documentElement;
        const bounds = isWindow
          ? { top: 0, bottom: window.innerHeight }
          : scrollParent.getBoundingClientRect();

        const y = pointerRef.current.y;
        let delta = 0;
        if (y < bounds.top + SCROLL_EDGE_ZONE) {
          const proximity = 1 - Math.max(0, y - bounds.top) / SCROLL_EDGE_ZONE;
          delta = -SCROLL_MAX_SPEED * proximity;
        } else if (y > bounds.bottom - SCROLL_EDGE_ZONE) {
          const proximity = 1 - Math.max(0, bounds.bottom - y) / SCROLL_EDGE_ZONE;
          delta = SCROLL_MAX_SPEED * proximity;
        }

        if (delta !== 0) {
          scrollParent.scrollBy(0, delta);
          // Scrolling moves every item's rect out from under a pointer
          // that hasn't itself moved, so the drop position needs
          // re-checking here too, not just in handlePointerMove.
          recomputeOrder(pointerRef.current.y);
        }
      }
      rafId = requestAnimationFrame(autoScrollTick);
    }
    rafId = requestAnimationFrame(autoScrollTick);

    function endDrag() {
      setDraggedKey(null);
    }

    document.body.style.cursor = "grabbing";
    document.body.style.userSelect = "none";
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);
    return () => {
      cancelAnimationFrame(rafId);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draggedKey]);

  const getHandleProps = (key) => ({
    onPointerDown: (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      e.preventDefault();
      scrollParentRef.current = getScrollParent(e.currentTarget);
      pointerRef.current = { x: e.clientX, y: e.clientY };
      setPointer(pointerRef.current);
      setDraggedKey(key);
    },
    style: { touchAction: "none" },
  });

  return { draggedKey, pointer, registerNode, getHandleProps };
}

/** Small floating label that tracks the pointer while a drag is active. */
export function DragGhost({ pointer, label }) {
  if (!label) return null;
  return (
    <div
      className="pointer-events-none fixed z-50 flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-2 text-sm font-medium text-ink shadow-xl"
      style={{ left: pointer.x + 14, top: pointer.y + 14 }}
    >
      <span className="text-ink-soft/50">⠿</span>
      {label}
    </div>
  );
}
