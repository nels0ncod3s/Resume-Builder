import { useEffect, useRef } from "react";

const CV_WIDTH = 794;
const CV_HEIGHT = 1123; // fallback only, used before the CV has rendered/measured

/**
 * #cv keeps its true 794px width at all times (so exports stay sharp and
 * consistent) and is scaled down visually via a transform on the node
 * itself when the viewport is narrower — same approach as the original
 * static template. #cv's height is no longer fixed to one page — it grows
 * with content — so the viewport measures #cv's actual rendered height
 * (not a fixed constant) and scales the wrapper to match, otherwise a
 * multi-page resume would get cropped to one page's worth of scaled space.
 * Driven by a ResizeObserver on both the viewport (catches sidebar/layout
 * shifts) and the CV node itself (catches content changes that alter its
 * height), plus a window resize listener as a fallback.
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
      const contentHeight = cv.offsetHeight || CV_HEIGHT;
      cv.style.transform = `scale(${scale})`;
      cv.style.transformOrigin = "top center";
      viewport.style.height = `${contentHeight * scale}px`;
    }

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(viewport);
    if (cvRef.current) observer.observe(cvRef.current);
    window.addEventListener("resize", updateScale);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, [cvRef]);

  return (
    <div ref={viewportRef} className="relative w-full">
      <div className="absolute left-1/2 top-0 -translate-x-1/2">
        {children}
      </div>
    </div>
  );
}
