import { useEffect, useRef, useState } from "react";

const HIDE_DELAY_MS = 1600;

/**
 * Lives inline in the top-right of the persistent header (TopNav), not as
 * a floating overlay — the header never scrolls away, so this stays
 * visible no matter how far down the editor column someone has scrolled,
 * without needing to guess pixel offsets to dodge the "Take a tour"
 * button that already lives in that corner.
 *
 * Reflects the saveStatus already returned by useResumeData(); autosave
 * itself was already happening via localStorage, this just surfaces it.
 * `status` is null on pages that don't autosave, in which case this
 * renders nothing.
 */
export default function SaveToast({ status }) {
  const [visible, setVisible] = useState(false);
  const hideTimer = useRef(null);

  useEffect(() => {
    if (status === "saving") {
      clearTimeout(hideTimer.current);
      setVisible(true);
    } else if (!status) {
      // Navigated away from a page that autosaves — nothing to show.
      clearTimeout(hideTimer.current);
      setVisible(false);
    } else if (visible) {
      // Just finished a save — hold the "Saved" toast briefly, then fade
      // it out, instead of yanking it away the instant the write completes.
      hideTimer.current = setTimeout(() => setVisible(false), HIDE_DELAY_MS);
    }
    return () => clearTimeout(hideTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const isSaving = status === "saving";

  if (!status && !visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-none inline-flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-2 text-xs font-semibold text-ink shadow-sm transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${isSaving ? "animate-pulse bg-amber-400" : "bg-emerald-500"}`}
      />
      {isSaving ? "Saving…" : "Saved"}
    </div>
  );
}
