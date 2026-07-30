import { useEffect, useRef } from "react";

const CV_WIDTH = 794;
const CV_HEIGHT = 1123;

/**
 * #cv keeps its true 794x1123 pixel size at all times (so exports stay sharp
 * and consistent) and is scaled down visually via a transform on the node
 * itself when the viewport is narrower — same approach as the original
 * static template. Driven by both a ResizeObserver (catches sidebar/layout
 * shifts that don't fire a window resize) and a window resize listener
 * (the original template's approach, kept as a fallback since some
 * environments emulate viewport changes without reliably notifying
 * ResizeObserver).
 */
export default function CVScaledViewport({ cvRef, children }) {
  const viewportRef = useRef(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    function updateScale() {
      const cv = cvRef.current;
      if (!cv) return;
      const available = viewport.clientWidth;
      // A transient 0 reading (e.g. mid-reflow during a breakpoint change)
      // must never be applied — it would permanently collapse the preview.
      if (available <= 0) return;
      const scale = Math.min(1, available / CV_WIDTH);
      cv.style.transform = `scale(${scale})`;
      cv.style.transformOrigin = "top center";
      viewport.style.height = `${CV_HEIGHT * scale}px`;
    }

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(viewport);
    window.addEventListener("resize", updateScale);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, [cvRef]);

  return (
    <div ref={viewportRef} className="flex w-full justify-center overflow-hidden">
      {children}
    </div>
  );
}
