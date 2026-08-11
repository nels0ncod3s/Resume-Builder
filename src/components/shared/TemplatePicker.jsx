import { useEffect, useState } from "react";
import { TEMPLATES } from "../../data/templates.js";

// Featured templates show directly in the grid; everything else lives
// behind "More templates" so the picker stays a tidy 3-tile row no matter
// how many templates get added later — see the `featured` flag in
// data/templates.js for which ones those are.
const FEATURED = TEMPLATES.filter((t) => t.featured);
const MORE = TEMPLATES.filter((t) => !t.featured);

// Swatch grid used by both EditorPanel and CoverLetterEditorPanel to pick
// a template. Deliberately dumb/generic — it just renders whatever's in
// data/templates.js — so the two editors stay in sync automatically as
// templates are added or changed there, with no duplicated list.
export default function TemplatePicker({ value, onChange }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const activeMoreTemplate = MORE.find((t) => t.id === value);

  return (
    <>
      <div className="grid grid-cols-3 gap-3">
        {FEATURED.map((t) => (
          <TemplateSwatch key={t.id} template={t} active={t.id === value} onClick={() => onChange(t.id)} />
        ))}

        {MORE.length > 0 &&
          (activeMoreTemplate ? (
            // The current selection lives behind "More" — show it here
            // instead of a generic tile, so it's still visible at a glance
            // rather than looking like nothing's selected.
            <TemplateSwatch template={activeMoreTemplate} active onClick={() => setMoreOpen(true)} />
          ) : (
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              aria-haspopup="dialog"
              className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-line p-2.5 text-ink-soft transition-colors hover:border-ink/40 hover:text-ink"
            >
              <span className="flex h-9 w-full items-center justify-center rounded border border-line text-lg leading-none">
                ⋯
              </span>
              <span className="text-xs font-semibold">More…</span>
            </button>
          ))}
      </div>

      {moreOpen && (
        <MoreTemplatesModal
          templates={MORE}
          value={value}
          onChange={(id) => {
            onChange(id);
            setMoreOpen(false);
          }}
          onClose={() => setMoreOpen(false)}
        />
      )}
    </>
  );
}

function TemplateSwatch({ template: t, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex flex-col gap-2 rounded-lg border p-2.5 text-left transition-colors ${
        active ? "border-ink ring-2 ring-ink/15" : "border-line hover:border-ink/40"
      }`}
    >
      <span className="flex h-9 w-full overflow-hidden rounded" style={{ border: `1px solid ${t.swatch.accent}` }}>
        <span className="w-2 shrink-0" style={{ background: t.swatch.accent }} />
        <span
          className="flex flex-1 items-center justify-center text-sm font-bold"
          style={{ background: t.swatch.bg, color: t.swatch.accent, fontFamily: t.fonts.heading }}
        >
          Aa
        </span>
      </span>
      <span className="truncate text-xs font-semibold text-ink">{t.name}</span>
    </button>
  );
}

function MoreTemplatesModal({ templates, value, onChange, onClose }) {
  // Escape to close, and lock background scroll while open — standard
  // modal manners, cheap to add.
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="More templates"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-xl border border-line bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line p-4">
          <h3 className="font-display text-lg font-bold text-ink">More templates</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-paper hover:text-ink"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-2.5 overflow-y-auto p-4">
          {templates.map((t) => {
            const active = t.id === value;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onChange(t.id)}
                aria-pressed={active}
                className={`flex items-center gap-3 rounded-lg border p-2.5 text-left transition-colors ${
                  active ? "border-ink ring-2 ring-ink/15" : "border-line hover:border-ink/40"
                }`}
              >
                <span
                  className="flex h-11 w-14 shrink-0 overflow-hidden rounded"
                  style={{ border: `1px solid ${t.swatch.accent}` }}
                >
                  <span className="w-2 shrink-0" style={{ background: t.swatch.accent }} />
                  <span
                    className="flex flex-1 items-center justify-center text-sm font-bold"
                    style={{ background: t.swatch.bg, color: t.swatch.accent, fontFamily: t.fonts.heading }}
                  >
                    Aa
                  </span>
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-ink">{t.name}</span>
                  <span className="block text-xs text-ink-soft">{t.description}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
