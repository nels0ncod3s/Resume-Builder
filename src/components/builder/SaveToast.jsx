import { useEffect, useRef, useState } from "react";

const HIDE_DELAY_MS = 1600;

/**
 * A small sonner-style toast, fixed to the viewport corner rather than
 * placed inline in the editor column — the editor scrolls, so anything
 * inline can end up off-screen while someone is editing a field further
 * down the page. This stays visible no matter what's scrolled into view.
 *
 * Reflects the saveStatus already returned by useResumeData(); autosave
 * itself was already happening via localStorage, this just surfaces it.
 */
export default function SaveToast({ status }) {
  const [visible, setVisible] = useState(false);
  const hideTimer = useRef(null);

  useEffect(() => {
    if (status === "saving") {
      clearTimeout(hideTimer.current);
      setVisible(true);
    } else if (visible) {
      // Just finished a save — hold the "Saved" toast briefly, then fade
      // it out, instead of yanking it away the instant the write completes.
      hideTimer.current = setTimeout(() => setVisible(false), HIDE_DELAY_MS);
    }
    return () => clearTimeout(hideTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const isSaving = status === "saving";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-none fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full border border-line bg-white/95 px-4 py-2.5 text-xs font-semibold text-ink shadow-[0_8px_24px_rgba(0,0,0,0.12)] backdrop-blur-sm transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${isSaving ? "animate-pulse bg-amber-400" : "bg-emerald-500"}`}
      />
      {isSaving ? "Saving…" : "Saved"}
    </div>
  );
}
