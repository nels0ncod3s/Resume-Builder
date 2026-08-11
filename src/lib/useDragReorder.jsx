import { useEffect, useLayoutEffect, useRef, useState } from "react";

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
 * Two things make this feel smooth rather than janky:
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
 * @param {string[]} order - current order of keys
 * @param {(next: string[]) => void} onReorder - called with the full
 *   reordered array whenever the drag crosses another item's midpoint
 */
export function useDragReorder(order, onReorder) {
  const [draggedKey, setDraggedKey] = useState(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const nodesRef = useRef(new Map());
  const orderRef = useRef(order);
  const flipRectsRef = useRef(null);
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

    function handlePointerMove(e) {
      setPointer({ x: e.clientX, y: e.clientY });

      const current = orderRef.current;
      const others = current.filter((k) => k !== draggedKey);
      let index = others.length;
      for (let i = 0; i < others.length; i++) {
        const node = nodesRef.current.get(others[i]);
        if (!node) continue;
        const rect = node.getBoundingClientRect();
        if (e.clientY < rect.top + rect.height / 2) {
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

    function endDrag() {
      setDraggedKey(null);
    }

    document.body.style.cursor = "grabbing";
    document.body.style.userSelect = "none";
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);
    return () => {
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
      setPointer({ x: e.clientX, y: e.clientY });
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
